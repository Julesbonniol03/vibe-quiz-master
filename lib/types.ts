export type Category = "Histoire" | "Sciences" | "Arts" | "Sport";

export interface Question {
  id: number;
  category: Category;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizState {
  currentQuestion: number;
  score: number;
  streak: number;
  bestStreak: number;
  answers: (number | null)[];
  timeLeft: number;
  phase: "idle" | "playing" | "answered" | "finished";
  selectedOption: number | null;
  selectedCategory: Category | "All";
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  category: string;
  badge: string;
}

export interface UserStats {
  totalScore: number;
  gamesPlayed: number;
  bestStreak: number;
  accuracy: number;
  categoryScores: Record<Category, number>;
}
