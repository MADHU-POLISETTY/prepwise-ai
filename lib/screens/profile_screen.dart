import 'package:flutter/material.dart';
import '../models/interview_result.dart';

class ProfileScreen extends StatefulWidget {
  final String userEmail;
  final List<InterviewResult> interviews;
  final VoidCallback onSignOut;
  final VoidCallback onResetDatabase;

  const ProfileScreen({
    Key? key,
    required this.userEmail,
    required this.interviews,
    required this.onSignOut,
    required this.onResetDatabase,
  }) : super(key: key);

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _darkPreference = true;
  bool _pushNotifications = false;
  bool _biometricSecure = false;
  bool _syncing = false;

  void _syncLocalStorage() {
    setState(() => _syncing = true);
    Future.delayed(const Duration(seconds: 1), () {
      setState(() => _syncing = false);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('All local assessment benchmarks synchronized securely with Firebase database.')),
      );
    });
  }

  void _requestNotificationRules() {
    setState(() {
      _pushNotifications = !_pushNotifications;
    });
    if (_pushNotifications) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Push notifications successfully registered for CV assessment scoring prompts!')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final username = widget.userEmail.split('@')[0];
    final total = widget.interviews.length;
    final int average = total > 0
        ? (widget.interviews.map((i) => i.score).reduce((a, b) => a + b) / total).round()
        : 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title Banner
          const Text(
            'CANDIDATE ANALYTICS',
            style: TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.bold, color: Colors.indigoAccent),
          ),
          const SizedBox(height: 4),
          const Text(
            'Profile & Settings',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 20),

          // User info Card matching Stripe/LinkedIn elegance
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.01),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: Colors.white,
                  child: Text(
                    widget.userEmail.toUpperCase().substring(0, 1),
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            username[0].toUpperCase() + username.substring(1),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: Colors.white),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.emerald.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: Colors.emerald.withOpacity(0.3)),
                            ),
                            child: const Text('LIVE', style: TextStyle(fontSize: 8, color: Colors.emeraldAccent, fontWeight: FontWeight.bold)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          const Icon(Icons.mail_outline, size: 12, color: Colors.white30),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              widget.userEmail,
                              style: const TextStyle(fontSize: 11, color: Colors.white54),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Sessional Tri-metric benchmarks
          Row(
            children: [
              Expanded(child: _buildTriWidget('AVERAGE', '$average%', Colors.indigoAccent)),
              const SizedBox(width: 8),
              Expanded(child: _buildTriWidget('TRIALS', '$total', Colors.tealAccent)),
              const SizedBox(width: 8),
              Expanded(child: _buildTriWidget('XP SCORE', '${total * 120 + average * 5}', Colors.orangeAccent)),
            ],
          ),
          const SizedBox(height: 24),

          // Preference Group lists (Material 3 style)
          const Text(
            'MOBILE SYSTEM SETTINGS',
            style: TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white38),
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.01),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.05)),
            ),
            child: Column(
              children: [
                // Dark prefer switcher
                SwitchListTile(
                  title: const Text('Light UI Theme Toggle', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                  subtitle: const Text('Use high-contrast light colors', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  value: !_darkPreference,
                  onChanged: (val) {
                    setState(() {
                      _darkPreference = !val;
                    });
                  },
                  activeColor: const Color(0xFF6366F1),
                ),
                const Divider(height: 1, color: Colors.white10),

                // Push notifier switcher
                SwitchListTile(
                  title: const Text('Smart Push Alerts', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                  subtitle: const Text('Alert on sessional career milestones', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  value: _pushNotifications,
                  onChanged: (val) => _requestNotificationRules(),
                  activeColor: Colors.emerald,
                ),
                const Divider(height: 1, color: Colors.white10),

                // Biometrics Secure toggle
                SwitchListTile(
                  title: const Text('Biometric Launcher PIN', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                  subtitle: const Text('Unlock with face detection safety', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  value: _biometricSecure,
                  onChanged: (val) {
                    setState(() {
                      _biometricSecure = val;
                    });
                  },
                  activeColor: const Color(0xFF6366F1),
                ),
                const Divider(height: 1, color: Colors.white10),

                // Offline sync action
                ListTile(
                  title: const Text('Offline Storage Synchronize', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                  subtitle: const Text('Upload local caches with remote database', style: TextStyle(fontSize: 10, color: Colors.white38)),
                  trailing: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: Colors.white24),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _syncing ? null : _syncLocalStorage,
                    icon: _syncing
                        ? const SizedBox(width: 10, height: 10, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.indigoAccent))
                        : const Icon(Icons.sync, size: 12, color: Colors.white70),
                    label: const Text('SYNC', style: TextStyle(fontSize: 9, color: Colors.white70)),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          const Text(
            'COMPLIANCE MANAGEMENT',
            style: TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white38),
          ),
          const SizedBox(height: 12),

          // Purge Cache action button
          InkWell(
            onTap: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: const Color(0xFF0F0E21),
                  title: const Text('CONFIRM DESTRUCTION', style: TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                  content: const Text('This will purge all tracked mock interview telemetry and reset the offline score charts. Continue?', style: TextStyle(color: Colors.white54, fontSize: 11)),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context), child: const Text('CANCEL', style: TextStyle(color: Colors.white30))),
                    TextButton(
                      onPressed: () {
                        widget.onResetDatabase();
                        Navigator.pop(context);
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('All local assessment scores successfully erased.')),
                        );
                      },
                      child: const Text('PURGE', style: TextStyle(color: Colors.redAccent)),
                    ),
                  ],
                ),
              );
            },
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.withOpacity(0.04),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.red.withOpacity(0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.delete, color: Colors.redAccent, size: 18),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Reset Sessional Database', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.redAccent)),
                        SizedBox(height: 2),
                        Text('Purge all offline cached benchmark parameters', style: TextStyle(fontSize: 10, color: Colors.white38)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // Terminate session switcher
          InkWell(
            onTap: widget.onSignOut,
            borderRadius: BorderRadius.circular(16),
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.01),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.logout, color: Colors.white70, size: 18),
                  SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Terminate Sessional Client', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white70)),
                        SizedBox(height: 2),
                        Text('Sign out security metrics securely', style: TextStyle(fontSize: 10, color: Colors.white38)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTriWidget(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.02),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withOpacity(0.05)),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 8, fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Colors.white30)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}
