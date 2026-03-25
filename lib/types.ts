export type Category =
  | "Histoire"
  | "Sciences"
  | "Géographie"
  | "Pop Culture"
  | "Sport"
  | "Arts & Littérature"
  | "Nature & Animaux"
  | "Technologie"
  | "Gastronomie"
  | "Mythologie & Religions"
  | "Cinéma"
  | "Musique"
  | "Économie & Business"
  | "Espace & Astronomie"
  | "Philosophie"
  | "Maîtrise du Français"
  | "Actualités 2025-2026";

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
