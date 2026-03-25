"use client";
import { useState, useEffect, useCallback } from "react";

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
export function getLevel(xp: number): { level: number; currentXp: number; xpForNext: number; progress: number } {
  let level = 1;
  let cumulative = 0;
  while (cumulative + level * 100 <= xp) {
    cumulative += level * 100;
    level++;
  }
  const currentXp = xp - cumulative;
  const xpForNext = level * 100;
  const progress = Math.round((currentXp / xpForNext) * 100);
  return { level, currentXp, xpForNext, progress };
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
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
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
    setHydrated(true);
  }, []);

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
    setTotalPlayed((prev) => { save(KEY_PLAYED, prev + 1); return prev + 1; });
  }, []);

  const markRight = useCallback((id: number) => {
    setRightIds((prev) => {
      const next = prev.includes(id) ? prev : [...prev, id];
      save(KEY_RIGHT, next);
      return next;
    });
    setTotalPlayed((prev) => { save(KEY_PLAYED, prev + 1); return prev + 1; });
    setTotalCorrect((prev) => { save(KEY_CORRECT, prev + 1); return prev + 1; });
  }, []);

  const saveWrongQuestion = useCallback((q: Omit<WrongQuestion, "answeredAt">) => {
    setWrongQuestions((prev) => {
      // Replace if already exists, else add
      const filtered = prev.filter((wq) => wq.id !== q.id);
      const next = [...filtered, { ...q, answeredAt: Date.now() }];
      save(KEY_WRONG_QUESTIONS, next);
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
  }, []);

  const addXp = useCallback((amount: number) => {
    setXp((prev) => {
      const next = prev + amount;
      save(KEY_XP, next);
      return next;
    });
  }, []);

  const recordGame = useCallback((bestStreak: number) => {
    setGamesPlayed((prev) => {
      const next = prev + 1;
      save(KEY_GAMES, next);
      return next;
    });
    setGlobalBestStreak((prev) => {
      const next = Math.max(prev, bestStreak);
      save(KEY_BEST_STREAK, next);
      return next;
    });
  }, []);

  const completeDaily = useCallback(() => {
    const today = getTodayStr();
    // Already completed today
    if (dailyCompleted === today) return;

    setDailyCompleted(today);
    save(KEY_DAILY_COMPLETED, today);

    // Update streak: if yesterday was the last play date, increment; else reset to 1
    const yesterday = getYesterdayStr();
    const newStreak = dailyLastDate === yesterday || dailyLastDate === today ? dailyStreak + 1 : 1;
    setDailyStreak(newStreak);
    save(KEY_DAILY_STREAK, newStreak);
    setDailyLastDate(today);
    save(KEY_DAILY_LAST_DATE, today);
  }, [dailyCompleted, dailyLastDate, dailyStreak]);

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
