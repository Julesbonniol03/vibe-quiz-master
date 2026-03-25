"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { categoryColors, difficultyColors } from "@/lib/questions";
import { Category, Question } from "@/lib/types";
import { useProgress, calculateGameXp, getLevel } from "@/hooks/useProgress";
import { useFeedback } from "@/hooks/useFeedback";
import confetti from "canvas-confetti";

type GameMode = "classique" | "blitz" | "mort-subite" | "daily";
type Difficulty = "easy" | "medium" | "hard";
type GamePhase = "loading" | "select" | "select-difficulty" | "playing" | "answered" | "finished";

const DIFFICULTY_INFO: Record<Difficulty, { label: string; icon: string; desc: string; color: string; border: string; bg: string; shadow: string }> = {
  easy: { label: "Débutant", icon: "🌱", desc: "Pour se mettre en jambes", color: "text-green-400", border: "border-green-500/50", bg: "bg-green-500/10", shadow: "shadow-green-500/10" },
  medium: { label: "Intermédiaire", icon: "⚡", desc: "Le juste milieu", color: "text-amber-400", border: "border-amber-400/50", bg: "bg-amber-400/10", shadow: "shadow-amber-400/10" },
  hard: { label: "Expert", icon: "🔥", desc: "Seuls les meilleurs survivent", color: "text-neon-rose", border: "border-neon-rose/50", bg: "bg-neon-rose/10", shadow: "shadow-neon-rose/10" },
};

const TIMER_SECONDS = 15;
const CLASSIC_QUESTIONS = 10;
const DAILY_QUESTIONS = 5;
const BLITZ_QUESTIONS = 50; // large pool, game ends by timer
const BLITZ_DURATION = 60;
const SUDDEN_DEATH_QUESTIONS = 50; // large pool, game ends on first error

const MODE_INFO: Record<GameMode, { label: string; icon: string; desc: string; color: string }> = {
  classique: { label: "Classique", icon: "📝", desc: "10 questions tranquilles", color: "neon-cyan" },
  blitz: { label: "Blitz", icon: "⚡", desc: "60s chrono, max de points", color: "amber-400" },
  "mort-subite": { label: "Mort Subite", icon: "💀", desc: "Première erreur = fin", color: "neon-rose" },
  daily: { label: "Défi du Jour", icon: "🎯", desc: "5 questions, même pour tous", color: "purple-400" },
};

interface CategoryInfo {
  name: string;
  count: number;
}

interface Props {
  initialCategory?: string;
  initialMode?: GameMode | string;
}

export default function QuizClient({ initialCategory, initialMode }: Props) {
  const [phase, setPhase] = useState<GamePhase>("loading");
  const [gameMode, setGameMode] = useState<GameMode>((initialMode as GameMode) || "classique");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    (initialCategory as Category) || "All"
  );
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [shakeWrong, setShakeWrong] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("easy");

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
  const [xpGained, setXpGained] = useState(0);
  const [prevLevel, setPrevLevel] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blitzTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const gameRecordedRef = useRef(false);
  const gameStartTimeRef = useRef(0);

  const progress = useProgress();
  const router = useRouter();
  const { correctFeedback, wrongFeedback } = useFeedback();

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
    wrongFeedback();
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
  }, [gameQuestions, currentIndex, stopTimer, gameMode, wrongFeedback]);

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

  const questionsLimit = gameMode === "daily" ? DAILY_QUESTIONS : gameMode === "classique" ? CLASSIC_QUESTIONS : gameMode === "blitz" ? BLITZ_QUESTIONS : SUDDEN_DEATH_QUESTIONS;

  const startGame = useCallback(async () => {
    setPhase("loading");
    try {
      let data;
      if (gameMode === "daily") {
        const res = await fetch("/api/questions/daily");
        data = await res.json();
      } else {
        const params = new URLSearchParams({ limit: String(questionsLimit) });
        if (selectedCategory !== "All") params.set("category", selectedCategory);
        params.set("difficulty", selectedDifficulty);
        const res = await fetch(`/api/questions/random?${params}`);
        data = await res.json();
      }
      if (!data.questions || data.questions.length === 0) {
        setPhase("select");
        return;
      }
      setGameQuestions(data.questions);
      setCurrentIndex(0);
      setScore(0);
      gameRecordedRef.current = false;
      setXpGained(0);
      setStreak(0);
      setBestStreak(0);
      setAnswers([]);
      setSelectedOption(null);
      setShakeWrong(false);
      setBlitzTimeLeft(BLITZ_DURATION);
      gameStartTimeRef.current = Date.now();
      setPhase("playing");
    } catch {
      setPhase("select");
    }
  }, [selectedCategory, selectedDifficulty, questionsLimit, gameMode]);

  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (phase !== "playing") return;
      stopTimer();
      const currentQ = gameQuestions[currentIndex];
      const isCorrect = optionIndex === currentQ.correctIndex;
      setSelectedOption(optionIndex);
      setAnswers((prev) => [...prev, { selected: optionIndex, correct: currentQ.correctIndex }]);
      if (isCorrect) {
        correctFeedback();
        setScore((s) => s + 1);
        setStreak((s) => {
          const newStreak = s + 1;
          setBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
        setShakeWrong(false);
      } else {
        wrongFeedback();
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
    [phase, gameQuestions, currentIndex, stopTimer, gameMode, correctFeedback, wrongFeedback]
  );

  const handleNext = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= gameQuestions.length) {
      setPhase("finished");
      return;
    }
    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setShakeWrong(false);
    setPhase("playing");
  }, [currentIndex, gameQuestions.length]);

  // Auto-advance to next question after 1.2s
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (phase !== "answered") return;
    autoAdvanceRef.current = setTimeout(() => {
      handleNext();
    }, 1200);
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, [phase, handleNext]);

  // Record XP & wrong questions when game finishes
  useEffect(() => {
    if (phase !== "finished" || gameRecordedRef.current || !progress.hydrated) return;
    gameRecordedRef.current = true;

    const total = answers.length;
    const earned = calculateGameXp(score, bestStreak, total);
    const levelBefore = getLevel(progress.xp).level;
    setPrevLevel(levelBefore);
    setXpGained(earned);
    progress.addXp(earned);
    progress.recordGame(bestStreak);

    // Mark daily challenge as completed
    if (gameMode === "daily") {
      progress.completeDaily();
    }

    // Record speed
    const gameTimeSeconds = (Date.now() - gameStartTimeRef.current) / 1000;
    progress.recordSpeed(gameTimeSeconds, total);

    // Save each answer: mark right/wrong, record category stats, save wrong question data
    const answeredQs = gameQuestions.slice(0, answers.length);
    answeredQs.forEach((q, i) => {
      const ans = answers[i];
      const isCorrect = ans?.selected === q.correctIndex;
      progress.recordCategoryAnswer(q.category, isCorrect);
      if (isCorrect) {
        progress.markRight(q.id);
      } else {
        progress.markWrong(q.id);
        progress.saveWrongQuestion({
          id: q.id,
          category: q.category,
          difficulty: q.difficulty,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Neon confetti explosion on perfect score
  useEffect(() => {
    if (phase !== "finished") return;
    const total = answers.length;
    if (total === 0 || score !== total) return;

    const neonColors = ["#00f0ff", "#ff2d7b", "#a855f7", "#fbbf24", "#34d399"];
    const fire = (opts: confetti.Options) =>
      confetti({ ...opts, colors: neonColors, disableForReducedMotion: true });

    // Burst from both sides
    fire({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.65 } });
    fire({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.65 } });

    // Delayed center burst
    const t = setTimeout(() => {
      fire({ particleCount: 100, spread: 100, origin: { x: 0.5, y: 0.4 }, startVelocity: 45 });
    }, 300);

    return () => clearTimeout(t);
  }, [phase, score, answers.length]);

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {(Object.entries(MODE_INFO) as [GameMode, typeof modeInfo][]).map(([mode, info]) => {
            const isActive = gameMode === mode;
            const activeClass =
              mode === "blitz" ? "border-amber-400/50 bg-amber-400/10 shadow-lg shadow-amber-400/10"
              : mode === "mort-subite" ? "border-neon-rose/50 bg-neon-rose/10 shadow-lg shadow-neon-rose/10"
              : mode === "daily" ? "border-purple-400/50 bg-purple-400/10 shadow-lg shadow-purple-400/10"
              : "border-neon-cyan/50 bg-neon-cyan/10 shadow-lg shadow-neon-cyan/10";
            const activeText =
              mode === "blitz" ? "text-amber-400"
              : mode === "mort-subite" ? "text-neon-rose"
              : mode === "daily" ? "text-purple-400"
              : "text-neon-cyan";
            return (
              <motion.button
                key={mode}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setGameMode(mode)}
                className={`p-4 rounded-2xl border-2 text-center transition-all ${
                  isActive
                    ? activeClass
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                }`}
              >
                <div className="text-2xl mb-1">{info.icon}</div>
                <div className={`font-semibold text-sm ${isActive ? activeText : "text-white"}`}>
                  {info.label}
                </div>
                <div className="text-slate-600 text-xs mt-1">{info.desc}</div>
              </motion.button>
            );
          })}
        </div>

        {gameMode === "daily" ? (
          <div className="glass-card !rounded-2xl p-6 mb-8 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-white font-semibold mb-1">5 questions identiques pour tout le monde</p>
            <p className="text-slate-500 text-sm">Toutes catégories confondues · Timer 15s · Changent chaque jour</p>
            {progress.isDailyCompleted && (
              <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 inline-flex items-center gap-2">
                <span className="text-green-400 font-semibold text-sm">✅ Défi du jour déjà complété !</span>
              </div>
            )}
            {progress.dailyStreak > 0 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <span className="text-orange-400 font-bold">🔥 {progress.dailyStreak} jour{progress.dailyStreak > 1 ? "s" : ""} d&apos;affilée</span>
              </div>
            )}
          </div>
        ) : (
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
        )}

        {/* Histoire: show period revision option */}
        {selectedCategory === "Histoire" && gameMode === "classique" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="glass-card !rounded-2xl p-5 flex items-center gap-4">
              <div className="text-3xl">🏛️</div>
              <div className="flex-1">
                <p className="text-white font-semibold">Révision Chronologique</p>
                <p className="text-slate-500 text-sm">Flashcards par période historique</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/reviser/histoire")}
                className="px-4 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold rounded-xl hover:bg-amber-500/20 transition-colors text-sm whitespace-nowrap"
              >
                Réviser une Période →
              </motion.button>
            </div>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (gameMode === "daily") {
              startGame();
            } else {
              setPhase("select-difficulty");
            }
          }}
          className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-opacity shadow-xl shadow-neon-cyan/15"
        >
          {gameMode === "daily" ? "🎯 Lancer le Défi du Jour" : selectedCategory === "Histoire" ? "📝 Quiz Classique →" : "Choisir le niveau →"}
        </motion.button>
      </motion.div>
    );
  }

  // ─── SELECT DIFFICULTY SCREEN ───
  if (phase === "select-difficulty") {
    const modeInfo = MODE_INFO[gameMode];
    const catLabel = selectedCategory === "All" ? "Toutes catégories" : selectedCategory;
    const catCol = selectedCategory !== "All" ? categoryColors[selectedCategory] : null;

    return (
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="max-w-lg mx-auto px-4 py-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-5xl mb-4"
          >
            🎯
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Choisis ton{" "}
            <span className="gradient-text">niveau</span>
          </h1>
          <p className="text-slate-500">
            {catCol ? catCol.icon : "🌍"} {catLabel} · {modeInfo.icon} {modeInfo.label}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          {(Object.entries(DIFFICULTY_INFO) as [Difficulty, typeof DIFFICULTY_INFO["easy"]][]).map(
            ([diff, info], i) => {
              const isSelected = selectedDifficulty === diff;
              return (
                <motion.button
                  key={diff}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  whileHover={{ scale: 1.02, x: 6 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                    isSelected
                      ? `${info.border} ${info.bg} shadow-lg ${info.shadow}`
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className={`text-4xl flex-shrink-0 ${isSelected ? "" : "grayscale opacity-50"} transition-all`}>
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <div className={`font-bold text-lg ${isSelected ? info.color : "text-white"}`}>
                      {info.label}
                    </div>
                    <div className="text-slate-500 text-sm">{info.desc}</div>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`w-6 h-6 rounded-full ${info.bg} border ${info.border} flex items-center justify-center`}
                    >
                      <span className={`text-xs ${info.color}`}>✓</span>
                    </motion.div>
                  )}
                </motion.button>
              );
            }
          )}
        </div>

        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPhase("select")}
            className="px-6 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/8 transition-colors"
          >
            ← Retour
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={startGame}
            className="flex-1 py-4 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-opacity shadow-xl shadow-neon-cyan/15"
          >
            {gameMode === "blitz" ? "⚡ Lancer le Blitz" : gameMode === "mort-subite" ? "💀 Lancer Mort Subite" : "📝 Lancer le Quiz"}
          </motion.button>
        </div>
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
          <p className="text-slate-600 text-sm mb-2">
            {modeLabel.icon} Mode {modeLabel.label}
            {gameMode === "blitz" && ` · ${BLITZ_DURATION - blitzTimeLeft}s utilisées`}
            {gameMode === "mort-subite" && score === total && " · Sans faute !"}
          </p>

          {/* Daily streak badge */}
          {gameMode === "daily" && progress.dailyStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-4"
            >
              <span className="text-lg">🔥</span>
              <span className="text-orange-400 font-bold">{progress.dailyStreak} jour{progress.dailyStreak > 1 ? "s" : ""} d&apos;affilée !</span>
            </motion.div>
          )}

          {/* XP Gain Banner */}
          {xpGained > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", bounce: 0.4 }}
              className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20"
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-2xl">✨</span>
                <span className="text-amber-400 font-bold text-xl">+{xpGained} XP</span>
              </div>
              {(() => {
                const newLevelInfo = getLevel(progress.xp);
                const leveledUp = newLevelInfo.level > prevLevel;
                return (
                  <>
                    {leveledUp && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-yellow-400 font-bold text-center mb-2"
                      >
                        🎉 Niveau {newLevelInfo.level} atteint !
                      </motion.p>
                    )}
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-xs whitespace-nowrap">
                        Niv. {newLevelInfo.level}
                      </span>
                      <div className="flex-1 bg-white/[0.06] rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${newLevelInfo.progress}%` }}
                          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                          className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
                          style={{ boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)" }}
                        />
                      </div>
                      <span className="text-slate-600 text-xs whitespace-nowrap">
                        {newLevelInfo.currentXp}/{newLevelInfo.xpForNext}
                      </span>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          )}

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

          {/* Share button */}
          <ShareScoreButton
            answers={answers}
            score={score}
            total={total}
            gameMode={gameMode}
            dailyStreak={progress.dailyStreak}
          />

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
              className={`flex-1 py-3 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-neon-cyan/15 ${
                gameMode === "daily" && progress.isDailyCompleted ? "opacity-50" : ""
              }`}
            >
              {gameMode === "daily" ? "Revenir demain !" : "Rejouer"}
            </motion.button>
          </div>
          <div className="flex gap-3 mt-3">
            {score < total && (
              <Link
                href="/reviser"
                className="flex-1 py-3 text-center text-amber-400/70 hover:text-amber-400 text-sm font-medium transition-colors"
              >
                📖 Réviser mes erreurs
              </Link>
            )}
            <Link
              href="/leaderboard"
              className="flex-1 py-3 text-center text-neon-cyan/70 hover:text-neon-cyan text-sm font-medium transition-colors"
            >
              Voir le classement →
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  // ─── PLAYING / ANSWERED ───
  const catColors = categoryColors[currentQ.category] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "❓" };
  const diffColors = difficultyColors[currentQ.difficulty];
  const progressPercent = (gameMode === "classique" || gameMode === "daily")
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

          {/* Daily indicator */}
          {gameMode === "daily" && (
            <div className="glass-card !rounded-xl px-4 py-2 flex items-center gap-2 border-purple-400/20">
              <span className="text-lg">🎯</span>
              <span className="text-purple-400 text-sm font-bold">Défi du Jour</span>
            </div>
          )}

          {(gameMode === "classique" || gameMode === "daily") && (
            <div className="text-slate-600 text-sm font-medium tabular-nums">
              {currentIndex + 1} / {gameQuestions.length}
            </div>
          )}

          {gameMode !== "classique" && gameMode !== "daily" && (
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
      {(gameMode === "classique" || gameMode === "daily") && (
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

            {/* Explanation shown inline */}
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="glass-card !rounded-2xl p-4 mb-4 overflow-hidden"
            >
              <p className="text-slate-400 text-sm leading-relaxed">
                <span className="text-neon-cyan font-medium">💡 </span>
                {currentQ.explanation}
              </p>
            </motion.div>

            {/* Auto-advance progress bar */}
            <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 1.2, ease: "linear" }}
                className="h-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose"
                style={{ boxShadow: "0 0 8px rgba(0, 240, 255, 0.4)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SHARE SCORE BUTTON ───
function ShareScoreButton({
  answers,
  score,
  total,
  gameMode,
  dailyStreak,
}: {
  answers: { selected: number | null; correct: number }[];
  score: number;
  total: number;
  gameMode: GameMode;
  dailyStreak: number;
}) {
  const [copied, setCopied] = useState(false);

  const generateShareText = () => {
    const emojiGrid = answers
      .map((a) => (a.selected === a.correct ? "🟩" : a.selected === null ? "🟨" : "🟥"))
      .join("");

    const modeLabel = MODE_INFO[gameMode];
    const today = new Date();
    const dateStr = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

    let text = `🧠 Vibe Quiz Master ${gameMode === "daily" ? `— Défi du ${dateStr}` : `— ${modeLabel.label}`}\n`;
    text += `${emojiGrid}\n`;
    text += `${score}/${total} `;
    text += score === total ? "💯" : score >= total * 0.7 ? "⭐" : "💪";
    if (dailyStreak > 1 && gameMode === "daily") {
      text += ` 🔥 ${dailyStreak}j d'affilée`;
    }
    return text;
  };

  const handleShare = async () => {
    const text = generateShareText();

    // Try native share (mobile)
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {
        // User cancelled or not supported, fall through
      }
    }

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleWhatsApp = () => {
    const text = generateShareText();
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="flex gap-3 mb-6"
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleShare}
        className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/8 transition-colors text-sm flex items-center justify-center gap-2"
      >
        {copied ? "✅ Copié !" : "📋 Copier mon score"}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleWhatsApp}
        className="py-3 px-5 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] font-semibold rounded-xl hover:bg-[#25D366]/20 transition-colors text-sm flex items-center gap-2"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        WhatsApp
      </motion.button>
    </motion.div>
  );
}
