"use client";

import { useState, useEffect, useCallback } from "react";

const KEY_ACHIEVEMENTS = "vqm_achievements";

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: string;       // tailwind text color
  glowColor: string;   // CSS rgba for shadow
}

export const ACHIEVEMENTS: Achievement[] = [
  // Maîtrise par catégorie
  { id: "moliere", name: "Molière", desc: "Zéro faute en Français", icon: "📝", color: "text-blue-400", glowColor: "rgba(96,165,250,0.5)" },
  { id: "napoleon", name: "Napoléon", desc: "Roi de l'Histoire — zéro faute", icon: "🏛️", color: "text-amber-400", glowColor: "rgba(251,191,36,0.5)" },
  { id: "pasteur", name: "Pasteur", desc: "Zéro faute en Sciences", icon: "🔬", color: "text-cyan-400", glowColor: "rgba(34,211,238,0.5)" },

  // Modes spéciaux
  { id: "leclair", name: "L'Éclair", desc: "10/10 en mode Blitz", icon: "⚡", color: "text-yellow-400", glowColor: "rgba(250,204,21,0.5)" },
  { id: "increvable", name: "L'Increvable", desc: "20 questions en Mort Subite", icon: "💀", color: "text-rose-400", glowColor: "rgba(251,113,133,0.5)" },
  { id: "cerveau", name: "Le Cerveau", desc: "10/10 en mode Expert", icon: "🧠", color: "text-neon-green", glowColor: "rgba(0,255,65,0.5)" },

  // Exploration
  { id: "voyageur", name: "Le Voyageur Temporel", desc: "50+ questions d'Histoire jouées", icon: "🕰️", color: "text-purple-400", glowColor: "rgba(192,132,252,0.5)" },
  { id: "premiere-partie", name: "La Recrue", desc: "Terminer sa première partie", icon: "🎮", color: "text-green-400", glowColor: "rgba(74,222,128,0.5)" },

  // Séries
  { id: "streak5", name: "En Flammes", desc: "Série de 5 bonnes réponses", icon: "🔥", color: "text-orange-400", glowColor: "rgba(251,146,60,0.5)" },
  { id: "streak10", name: "L'Inarrêtable", desc: "Série de 10 bonnes réponses", icon: "💥", color: "text-red-400", glowColor: "rgba(248,113,113,0.5)" },

  // Progression
  { id: "cent-questions", name: "Le Centurion", desc: "Répondre à 100 questions", icon: "🏅", color: "text-amber-400", glowColor: "rgba(251,191,36,0.5)" },
  { id: "daily7", name: "Le Rituel", desc: "7 jours de défi quotidien d'affilée", icon: "📅", color: "text-indigo-400", glowColor: "rgba(129,140,248,0.5)" },
];

export interface GameContext {
  score: number;
  total: number;
  category: string;
  mode: string;
  difficulty: string;
  streak: number;
  totalPlayed: number;
  globalBestStreak: number;
  dailyStreak: number;
  categoryStats: Record<string, { played: number; correct: number }>;
  gameHistory: { category: string; mode: string }[];
}

export function evaluateAchievements(ctx: GameContext, unlocked: string[]): string[] {
  const newlyUnlocked: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (!unlocked.includes(id) && condition) newlyUnlocked.push(id);
  };

  const accuracy = ctx.total > 0 ? ctx.score / ctx.total : 0;
  const isPerfect = ctx.total > 0 && ctx.score === ctx.total;

  // Maîtrise par catégorie (zéro faute, 10+ questions)
  check("moliere", ctx.category === "Maîtrise du Français" && isPerfect && ctx.total >= 10);
  check("napoleon", ctx.category === "Histoire" && isPerfect && ctx.total >= 10);
  check("pasteur", ctx.category === "Sciences" && isPerfect && ctx.total >= 10);

  // Modes spéciaux
  check("leclair", ctx.mode === "blitz" && isPerfect && ctx.total >= 10);
  check("increvable", ctx.mode === "mort-subite" && ctx.score >= 20);
  check("cerveau", ctx.difficulty === "hard" && isPerfect && ctx.total >= 10);

  // Exploration
  const histStats = ctx.categoryStats["Histoire"];
  check("voyageur", histStats !== undefined && histStats.played >= 50);
  check("premiere-partie", true);

  // Séries
  check("streak5", ctx.globalBestStreak >= 5 || ctx.streak >= 5);
  check("streak10", ctx.globalBestStreak >= 10 || ctx.streak >= 10);

  // Progression
  check("cent-questions", ctx.totalPlayed >= 100);
  check("daily7", ctx.dailyStreak >= 7);

  return newlyUnlocked;
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [pending, setPending] = useState<Achievement[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY_ACHIEVEMENTS);
      setUnlocked(raw ? JSON.parse(raw) : []);
    } catch {
      setUnlocked([]);
    }
    setHydrated(true);
  }, []);

  const unlock = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setUnlocked((prev) => {
      const next = Array.from(new Set([...prev, ...ids]));
      localStorage.setItem(KEY_ACHIEVEMENTS, JSON.stringify(next));
      return next;
    });
    // Queue toasts
    const newBadges = ids.map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean) as Achievement[];
    setPending((prev) => [...prev, ...newBadges]);
  }, []);

  const dismissToast = useCallback(() => {
    setPending((prev) => prev.slice(1));
  }, []);

  const isUnlocked = useCallback((id: string) => unlocked.includes(id), [unlocked]);

  return { unlocked, hydrated, pending, unlock, dismissToast, isUnlocked };
}
