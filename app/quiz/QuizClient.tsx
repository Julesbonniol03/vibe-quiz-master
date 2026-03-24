"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { categoryColors, difficultyColors } from "@/lib/questions";
import { Category, Question } from "@/lib/types";

type GameMode = "classique" | "blitz" | "mort-subite";
type GamePhase = "loading" | "select" | "playing" | "answered" | "finished";

const TIMER_SECONDS = 15;
const CLASSIC_QUESTIONS = 10;
const BLITZ_QUESTIONS = 50; // large pool, game ends by timer
const BLITZ_DURATION = 60;
const SUDDEN_DEATH_QUESTIONS = 50; // large pool, game ends on first error

const MODE_INFO: Record<GameMode, { label: string; icon: string; desc: string; color: string }> = {
  classique: { label: "Classique", icon: "📝", desc: "10 questions tranquilles", color: "neon-cyan" },
  blitz: { label: "Blitz", icon: "⚡", desc: "60s chrono, max de points", color: "amber-400" },
  "mort-subite": { label: "Mort Subite", icon: "💀", desc: "Première erreur = fin", color: "neon-rose" },
};

interface CategoryInfo {
  name: string;
  count: number;
}

interface Props {
  initialCategory?: string;
  initialMode?: GameMode;
}

export default function QuizClient({ initialCategory, initialMode }: Props) {
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [gameMode, setGameMode] = useState<GameMode>(initialMode || "classique");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    (initialCategory as Category) || "All"
  );
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data.categories);
        setTotalQuestions(data.total);
        setPhase("select");
      })
      .catch(() => setPhase("select"));
  }, []);

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [blitzTimeLeft, setBlitzTimeLeft] = useState(BLITZ_DURATION);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answers, setAnswers] = useState<{ selected: number | null; correct: number }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blitzTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopBlitzTimer = useCallback(() => {
    if (blitzTimerRef.current) {
      clearInterval(blitzTimerRef.current);
      blitzTimerRef.current = null;
    }
  }, []);

  // Blitz global timer
  useEffect(() => {
    if (gameMode !== "blitz" || (phase !== "playing" && phase !== "answered")) return;
    if (blitzTimerRef.current) return; // already running

    blitzTimerRef.current = setInterval(() => {
      setBlitzTimeLeft((t) => {
        if (t <= 1) {
          stopBlitzTimer();
          stopTimer();
          setPhase("finished");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => stopBlitzTimer();
  }, [gameMode, phase, stopBlitzTimer, stopTimer]);

  const handleTimeout = useCallback(() => {
    stopTimer();
    const currentQ = gameQuestions[currentIndex];
    setAnswers((prev) => [...prev, { selected: null, correct: currentQ.correctIndex }]);
    setStreak(0);
    setSelectedOption(-1);
    setShakeWrong(true);

    // Mort subite: timeout = error = game over
    if (gameMode === "mort-subite") {
      setPhase("finished");
    } else {
      setPhase("answered");
    }
  }, [gameQuestions, currentIndex, stopTimer, gameMode]);

  // Per-question timer (classic & sudden death use 15s, blitz uses 10s)
  useEffect(() => {
    if (phase !== "playing") return;
    const perQuestionTime = gameMode === "blitz" ? 10 : TIMER_SECONDS;
    setTimeLeft(perQuestionTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          handleTimeout();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => stopTimer();
  }, [phase, currentIndex, handleTimeout, stopTimer, gameMode]);

  const questionsLimit = gameMode === "classique" ? CLASSIC_QUESTIONS : gameMode === "blitz" ? BLITZ_QUESTIONS : SUDDEN_DEATH_QUESTIONS;

  const startGame = useCallback(async () => {
    setPhase("loading");
    try {
      const params = new URLSearchParams({ limit: String(questionsLimit) });
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      const res = await fetch(`/api/questions/random?${params}`);
      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        setPhase("select");
        return;
      }
      setGameQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      setStreak(0);
      setBestStreak(0);
      setAnswers([]);
      setSelectedOption(null);
      setShowExplanation(false);
      setShakeWrong(false);
      setBlitzTimeLeft(BLITZ_DURATION);
      setPhase("playing");
    } catch {
      setPhase("select");
    }
  }, [selectedCategory, questionsLimit]);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (phase !== "playing") return;
      stopTimer();
      const currentQ = gameQuestions[currentIndex];
      const isCorrect = optionIndex === currentQ.correctIndex;
      setSelectedOption(optionIndex);
      setAnswers((prev) => [...prev, { selected: optionIndex, correct: currentQ.correctIndex }]);
      if (isCorrect) {
        setScore((s) => s + 1);
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
        setShakeWrong(false);
      } else {
        setStreak(0);
        setShakeWrong(true);
      }

      // Mort subite: wrong answer = game over immediately
      if (gameMode === "mort-subite" && !isCorrect) {
        setPhase("finished");
      } else {
        setPhase("answered");
      }
    },
    [phase, gameQuestions, currentIndex, stopTimer, gameMode]
  );

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= gameQuestions.length) {
      setPhase("finished");
      return;
    }
    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setShowExplanation(false);
    setShakeWrong(false);
    setPhase("playing");
  }, [currentIndex, gameQuestions.length]);

  const currentQ = gameQuestions[currentIndex];
  const perQuestionTime = gameMode === "blitz" ? 10 : TIMER_SECONDS;
  const timerPercent = (timeLeft / perQuestionTime) * 100;
  const timerUrgent = timeLeft <= 4;
  const timerWarn = timeLeft <= 8 && timeLeft > 4;

  // For finished screen: actual questions answered (not the whole pool)
  const answeredQuestions = gameQuestions.slice(0, answers.length);

  // ─── LOADING SCREEN ───
  if (phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl mb-6 inline-block"
        >
          🧠
        </motion.div>
        <p className="text-slate-500 text-lg">Chargement des questions...</p>
        <div className="mt-6 mx-auto w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-cyan to-neon-rose rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  // ─── SELECT SCREEN ───
  if (phase === "select") {
    const allCategoryNames: string[] = ["All", ...categories.map((c) => c.name)];
    const modeInfo = MODE_INFO[gameMode];
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto px-4 py-10"
      >
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Choisissez une{" "}
            <span className="gradient-text">catégorie</span>
          </h1>
          <p className="text-slate-500">
            {modeInfo.icon} {modeInfo.label} · {modeInfo.desc}
          </p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {(Object.entries(MODE_INFO) as [GameMode, typeof modeInfo][]).map(([mode, info]) => {
            const isActive = gameMode === mode;
            return (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setGameMode(mode)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  isActive
                    ? mode === "blitz"
                      ? "border-amber-400/50 bg-amber-400/10 shadow-lg shadow-amber-400/10"
                      : mode === "mort-subite"
                      ? "border-neon-rose/50 bg-neon-rose/10 shadow-lg shadow-neon-rose/10"
                      : "border-neon-cyan/50 bg-neon-cyan/10 shadow-lg shadow-neon-cyan/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className={`font-semibold text-sm ${
                  isActive
                    ? mode === "blitz" ? "text-amber-400" : mode === "mort-subite" ? "text-neon-rose" : "text-neon-cyan"
                    : "text-white"
                }`}>
                  {info.label}
                </div>
                <div className="text-slate-600 text-xs mt-1">{info.desc}</div>
              </motion.button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {allCategoryNames.map((cat, i) => {
            const colors = cat !== "All" ? categoryColors[cat] : null;
            const isSelected = selectedCategory === cat;
            const catInfo = categories.find((c) => c.name === cat);
            const questionCount = cat === "All" ? totalQuestions : (catInfo?.count ?? 0);
            return (
              <motion.button
                key={cat}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat as Category | "All")}
                className={`p-5 rounded-2xl border-2 transition-colors text-left ${
                  isSelected
                    ? "border-neon-cyan/50 bg-neon-cyan/10 shadow-lg shadow-neon-cyan/10"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div className="text-3xl mb-2">{colors ? colors.icon : "🌍"}</div>
                <div className={`font-semibold ${isSelected ? "text-neon-cyan" : "text-white"}`}>
                  {cat === "All" ? "Tout" : cat}
                </div>
                <div className="text-slate-600 text-xs mt-1">
                  {questionCount} questions
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={startGame}
          className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-opacity shadow-xl shadow-neon-cyan/15"
        >
          {gameMode === "blitz" ? "⚡ Lancer le Blitz" : gameMode === "mort-subite" ? "💀 Lancer Mort Subite" : "📝 Lancer le Quiz"}
        </motion.button>
      </motion.div>
    );
  }

  // ─── FINISHED SCREEN ───
  if (phase === "finished") {
    const total = answeredQuestions.length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    const grade =
      accuracy >= 90 ? { label: "Excellent !", icon: "🏆", color: "text-yellow-400" }
      : accuracy >= 70 ? { label: "Très bien !", icon: "⭐", color: "text-neon-cyan" }
      : accuracy >= 50 ? { label: "Pas mal !", icon: "👍", color: "text-green-400" }
      : { label: "Continuez !", icon: "💪", color: "text-neon-rose" };

    const modeLabel = MODE_INFO[gameMode];

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto px-4 py-10"
      >
        <div className="glass-card-strong p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="text-6xl mb-4"
          >
            {grade.icon}
          </motion.div>
          <h2 className={`text-3xl font-bold mb-1 ${grade.color}`}>{grade.label}</h2>
          <p className="text-slate-500 mb-2">Quiz terminé !</p>
          <p className="text-slate-600 text-sm mb-8">
            {modeLabel.icon} Mode {modeLabel.label}
            {gameMode === "blitz" && ` · ${BLITZ_DURATION - blitzTimeLeft}s utilisées`}
            {gameMode === "mort-subite" && score === total && " · Sans faute !"}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-neon-cyan/5 border border-neon-cyan/15 rounded-2xl p-4"
            >
              <div className="text-2xl font-bold text-neon-cyan">{score}/{total}</div>
              <div className="text-slate-500 text-xs mt-1">Score</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-neon-rose/5 border border-neon-rose/15 rounded-2xl p-4"
            >
              <div className="text-2xl font-bold text-neon-rose">{bestStreak} 🔥</div>
              <div className="text-slate-500 text-xs mt-1">Meilleur Streak</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`${accuracy >= 70 ? "bg-green-500/5 border-green-500/15" : "bg-amber-500/5 border-amber-500/15"} border rounded-2xl p-4`}
            >
              <div className={`text-2xl font-bold ${accuracy >= 70 ? "text-green-400" : "text-amber-400"}`}>{accuracy}%</div>
              <div className="text-slate-500 text-xs mt-1">Précision</div>
            </motion.div>
          </div>

          {/* Answer review */}
          <div className="space-y-2 mb-8 text-left">
            {answeredQuestions.map((q, i) => {
              const ans = answers[i];
              const isCorrect = ans?.selected === q.correctIndex;
              const isTimedOut = ans?.selected === null;
              const catCol = categoryColors[q.category] || { text: "text-slate-400", icon: "❓" };
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isCorrect
                      ? "bg-green-500/5 border-green-500/15"
                      : "bg-neon-rose/5 border-neon-rose/15"
                  }`}
                >
                  <span className="text-lg">{isCorrect ? "✅" : isTimedOut ? "⏰" : "❌"}</span>
                  <span className="text-slate-400 text-sm flex-1 truncate">{q.question}</span>
                  <span className={`text-xs font-medium ${catCol.text}`}>
                    {catCol.icon}
                  </span>
                </motion.div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                stopBlitzTimer();
                setPhase("select");
                setSelectedCategory("All");
              }}
              className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/8 transition-colors"
            >
              Changer catégorie
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={startGame}
              className="flex-1 py-3 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-neon-cyan/15"
            >
              Rejouer
            </motion.button>
          </div>
          <Link
            href="/leaderboard"
            className="block mt-3 py-3 text-neon-cyan/70 hover:text-neon-cyan text-sm font-medium transition-colors"
          >
            Voir le classement →
          </Link>
        </div>
      </motion.div>
    );
  }

  // ─── PLAYING / ANSWERED ───
  const catColors = categoryColors[currentQ.category] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "❓" };
  const diffColors = difficultyColors[currentQ.difficulty];
  const progressPercent = gameMode === "classique"
    ? ((currentIndex + (phase === "answered" ? 1 : 0)) / gameQuestions.length) * 100
    : 100; // non-classic modes: no fixed progress

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="glass-card !rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-slate-500 text-sm">Score</span>
            <span className="text-neon-cyan font-bold">{score}</span>
          </div>
          <AnimatePresence>
            {streak > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="bg-neon-rose/10 border border-neon-rose/20 rounded-xl px-4 py-2 flex items-center gap-2"
              >
                <span className="text-neon-rose text-sm font-bold">{streak}x</span>
                <span>🔥</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          {/* Blitz global timer */}
          {gameMode === "blitz" && (
            <div className={`glass-card !rounded-xl px-4 py-2 flex items-center gap-2 ${
              blitzTimeLeft <= 10 ? "border-neon-rose/30" : ""
            }`}>
              <span className="text-lg">⚡</span>
              <span className={`font-bold tabular-nums ${
                blitzTimeLeft <= 10 ? "text-neon-rose" : blitzTimeLeft <= 20 ? "text-amber-400" : "text-neon-cyan"
              }`}>
                {blitzTimeLeft}s
              </span>
            </div>
          )}

          {/* Mort subite indicator */}
          {gameMode === "mort-subite" && (
            <div className="glass-card !rounded-xl px-4 py-2 flex items-center gap-2 border-neon-rose/20">
              <span className="text-lg">💀</span>
              <span className="text-neon-rose text-sm font-bold">Mort Subite</span>
            </div>
          )}

          {gameMode === "classique" && (
            <div className="text-slate-600 text-sm font-medium tabular-nums">
              {currentIndex + 1} / {gameQuestions.length}
            </div>
          )}

          {gameMode !== "classique" && (
            <div className="text-slate-600 text-sm font-medium tabular-nums">
              Q{currentIndex + 1}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            stopBlitzTimer();
            setPhase("select");
          }}
          className="text-slate-600 hover:text-slate-300 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          Quitter
        </button>
      </div>

      {/* Glowing progress bar */}
      {gameMode === "classique" && (
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-6 overflow-hidden">
          <motion.div
            className="h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose animate-glow-bar"
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 10px rgba(0, 240, 255, 0.4), 0 0 25px rgba(0, 240, 255, 0.15)",
            }}
          />
        </div>
      )}

      {/* Blitz progress bar (time-based) */}
      {gameMode === "blitz" && (
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-6 overflow-hidden">
          <motion.div
            className="h-1.5 rounded-full"
            animate={{ width: `${(blitzTimeLeft / BLITZ_DURATION) * 100}%` }}
            transition={{ duration: 1, ease: "linear" }}
            style={{
              background: blitzTimeLeft <= 10
                ? "linear-gradient(90deg, #ff2d7b, #ff6b9d)"
                : blitzTimeLeft <= 20
                ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                : "linear-gradient(90deg, #f59e0b, #00f0ff)",
              boxShadow: blitzTimeLeft <= 10
                ? "0 0 12px rgba(255, 45, 123, 0.6)"
                : "0 0 10px rgba(245, 158, 11, 0.4)",
            }}
          />
        </div>
      )}

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`glass-card-strong p-6 mb-4 ${shakeWrong && phase === "answered" ? "animate-shake" : ""}`}
        >
          {/* Category + difficulty */}
          <div className="flex items-center justify-between mb-5">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${catColors.bg} border ${catColors.border}`}>
              <span>{catColors.icon}</span>
              <span className={`text-sm font-medium ${catColors.text}`}>{currentQ.category}</span>
            </div>
            <span className={`text-xs font-medium ${diffColors.text}`}>{diffColors.label}</span>
          </div>

          {/* Per-question timer */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-600 text-xs">Temps restant</span>
              <span
                className={`text-sm font-bold tabular-nums ${
                  timerUrgent ? "text-neon-rose" : timerWarn ? "text-amber-400" : "text-neon-cyan"
                } ${phase === "answered" ? "opacity-30" : ""}`}
              >
                {phase === "answered" ? "—" : `${timeLeft}s`}
              </span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-2 rounded-full"
                animate={{
                  width: phase === "answered" ? "0%" : `${timerPercent}%`,
                }}
                transition={{ duration: 1, ease: "linear" }}
                style={{
                  background: timerUrgent
                    ? "linear-gradient(90deg, #ff2d7b, #ff6b9d)"
                    : timerWarn
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "linear-gradient(90deg, #00f0ff, #00c8d4)",
                  boxShadow: timerUrgent
                    ? "0 0 12px rgba(255, 45, 123, 0.6), 0 0 30px rgba(255, 45, 123, 0.2)"
                    : timerWarn
                    ? "0 0 12px rgba(245, 158, 11, 0.5)"
                    : "0 0 12px rgba(0, 240, 255, 0.5), 0 0 30px rgba(0, 240, 255, 0.15)",
                }}
              />
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl font-semibold text-white leading-relaxed">{currentQ.question}</h2>
        </motion.div>
      </AnimatePresence>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {currentQ.options.map((option, i) => {
          const isSelected = selectedOption === i;
          const isCorrect = i === currentQ.correctIndex;
          const optionLabel = ["A", "B", "C", "D"][i];

          let bgClass: string;
          let borderClass: string;
          let textClass: string;
          let glowStyle = {};

          if (phase === "answered") {
            if (isCorrect) {
              bgClass = "bg-green-500/10";
              borderClass = "border-green-500/50";
              textClass = "text-green-300";
              glowStyle = { boxShadow: "0 0 15px rgba(34, 197, 94, 0.15)" };
            } else if (isSelected && !isCorrect) {
              bgClass = "bg-neon-rose/10";
              borderClass = "border-neon-rose/40";
              textClass = "text-neon-rose";
            } else {
              bgClass = "bg-white/[0.01]";
              borderClass = "border-white/[0.05]";
              textClass = "text-slate-600";
            }
          } else {
            bgClass = "bg-white/[0.02]";
            borderClass = "border-white/[0.06]";
            textClass = "text-slate-300";
          }

          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.25 }}
              whileHover={phase !== "answered" ? { scale: 1.01, x: 4 } : undefined}
              whileTap={phase !== "answered" ? { scale: 0.98 } : undefined}
              onClick={() => handleAnswer(i)}
              disabled={phase === "answered"}
              className={`w-full p-4 rounded-2xl border-2 text-left font-medium transition-colors flex items-center gap-3 ${bgClass} ${borderClass} ${textClass} ${
                phase !== "answered" ? "cursor-pointer hover:border-neon-cyan/30 hover:bg-neon-cyan/5" : ""
              }`}
              style={glowStyle}
            >
              <span
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold border ${
                  phase === "answered" && isCorrect
                    ? "bg-green-500/20 border-green-500/50 text-green-300"
                    : phase === "answered" && isSelected && !isCorrect
                    ? "bg-neon-rose/20 border-neon-rose/40 text-neon-rose"
                    : "bg-white/5 border-white/10 text-slate-500"
                }`}
              >
                {phase === "answered" && isCorrect
                  ? "✓"
                  : phase === "answered" && isSelected && !isCorrect
                  ? "✗"
                  : optionLabel}
              </span>
              <span className="flex-1">{option}</span>
              {phase === "answered" && isCorrect && !isSelected && (
                <span className="text-green-400/70 text-sm">← Bonne réponse</span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback + Explanation */}
      <AnimatePresence>
        {phase === "answered" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {selectedOption === -1 ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-4 text-center">
                <p className="text-amber-400 font-semibold">⏰ Temps écoulé !</p>
                <p className="text-slate-500 text-sm mt-1">La bonne réponse était surlignée en vert.</p>
              </div>
            ) : selectedOption === currentQ.correctIndex ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 mb-4 text-center"
                style={{ boxShadow: "0 0 20px rgba(34, 197, 94, 0.08)" }}
              >
                <p className="text-green-400 font-semibold text-lg">
                  ✅ Bonne réponse !{streak > 1 && ` 🔥 Streak x${streak}`}
                </p>
              </motion.div>
            ) : (
              <div className="bg-neon-rose/5 border border-neon-rose/20 rounded-2xl p-4 mb-4 text-center">
                <p className="text-neon-rose font-semibold text-lg">❌ Mauvaise réponse</p>
                <p className="text-slate-500 text-sm mt-1">
                  La bonne réponse : {currentQ.options[currentQ.correctIndex]}
                </p>
              </div>
            )}

            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass-card !rounded-2xl p-4 mb-4 overflow-hidden"
                >
                  <p className="text-slate-400 text-sm leading-relaxed">
                    <span className="text-neon-cyan font-medium">💡 Explication : </span>
                    {currentQ.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowExplanation((v) => !v)}
                className="px-4 py-3 glass-card !rounded-xl text-slate-400 text-sm font-medium hover:bg-white/5 transition-colors"
              >
                {showExplanation ? "Masquer" : "💡 Explication"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNext}
                className="flex-1 py-3 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-neon-cyan/15"
              >
                {currentIndex + 1 >= gameQuestions.length ? "Voir les résultats 🏆" : "Question suivante →"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
