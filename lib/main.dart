import 'package:flutter/material.dart';
import 'models/interview_result.dart';
import 'screens/home_screen.dart';
import 'screens/interview_screen.dart';
import 'screens/resume_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/profile_screen.dart';

void main() {
  runApp(const PrepWiseApp());
}

class PrepWiseApp extends StatelessWidget {
  const PrepWiseApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PrepWise AI',
      debugShowCheckedModeBanner: false,
      themeMode: ThemeMode.dark,
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF050505),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF10B981),
          surface: Color(0xFF0F0E21),
        ),
        fontFamily: 'sans-serif',
      ),
      home: const AuthOrNavigationWrapper(),
    );
  }
}

class AuthOrNavigationWrapper extends StatefulWidget {
  const AuthOrNavigationWrapper({Key? key}) : super(key: key);

  @override
  State<AuthOrNavigationWrapper> createState() => _AuthOrNavigationWrapperState();
}

class _AuthOrNavigationWrapperState extends State<AuthOrNavigationWrapper> {
  // Simple session authentication state simulator
  bool _isAuthenticated = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _authLoading = false;

  // App metrics state
  final List<InterviewResult> _interviews = [];
  int _activeTab = 0; // 0: Home, 1: Interview, 2: Resume, 3: Analytics, 4: Profile

  @override
  void initState() {
    super.initState();
    // Bootstrap initial high-quality demonstration evaluation metrics
    _interviews.add(InterviewResult(
      id: 'demo-1',
      role: 'Full-Stack Software Engineer',
      difficulty: 'Mid',
      category: 'Technical',
      score: 84,
      technicalScore: 86,
      communicationScore: 80,
      confidenceScore: 85,
      feedback: 'Excellent response patterns described for Redux state synchronization pipeline bottlenecks. Included quantitative latency decreases.',
      completedAt: DateTime.now().subtract(const Duration(days: 2)),
    ));
    _interviews.add(InterviewResult(
      id: 'demo-2',
      role: 'Frontend Specialized Architect',
      difficulty: 'Expert',
      category: 'HR',
      score: 76,
      technicalScore: 78,
      communicationScore: 74,
      confidenceScore: 76,
      feedback: 'Behavioral responses aligned with active STAR criteria, but should incorporate more explicit telemetry details to validate engineering guidelines.',
      completedAt: DateTime.now().subtract(const Duration(days: 4)),
    ));
  }

  Future<void> _handleSignIn() async {
    final email = _emailController.text.trim();
    if (email.isEmpty || !email.contains('@')) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid candidate email address.')),
      );
      return;
    }

    setState(() => _authLoading = true);
    await Future.delayed(const Duration(milliseconds: 900));

    setState(() {
      _isAuthenticated = true;
      _authLoading = false;
    });
  }

  void _handleSignOut() {
    setState(() {
      _isAuthenticated = false;
      _emailController.clear();
      _passwordController.clear();
    });
  }

  Future<String> _getGeminiApiKeySimulate() async {
    // In a real device config, this queries Flutter Secure Storage or DotEnv.
    return "MOCK_DUMMY_GEMINI_API_KEY";
  }

  @override
  Widget build(BuildContext context) {
    if (!_isAuthenticated) {
      // High-Contrast Premium Portal View
      return Scaffold(
        backgroundColor: const Color(0xFF050505),
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo Icon Brand
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF6366F1).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: const Color(0xFF6366F1)),
                  ),
                  child: const Icon(Icons.rocket_launch, size: 48, color: Color(0xFF818CF8)),
                ),
                const SizedBox(height: 20),

                // Greeting Display
                const Text(
                  'PrepWise AI',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -1.0,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Sessional Career Appraisals',
                  style: TextStyle(
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.w600,
                    color: Colors.white30,
                  ),
                ),
                const SizedBox(height: 32),

                // Form Container
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.01),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Candidate Email', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white70)),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _emailController,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        decoration: InputDecoration(
                          hintText: 'candidate.preview@prepwise.ai',
                          hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
                          filled: true,
                          fillColor: Colors.black26,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Colors.white12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),

                      const Text('Secure Access Key', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white70)),
                      const SizedBox(height: 8),
                      TextField(
                        controller: _passwordController,
                        style: const TextStyle(color: Colors.white, fontSize: 13),
                        obscureText: true,
                        decoration: InputDecoration(
                          hintText: '••••••••',
                          hintStyle: const TextStyle(color: Colors.white24, fontSize: 12),
                          filled: true,
                          fillColor: Colors.black26,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Colors.white12),
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF6366F1),
                            padding: const EdgeInsets.symmetric(vertical: 14),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: _authLoading ? null : _handleSignIn,
                          child: _authLoading
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                              : const Text('ESTABLISH CLIENT SESSION', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 0.5, color: Colors.white, fontSize: 12)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Demo preset switchers
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text('Testing mock keys? ', style: TextStyle(fontSize: 11, color: Colors.white30)),
                    InkWell(
                      onTap: () {
                        _emailController.text = 'guest.account@prepwise.ai';
                        _handleSignIn();
                      },
                      child: const Text('Autologin Guest Session', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF818CF8))),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      );
    }

    // AUTHENTICATED REAL APP SHELL (with simulated iOS status bar layout context inside Scaffold)
    return Scaffold(
      backgroundColor: const Color(0xFF050505),
      
      // Bottom Navigation layout
      bottomNavigationBar: Container(
        padding: const EdgeInsets.only(bottom: 16, top: 10, left: 16, right: 16),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.85),
          border: const Border(top: BorderSide(color: Colors.white10)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(0, Icons.home, 'Home'),
            _buildNavItem(1, Icons.play_circle, 'Coach'),
            _buildNavItem(2, Icons.description, 'Resume'),
            _buildNavItem(3, Icons.analytics, 'Metrics'),
            _buildNavItem(4, Icons.person, 'Profile'),
          ],
        ),
      ),

      // Load correct screens depending on active indices
      body: SafeArea(
        child: Column(
          children: [
            // Status line spacer
            Container(height: 1, color: Colors.white.withOpacity(0.05)),
            
            Expanded(
              child: IndexedStack(
                index: _activeTab,
                children: [
                  HomeScreen(
                    interviews: _interviews,
                    onNavigate: (index) {
                      setState(() => _activeTab = index);
                    },
                    onStartTrack: (category) {
                      setState(() {
                        _activeTab = 1; // Transition to Coach
                      });
                    },
                  ),
                  InterviewScreen(
                    getGeminiApiKey: _getGeminiApiKeySimulate,
                    onResultSaved: (res) {
                      setState(() {
                        _interviews.insert(0, res);
                      });
                    },
                  ),
                  ResumeScreen(
                    getGeminiApiKey: _getGeminiApiKeySimulate,
                  ),
                  DashboardScreen(
                    interviews: _interviews,
                  ),
                  ProfileScreen(
                    userEmail: _emailController.text.isNotEmpty ? _emailController.text : "candidate.preview@prepwise.ai",
                    interviews: _interviews,
                    onSignOut: _handleSignOut,
                    onResetDatabase: () {
                      setState(() {
                        _interviews.clear();
                      });
                    },
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, String label) {
    final isSelected = _activeTab == index;
    final color = isSelected ? const Color(0xFF6366F1) : Colors.white38;
    return GestureDetector(
      onTap: () => setState(() => _activeTab = index),
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
