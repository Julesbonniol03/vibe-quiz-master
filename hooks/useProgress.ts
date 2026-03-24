"use client";
import { useState, useEffect, useCallback } from "react";

const KEY_WRONG = "vqm_wrong";
const KEY_RIGHT = "vqm_right";
const KEY_PLAYED = "vqm_played";
const KEY_CORRECT = "vqm_correct";

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

export function useProgress() {
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [rightIds, setRightIds] = useState<number[]>([]);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setWrongIds(load<number[]>(KEY_WRONG, []));
    setRightIds(load<number[]>(KEY_RIGHT, []));
    setTotalPlayed(load<number>(KEY_PLAYED, 0));
    setTotalCorrect(load<number>(KEY_CORRECT, 0));
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

  const dismissMistake = useCallback((id: number) => {
    setWrongIds((prev) => {
      const next = prev.filter((x) => x !== id);
      save(KEY_WRONG, next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    save(KEY_WRONG, []);
    save(KEY_RIGHT, []);
    save(KEY_PLAYED, 0);
    save(KEY_CORRECT, 0);
    setWrongIds([]);
    setRightIds([]);
    setTotalPlayed(0);
    setTotalCorrect(0);
  }, []);

  const accuracy =
    totalPlayed > 0 ? Math.round((totalCorrect / totalPlayed) * 100) : 0;

  return {
    hydrated,
    wrongIds,
    rightIds,
    totalPlayed,
    totalCorrect,
    accuracy,
    markWrong,
    markRight,
    dismissMistake,
    resetAll,
  };
}
