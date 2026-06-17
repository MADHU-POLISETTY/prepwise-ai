import 'package:flutter/material.dart';
import '../models/interview_result.dart';

class HomeScreen extends StatelessWidget {
  final List<InterviewResult> interviews;
  final Function(int) onNavigate;
  final Function(String) onStartTrack;

  const HomeScreen({
    Key? key,
    required this.interviews,
    required this.onNavigate,
    required this.onStartTrack,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final int totalPractice = interviews.length;
    final int avgScore = totalPractice > 0
        ? (interviews.map((i) => i.score).reduce((a, b) => a + b) / totalPractice).round()
        : 0;
    final int userXP = totalPractice * 120 + avgScore * 5;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Greeting and Widgets
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'GOOD MORNING',
                    style: TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.0,
                      color: Theme.of(context).colorScheme.primary,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Candidate',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      letterSpacing: -0.5,
                      color: Colors.white,
                    ),
                  ),
                ],
              ),
              // Gamification Widget
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.04),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.white.withOpacity(0.1)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.flash_on, color: Colors.orange, size: 16),
                    const SizedBox(width: 4),
                    const Text(
                      '7D',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: Colors.orange,
                      ),
                    ),
                    Container(
                      height: 12,
                      width: 1,
                      color: Colors.white24,
                      margin: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    const Icon(Icons.emoji_events, color: Colors.indigo, size: 14),
                    const SizedBox(width: 4),
                    Text(
                      '$userXP XP',
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Main Promotion Hero Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  const Color(0xFF1D1B38),
                  const Color(0xFF0F0E21),
                  Colors.black.withOpacity(0.8),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF818CF8).withOpacity(0.3)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.stars, color: Color(0xFFC7D2FE), size: 12),
                      SizedBox(width: 4),
                      Text(
                        'ACTIVE EVALUATION SYSTEM',
                        style: TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 8,
                          color: Color(0xFFC7D2FE),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Master Technical Careers',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Triggers responsive NLP assessment flows customized to Stripe, Google or target system architecture paths.',
                  style: TextStyle(
                    fontSize: 12,
                    color: Color(0xFFCBD5E1),
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF6366F1),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    onPressed: () => onNavigate(1), // Target interview tab
                    icon: const Icon(Icons.play_arrow, color: Colors.white, size: 16),
                    label: const Text(
                      'LAUNCH INTERVIEW PREP',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Workspace Grid
          const Text(
            'INTERACTIVE WORKSPACE',
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.white38,
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildActionCard(
                  context: context,
                  icon: Icons.description,
                  iconColor: Colors.teal,
                  title: 'Audit Resume',
                  description: 'Inspect ATS deficits',
                  onTap: () => onNavigate(2), // Targets Resume analyzer
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildActionCard(
                  context: context,
                  icon: Icons.chat_bubble_outline,
                  iconColor: Colors.purple,
                  title: 'Consult AI Mentor',
                  description: 'Ask MS AI guidelines',
                  onTap: () => onNavigate(4), // Targets Profile / chat menu
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Lanes / Tracks of evaluation
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'ASSESSMENT LANES',
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: Colors.white38,
                ),
              ),
              Text(
                'Tracked Skills',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildLaneItem(
            context: context,
            trackNo: 'Track 01',
            title: 'Behavioral & Case Studies',
            description: 'STAR layouts, system situation guides, and core metrics.',
            color: Colors.orange,
            onTap: () => onStartTrack('HR'),
          ),
          const SizedBox(height: 10),
          _buildLaneItem(
            context: context,
            trackNo: 'Track 02',
            title: 'Architectures & Coding',
            description: 'Scalability drills, cache strategies, databases, and microservices.',
            color: Colors.teal,
            onTap: () => onStartTrack('Technical'),
          ),
          const SizedBox(height: 10),
          _buildLaneItem(
            context: context,
            trackNo: 'Track 03',
            title: 'Sizing Estimation',
            description: 'Throughput metrics, server allocations, storage plans, and business modeling.',
            color: Colors.purple,
            onTap: () => onStartTrack('Aptitude'),
          ),
          const SizedBox(height: 24),

          // Sessional Logs list
          const Text(
            'RECENT HISTORY & EVALUATIONS',
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: Colors.white38,
            ),
          ),
          const SizedBox(height: 12),
          if (interviews.isEmpty)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.01),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: const Column(
                children: [
                  Icon(Icons.menu_book, color: Colors.white24, size: 28),
                  SizedBox(height: 10),
                  Text(
                    'No practice logs found. Start an appraisal mock session from Track 01, Track 02, or Track 03 to create telemetry.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 11, color: Colors.white54, height: 1.4),
                  ),
                ],
              ),
            )
          else
            ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: interviews.take(2).length,
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final item = interviews[index];
                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  tileColor: Colors.white.withOpacity(0.01),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: Border.all(color: Colors.white.withOpacity(0.05)),
                  ),
                  leading: CircleAvatar(
                    backgroundColor: Colors.indigo.withOpacity(0.1),
                    child: const Icon(Icons.assessment, color: Colors.indigo),
                  ),
                  title: Text(
                    item.role,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                  ),
                  subtitle: Text(
                    'Score: ${item.score}%  |  ${item.category}',
                    style: const TextStyle(fontSize: 11, color: Colors.white54),
                  ),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white30, size: 20),
                  onTap: () => onNavigate(3), // Jump to Dashboard screen tab
                );
              },
            ),
        ],
      ),
    );
  }

  Widget _buildActionCard({
    required BuildContext context,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String description,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.02),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: iconColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: iconColor, size: 18),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
            ),
            const SizedBox(height: 4),
            Text(
              description,
              style: const TextStyle(fontSize: 10, color: Colors.white38),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLaneItem({
    required BuildContext context,
    required String trackNo,
    required String title,
    required String description,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.01),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: color.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: color.withOpacity(0.3)),
                        ),
                        child: Text(
                          trackNo,
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 8,
                            fontWeight: FontWeight.bold,
                            color: color,
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    description,
                    style: const TextStyle(fontSize: 11, color: Colors.white38, height: 1.3),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: Colors.white.withOpacity(0.2), size: 12),
          ],
        ),
      ),
    );
  }
}
