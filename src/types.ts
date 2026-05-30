export type InterviewCategory = 'HR' | 'Technical' | 'Aptitude';

export interface Question {
  id: number;
  text: string;
  category: InterviewCategory;
}

export interface Answer {
  questionId: number;
  questionText: string;
  answerText: string;
}

export interface InterviewResult {
  id: string;
  userId: string;
  category: InterviewCategory;
  role?: string;
  answers: Answer[];
  score: number;
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  feedback: string;
  completedAt: string;
}

export interface User {
  uid: string;
  email: string;
  createdAt: string;
}

export interface ResumeAnalysisResult {
  skills: string[];
  strengths: string[];
  improvements: string[];
  summary: string;
}
