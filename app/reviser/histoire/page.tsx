"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  id: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  period?: string;
}

const PERIODS = [
  { id: "Antiquité", label: "Antiquité", icon: "🏛️", desc: "Égypte, Grèce, Rome", color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-500/10", shadow: "shadow-amber-500/10" },
  { id: "Moyen Âge", label: "Moyen Âge", icon: "⚔️", desc: "Ve - XVe siècle", color: "text-orange-400", border: "border-orange-400/50", bg: "bg-orange-400/10", shadow: "shadow-orange-400/10" },
  { id: "Renaissance", label: "Renaissance", icon: "🎨", desc: "XVe - XVIIe siècle", color: "text-purple-400", border: "border-purple-400/50", bg: "bg-purple-400/10", shadow: "shadow-purple-400/10" },
  { id: "XVIIIe-XIXe siècle", label: "XVIIIe-XIXe", icon: "🏭", desc: "Lumières, Révolutions, Industrie", color: "text-sky-400", border: "border-sky-400/50", bg: "bg-sky-400/10", shadow: "shadow-sky-400/10" },
  { id: "XXe siècle", label: "XXe siècle", icon: "🌍", desc: "Guerres mondiales, Guerre froide", color: "text-rose-400", border: "border-rose-400/50", bg: "bg-rose-400/10", shadow: "shadow-rose-400/10" },
] as const;

type Phase = "select-period" | "loading" | "flashcards" | "finished";

const DIFF_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: "Facile", color: "text-green-400" },
  medium: { label: "Moyen", color: "text-amber-400" },
  hard: { label: "Difficile", color: "text-rose-400" },
};

export default function HistoireRevisionPage() {
  const [phase, setPhase] = useState<Phase>("select-period");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(PERIODS[0].id);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const currentCard = questions[currentIndex] as Question | undefined;

  const startRevision = useCallback(async () => {
    setPhase("loading");
    try {
      const params = new URLSearchParams({
        category: "Histoire",
        period: selectedPeriod,
        limit: "50",
      });
      const res = await fetch(`/api/questions/random?${params}`);
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        setPhase("select-period");
        return;
      }
      setQuestions(data.questions);
      setCurrentIndex(0);
      setFlipped(false);
      setPhase("flashcards");
    } catch {
      setPhase("select-period");
    }
  }, [selectedPeriod]);

  const handleFlip = useCallback(() => setFlipped((f) => !f), []);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setPhase("finished");
      return;
    }
    setFlipped(false);
    // Small delay so the flip-back animation starts before the slide
    setTimeout(() => {
      setCurrentIndex((i) => i + 1);
    }, 80);
  }, [currentIndex, questions.length]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((i) => Math.max(i - 1, 0));
    }, 80);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (phase !== "flashcards") return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); handleFlip(); }
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, handleFlip, handleNext, handlePrev]);

  // ─── LOADING ───
  if (phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl mb-6 inline-block"
        >
          🏛️
        </motion.div>
        <p className="text-slate-500 text-lg">Chargement des flashcards...</p>
        <div className="mt-6 mx-auto w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  // ─── SELECT PERIOD ───
  if (phase === "select-period") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 py-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-5xl mb-4"
          >
            🏛️
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Révision{" "}
            <span className="gradient-text">Chronologique</span>
          </h1>
          <p className="text-slate-500">
            Parcourez l&apos;Histoire période par période en mode Flashcard
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {PERIODS.map((period, i) => {
            const isSelected = selectedPeriod === period.id;
            return (
              <motion.button
                key={period.id}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.3 }}
                whileHover={{ scale: 1.02, x: 6 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedPeriod(period.id)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                  isSelected
                    ? `${period.border} ${period.bg} shadow-lg ${period.shadow}`
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div className={`text-3xl flex-shrink-0 ${isSelected ? "" : "grayscale opacity-50"} transition-all`}>
                  {period.icon}
                </div>
                <div className="flex-1">
                  <div className={`font-bold ${isSelected ? period.color : "text-white"}`}>
                    {period.label}
                  </div>
                  <div className="text-slate-500 text-sm">{period.desc}</div>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-6 h-6 rounded-full ${period.bg} border ${period.border} flex items-center justify-center`}
                  >
                    <span className={`text-xs ${period.color}`}>✓</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="flex gap-3">
          <Link
            href="/quiz?category=Histoire"
            className="px-6 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/8 transition-colors text-center"
          >
            ← Quiz Classique
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startRevision}
            className="flex-1 py-4 bg-gradient-to-r from-amber-400 to-orange-500 text-obsidian-950 font-bold text-lg rounded-2xl hover:opacity-90 transition-opacity shadow-xl shadow-amber-500/20"
          >
            Commencer les Flashcards
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // ─── FINISHED ───
  if (phase === "finished") {
    const periodInfo = PERIODS.find((p) => p.id === selectedPeriod) || PERIODS[0];
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto px-4 py-10"
      >
        <div className="glass-card-strong p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="text-6xl mb-4"
          >
            🎉
          </motion.div>
          <h2 className="text-3xl font-bold text-white mb-2">Bravo !</h2>
          <p className="text-slate-500 mb-2">
            Vous avez parcouru toutes les flashcards
          </p>
          <p className={`${periodInfo.color} font-semibold mb-8`}>
            {periodInfo.icon} {periodInfo.label} &middot; {questions.length} questions
          </p>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setPhase("select-period");
              }}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/8 transition-colors"
            >
              Changer de période
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setCurrentIndex(0);
                setFlipped(false);
                setPhase("flashcards");
              }}
              className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-obsidian-950 font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/15"
            >
              Recommencer
            </motion.button>
          </div>
          <Link
            href="/quiz?category=Histoire"
            className="block mt-4 text-neon-green/70 hover:text-neon-green text-sm font-medium transition-colors"
          >
            Passer au Quiz Histoire →
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─── FLASHCARDS ───
  const periodInfo = PERIODS.find((p) => p.id === selectedPeriod) || PERIODS[0];
  const diffInfo = currentCard ? DIFF_LABELS[currentCard.difficulty] : null;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${periodInfo.bg} border ${periodInfo.border}`}>
            <span>{periodInfo.icon}</span>
            <span className={`text-sm font-medium ${periodInfo.color}`}>{periodInfo.label}</span>
          </div>
          {diffInfo && (
            <span className={`text-xs font-medium ${diffInfo.color}`}>{diffInfo.label}</span>
          )}
        </div>
        <button
          onClick={() => setPhase("select-period")}
          className="text-slate-600 hover:text-slate-300 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          Quitter
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-sm">
          {currentIndex + 1} / {questions.length}
        </span>
        <span className="text-slate-600 text-xs">Mode Flashcard</span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-6 overflow-hidden">
        <motion.div
          className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ boxShadow: "0 0 10px rgba(245, 158, 11, 0.4)" }}
        />
      </div>

      {/* Flashcard with 3D flip */}
      <div style={{ perspective: "1200px" }} className="mb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div
              onClick={handleFlip}
              className="cursor-pointer select-none"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") handleFlip();
              }}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative min-h-[360px]"
              >
                {/* Front - Question */}
                <div
                  className="absolute inset-0 glass-card-strong p-8 flex flex-col"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {currentCard && (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20`}>
                          <span>🏛️</span>
                          <span className="text-sm font-medium text-amber-400">Histoire</span>
                        </div>
                        <span className="text-slate-600 text-xs">
                          Touchez pour retourner
                        </span>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <h2 className="text-xl md:text-2xl font-semibold text-white text-center leading-relaxed">
                          {currentCard.question}
                        </h2>
                      </div>
                      <div className="flex justify-center mt-6">
                        <motion.div
                          animate={{ y: [0, 6, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="text-slate-600 text-sm flex items-center gap-2"
                        >
                          <span>↻</span> Cliquer pour voir la réponse
                        </motion.div>
                      </div>
                    </>
                  )}
                </div>

                {/* Back - Answer + Explanation */}
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
                      <div className="flex-1 flex flex-col items-center justify-center gap-5">
                        <p className="text-2xl font-bold text-green-400 text-center">
                          {currentCard.options[currentCard.correctIndex]}
                        </p>
                        <div className="w-12 h-px bg-white/10" />
                        <p className="text-slate-400 text-sm text-center leading-relaxed max-w-md">
                          <span className="text-neon-green font-medium">💡 </span>
                          {currentCard.explanation}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {currentCard.options.map((opt, i) => (
                          <span
                            key={i}
                            className={`flex-1 text-center text-xs py-2 px-1 rounded-lg border ${
                              i === currentCard.correctIndex
                                ? "bg-green-500/10 border-green-500/30 text-green-400 font-semibold"
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

      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 glass-card !rounded-xl text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Précédent
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-obsidian-950 font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/15"
        >
          {currentIndex + 1 >= questions.length ? "Terminer" : "Suivant →"}
        </motion.button>
      </div>

      {/* Keyboard hint */}
      <p className="text-slate-700 text-xs text-center mt-4">
        Espace pour retourner &middot; ← → pour naviguer
      </p>
    </div>
  );
}
