"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";
import { motion } from "framer-motion";
import Link from "next/link";

export function StatsGrid() {
  const { hydrated, levelInfo, gamesPlayed, globalBestStreak, accuracy, totalPlayed, dailyStreak } = useProgress();

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card !rounded-2xl p-5 animate-pulse">
            <div className="w-8 h-8 bg-white/5 rounded-lg mb-2" />
            <div className="w-16 h-6 bg-white/5 rounded mb-1" />
            <div className="w-20 h-4 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Niveau", value: `${levelInfo.level}`, sub: `${levelInfo.currentXp}/${levelInfo.xpForNext} XP`, icon: "⭐", color: "text-yellow-400" },
    { label: "Flamme Quotidienne", value: `${dailyStreak}`, sub: dailyStreak > 0 ? `jour${dailyStreak > 1 ? "s" : ""} d'affilée` : "Jouez le défi !", icon: "🔥", color: "text-orange-400" },
    { label: "Parties Jouées", value: `${gamesPlayed}`, sub: `${totalPlayed} questions · streak ${globalBestStreak}`, icon: "🎮", color: "text-neon-cyan" },
    { label: "Précision", value: `${accuracy}%`, sub: `${totalPlayed} réponses`, icon: "🎯", color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card !rounded-2xl p-5 hover:bg-white/[0.04] transition-colors"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
          <div className="text-slate-600 text-sm">{stat.label}</div>
          <div className="text-slate-700 text-xs mt-0.5">{stat.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}

export function XpBar() {
  const { hydrated, xp, levelInfo } = useProgress();

  if (!hydrated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mt-3"
    >
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
        <span className="text-amber-400 text-sm font-bold">Niv. {levelInfo.level}</span>
      </div>
      <div className="flex-1 bg-white/[0.06] rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose animate-xp-pulse"
        />
      </div>
      <span className="text-slate-600 text-xs tabular-nums whitespace-nowrap">
        {xp} XP total
      </span>
    </motion.div>
  );
}

export function DailyBanner() {
  const { hydrated, dailyStreak, isDailyCompleted } = useProgress();
  if (!hydrated) return null;

  return (
    <div className="relative overflow-hidden bg-cyber-900 border border-neon-rose/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-neon-cyan/[0.03]" />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
          🎯
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Défi du jour</span>
            {dailyStreak > 0 && (
              <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                🔥 {dailyStreak}j
              </span>
            )}
            {isDailyCompleted && (
              <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                ✅ Fait
              </span>
            )}
          </div>
          <p className="text-white font-semibold">5 questions identiques pour tout le monde</p>
          <p className="text-slate-500 text-sm">Toutes catégories · Timer 15s · Changent chaque jour</p>
        </div>
      </div>
      <a
        href="/quiz?mode=daily"
        className={`relative px-5 py-2.5 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap ${
          isDailyCompleted
            ? "bg-white/5 border border-white/10 text-slate-400 shadow-none"
            : "bg-purple-500 hover:bg-purple-500/90 text-white shadow-purple-500/20"
        }`}
      >
        {isDailyCompleted ? "Revenir demain" : "Relever le défi →"}
      </a>
    </div>
  );
}

export function RevisionCta() {
  const { hydrated, wrongQuestions } = useProgress();
  if (!hydrated || wrongQuestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card !rounded-2xl p-5 mb-8 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
        📖
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold">{wrongQuestions.length} question{wrongQuestions.length > 1 ? "s" : ""} à réviser</p>
        <p className="text-slate-500 text-sm">Revoyez vos erreurs avec des flashcards</p>
      </div>
      <a
        href="/reviser"
        className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold rounded-xl hover:bg-amber-500/20 transition-colors text-sm whitespace-nowrap"
      >
        Réviser →
      </a>
    </motion.div>
  );
}

// ─── DAILY ODYSSEY BANNER ───
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export function DailyOdyssey() {
  const { hydrated, isDailyCompleted, dailyStreak } = useProgress();
  const countdown = useCountdown();

  if (!hydrated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 rounded-2xl overflow-hidden"
    >
      {/* Animated glow border */}
      <div className="absolute inset-0 rounded-2xl animate-glow-border" />

      {/* Inner content with 2px inset to show the glow border */}
      <div className="relative m-[2px] rounded-[14px] bg-cyber-900 p-5 sm:p-6">
        <div className="absolute inset-0 overflow-hidden rounded-[14px]">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-cyan/[0.04] rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-rose/[0.03] rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-rose/20 border border-neon-cyan/20 flex items-center justify-center text-3xl flex-shrink-0"
            >
              🎯
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-neon-cyan font-bold text-sm uppercase tracking-wider">Quête du Jour</span>
                {dailyStreak > 0 && (
                  <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                    🔥 {dailyStreak}j
                  </span>
                )}
                {isDailyCompleted && (
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                    ✅ Accomplie
                  </span>
                )}
              </div>
              <p className="text-white font-semibold text-sm sm:text-base">
                5 questions &middot; Tous thèmes &middot; Timer 15s
              </p>
              {!isDailyCompleted && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-slate-600 text-xs">Prochaine quête dans</span>
                  <span className="text-neon-cyan font-mono text-xs font-bold tabular-nums bg-neon-cyan/5 border border-neon-cyan/10 rounded-lg px-2 py-0.5">
                    {countdown}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/quiz?mode=daily"
            className={`px-5 py-2.5 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${
              isDailyCompleted
                ? "bg-white/5 border border-white/10 text-slate-500 shadow-none"
                : "bg-gradient-to-r from-neon-cyan to-neon-cyan/80 text-cyber-950 shadow-lg shadow-neon-cyan/20"
            }`}
          >
            {isDailyCompleted ? "Revenir demain" : "Relever le défi →"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ONLINE PLAYERS (simulated social proof) ───
export function OnlineCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Simulated: base 120-180, fluctuates slightly
    const base = 120 + Math.floor(Math.random() * 60);
    setCount(base);
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 7) - 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-slate-600 text-sm flex items-center gap-1.5 mt-1"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>⚡️ {count} joueurs en ligne actuellement</span>
    </motion.p>
  );
}
