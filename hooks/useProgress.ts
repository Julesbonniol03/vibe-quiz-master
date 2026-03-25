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

  const resetAll = useCallback(() => {
    save(KEY_WRONG, []);
    save(KEY_RIGHT, []);
    save(KEY_PLAYED, 0);
    save(KEY_CORRECT, 0);
    save(KEY_XP, 0);
    save(KEY_GAMES, 0);
    save(KEY_BEST_STREAK, 0);
    save(KEY_WRONG_QUESTIONS, []);
    setWrongIds([]);
    setRightIds([]);
    setTotalPlayed(0);
    setTotalCorrect(0);
    setXp(0);
    setGamesPlayed(0);
    setGlobalBestStreak(0);
    setWrongQuestions([]);
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
    markWrong,
    markRight,
    saveWrongQuestion,
    dismissMistake,
    addXp,
    recordGame,
    resetAll,
  };
}
