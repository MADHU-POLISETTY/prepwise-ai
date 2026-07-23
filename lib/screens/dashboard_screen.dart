import 'package:flutter/material.dart';
import '../models/interview_result.dart';

class DashboardScreen extends StatelessWidget {
  final List<InterviewResult> interviews;

  const DashboardScreen({
    Key? key,
    required this.interviews,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final int total = interviews.length;
    final int average = total > 0
        ? (interviews.map((i) => i.score).reduce((a, b) => a + b) / total).round()
        : 0;
    final int techAvg = total > 0
        ? (interviews.map((i) => i.technicalScore).reduce((a, b) => a + b) / total).round()
        : 0;
    final int commAvg = total > 0
        ? (interviews.map((i) => i.communicationScore).reduce((a, b) => a + b) / total).round()
        : 0;

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Title Banner
          const Text(
            'ANALYTICS TELEMETRY',
            style: TextStyle(fontFamily: 'monospace', fontSize: 10, fontWeight: FontWeight.bold, color: Colors.indigoAccent),
          ),
          const SizedBox(height: 4),
          const Text(
            'Performance Metrics',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 20),

          if (total == 0)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.bottom(20),
              decoration: BoxDecoration(
                color: const Color(0xFF131130),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.flash_on, color: Color(0xFF818CF8)),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Sandbox Evaluation Mode', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.white)),
                        SizedBox(height: 2),
                        Text('We have populated baseline target performance criteria to demonstrate your Material 3 display indicators.', style: TextStyle(fontSize: 10, color: Colors.white70, height: 1.3)),
                      ],
                    ),
                  )
                ],
              ),
            ),

          // Numerical Pills Grid
          GridView.count(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.3,
            children: [
              _buildProgressMetric('TOTAL', '${total > 0 ? total : 4}', Colors.cyan),
              _buildProgressMetric('RATING', '${total > 0 ? average : 82}%', Colors.indigoAccent),
              _buildProgressMetric('STREAK', '7 DAYS', Colors.orange),
            ],
          ),
          const SizedBox(height: 24),

          // Visual Competency Progress Bars (Using custom Containers that render clean percentages)
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
                const Text(
                  'Weighted Skill Competencies',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.white),
                ),
                const SizedBox(height: 18),
                _buildProgressBar('Technical & Architecture Specialization', total > 0 ? techAvg : 82, Colors.teal),
                const SizedBox(height: 16),
                _buildProgressBar('Behavioral Alignment & STAR Delivery', total > 0 ? commAvg : 74, Colors.orange),
                const SizedBox(height: 16),
                _buildProgressBar('Technical Estimation Modeling', total > 0 ? average : 78, Colors.purple),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Core Strengths Panel
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF070907),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.emerald.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.check_circle, color: Colors.emerald, size: 16),
                    SizedBox(width: 8),
                    Text('Core Evaluation Strengths', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, fontFamily: 'monospace', color: Colors.emeraldAccent)),
                  ],
                ),
                const SizedBox(height: 12),
                _buildBulletPoint('Accurate behavioral structure and chronological delivery.'),
                _buildBulletPoint('Stellar software architecture concepts described fluently.'),
                _buildBulletPoint('Coherent caching throughput models identified confidently.'),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // Identified Priorities Growth Panel
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF090707),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.rose.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Row(
                  children: [
                    Icon(Icons.warning, color: Colors.rose, size: 16),
                    SizedBox(width: 8),
                    Text('Identified Growth Areas', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, fontFamily: 'monospace', color: Colors.roseAccent)),
                  ],
                ),
                const SizedBox(height: 12),
                _buildBulletPoint('Include tighter capacity estimation values during sizing questions.'),
                _buildBulletPoint('Articulate quantitative team outputs in situation summaries.'),
                _buildBulletPoint('Explicitly declare storage requirements for caching nodes.'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressMetric(String label, String value, Color color) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.01),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      padding: const EdgeInsets.all(12),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 8, fontFamily: 'monospace', fontWeight: FontWeight.bold, color: Colors.white30)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }

  Widget _buildProgressBar(String title, int percent, Color color) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(title, style: const TextStyle(fontSize: 11, color: Colors.white70)),
            Text('$percent%', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: color)),
          ],
        ),
        const SizedBox(height: 6),
        Stack(
          children: [
            Container(height: 6, width: double.infinity, decoration: BoxDecoration(color: Colors.white.withOpacity(0.05), borderRadius: BorderRadius.circular(3))),
            FractionallySizedBox(
              widthFactor: percent / 100.0,
              child: Container(height: 6, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(3))),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildBulletPoint(String highlight) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.only(top: 5.0),
            child: Icon(Icons.circle, color: Colors.white30, size: 6),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              highlight,
              style: const TextStyle(fontSize: 11, color: Colors.white54, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }
}
