"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface StoryLevel {
  id: number;
  day: number;
  title: string;
  description: string;
  category: string;
}

interface StoryMapProps {
  levels: StoryLevel[];
  isLevelUnlocked: (id: number) => boolean;
  isLevelCompleted: (id: number) => boolean;
  getLevelScore: (id: number) => { score: number; total: number } | null;
}

const PHASE_COLORS = {
  antiquity: { gradient: "from-amber-500/20 to-amber-600/10", border: "border-amber-500/30", text: "text-amber-400", glow: "shadow-amber-500/20" },
  lumieres: { gradient: "from-blue-500/20 to-blue-600/10", border: "border-blue-500/30", text: "text-blue-400", glow: "shadow-blue-500/20" },
  moderne: { gradient: "from-neon-rose/20 to-purple-600/10", border: "border-neon-rose/30", text: "text-neon-rose", glow: "shadow-neon-rose/20" },
};

function getPhase(day: number) {
  if (day <= 10) return { label: "Antiquite au 17eme", color: PHASE_COLORS.antiquity, emoji: "🏛️" };
  if (day <= 20) return { label: "18eme - Les Lumieres", color: PHASE_COLORS.lumieres, emoji: "💡" };
  return { label: "Monde Moderne", color: PHASE_COLORS.moderne, emoji: "🚀" };
}

function getStars(score: number, total: number): number {
  const pct = (score / total) * 100;
  if (pct >= 100) return 3;
  if (pct >= 60) return 2;
  if (pct > 0) return 1;
  return 0;
}

export default function StoryMap({ levels, isLevelUnlocked, isLevelCompleted, getLevelScore }: StoryMapProps) {
  let currentPhaseLabel = "";

  return (
    <div className="max-w-2xl mx-auto py-4">
      <div className="relative">
        {/* Vertical path line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-amber-500/20 via-blue-500/20 to-neon-rose/20 -translate-x-1/2" />

        <div className="space-y-4">
          {levels.map((level, idx) => {
            const unlocked = isLevelUnlocked(level.id);
            const completed = isLevelCompleted(level.id);
            const scoreData = getLevelScore(level.id);
            const stars = scoreData ? getStars(scoreData.score, scoreData.total) : 0;
            const phase = getPhase(level.day);
            const isNewPhase = phase.label !== currentPhaseLabel;
            if (isNewPhase) currentPhaseLabel = phase.label;
            const isEven = idx % 2 === 0;

            return (
              <div key={level.id}>
                {/* Phase header */}
                {isNewPhase && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-6 mt-4"
                  >
                    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${phase.color.gradient} border ${phase.color.border} rounded-full px-5 py-2 relative z-10`}>
                      <span className="text-lg">{phase.emoji}</span>
                      <span className={`font-bold text-sm uppercase tracking-wider ${phase.color.text}`}>{phase.label}</span>
                    </div>
                  </motion.div>
                )}

                {/* Level node */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`relative flex items-center gap-4 ${isEven ? "flex-row" : "flex-row-reverse"}`}
                >
                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Node circle on the line */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                        completed
                          ? `bg-gradient-to-br ${phase.color.gradient} border-2 ${phase.color.border} shadow-lg ${phase.color.glow}`
                          : unlocked
                          ? "bg-neon-cyan/20 border-2 border-neon-cyan/40 shadow-lg shadow-neon-cyan/20 animate-pulse"
                          : "bg-white/[0.04] border-2 border-white/[0.08]"
                      }`}
                    >
                      {completed ? (
                        <span className="text-green-400">✓</span>
                      ) : unlocked ? (
                        <span className="text-neon-cyan">{level.day}</span>
                      ) : (
                        <span className="text-slate-600">🔒</span>
                      )}
                    </div>
                  </div>

                  {/* Level card */}
                  <div className="flex-1">
                    {unlocked ? (
                      <Link href={`/story-mode/level/${level.id}`}>
                        <div
                          className={`glass-card !rounded-2xl p-4 transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${
                            completed
                              ? `border ${phase.color.border} bg-gradient-to-r ${phase.color.gradient}`
                              : "hover:bg-white/[0.04] border-2 border-neon-cyan/20 hover:border-neon-cyan/40"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold uppercase tracking-wider ${phase.color.text}`}>
                              Jour {level.day}
                            </span>
                            {completed && stars > 0 && (
                              <span className="text-yellow-400 text-xs">
                                {"★".repeat(stars)}{"☆".repeat(3 - stars)}
                              </span>
                            )}
                          </div>
                          <h3 className="text-white font-bold text-sm leading-tight mb-1">{level.title}</h3>
                          <p className="text-slate-500 text-xs line-clamp-1">{level.description}</p>
                          {scoreData && (
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 bg-white/[0.06] rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose`}
                                  style={{ width: `${(scoreData.score / scoreData.total) * 100}%` }}
                                />
                              </div>
                              <span className="text-slate-500 text-xs">{scoreData.score}/{scoreData.total}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="glass-card !rounded-2xl p-4 opacity-40">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Jour {level.day}</span>
                        </div>
                        <h3 className="text-slate-500 font-bold text-sm leading-tight mb-1">{level.title}</h3>
                        <p className="text-slate-700 text-xs">Termine le jour {level.day - 1} pour debloquer</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Final trophy at the bottom */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center mt-8"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/30 flex items-center justify-center text-3xl relative z-10 shadow-lg shadow-yellow-500/20">
            🏆
          </div>
        </motion.div>
      </div>
    </div>
  );
}
