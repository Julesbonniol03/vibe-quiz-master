"use client";

import { useProgress } from "@/hooks/useProgress";
import { motion } from "framer-motion";

export function StatsGrid() {
  const { hydrated, levelInfo, gamesPlayed, globalBestStreak, accuracy, totalPlayed } = useProgress();

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
    { label: "Parties Jouées", value: `${gamesPlayed}`, sub: `${totalPlayed} questions`, icon: "🎮", color: "text-neon-cyan" },
    { label: "Meilleur Streak", value: `${globalBestStreak}`, sub: "d'affilée", icon: "🔥", color: "text-neon-rose" },
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
          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
          style={{ boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)" }}
        />
      </div>
      <span className="text-slate-600 text-xs tabular-nums whitespace-nowrap">
        {xp} XP total
      </span>
    </motion.div>
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
