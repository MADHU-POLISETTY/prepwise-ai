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
  atsScore: number;
  keywordMatches: { word: string; matched: boolean }[];
  missingSkills: string[];
}

export type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface UserStats {
  completedInterviews: number;
  averageScore: number;
  currentStreak: number;
  xp: number;
  unlockedBadges: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  xpAward: number;
  icon: string;
}

export interface LeaderboardUser {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
  isCurrentUser?: boolean;
}

