"use client";
import { useState, useEffect, useCallback } from "react";

const KEY_STORY = "vqm_story_progress";

export interface StoryProgress {
  unlockedLevel: number;       // highest unlocked level (1-based)
  completedLevels: number[];   // list of completed level IDs
  levelScores: Record<number, { score: number; total: number; completedAt: number }>;
}

const DEFAULT_PROGRESS: StoryProgress = {
  unlockedLevel: 1,
  completedLevels: [],
  levelScores: {},
};

function load(): StoryProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(KEY_STORY);
    return raw ? { ...DEFAULT_PROGRESS, ...JSON.parse(raw) } : DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function save(progress: StoryProgress) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY_STORY, JSON.stringify(progress));
}

export function useStoryProgress() {
  const [progress, setProgress] = useState<StoryProgress>(DEFAULT_PROGRESS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(load());
    setHydrated(true);
  }, []);

  const completeLevel = useCallback((levelId: number, score: number, total: number) => {
    setProgress((prev) => {
      const next: StoryProgress = {
        ...prev,
        completedLevels: prev.completedLevels.includes(levelId)
          ? prev.completedLevels
          : [...prev.completedLevels, levelId],
        unlockedLevel: Math.max(prev.unlockedLevel, levelId + 1),
        levelScores: {
          ...prev.levelScores,
          [levelId]: { score, total, completedAt: Date.now() },
        },
      };
      save(next);
      return next;
    });
  }, []);

  const isLevelUnlocked = useCallback(
    (levelId: number) => levelId <= progress.unlockedLevel,
    [progress.unlockedLevel]
  );

  const isLevelCompleted = useCallback(
    (levelId: number) => progress.completedLevels.includes(levelId),
    [progress.completedLevels]
  );

  const getLevelScore = useCallback(
    (levelId: number) => progress.levelScores[levelId] || null,
    [progress.levelScores]
  );

  return {
    hydrated,
    progress,
    completeLevel,
    isLevelUnlocked,
    isLevelCompleted,
    getLevelScore,
  };
}
