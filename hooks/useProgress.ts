"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useOptionalAuth } from "@/contexts/AuthContext";

const KEY_WRONG = "vqm_wrong";
const KEY_RIGHT = "vqm_right";
const KEY_PLAYED = "vqm_played";
const KEY_CORRECT = "vqm_correct";
const KEY_XP = "vqm_xp";
const KEY_GAMES = "vqm_games";
const KEY_BEST_STREAK = "vqm_best_streak";
const KEY_WRONG_QUESTIONS = "vqm_wrong_questions"; // full question data for flashcards
const KEY_DAILY_STREAK = "vqm_daily_streak";
const KEY_DAILY_LAST_DATE = "vqm_daily_last_date";
const KEY_DAILY_COMPLETED = "vqm_daily_completed"; // date string of last completed daily
const KEY_CATEGORY_STATS = "vqm_category_stats"; // { [category]: { played, correct } }
const KEY_SPEED_RECORDS = "vqm_speed_records"; // { totalTime, totalAnswered } for avg speed
const KEY_LEITNER = "vqm_leitner"; // Spaced repetition: { [questionId]: 1|2|3 }
const KEY_GAME_HISTORY = "vqm_game_history"; // last N games played

export type LeitnerLevel = 1 | 2 | 3;
export interface LeitnerMap {
  [questionId: string]: LeitnerLevel;
}

export interface CategoryStats {
  [category: string]: { played: number; correct: number };
}

export interface SpeedRecord {
  totalTime: number;   // cumulative seconds spent answering
  totalAnswered: number; // total questions answered
  bestAvg: number;     // best average seconds per question in a single game
}

export interface GameHistoryEntry {
  date: number;        // timestamp
  score: number;
  total: number;
  category: string;    // "All" or category name
  mode: string;        // classique, blitz, etc.
  difficulty: string;  // easy, medium, hard
  streak: number;
}

export interface WrongQuestion {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  answeredAt: number; // timestamp
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

// XP thresholds: level N requires N*100 XP total
// Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, Level 4: 600 XP, etc.
export function getLevel(xp: number): { level: number; currentXp: number; xpForNext: number; progress: number; title: string; titleColor: string } {
  let level = 1;
  let cumulative = 0;
  while (cumulative + level * 100 <= xp) {
    cumulative += level * 100;
    level++;
  }
  const currentXp = xp - cumulative;
  const xpForNext = level * 100;
  const progress = Math.round((currentXp / xpForNext) * 100);
  const { title, color: titleColor } = getPrestigeTitle(level);
  return { level, currentXp, xpForNext, progress, title, titleColor };
}

const PRESTIGE_TITLES = [
  { minLevel: 1,  title: "Apprenti Teubé", color: "text-slate-400" },
  { minLevel: 6,  title: "Teubé Éclairé", color: "text-sky-400" },
  { minLevel: 16, title: "Maître du Réseau", color: "text-amber-400" },
  { minLevel: 31, title: "Oracle de la Matrice", color: "text-neon-cyan" },
];

function getPrestigeTitle(level: number): { title: string; color: string } {
  let result = PRESTIGE_TITLES[0];
  for (const t of PRESTIGE_TITLES) {
    if (level >= t.minLevel) result = t;
    else break;
  }
  return result;
}

// XP earned per game: 10 per correct + 5 bonus per streak point + 20 completion bonus
export function calculateGameXp(score: number, bestStreak: number, totalQuestions: number): number {
  const baseXp = score * 10;
  const streakBonus = bestStreak * 5;
  const completionBonus = 20;
  const accuracyBonus = totalQuestions > 0 && score === totalQuestions ? 50 : 0; // perfect game
  return baseXp + streakBonus + completionBonus + accuracyBonus;
}

export function useProgress() {
  const auth = useOptionalAuth();
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSyncRef = useRef<Record<string, unknown>>({});

  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [rightIds, setRightIds] = useState<number[]>([]);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [xp, setXp] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [globalBestStreak, setGlobalBestStreak] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<WrongQuestion[]>([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [dailyLastDate, setDailyLastDate] = useState("");
  const [dailyCompleted, setDailyCompleted] = useState("");
  const [categoryStats, setCategoryStats] = useState<CategoryStats>({});
  const [speedRecord, setSpeedRecord] = useState<SpeedRecord>({ totalTime: 0, totalAnswered: 0, bestAvg: 0 });
  const [leitner, setLeitner] = useState<LeitnerMap>({});
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Debounced Supabase sync — batches updates within 500ms
  const syncToSupabase = useCallback((fields: Record<string, unknown>) => {
    if (!auth?.user || !auth?.updateProfileField) return;
    Object.assign(pendingSyncRef.current, fields);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      const batch = { ...pendingSyncRef.current };
      pendingSyncRef.current = {};
      auth.updateProfileField(batch as Parameters<typeof auth.updateProfileField>[0]);
    }, 500);
  }, [auth]);

  // Hydrate: prefer Supabase profile if logged in, else localStorage
  useEffect(() => {
    if (auth?.loading) return; // wait for auth to resolve

    if (auth?.profile) {
      // Logged in — hydrate from Supabase profile
      const p = auth.profile;
      setXp(p.xp);
      setGamesPlayed(p.games_played);
      setTotalPlayed(p.total_played);
      setTotalCorrect(p.total_correct);
      setGlobalBestStreak(p.best_streak);
      setDailyStreak(p.daily_streak);
      setDailyLastDate(p.daily_last_date || "");
      setDailyCompleted(p.daily_completed || "");
      setCategoryStats(p.category_stats || {});
      setSpeedRecord(p.speed_record || { totalTime: 0, totalAnswered: 0, bestAvg: 0 });
      // These stay in localStorage only (too granular for DB)
      setWrongIds(load<number[]>(KEY_WRONG, []));
      setRightIds(load<number[]>(KEY_RIGHT, []));
      setWrongQuestions(load<WrongQuestion[]>(KEY_WRONG_QUESTIONS, []));
      setLeitner(load<LeitnerMap>(KEY_LEITNER, {}));
      setGameHistory(load<GameHistoryEntry[]>(KEY_GAME_HISTORY, []));
    } else {
      // Not logged in — localStorage fallback
      setWrongIds(load<number[]>(KEY_WRONG, []));
      setRightIds(load<number[]>(KEY_RIGHT, []));
      setTotalPlayed(load<number>(KEY_PLAYED, 0));
      setTotalCorrect(load<number>(KEY_CORRECT, 0));
      setXp(load<number>(KEY_XP, 0));
      setGamesPlayed(load<number>(KEY_GAMES, 0));
      setGlobalBestStreak(load<number>(KEY_BEST_STREAK, 0));
      setWrongQuestions(load<WrongQuestion[]>(KEY_WRONG_QUESTIONS, []));
      setDailyStreak(load<number>(KEY_DAILY_STREAK, 0));
      setDailyLastDate(load<string>(KEY_DAILY_LAST_DATE, ""));
      setDailyCompleted(load<string>(KEY_DAILY_COMPLETED, ""));
      setCategoryStats(load<CategoryStats>(KEY_CATEGORY_STATS, {}));
      setSpeedRecord(load<SpeedRecord>(KEY_SPEED_RECORDS, { totalTime: 0, totalAnswered: 0, bestAvg: 0 }));
      setLeitner(load<LeitnerMap>(KEY_LEITNER, {}));
      setGameHistory(load<GameHistoryEntry[]>(KEY_GAME_HISTORY, []));
    }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.loading, auth?.profile?.id]);

  const markWrong = useCallback((id: number) => {
    setWrongIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      save(KEY_WRONG, next);
      return next;
    });
    setRightIds((prev) => {
      const next = prev.filter((x) => x !== id);
      save(KEY_RIGHT, next);
      return next;
    });
    setTotalPlayed((prev) => {
      const next = prev + 1;
      save(KEY_PLAYED, next);
      syncToSupabase({ total_played: next });
      return next;
    });
  }, [syncToSupabase]);

  const markRight = useCallback((id: number) => {
    setRightIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      save(KEY_RIGHT, next);
      return next;
    });
    setTotalPlayed((prev) => {
      const next = prev + 1;
      save(KEY_PLAYED, next);
      syncToSupabase({ total_played: next });
      return next;
    });
    setTotalCorrect((prev) => {
      const next = prev + 1;
      save(KEY_CORRECT, next);
      syncToSupabase({ total_correct: next });
      return next;
    });
  }, [syncToSupabase]);

  const saveWrongQuestion = useCallback((q: Omit<WrongQuestion, "answeredAt">) => {
    setWrongQuestions((prev) => {
      const filtered = prev.filter((wq) => wq.id !== q.id);
      const next = [...filtered, { ...q, answeredAt: Date.now() }];
      save(KEY_WRONG_QUESTIONS, next);
      return next;
    });
    // Assign Leitner level 1 (reset if already higher)
    setLeitner((prev) => {
      const next = { ...prev, [String(q.id)]: 1 as LeitnerLevel };
      save(KEY_LEITNER, next);
      return next;
    });
  }, []);

  const dismissMistake = useCallback((id: number) => {
    setWrongIds((prev) => {
      const next = prev.filter((x) => x !== id);
      save(KEY_WRONG, next);
      return next;
    });
    setWrongQuestions((prev) => {
      const next = prev.filter((wq) => wq.id !== id);
      save(KEY_WRONG_QUESTIONS, next);
      return next;
    });
    setLeitner((prev) => {
      const next = { ...prev };
      delete next[String(id)];
      save(KEY_LEITNER, next);
      return next;
    });
  }, []);

  // Leitner: promote a question (correct in revision) — 1→2→3
  const promoteLeitner = useCallback((id: number) => {
    setLeitner((prev) => {
      const key = String(id);
      const current = prev[key] || 1;
      const next = { ...prev, [key]: Math.min(current + 1, 3) as LeitnerLevel };
      save(KEY_LEITNER, next);
      return next;
    });
  }, []);

  // Leitner: demote a question (wrong in revision) — back to 1
  const demoteLeitner = useCallback((id: number) => {
    setLeitner((prev) => {
      const next = { ...prev, [String(id)]: 1 as LeitnerLevel };
      save(KEY_LEITNER, next);
      return next;
    });
  }, []);

  // Leitner: get level for a question
  const getLeitnerLevel = useCallback((id: number): LeitnerLevel => {
    return leitner[String(id)] || 1;
  }, [leitner]);

  const addXp = useCallback((amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      save(KEY_XP, next);
      syncToSupabase({ xp: next });
      return next;
    });
  }, [syncToSupabase]);

  const recordGame = useCallback((bestStreak: number) => {
    setGamesPlayed((prev) => {
      const next = prev + 1;
      save(KEY_GAMES, next);
      syncToSupabase({ games_played: next });
      return next;
    });
    setGlobalBestStreak((prev) => {
      const next = Math.max(prev, bestStreak);
      save(KEY_BEST_STREAK, next);
      syncToSupabase({ best_streak: next });
      return next;
    });
  }, [syncToSupabase]);

  const recordCategoryAnswer = useCallback((category: string, isCorrect: boolean) => {
    setCategoryStats((prev) => {
      const existing = prev[category] || { played: 0, correct: 0 };
      const next = {
        ...prev,
        [category]: {
          played: existing.played + 1,
          correct: existing.correct + (isCorrect ? 1 : 0),
        },
      };
      save(KEY_CATEGORY_STATS, next);
      syncToSupabase({ category_stats: next });
      return next;
    });
  }, [syncToSupabase]);

  const recordSpeed = useCallback((timeSpentSeconds: number, questionsAnswered: number) => {
    if (questionsAnswered === 0) return;
    setSpeedRecord((prev) => {
      const newTotalTime = prev.totalTime + timeSpentSeconds;
      const newTotalAnswered = prev.totalAnswered + questionsAnswered;
      const gameAvg = timeSpentSeconds / questionsAnswered;
      const newBestAvg = prev.bestAvg === 0 ? gameAvg : Math.min(prev.bestAvg, gameAvg);
      const next = { totalTime: newTotalTime, totalAnswered: newTotalAnswered, bestAvg: newBestAvg };
      save(KEY_SPEED_RECORDS, next);
      syncToSupabase({ speed_record: next });
      return next;
    });
  }, [syncToSupabase]);

  const recordGameHistory = useCallback((entry: Omit<GameHistoryEntry, "date">) => {
    setGameHistory((prev) => {
      const next = [{ ...entry, date: Date.now() }, ...prev].slice(0, 20); // keep last 20
      save(KEY_GAME_HISTORY, next);
      return next;
    });
  }, []);

  const completeDaily = useCallback(() => {
    const today = getTodayStr();
    if (dailyCompleted === today) return;

    setDailyCompleted(today);
    save(KEY_DAILY_COMPLETED, today);

    const yesterday = getYesterdayStr();
    const newStreak = dailyLastDate === yesterday || dailyLastDate === today ? dailyStreak + 1 : 1;
    setDailyStreak(newStreak);
    save(KEY_DAILY_STREAK, newStreak);
    setDailyLastDate(today);
    save(KEY_DAILY_LAST_DATE, today);
    syncToSupabase({ daily_streak: newStreak, daily_last_date: today, daily_completed: today });
  }, [dailyCompleted, dailyLastDate, dailyStreak, syncToSupabase]);

  // Check if streak is still valid (hasn't been broken)
  const computedDailyStreak = (() => {
    if (!hydrated) return 0;
    const today = getTodayStr();
    const yesterday = getYesterdayStr();
    if (dailyLastDate === today || dailyLastDate === yesterday) return dailyStreak;
    return 0; // streak broken
  })();

  const isDailyCompleted = dailyCompleted === getTodayStr();

  const resetAll = useCallback(() => {
    save(KEY_WRONG, []);
    save(KEY_RIGHT, []);
    save(KEY_PLAYED, 0);
    save(KEY_CORRECT, 0);
    save(KEY_XP, 0);
    save(KEY_GAMES, 0);
    save(KEY_BEST_STREAK, 0);
    save(KEY_WRONG_QUESTIONS, []);
    save(KEY_DAILY_STREAK, 0);
    save(KEY_DAILY_LAST_DATE, "");
    save(KEY_DAILY_COMPLETED, "");
    save(KEY_CATEGORY_STATS, {});
    save(KEY_SPEED_RECORDS, { totalTime: 0, totalAnswered: 0, bestAvg: 0 });
    save(KEY_LEITNER, {});
    save(KEY_GAME_HISTORY, []);
    setWrongIds([]);
    setRightIds([]);
    setTotalPlayed(0);
    setTotalCorrect(0);
    setXp(0);
    setGamesPlayed(0);
    setGlobalBestStreak(0);
    setWrongQuestions([]);
    setDailyStreak(0);
    setDailyLastDate("");
    setDailyCompleted("");
    setCategoryStats({});
    setSpeedRecord({ totalTime: 0, totalAnswered: 0, bestAvg: 0 });
    setLeitner({});
    setGameHistory([]);
  }, []);

  const accuracy =
    totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;

  const levelInfo = getLevel(xp);

  return {
    hydrated,
    wrongIds,
    rightIds,
    totalPlayed,
    totalCorrect,
    accuracy,
    xp,
    levelInfo,
    gamesPlayed,
    globalBestStreak,
    wrongQuestions,
    dailyStreak: computedDailyStreak,
    isDailyCompleted,
    markWrong,
    markRight,
    saveWrongQuestion,
    dismissMistake,
    addXp,
    recordGame,
    categoryStats,
    speedRecord,
    leitner,
    gameHistory,
    recordCategoryAnswer,
    recordSpeed,
    recordGameHistory,
    promoteLeitner,
    demoteLeitner,
    getLeitnerLevel,
    completeDaily,
    resetAll,
  };
}

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
