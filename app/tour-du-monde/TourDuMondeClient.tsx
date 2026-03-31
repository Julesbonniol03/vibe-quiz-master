"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useProgress, calculateGameXp } from "@/hooks/useProgress";
import { useHearts } from "@/hooks/useHearts";
import { useFeedback } from "@/hooks/useFeedback";

const TIMER_SECONDS = 15;
const QUESTIONS_PER_GAME = 10;

interface GeoEntry {
  code: string;
  country: string;
  capital: string;
  continent: string;
}

type QuestionMode = "capital-to-country" | "country-to-capital";
type Phase = "menu" | "playing" | "answered" | "finished";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  geoData: GeoEntry[];
}

function generateQuestions(geoData: GeoEntry[], mode: QuestionMode, continent?: string): QuizQuestion[] {
  const pool = continent ? geoData.filter((g) => g.continent === continent) : [...geoData];

  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected = pool.slice(0, QUESTIONS_PER_GAME);

  return selected.map((entry) => {
    if (mode === "capital-to-country") {
      // "Quelle est la capitale de [Pays] ?"
      const correct = entry.capital;
      const distractors = geoData
        .filter((g) => g.capital !== correct && g.continent === entry.continent)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((g) => g.capital);

      // Fill if not enough from same continent
      while (distractors.length < 3) {
        const fallback = geoData.find(
          (g) => g.capital !== correct && !distractors.includes(g.capital)
        );
        if (fallback) distractors.push(fallback.capital);
        else break;
      }

      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
      return {
        question: `Quelle est la capitale de ${entry.country} ?`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `${entry.capital} est la capitale de ${entry.country} (${entry.continent}).`,
      };
    } else {
      // "De quel pays [Capitale] est-elle la capitale ?"
      const correct = entry.country;
      const distractors = geoData
        .filter((g) => g.country !== correct && g.continent === entry.continent)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((g) => g.country);

      while (distractors.length < 3) {
        const fallback = geoData.find(
          (g) => g.country !== correct && !distractors.includes(g.country)
        );
        if (fallback) distractors.push(fallback.country);
        else break;
      }

      const options = [correct, ...distractors].sort(() => Math.random() - 0.5);
      return {
        question: `${entry.capital} est la capitale de quel pays ?`,
        options,
        correctIndex: options.indexOf(correct),
        explanation: `${entry.capital} est la capitale de ${entry.country} (${entry.continent}).`,
      };
    }
  });
}

export default function TourDuMondeClient({ geoData }: Props) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [questionMode, setQuestionMode] = useState<QuestionMode>("capital-to-country");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = useProgress();
  const heartsSystem = useHearts();
  const { correctFeedback, wrongFeedback } = useFeedback();

  const continents = useMemo(() => Array.from(new Set(geoData.map((g) => g.continent))), [geoData]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const currentQ = questions[currentIndex];
  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerUrgent = timeLeft <= 4;
  const timerWarn = timeLeft <= 8 && timeLeft > 4;

  // ─── TIMER ───
  const handleTimeout = useCallback(() => {
    stopTimer();
    wrongFeedback();
    if (!currentQ) return;
    setSelectedOption(-1);
    setStreak(0);
    setIsAnswering(true);
    heartsSystem.loseHeart();
    setPhase("answered");
  }, [stopTimer, wrongFeedback, currentQ, heartsSystem]);

  useEffect(() => {
    if (phase !== "playing") return;
    setTimeLeft(TIMER_SECONDS);
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
  }, [phase, currentIndex, handleTimeout, stopTimer]);

  // ─── ACTIONS ───
  const startGame = useCallback((mode: QuestionMode, continent?: string) => {
    const q = generateQuestions(geoData, mode, continent);
    setQuestions(q);
    setQuestionMode(mode);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedOption(null);
    setIsAnswering(false);
    setPhase("playing");
  }, [geoData]);

  const handleNext = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
    setIsAnswering(false);
    if (!heartsSystem.canPlay) {
      setPhase("finished");
      return;
    }
    const next = currentIndex + 1;
    if (next >= questions.length) {
      setPhase("finished");
      return;
    }
    setCurrentIndex(next);
    setSelectedOption(null);
    setPhase("playing");
  }, [currentIndex, questions.length, heartsSystem.canPlay]);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (phase !== "playing" || isAnswering || !currentQ) return;
    setIsAnswering(true);
    stopTimer();
    setSelectedOption(optionIndex);

    const isCorrect = optionIndex === currentQ.correctIndex;
    if (isCorrect) {
      correctFeedback();
      setScore((s) => s + 1);
      setStreak((s) => {
        const n = s + 1;
        setBestStreak((b) => Math.max(b, n));
        return n;
      });
    } else {
      wrongFeedback();
      setStreak(0);
      heartsSystem.loseHeart();
    }

    setPhase("answered");

    if (isCorrect) {
      autoAdvanceRef.current = setTimeout(() => {
        handleNext();
      }, 1200);
    }
  }, [phase, isAnswering, currentQ, stopTimer, correctFeedback, wrongFeedback, heartsSystem, handleNext]);

  // Record XP on finish
  const xpEarned = useMemo(() => {
    if (phase !== "finished") return 0;
    return calculateGameXp(score, bestStreak, questions.length);
  }, [phase, score, bestStreak, questions.length]);

  const [xpRecorded, setXpRecorded] = useState(false);
  if (phase === "finished" && !xpRecorded && progress.hydrated) {
    progress.addXp(xpEarned);
    progress.recordGame(bestStreak);
    progress.recordGameHistory({
      score,
      total: questions.length,
      category: "Tour du Monde",
      mode: questionMode === "capital-to-country" ? "Capitales" : "Pays",
      difficulty: "medium",
      streak: bestStreak,
    });
    setXpRecorded(true);
  }

  // ─── MENU ───
  if (phase === "menu") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="text-6xl mb-4">
            🌍
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tour du <span className="gradient-text">Monde</span>
          </h1>
          <p className="text-slate-500">Teste tes connaissances en géographie</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => startGame("capital-to-country")}
            className="p-6 rounded-2xl border-2 border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10 transition-all text-center"
          >
            <div className="text-4xl mb-3">🏛️</div>
            <div className="text-neon-cyan font-bold text-lg mb-1">Capitales</div>
            <div className="text-slate-500 text-xs">Quelle est la capitale de... ?</div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => startGame("country-to-capital")}
            className="p-6 rounded-2xl border-2 border-neon-rose/30 bg-neon-rose/5 hover:bg-neon-rose/10 transition-all text-center"
          >
            <div className="text-4xl mb-3">🗺️</div>
            <div className="text-neon-rose font-bold text-lg mb-1">Pays</div>
            <div className="text-slate-500 text-xs">De quel pays est cette capitale ?</div>
          </motion.button>
        </div>

        <div className="mb-6">
          <p className="text-slate-600 text-xs font-medium uppercase tracking-wider mb-3">Par continent</p>
          <div className="flex flex-wrap gap-2">
            {continents.map((c) => (
              <button key={c} onClick={() => startGame("capital-to-country", c)}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-400 text-sm hover:border-neon-cyan/30 hover:text-white hover:bg-neon-cyan/5 transition-all">
                {c}
              </button>
            ))}
          </div>
        </div>

        <Link href="/dashboard" className="block text-center text-slate-600 text-sm hover:text-slate-400 transition-colors mt-8">
          ← Retour au Dashboard
        </Link>
      </div>
    );
  }

  // ─── FINISHED ───
  if (phase === "finished") {
    const total = questions.length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg mx-auto px-4 py-10 text-center">
        <div className="text-6xl mb-4">{accuracy >= 80 ? "🏆" : accuracy >= 50 ? "🌍" : "📚"}</div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {accuracy >= 80 ? "Géographe Expert !" : accuracy >= 50 ? "Pas mal !" : "Continue d'explorer !"}
        </h2>
        <p className="text-slate-500 mb-6">{score} / {total} bonnes réponses</p>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass-card !rounded-2xl p-4">
            <div className="text-2xl font-bold text-neon-cyan">{score}/{total}</div>
            <div className="text-slate-600 text-xs mt-1">Score</div>
          </div>
          <div className="glass-card !rounded-2xl p-4">
            <div className="text-2xl font-bold text-amber-400">{bestStreak} 🔥</div>
            <div className="text-slate-600 text-xs mt-1">Série</div>
          </div>
          <div className="glass-card !rounded-2xl p-4">
            <div className="text-2xl font-bold text-green-400">+{xpEarned}</div>
            <div className="text-slate-600 text-xs mt-1">XP gagné</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setXpRecorded(false); setPhase("menu"); }}
            className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/8 transition-colors">
            Menu
          </button>
          <button onClick={() => { setXpRecorded(false); startGame(questionMode); }}
            className="flex-1 py-4 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-2xl hover:brightness-110 transition-all">
            Rejouer 🌍
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── PLAYING / ANSWERED ───
  const optionLabels = ["A", "B", "C", "D"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="glass-card !rounded-xl px-3 py-1.5 flex items-center gap-2">
            <span className="text-slate-500 text-sm">Score</span>
            <span className="text-neon-cyan font-bold">{score}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: heartsSystem.maxHearts }).map((_, i) => (
              <span key={i} className="text-sm">
                {i < heartsSystem.hearts ? (heartsSystem.premium ? "💛" : "❤️") : <span className="opacity-20">🖤</span>}
              </span>
            ))}
          </div>
          {streak > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-1.5 flex items-center gap-1">
              <span className="text-orange-400 text-sm font-bold">{streak}x</span>
              <span>🔥</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600 text-sm tabular-nums">{currentIndex + 1}/{questions.length}</span>
          <button onClick={() => setPhase("menu")} className="text-slate-600 hover:text-slate-300 text-sm px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
            Quitter
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-4 overflow-hidden">
        <motion.div
          className="h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose"
          animate={{ width: `${((currentIndex + (phase === "answered" ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
          style={{ boxShadow: "0 0 10px rgba(0, 240, 255, 0.4)" }}
        />
      </div>

      {/* Question card */}
      {currentQ && (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.3 }}
            className="glass-card-strong p-6 mb-4"
          >
            {/* Timer */}
            <div className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-600 text-xs">Temps restant</span>
                <span className={`text-sm font-bold tabular-nums ${
                  phase === "answered" ? "opacity-30 text-slate-600" :
                  timerUrgent ? "text-neon-rose" : timerWarn ? "text-amber-400" : "text-neon-cyan"
                }`}>
                  {phase === "answered" ? "—" : `${timeLeft}s`}
                </span>
              </div>
              <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 rounded-full transition-all duration-1000 ease-linear"
                  style={{
                    width: phase === "answered" ? "0%" : `${timerPercent}%`,
                    background: timerUrgent
                      ? "linear-gradient(90deg, #ff2d7b, #ff6b9d)"
                      : timerWarn
                      ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                      : "linear-gradient(90deg, #00f0ff, #00c8d4)",
                    boxShadow: timerUrgent
                      ? "0 0 12px rgba(255, 45, 123, 0.6)"
                      : timerWarn
                      ? "0 0 12px rgba(245, 158, 11, 0.5)"
                      : "0 0 12px rgba(0, 240, 255, 0.5)",
                  }}
                />
              </div>
            </div>

            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span>🌍</span>
                <span className="text-sm font-medium text-emerald-400">Tour du Monde</span>
              </div>
            </div>

            {/* Question */}
            <h2 className="text-xl font-semibold text-white leading-relaxed">{currentQ.question}</h2>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Options — grid 2x2 pour les boutons */}
      {currentQ && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentQ.options.map((option, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === currentQ.correctIndex;

            let bgClass = "bg-white/[0.02]";
            let borderClass = "border-white/[0.06]";
            let textClass = "text-slate-300";
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
                disabled={phase === "answered" || isAnswering}
                className={`w-full p-4 rounded-2xl border-2 text-left font-medium transition-colors flex items-center gap-3 ${bgClass} ${borderClass} ${textClass} ${
                  phase !== "answered" && !isAnswering ? "cursor-pointer hover:border-neon-cyan/30 hover:bg-neon-cyan/5" : ""
                }`}
                style={glowStyle}
              >
                <span className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold border ${
                  phase === "answered" && isCorrect
                    ? "bg-green-500/20 border-green-500/50 text-green-300"
                    : phase === "answered" && isSelected && !isCorrect
                    ? "bg-neon-rose/20 border-neon-rose/40 text-neon-rose"
                    : "bg-white/5 border-white/10 text-slate-500"
                }`}>
                  {phase === "answered" && isCorrect ? "✓" : phase === "answered" && isSelected && !isCorrect ? "✗" : optionLabels[i]}
                </span>
                <span className="flex-1">{option}</span>
                {phase === "answered" && isCorrect && !isSelected && (
                  <span className="text-green-400/70 text-sm">← Bonne réponse</span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Feedback */}
      <AnimatePresence>
        {phase === "answered" && currentQ && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {selectedOption === -1 ? (
              /* Timeout — Teubé style */
              <>
                <motion.div
                  initial={{ scale: 1.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5, duration: 0.4 }}
                  className="bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl p-5 mb-3 text-center"
                  style={{ boxShadow: "0 0 30px rgba(245, 158, 11, 0.15)" }}
                >
                  <p className="text-amber-400 font-black text-xl mb-1">⏰ TROP LENT !</p>
                  <p className="text-amber-400/70 text-sm italic mb-2">T&apos;es resté planté là comme un Teubé !</p>
                  <p className="text-slate-500 text-sm">
                    La bonne réponse : <span className="text-green-400 font-bold">{currentQ.options[currentQ.correctIndex]}</span>
                  </p>
                </motion.div>
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ delay: 0.2 }} className="glass-card !rounded-2xl p-4 mb-3 overflow-hidden">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    <span className="text-neon-cyan font-medium">💡 </span>{currentQ.explanation}
                  </p>
                </motion.div>
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  onClick={handleNext}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold hover:brightness-110 transition-all"
                  style={{ boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)" }}>
                  Continuer →
                </motion.button>
              </>
            ) : selectedOption !== null && selectedOption === currentQ.correctIndex ? (
              /* Correct */
              <>
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                  className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 mb-3 text-center"
                  style={{ boxShadow: "0 0 20px rgba(34, 197, 94, 0.08)" }}>
                  <p className="text-green-400 font-semibold text-lg">✓ Bravo !{streak > 1 && ` 🔥 Série x${streak}`}</p>
                </motion.div>
                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                  <motion.div initial={{ width: "100%" }} animate={{ width: "0%" }} transition={{ duration: 1.2, ease: "linear" }}
                    className="h-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose"
                    style={{ boxShadow: "0 0 8px rgba(0, 240, 255, 0.4)" }} />
                </div>
              </>
            ) : (
              /* Wrong */
              <>
                <div className="bg-neon-rose/5 border border-neon-rose/20 rounded-2xl p-4 mb-3 text-center">
                  <p className="text-neon-rose font-semibold text-lg">✗ Raté !</p>
                  <p className="text-slate-500 text-sm mt-1">
                    La bonne réponse : <span className="text-green-400 font-semibold">{currentQ.options[currentQ.correctIndex]}</span>
                  </p>
                </div>
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="glass-card !rounded-2xl p-4 mb-3 overflow-hidden">
                  <p className="text-slate-400 text-sm leading-relaxed">
                    <span className="text-neon-cyan font-medium">💡 </span>{currentQ.explanation}
                  </p>
                </motion.div>
                <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  onClick={handleNext}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold hover:brightness-110 transition-all"
                  style={{ boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)" }}>
                  Continuer →
                </motion.button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
