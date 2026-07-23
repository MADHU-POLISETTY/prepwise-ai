import 'package:flutter/material.dart';
import '../models/interview_result.dart';
import '../services/gemini_service.dart';

class InterviewScreen extends StatefulWidget {
  final Future<String> Function() getGeminiApiKey;
  final Function(InterviewResult) onResultSaved;

  const InterviewScreen({
    Key? key,
    required this.getGeminiApiKey,
    required this.onResultSaved,
  }) : super(key: key);

  @override
  State<InterviewScreen> createState() => _InterviewScreenState();
}

class _InterviewScreenState extends State<InterviewScreen> {
  // Config states
  String _role = 'Frontend Software Engineer';
  String _difficulty = 'Senior';
  String _category = 'Technical';
  
  bool _isSessionStarted = false;
  bool _isSubmitting = false;
  
  // Real active session conversational logs
  final List<Map<String, String>> _transcript = [];
  final TextEditingController _answerController = TextEditingController();

  final List<String> _questions = [
    "Could you walk me through your structural architectural setup for state synchronization or cache coherence in full-stack setups?",
    "When facing high memory bottlenecks during layout tree computations, how do you diagnose background threads performance leaks?",
    "Excellent descriptions. Lastly, tell me about a major scaling constraint challenge you overcame in a cross-platform setting."
  ];
  int _currentQuestionIndex = 0;

  void _startMockSession() {
    setState(() {
      _isSessionStarted = true;
      _transcript.clear();
      _currentQuestionIndex = 0;
      // Inject primary AI introductory question
      _transcript.add({
        'role': 'AI Interviewer',
        'content': 'Welcome. I am your PrepWise carrier coach evaluator. Let\'s begin. ${_questions[0]}'
      });
    });
  }

  void _submitAnswer() {
    final answerText = _answerController.text.trim();
    if (answerText.isEmpty) return;

    setState(() {
      _transcript.add({
        'role': 'User',
        'content': answerText,
      });
      _answerController.clear();
    });

    // Advance question index
    if (_currentQuestionIndex < _questions.length - 1) {
      setState(() {
        _currentQuestionIndex++;
        _transcript.add({
          'role': 'AI Interviewer',
          'content': _questions[_currentQuestionIndex],
        });
      });
    } else {
      _evaluateAndReport();
    }
  }

  Future<void> _evaluateAndReport() async {
    setState(() {
      _isSubmitting = true;
    });

    try {
      final apiKey = await widget.getGeminiApiKey();
      final gemini = GeminiService(apiKey: apiKey);

      final result = await gemini.evaluateInterview(
        role: _role,
        difficulty: _difficulty,
        category: _category,
        transcript: _transcript,
      );

      widget.onResultSaved(result);

      // Show completed assessment results
      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          backgroundColor: const Color(0xFF0F0E21),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: Color(0xFF6366F1)),
          ),
          title: Row(
            children: [
              const Icon(Icons.verified, color: Colors.emerald, size: 24),
              const SizedBox(width: 8),
              const Text('APPRASAL COMPLETE', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Evaluation Metrics for $_role ($difficulty):', style: const TextStyle(color: Colors.white70, fontSize: 12)),
              const SizedBox(height: 14),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildScorePill('OVERALL', result.score, Colors.indigo),
                  _buildScorePill('DOMAIN', result.technicalScore, Colors.teal),
                  _buildScorePill('VOCAL XP', result.communicationScore, Colors.orange),
                ],
              ),
              const SizedBox(height: 14),
              const Text('Expert Feedback:', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11)),
              const SizedBox(height: 4),
              Container(
                height: 120,
                child: SingleChildScrollView(
                  child: Text(
                    result.feedback,
                    style: const TextStyle(fontSize: 11, color: Colors.white70, height: 1.4),
                  ),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                setState(() {
                  _isSessionStarted = false;
                  _isSubmitting = false;
                });
              },
              child: const Text('OKAY', style: TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold)),
            )
          ],
        ),
      );

    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
    }
  }

  Widget _buildScorePill(String label, int val, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(fontSize: 8, color: Colors.white38, fontWeight: FontWeight.bold)),
          const SizedBox(height: 2),
          Text('$val%', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title Banner
          const Text(
            'INTERACTIVE SIMULATOR',
            style: TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF6366F1)),
          ),
          const SizedBox(height: 4),
          const Text(
            'Smart Interview Prep',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 20),

          if (!_isSessionStarted) ...[
            // Prep Configuration Wizard
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.01),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Select Target Professional Role', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _role,
                    dropdownColor: const Color(0xFF0F0E21),
                    style: const TextStyle(color: Colors.white, fontSize: 13),
                    decoration: const InputDecoration(
                      filled: true,
                      fillColor: Colors.black26,
                      contentPadding: EdgeInsets.symmetric(horizontal: 12),
                    ),
                    items: [
                      'Frontend Software Engineer',
                      'Backend Architecture Specialist',
                      'Technical Product Manager',
                      'General iOS Developer'
                    ].map((role) => DropdownMenuItem(value: role, child: Text(role))).toList(),
                    onChanged: (val) {
                      if (val != null) setState(() => _role = val);
                    },
                  ),
                  const SizedBox(height: 18),

                  const Text('Select Evaluation Difficulty', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                  const SizedBox(height: 8),
                  Row(
                    children: ['Junior', 'Mid', 'Senior', 'Expert'].map((diff) {
                      final selected = _difficulty == diff;
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() => _difficulty = diff),
                          child: Container(
                            alignment: Alignment.center,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            margin: const EdgeInsets.only(right: 6),
                            decoration: BoxDecoration(
                              color: selected ? const Color(0xFF6366F1).withOpacity(0.15) : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: selected ? const Color(0xFF6366F1) : Colors.white12,
                              ),
                            ),
                            child: Text(
                              diff,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                                color: selected ? Colors.white : Colors.white54,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 18),

                  const Text('Select Appraisal Focus Unit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white)),
                  const SizedBox(height: 8),
                  Row(
                    children: ['HR', 'Technical', 'Aptitude'].map((cat) {
                      final selected = _category == cat;
                      return Expanded(
                        child: InkWell(
                          onTap: () => setState(() => _category = cat),
                          child: Container(
                            alignment: Alignment.center,
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            margin: const EdgeInsets.only(right: 6),
                            decoration: BoxDecoration(
                              color: selected ? Colors.teal.withOpacity(0.1) : Colors.transparent,
                              borderRadius: BorderRadius.circular(8),
                              border: Border.all(
                                color: selected ? Colors.teal : Colors.white12,
                              ),
                            ),
                            child: Text(
                              cat == 'HR' ? 'Behavioral' : cat,
                              style: TextStyle(
                                fontSize: 11,
                                color: selected ? Colors.tealAccent : Colors.white54,
                                fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF6366F1),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: _startMockSession,
                      icon: const Icon(Icons.rocket_launch, color: Colors.white, size: 16),
                      label: const Text('BEGIN APPRASIONAL SESSION', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
                    ),
                  )
                ],
              ),
            ),
          ] else ...[
            // Active conversational visualizer
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.01),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Sessional header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('ACTIVE: $_role', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.white)),
                          Text('Stage Progress: ${_currentQuestionIndex + 1} / ${_questions.length}', style: const TextStyle(fontSize: 9, color: Colors.white54)),
                        ],
                      ),
                      IconButton(
                        onPressed: () => setState(() => _isSessionStarted = false),
                        icon: const Icon(Icons.cancel, color: Colors.red, size: 18),
                      )
                    ],
                  ),
                  const Divider(color: Colors.white10),
                  const SizedBox(height: 10),

                  // Chat Log View
                  Container(
                    height: 220,
                    child: ListView.builder(
                      itemCount: _transcript.length,
                      itemBuilder: (context, idx) {
                        final msg = _transcript[idx];
                        final isAI = msg['role'] == 'AI Interviewer';
                        return Align(
                          alignment: isAI ? Alignment.centerLeft : Alignment.centerRight,
                          child: Container(
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: isAI ? Colors.white.withOpacity(0.04) : const Color(0xFF6366F1).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: isAI ? Colors.white.withOpacity(0.05) : const Color(0xFF6366F1).withOpacity(0.2)),
                            ),
                            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.7),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  msg['role'] ?? '',
                                  style: TextStyle(
                                    fontSize: 8,
                                    fontWeight: FontWeight.bold,
                                    fontFamily: 'monospace',
                                    color: isAI ? Colors.tealAccent : const Color(0xFFC7D2FE),
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  msg['content'] ?? '',
                                  style: const TextStyle(fontSize: 11.5, color: Colors.white70, height: 1.3),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 14),

                  if (_isSubmitting) ...[
                    const Center(
                      child: Column(
                        children: [
                          CircularProgressIndicator(color: Color(0xFF6366F1)),
                          SizedBox(height: 10),
                          Text('Applying Gemini NLP evaluation algorithms...', style: TextStyle(fontSize: 10, color: Colors.white54)),
                        ],
                      ),
                    )
                  ] else ...[
                    // Input tools
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _answerController,
                            style: const TextStyle(color: Colors.white, fontSize: 12),
                            decoration: InputDecoration(
                              hintText: 'Formulate responsive target STAR answer...',
                              hintStyle: const TextStyle(color: Colors.white24, fontSize: 11),
                              filled: true,
                              fillColor: Colors.white.withOpacity(0.02),
                              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Colors.white12)),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        IconButton(
                          style: IconButton.styleFrom(backgroundColor: const Color(0xFF6366F1), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                          icon: const Icon(Icons.mic, color: Colors.white),
                          onPressed: () {
                            // Voice synthesis simulator
                            _answerController.text = "In my previous project, we established caching mechanisms optimized with Redis pipelines, lowering latency thresholds by approximately 45%.";
                          },
                        ),
                        IconButton(
                          style: IconButton.styleFrom(backgroundColor: Colors.teal, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                          icon: const Icon(Icons.send, color: Colors.white),
                          onPressed: _submitAnswer,
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          ]
        ],
      ),
    );
  }
}
