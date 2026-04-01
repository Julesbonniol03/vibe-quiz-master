"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress, WrongQuestion, LeitnerLevel } from "@/hooks/useProgress";
import { categoryColors } from "@/lib/questions";
import { useFeedback } from "@/hooks/useFeedback";

const LEITNER_INFO: Record<LeitnerLevel, { label: string; icon: string; color: string; bg: string; border: string }> = {
  1: { label: "À revoir", icon: "🔴", color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/20" },
  2: { label: "En cours", icon: "🟡", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  3: { label: "Apprise", icon: "🟢", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
};

export default function ReviserPage() {
  const progress = useProgress();
  const { correctFeedback, wrongFeedback } = useFeedback();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [lastAction, setLastAction] = useState<"correct" | "wrong" | null>(null);

  const { hydrated, wrongQuestions, leitner, promoteLeitner, demoteLeitner, getLeitnerLevel, dismissMistake } = progress;

  // Filter questions
  const filtered = (filter === "all"
    ? wrongQuestions
    : wrongQuestions.filter((q) => q.category === filter)
  ).sort((a, b) => {
    // Prioritize level 1, then 2, then 3
    const la = getLeitnerLevel(a.id);
    const lb = getLeitnerLevel(b.id);
    return la - lb;
  });

  const categories = Array.from(new Set(wrongQuestions.map((q) => q.category))).sort();
  const currentCard = filtered[currentIndex] as WrongQuestion | undefined;

  // Compute mastery stats
  const masteryStats = computeMastery(wrongQuestions, leitner, filter);

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleNext = useCallback(() => {
    setFlipped(false);
    setLastAction(null);
    setCurrentIndex((i) => Math.min(i + 1, filtered.length - 1));
  }, [filtered.length]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setLastAction(null);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  // "I knew it" — promote in Leitner
  const handleKnewIt = useCallback(() => {
    if (!currentCard) return;
    const level = getLeitnerLevel(currentCard.id);
    if (level >= 3) {
      // Already mastered, dismiss
      dismissMistake(currentCard.id);
    } else {
      promoteLeitner(currentCard.id);
    }
    correctFeedback();
    setLastAction("correct");
    setFlipped(false);
    setTimeout(() => {
      setLastAction(null);
      setCurrentIndex((i) => {
        const newLen = level >= 3 ? filtered.length - 1 : filtered.length;
        if (newLen <= 0) return 0;
        return Math.min(i, newLen - 1);
      });
    }, 400);
  }, [currentCard, getLeitnerLevel, promoteLeitner, dismissMistake, correctFeedback, filtered.length]);

  // "Still wrong" — demote in Leitner
  const handleStillWrong = useCallback(() => {
    if (!currentCard) return;
    demoteLeitner(currentCard.id);
    wrongFeedback();
    setLastAction("wrong");
    setFlipped(false);
    setTimeout(() => {
      setLastAction(null);
      setCurrentIndex((i) => Math.min(i + 1, filtered.length - 1));
    }, 400);
  }, [currentCard, demoteLeitner, wrongFeedback, filtered.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!hydrated || filtered.length === 0) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleFlip(); }
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hydrated, filtered.length, handleFlip, handleNext, handlePrev]);

  if (!hydrated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6 animate-pulse">📖</div>
        <p className="text-slate-500 text-lg">Chargement...</p>
      </div>
    );
  }

  if (wrongQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="text-6xl mb-6">
          🎉
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-3">Rien à réviser !</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Vous n&apos;avez aucune erreur à revoir. Jouez un quiz pour commencer à suivre vos erreurs.
        </p>
        <Link
          href="/quiz"
          className="inline-block px-6 py-3 bg-gradient-to-r from-neon-green to-neon-red text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neon-green/20"
        >
          Jouer un quiz →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="text-5xl mb-4">📖</div>
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="gradient-text">Révisions</span>
        </h1>
        <p className="text-slate-500">
          {wrongQuestions.length} question{wrongQuestions.length > 1 ? "s" : ""} · Répétition Espacée
        </p>
      </div>

      {/* Mastery Progress Bar */}
      <MasteryBar stats={masteryStats} />

      {/* Leitner Level Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {([1, 2, 3] as LeitnerLevel[]).map((level) => {
          const info = LEITNER_INFO[level];
          const count = masteryStats.byLevel[level];
          return (
            <motion.div
              key={level}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: level * 0.1 }}
              className={`${info.bg} border ${info.border} rounded-xl p-3 text-center`}
            >
              <div className="text-lg mb-0.5">{info.icon}</div>
              <div className={`text-xl font-bold ${info.color} nums`}>{count}</div>
              <div className="text-slate-500 text-[10px]">{info.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Category Filter */}
      <CategoryFilter categories={categories} filter={filter} setFilter={setFilter} onFilterChange={() => setCurrentIndex(0)} />

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500">Aucune erreur dans cette catégorie.</p>
          <button onClick={() => { setFilter("all"); setCurrentIndex(0); }} className="mt-4 text-neon-green text-sm hover:underline">
            Voir toutes les catégories
          </button>
        </div>
      ) : (
        <>
          {/* Card Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">{currentIndex + 1} / {filtered.length}</span>
            {currentCard && (
              <LeitnerBadge level={getLeitnerLevel(currentCard.id)} />
            )}
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-6 overflow-hidden">
            <motion.div
              className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
              animate={{ width: `${((currentIndex + 1) / filtered.length) * 100}%` }}
              transition={{ duration: 0.3 }}
              style={{ boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)" }}
            />
          </div>

          {/* Flashcard */}
          <div style={{ perspective: "1200px" }} className="mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentCard?.id}-${currentIndex}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: lastAction === "correct" ? [1, 1.03, 1] : lastAction === "wrong" ? [1, 0.97, 1] : 1,
                }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.25 }}
              >
                <div
                  onClick={handleFlip}
                  className="cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") handleFlip(); }}
                >
                  <motion.div
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative min-h-[320px]"
                  >
                    {/* Front - Question */}
                    <div
                      className="absolute inset-0 glass-card-strong p-8 flex flex-col"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {currentCard && (
                        <>
                          <div className="flex items-center justify-between mb-6">
                            <CategoryBadge category={currentCard.category} />
                            <DifficultyBadge difficulty={currentCard.difficulty} />
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <h2 className="text-xl md:text-2xl font-semibold text-white text-center leading-relaxed">
                              {currentCard.question}
                            </h2>
                          </div>
                          <p className="text-slate-600 text-sm text-center mt-4">
                            Touchez pour voir la réponse
                          </p>
                        </>
                      )}
                    </div>

                    {/* Back - Answer */}
                    <div
                      className="absolute inset-0 glass-card-strong p-8 flex flex-col"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      {currentCard && (
                        <>
                          <div className="flex items-center justify-center mb-4">
                            <span className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-xl text-sm font-semibold">
                              Bonne réponse
                            </span>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center gap-4">
                            <p className="text-2xl font-bold text-green-400 text-center">
                              {currentCard.options[currentCard.correctIndex]}
                            </p>
                            {currentCard.explanation && (
                              <p className="text-slate-400 text-sm text-center leading-relaxed max-w-md">
                                💡 {currentCard.explanation}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4">
                            {currentCard.options.map((opt, i) => (
                              <span
                                key={i}
                                className={`flex-1 text-center text-xs py-2 px-1 rounded-lg border ${
                                  i === currentCard.correctIndex
                                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                                    : "bg-white/[0.02] border-white/[0.06] text-slate-600"
                                }`}
                              >
                                {opt}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Leitner Controls */}
          <div className="flex items-center gap-3 mb-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-3 glass-card !rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &larr;
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleStillWrong}
              className="flex-1 py-3 bg-neon-red/10 border border-neon-red/20 text-neon-red font-semibold rounded-xl hover:bg-neon-red/20 transition-colors text-sm"
            >
              ❌ Pas encore
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleKnewIt}
              className="flex-1 py-3 bg-green-500/10 border border-green-500/20 text-green-400 font-semibold rounded-xl hover:bg-green-500/20 transition-colors text-sm"
            >
              ✅ Je savais !
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNext}
              disabled={currentIndex >= filtered.length - 1}
              className="p-3 glass-card !rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              &rarr;
            </motion.button>
          </div>

          <p className="text-slate-700 text-xs text-center mb-8">
            Espace pour retourner &middot; &larr; &rarr; pour naviguer
          </p>
        </>
      )}

      {/* Premium CTA */}
      <PremiumRevisionCTA />
    </div>
  );
}

// ─── MASTERY BAR ───
interface MasteryStats {
  total: number;
  byLevel: Record<LeitnerLevel, number>;
  mastered: number;
  percent: number;
}

function computeMastery(
  questions: WrongQuestion[],
  leitnerMap: Record<string, LeitnerLevel>,
  filter: string
): MasteryStats {
  const filtered = filter === "all" ? questions : questions.filter((q) => q.category === filter);
  const total = filtered.length;
  const byLevel: Record<LeitnerLevel, number> = { 1: 0, 2: 0, 3: 0 };
  for (const q of filtered) {
    const level = (leitnerMap[String(q.id)] || 1) as LeitnerLevel;
    byLevel[level]++;
  }
  const mastered = byLevel[3];
  const percent = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { total, byLevel, mastered, percent };
}

function MasteryBar({ stats }: { stats: MasteryStats }) {
  if (stats.total === 0) return null;

  const l1Pct = (stats.byLevel[1] / stats.total) * 100;
  const l2Pct = (stats.byLevel[2] / stats.total) * 100;
  const l3Pct = (stats.byLevel[3] / stats.total) * 100;

  return (
    <div className="glass-card !rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm flex items-center gap-2">
          <span>🧠</span> Maîtrise globale
        </h3>
        <span className={`text-sm font-bold nums ${
          stats.percent >= 80 ? "text-green-400" : stats.percent >= 40 ? "text-amber-400" : "text-neon-red"
        }`}>
          {stats.percent}%
        </span>
      </div>

      {/* Stacked progress bar */}
      <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden flex">
        {l3Pct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${l3Pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-3 bg-green-500"
            style={{ boxShadow: "0 0 8px rgba(34,197,94,0.4)" }}
          />
        )}
        {l2Pct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${l2Pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="h-3 bg-amber-400"
          />
        )}
        {l1Pct > 0 && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${l1Pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="h-3 bg-neon-red/60"
          />
        )}
      </div>

      <div className="flex justify-between mt-2 text-[10px] text-slate-600">
        <span>🟢 Apprises : {stats.byLevel[3]}</span>
        <span>🟡 En cours : {stats.byLevel[2]}</span>
        <span>🔴 À revoir : {stats.byLevel[1]}</span>
      </div>
    </div>
  );
}

// ─── LEITNER BADGE ───
function LeitnerBadge({ level }: { level: LeitnerLevel }) {
  const info = LEITNER_INFO[level];
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${info.bg} border ${info.border} ${info.color} flex items-center gap-1.5`}>
      {info.icon} Niv. {level} &middot; {info.label}
    </span>
  );
}

// ─── PREMIUM CTA ───
function PremiumRevisionCTA() {
  const [isPremium, setIsPremium] = useState(false);
  useEffect(() => {
    try {
      setIsPremium(JSON.parse(localStorage.getItem("vqm_premium") || "false"));
    } catch { setIsPremium(false); }
  }, []);

  if (isPremium) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/15 bg-gradient-to-br from-amber-900/20 via-black to-yellow-900/10 p-6 text-center"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/[0.06] rounded-full blur-[60px]" />
      </div>
      <div className="relative z-10">
        <div className="text-3xl mb-3">👑</div>
        <h3 className="text-lg font-bold mb-1">
          <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">
            Maîtrise la culture G 3x plus vite
          </span>
        </h3>
        <p className="text-slate-500 text-sm mb-4 max-w-sm mx-auto">
          Les Légendes débloquent la répétition espacée avancée, les explications IA et le suivi détaillé par thème.
        </p>
        <Link
          href="/premium"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-sm font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-amber-500/20"
        >
          Devenir Légende →
        </Link>
      </div>
    </motion.div>
  );
}

// ─── SMALL COMPONENTS ───
function CategoryFilter({
  categories,
  filter,
  setFilter,
  onFilterChange,
}: {
  categories: string[];
  filter: string;
  setFilter: (f: string) => void;
  onFilterChange: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      <button
        onClick={() => { setFilter("all"); onFilterChange(); }}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          filter === "all"
            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
            : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
      >
        Toutes
      </button>
      {categories.map((cat) => {
        const colors = categoryColors[cat] || { icon: "❓", text: "text-slate-400" };
        return (
          <button
            key={cat}
            onClick={() => { setFilter(cat); onFilterChange(); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === cat
                ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                : "text-slate-500 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {colors.icon} {cat}
          </button>
        );
      })}
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors = categoryColors[category] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "❓" };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${colors.bg} border ${colors.border}`}>
      <span>{colors.icon}</span>
      <span className={`text-sm font-medium ${colors.text}`}>{category}</span>
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, { label: string; color: string }> = {
    easy: { label: "Facile", color: "text-green-400" },
    medium: { label: "Moyen", color: "text-amber-400" },
    hard: { label: "Difficile", color: "text-neon-red" },
  };
  const d = map[difficulty] || { label: difficulty, color: "text-slate-400" };
  return <span className={`text-xs font-medium ${d.color}`}>{d.label}</span>;
}
