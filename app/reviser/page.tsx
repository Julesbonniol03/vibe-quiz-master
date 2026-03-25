"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useProgress, WrongQuestion } from "@/hooks/useProgress";
import { categoryColors } from "@/lib/questions";

export default function ReviserPage() {
  const { hydrated, wrongQuestions, dismissMistake } = useProgress();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all"
    ? wrongQuestions
    : wrongQuestions.filter((q) => q.category === filter);

  const categories = Array.from(new Set(wrongQuestions.map((q) => q.category))).sort();

  const currentCard = filtered[currentIndex] as WrongQuestion | undefined;

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleNext = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((i) => Math.min(i + 1, filtered.length - 1));
  }, [filtered.length]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleDismiss = useCallback(() => {
    if (!currentCard) return;
    dismissMistake(currentCard.id);
    setFlipped(false);
    // Adjust index if we're past the end
    setCurrentIndex((i) => {
      const newLen = filtered.length - 1;
      if (newLen <= 0) return 0;
      return Math.min(i, newLen - 1);
    });
  }, [currentCard, dismissMistake, filtered.length]);

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
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-6xl mb-6"
        >
          🎉
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-3">Rien à réviser !</h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Vous n&apos;avez aucune erreur à revoir. Jouez un quiz pour commencer à suivre vos erreurs.
        </p>
        <Link
          href="/quiz"
          className="inline-block px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neon-cyan/20"
        >
          Jouer un quiz →
        </Link>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Header count={wrongQuestions.length} />
        <CategoryFilter categories={categories} filter={filter} setFilter={setFilter} />
        <div className="text-center py-16">
          <p className="text-slate-500">Aucune erreur dans cette catégorie.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 text-neon-cyan text-sm hover:underline"
          >
            Voir toutes les catégories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Header count={wrongQuestions.length} />
      <CategoryFilter categories={categories} filter={filter} setFilter={setFilter} />

      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-slate-500 text-sm">
          {currentIndex + 1} / {filtered.length}
        </span>
        <div className="flex-1 mx-4 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
          <motion.div
            className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
            animate={{ width: `${((currentIndex + 1) / filtered.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)" }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="perspective-1000 mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentCard?.id}-${currentIndex}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
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

      {/* Controls */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 glass-card !rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ←
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleDismiss}
          className="flex-1 py-3 bg-green-500/10 border border-green-500/20 text-green-400 font-semibold rounded-xl hover:bg-green-500/20 transition-colors text-sm"
        >
          ✅ J&apos;ai compris, retirer
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          disabled={currentIndex >= filtered.length - 1}
          className="p-3 glass-card !rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          →
        </motion.button>
      </div>

      {/* Keyboard hint */}
      <p className="text-slate-700 text-xs text-center mt-4">
        Espace pour retourner · ← → pour naviguer
      </p>
    </div>
  );
}

function Header({ count }: { count: number }) {
  return (
    <div className="text-center mb-8">
      <div className="text-5xl mb-4">📖</div>
      <h1 className="text-3xl font-bold text-white mb-2">
        <span className="gradient-text">Révisions</span>
      </h1>
      <p className="text-slate-500">
        {count} question{count > 1 ? "s" : ""} à revoir · Flashcards recto/verso
      </p>
    </div>
  );
}

function CategoryFilter({
  categories,
  filter,
  setFilter,
}: {
  categories: string[];
  filter: string;
  setFilter: (f: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mb-6 justify-center">
      <button
        onClick={() => setFilter("all")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
          filter === "all"
            ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
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
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              filter === cat
                ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
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
    hard: { label: "Difficile", color: "text-neon-rose" },
  };
  const d = map[difficulty] || { label: difficulty, color: "text-slate-400" };
  return <span className={`text-xs font-medium ${d.color}`}>{d.label}</span>;
}
