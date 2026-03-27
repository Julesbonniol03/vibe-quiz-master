"use client";

import { motion } from "framer-motion";
import { useStoryProgress } from "@/hooks/useStoryProgress";
import StoryMap from "@/components/StoryMap";
import Link from "next/link";

interface StoryLevel {
  id: number;
  day: number;
  title: string;
  description: string;
  category: string;
}

interface StoryModeClientProps {
  levels: StoryLevel[];
}

export default function StoryModeClient({ levels }: StoryModeClientProps) {
  const { hydrated, progress, isLevelUnlocked, isLevelCompleted, getLevelScore } = useStoryProgress();

  const completedCount = progress.completedLevels.length;
  const progressPct = Math.round((completedCount / 30) * 100);

  if (!hydrated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-40 bg-white/[0.03] rounded-3xl" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-white/[0.03] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-cyber-900 border border-white/[0.06] p-8 mb-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/[0.06] rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-neon-cyan/[0.04] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚔️</span>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Mode{" "}
                <span className="bg-gradient-to-r from-purple-400 to-neon-rose bg-clip-text text-transparent">
                  Epopee
                </span>
              </h1>
              <p className="text-slate-500 text-sm">Apprentissage en 30 jours</p>
            </div>
          </div>

          <p className="text-slate-400 mb-6 max-w-xl">
            De l&apos;Antiquite au Futur, parcours 30 niveaux pour maitriser les bases de la culture G.
            Chaque niveau debloque le suivant.
          </p>

          {/* Progress bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/[0.06] rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-neon-rose"
              />
            </div>
            <span className="text-slate-400 text-sm font-bold tabular-nums">{completedCount}/30</span>
          </div>

          {/* Phase indicators */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { emoji: "🏛️", label: "Antiquite - 17e", range: "Jours 1-10", done: progress.completedLevels.filter((l) => l <= 10).length, total: 10, color: "amber" },
              { emoji: "💡", label: "Les Lumieres", range: "Jours 11-20", done: progress.completedLevels.filter((l) => l > 10 && l <= 20).length, total: 10, color: "blue" },
              { emoji: "🚀", label: "Monde Moderne", range: "Jours 21-30", done: progress.completedLevels.filter((l) => l > 20).length, total: 10, color: "rose" },
            ].map((phase) => (
              <div
                key={phase.label}
                className={`bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 text-center`}
              >
                <span className="text-xl">{phase.emoji}</span>
                <p className="text-white text-xs font-semibold mt-1">{phase.label}</p>
                <p className="text-slate-600 text-[10px]">{phase.range}</p>
                <p className={`text-xs font-bold mt-1 ${phase.done === phase.total ? "text-green-400" : "text-slate-500"}`}>
                  {phase.done}/{phase.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Switch to Mode Libre */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1">
          <Link
            href="/dashboard"
            className="px-5 py-2 text-sm font-medium text-slate-500 rounded-xl hover:text-white hover:bg-white/[0.04] transition-all"
          >
            Mode Libre
          </Link>
          <div className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500/20 to-neon-rose/20 border border-purple-500/20 rounded-xl">
            Mode Epopee
          </div>
        </div>
      </div>

      {/* Story Map */}
      <StoryMap
        levels={levels}
        isLevelUnlocked={isLevelUnlocked}
        isLevelCompleted={isLevelCompleted}
        getLevelScore={getLevelScore}
      />
    </div>
  );
}
