"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { questions, categoryColors, difficultyColors } from "@/lib/questions";
import { Category, Question } from "@/lib/types";

const TIMER_SECONDS = 15;
const QUESTIONS_PER_GAME = 8;

type GamePhase = "select" | "playing" | "answered" | "finished";

interface Props {
  initialCategory?: string;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function QuizClient({ initialCategory }: Props) {
  const [phase, setPhase] = useState<GamePhase>("select");
  const [selectedCategory, setSelectedCategory] = useState<Category | "All">(
    (initialCategory as Category) || "All"
  );
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answers, setAnswers] = useState<{ selected: number | null; correct: number }[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleTimeout = useCallback(() => {
    stopTimer();
    const currentQ = gameQuestions[currentIndex];
    setAnswers((prev) => [...prev, { selected: null, correct: currentQ.correctIndex }]);
    setStreak(0);
    setSelectedOption(-1);
    setPhase("answered");
  }, [gameQuestions, currentIndex, stopTimer]);

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

  const startGame = useCallback(() => {
    const pool =
      selectedCategory === "All"
        ? questions
        : questions.filter((q) => q.category === selectedCategory);
    const selected = shuffle(pool).slice(0, QUESTIONS_PER_GAME);
    setGameQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);
    setPhase("playing");
  }, [selectedCategory]);

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
      } else {
        setStreak(0);
      }
      setPhase("answered");
    },
    [phase, gameQuestions, currentIndex, stopTimer]
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
    setPhase("playing");
  }, [currentIndex, gameQuestions.length]);

  const currentQ = gameQuestions[currentIndex];
  const timerPercent = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor =
    timeLeft > 8 ? "#6366f1" : timeLeft > 4 ? "#f59e0b" : "#f43f5e";

  // ─── SELECT SCREEN ───
  if (phase === "select") {
    const allCategories: (Category | "All")[] = ["All", "Histoire", "Sciences", "Arts", "Sport"];
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🧠</div>
          <h1 className="text-3xl font-bold text-white mb-2">Choisissez une catégorie</h1>
          <p className="text-slate-400">Timer de 15 secondes · 8 questions · Système de streak</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {allCategories.map((cat) => {
            const colors = cat !== "All" ? categoryColors[cat] : null;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`p-5 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 text-left ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <div className="text-3xl mb-2">{colors ? colors.icon : "🌍"}</div>
                <div className={`font-semibold ${isSelected ? "text-indigo-400" : "text-white"}`}>
                  {cat === "All" ? "Tout" : cat}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {cat === "All"
                    ? `${questions.length} questions`
                    : `${questions.filter((q) => q.category === cat).length} questions`}
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={startGame}
          className="w-full py-4 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20"
        >
          Lancer le Quiz 🚀
        </button>
      </div>
    );
  }

  // ─── FINISHED SCREEN ───
  if (phase === "finished") {
    const accuracy = Math.round((score / gameQuestions.length) * 100);
    const grade =
      accuracy >= 90 ? { label: "Excellent !", icon: "🏆", color: "text-yellow-400" }
      : accuracy >= 70 ? { label: "Très bien !", icon: "⭐", color: "text-indigo-400" }
      : accuracy >= 50 ? { label: "Pas mal !", icon: "👍", color: "text-green-400" }
      : { label: "Continuez !", icon: "💪", color: "text-rose-400" };

    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-center">
          <div className="text-6xl mb-4">{grade.icon}</div>
          <h2 className={`text-3xl font-bold mb-1 ${grade.color}`}>{grade.label}</h2>
          <p className="text-slate-400 mb-8">Quiz terminé !</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4">
              <div className="text-2xl font-bold text-indigo-400">{score}/{gameQuestions.length}</div>
              <div className="text-slate-400 text-xs mt-1">Score</div>
            </div>
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
              <div className="text-2xl font-bold text-rose-400">{bestStreak} 🔥</div>
              <div className="text-slate-400 text-xs mt-1">Meilleur Streak</div>
            </div>
            <div className={`${accuracy >= 70 ? "bg-green-500/10 border-green-500/20" : "bg-amber-500/10 border-amber-500/20"} border rounded-2xl p-4`}>
              <div className={`text-2xl font-bold ${accuracy >= 70 ? "text-green-400" : "text-amber-400"}`}>{accuracy}%</div>
              <div className="text-slate-400 text-xs mt-1">Précision</div>
            </div>
          </div>

          {/* Answer review */}
          <div className="space-y-2 mb-8 text-left">
            {gameQuestions.map((q, i) => {
              const ans = answers[i];
              const isCorrect = ans?.selected === q.correctIndex;
              const isTimedOut = ans?.selected === null;
              return (
                <div
                  key={q.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    isCorrect
                      ? "bg-green-500/10 border-green-500/20"
                      : "bg-rose-500/10 border-rose-500/20"
                  }`}
                >
                  <span className="text-lg">{isCorrect ? "✅" : isTimedOut ? "⏰" : "❌"}</span>
                  <span className="text-slate-300 text-sm flex-1 truncate">{q.question}</span>
                  <span className={`text-xs font-medium ${categoryColors[q.category].text}`}>
                    {categoryColors[q.category].icon}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setPhase("select");
                setSelectedCategory("All");
              }}
              className="flex-1 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all"
            >
              Changer catégorie
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
            >
              Rejouer 🔄
            </button>
          </div>
          <Link
            href="/leaderboard"
            className="block mt-3 py-3 text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors"
          >
            Voir le classement →
          </Link>
        </div>
      </div>
    );
  }

  // ─── PLAYING / ANSWERED ───
  const catColors = categoryColors[currentQ.category];
  const diffColors = difficultyColors[currentQ.difficulty];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header stats */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 flex items-center gap-2">
            <span className="text-slate-400 text-sm">Score</span>
            <span className="text-indigo-400 font-bold">{score}</span>
          </div>
          {streak > 0 && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 flex items-center gap-2 animate-bounce-in">
              <span className="text-rose-400 text-sm font-bold">{streak}x</span>
              <span>🔥</span>
            </div>
          )}
        </div>

        <div className="text-slate-400 text-sm font-medium">
          {currentIndex + 1} / {gameQuestions.length}
        </div>

        <button
          onClick={() => setPhase("select")}
          className="text-slate-500 hover:text-slate-300 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          Quitter ✕
        </button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500 transition-all duration-300"
          style={{ width: `${((currentIndex + (phase === "answered" ? 1 : 0)) / gameQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-4">
        {/* Category + difficulty */}
        <div className="flex items-center justify-between mb-5">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${catColors.bg} border ${catColors.border}`}>
            <span>{catColors.icon}</span>
            <span className={`text-sm font-medium ${catColors.text}`}>{currentQ.category}</span>
          </div>
          <span className={`text-xs font-medium ${diffColors.text}`}>{diffColors.label}</span>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-xs">Temps restant</span>
            <span
              className={`text-sm font-bold tabular-nums ${
                timeLeft > 8 ? "text-indigo-400" : timeLeft > 4 ? "text-amber-400" : "text-rose-400"
              } ${phase === "answered" ? "opacity-50" : ""}`}
            >
              {phase === "answered" ? "—" : `${timeLeft}s`}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{
                width: phase === "answered" ? "0%" : `${timerPercent}%`,
                backgroundColor: timerColor,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-xl font-semibold text-white leading-relaxed">{currentQ.question}</h2>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 mb-4">
        {currentQ.options.map((option, i) => {
          const isSelected = selectedOption === i;
          const isCorrect = i === currentQ.correctIndex;

          let optionClass =
            "w-full p-4 rounded-2xl border-2 text-left font-medium transition-all flex items-center gap-3 ";

          if (phase === "answered") {
            if (isCorrect) {
              optionClass += "bg-green-500/20 border-green-500 text-green-300 ";
            } else if (isSelected && !isCorrect) {
              optionClass += "bg-rose-500/20 border-rose-500 text-rose-300 ";
            } else {
              optionClass += "bg-white/3 border-white/10 text-slate-500 ";
            }
          } else {
            optionClass +=
              "bg-white/5 border-white/10 text-slate-200 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-white active:scale-98 cursor-pointer ";
          }

          const optionLabel = ["A", "B", "C", "D"][i];

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={phase === "answered"}
              className={optionClass}
            >
              <span
                className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-bold border ${
                  phase === "answered" && isCorrect
                    ? "bg-green-500/30 border-green-500 text-green-300"
                    : phase === "answered" && isSelected && !isCorrect
                    ? "bg-rose-500/30 border-rose-500 text-rose-300"
                    : "bg-white/10 border-white/20 text-slate-400"
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
                <span className="text-green-400 text-sm">← Bonne réponse</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback + Explanation */}
      {phase === "answered" && (
        <div className="animate-fade-in">
          {selectedOption === -1 ? (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 mb-4 text-center">
              <p className="text-amber-400 font-semibold">⏰ Temps écoulé !</p>
              <p className="text-slate-400 text-sm mt-1">La bonne réponse était surlignée en vert.</p>
            </div>
          ) : selectedOption === currentQ.correctIndex ? (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-4 text-center">
              <p className="text-green-400 font-semibold text-lg">
                ✅ Bonne réponse !{streak > 1 && ` 🔥 Streak x${streak}`}
              </p>
            </div>
          ) : (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 mb-4 text-center">
              <p className="text-rose-400 font-semibold text-lg">❌ Mauvaise réponse</p>
              <p className="text-slate-400 text-sm mt-1">
                La bonne réponse : {currentQ.options[currentQ.correctIndex]}
              </p>
            </div>
          )}

          {showExplanation && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 animate-fade-in">
              <p className="text-slate-400 text-sm leading-relaxed">
                <span className="text-indigo-400 font-medium">💡 Explication : </span>
                {currentQ.explanation}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowExplanation((v) => !v)}
              className="px-4 py-3 bg-white/5 border border-white/10 text-slate-300 text-sm font-medium rounded-xl hover:bg-white/10 transition-all"
            >
              {showExplanation ? "Masquer" : "💡 Explication"}
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-indigo-500/20"
            >
              {currentIndex + 1 >= gameQuestions.length ? "Voir les résultats 🏆" : "Question suivante →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
