class InterviewResult {
  final String id;
  final String role;
  final String difficulty;
  final String category;
  final int score;
  final int technicalScore;
  final int communicationScore;
  final int confidenceScore;
  final String feedback;
  final DateTime completedAt;

  InterviewResult({
    required this.id,
    required this.role,
    required this.difficulty,
    required this.category,
    required this.score,
    required this.technicalScore,
    required this.communicationScore,
    required this.confidenceScore,
    required this.feedback,
    required this.completedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'role': role,
      'difficulty': difficulty,
      'category': category,
      'score': score,
      'technicalScore': technicalScore,
      'communicationScore': communicationScore,
      'confidenceScore': confidenceScore,
      'feedback': feedback,
      'completedAt': completedAt.toIso8601String(),
    };
  }

  factory InterviewResult.fromJson(Map<String, dynamic> json) {
    return InterviewResult(
      id: json['id'] as String,
      role: json['role'] as String,
      difficulty: json['difficulty'] as String,
      category: json['category'] as String,
      score: json['score'] as int,
      technicalScore: json['technicalScore'] as int,
      communicationScore: json['communicationScore'] as int,
      confidenceScore: json['confidenceScore'] as int,
      feedback: json['feedback'] as String,
      completedAt: DateTime.parse(json['completedAt'] as String),
    );
  }
}
