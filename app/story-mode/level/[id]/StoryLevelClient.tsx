"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useStoryProgress } from "@/hooks/useStoryProgress";
import { useProgress } from "@/hooks/useProgress";
import { useFeedback } from "@/hooks/useFeedback";
import LessonNarrative from "@/components/LessonNarrative";
import Link from "next/link";

interface StoryLevelData {
  id: number;
  day: number;
  title: string;
  description: string;
  screenshot: string;
  lienModerne: string;
  category: string;
  difficulty: string;
  questionsCount: number;
}

interface Question {
  id: number;
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

type Phase = "lesson" | "loading" | "playing" | "answered" | "finished";

export default function StoryLevelClient({ level }: { level: StoryLevelData }) {
  const { isLevelUnlocked, isLevelCompleted, completeLevel, getLevelScore } = useStoryProgress();
  const { addXp, recordGame } = useProgress();
  const { correctFeedback, wrongFeedback } = useFeedback();

  const [phase, setPhase] = useState<Phase>("lesson");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  // Check if level is accessible
  const unlocked = isLevelUnlocked(level.id);
  const alreadyCompleted = isLevelCompleted(level.id);
  const previousScore = getLevelScore(level.id);

  // Fetch questions when quiz starts
  const startQuiz = useCallback(async () => {
    setPhase("loading");
    try {
      const res = await fetch(
        `/api/questions/random?limit=${level.questionsCount}&category=${encodeURIComponent(level.category)}&difficulty=${level.difficulty}`
      );
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setPhase("playing");
      } else {
        // Fallback: try without difficulty filter
        const res2 = await fetch(
          `/api/questions/random?limit=${level.questionsCount}&category=${encodeURIComponent(level.category)}`
        );
        const data2 = await res2.json();
        setQuestions(data2.questions || []);
        setPhase("playing");
      }
    } catch {
      setPhase("lesson");
    }
  }, [level]);

  // Timer
  useEffect(() => {
    if (phase !== "playing") return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, timeLeft]);

  const handleAnswer = useCallback(
    (optionIdx: number) => {
      if (phase !== "playing" || selectedOption !== null) return;
      const q = questions[currentQ];
      if (!q) return;

      setSelectedOption(optionIdx);
      const isCorrect = optionIdx === q.correctIndex;
      if (isCorrect) {
        setScore((s) => s + 1);
        correctFeedback();
      } else {
        wrongFeedback();
      }
      setPhase("answered");

      // Auto-advance
      setTimeout(() => {
        if (currentQ + 1 < questions.length) {
          setCurrentQ((c) => c + 1);
          setSelectedOption(null);
          setTimeLeft(15);
          setPhase("playing");
        } else {
          const finalScore = isCorrect ? score + 1 : score;
          completeLevel(level.id, finalScore, questions.length);
          addXp(finalScore * 10 + 20);
          recordGame(0);
          setPhase("finished");
        }
      }, isCorrect ? 1200 : 2500);
    },
    [phase, selectedOption, questions, currentQ, score, correctFeedback, wrongFeedback, completeLevel, level.id, addXp, recordGame]
  );

  // Not unlocked
  if (!unlocked) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Niveau verrouille</h2>
        <p className="text-slate-400 mb-6">Termine le jour {level.day - 1} pour debloquer ce niveau.</p>
        <Link
          href="/story-mode"
          className="px-6 py-3 bg-white/[0.05] border border-white/[0.1] text-white font-semibold rounded-xl hover:bg-white/[0.08] transition-all"
        >
          Retour a la map
        </Link>
      </div>
    );
  }

  // Lesson phase
  if (phase === "lesson") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {alreadyCompleted && previousScore && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-4"
          >
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3 text-sm">
              <span className="text-green-400">✅</span>
              <span className="text-green-400">Deja complete : {previousScore.score}/{previousScore.total}</span>
              <span className="text-slate-500 ml-auto">Rejouer pour ameliorer</span>
            </div>
          </motion.div>
        )}
        <LessonNarrative
          title={level.title}
          description={level.description}
          screenshot={level.screenshot}
          lienModerne={level.lienModerne}
          day={level.day}
          onStart={startQuiz}
        />
      </div>
    );
  }

  // Loading
  if (phase === "loading") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-4xl inline-block mb-4">
          ⚡
        </motion.div>
        <p className="text-slate-400">Chargement des questions...</p>
      </div>
    );
  }

  // Finished
  if (phase === "finished") {
    const pct = Math.round((score / questions.length) * 100);
    const stars = pct >= 100 ? 3 : pct >= 60 ? 2 : 1;
    const nextLevel = level.id + 1;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card-strong !rounded-3xl p-8 text-center"
        >
          <div className="text-5xl mb-4">
            {pct >= 100 ? "🏆" : pct >= 60 ? "🎉" : "💪"}
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Jour {level.day} termine !</h2>
          <p className="text-slate-400 mb-6">{level.title}</p>

          {/* Stars */}
          <div className="text-4xl mb-6 tracking-widest">
            {[1, 2, 3].map((s) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: s * 0.2 }}
              >
                {s <= stars ? "★" : "☆"}
              </motion.span>
            ))}
          </div>

          {/* Score */}
          <div className="bg-white/[0.03] rounded-2xl p-4 mb-6 inline-block">
            <span className="text-4xl font-bold text-neon-cyan">{score}</span>
            <span className="text-slate-500 text-lg">/{questions.length}</span>
            <p className="text-slate-500 text-sm mt-1">{pct}% de bonnes reponses</p>
          </div>

          {/* XP gained */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-neon-cyan font-bold mb-8"
          >
            +{score * 10 + 20} XP gagnes
          </motion.p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {nextLevel <= 30 && (
              <Link
                href={`/story-mode/level/${nextLevel}`}
                className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-cyan/80 text-cyber-950 font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neon-cyan/20"
              >
                Jour {level.day + 1} →
              </Link>
            )}
            <Link
              href="/story-mode"
              className="px-6 py-3 bg-white/[0.05] border border-white/[0.1] text-white font-semibold rounded-xl hover:bg-white/[0.08] transition-all"
            >
              Retour a la map
            </Link>
            <button
              onClick={() => {
                setPhase("lesson");
                setCurrentQ(0);
                setScore(0);
                setSelectedOption(null);
                setTimeLeft(15);
              }}
              className="px-6 py-3 bg-white/[0.05] border border-white/[0.1] text-slate-400 font-semibold rounded-xl hover:bg-white/[0.08] transition-all"
            >
              Rejouer
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing / Answered
  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/story-mode" className="text-slate-500 hover:text-white transition-colors">
          ←
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Jour {level.day}</span>
            <span className="text-slate-500 text-xs">{currentQ + 1}/{questions.length}</span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-2">
            <motion.div
              animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
              className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-neon-rose"
            />
          </div>
        </div>
        {/* Timer */}
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-colors ${
          timeLeft <= 5 ? "border-neon-rose text-neon-rose" : "border-neon-cyan/30 text-neon-cyan"
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Question card */}
      <motion.div
        key={currentQ}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-card-strong !rounded-3xl p-6 mb-4"
      >
        {/* Category badge */}
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 mb-4">
          <span className="text-purple-400 text-xs font-semibold">{q.category}</span>
        </div>

        <h2 className="text-xl font-bold text-white leading-relaxed mb-6">{q.question}</h2>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === q.correctIndex;
            const showResult = phase === "answered";

            let optionStyle = "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.15]";
            if (showResult) {
              if (isCorrect) {
                optionStyle = "bg-green-500/10 border-2 border-green-500/40 shadow-lg shadow-green-500/10";
              } else if (isSelected && !isCorrect) {
                optionStyle = "bg-red-500/10 border-2 border-red-500/40 shadow-lg shadow-red-500/10";
              } else {
                optionStyle = "bg-white/[0.02] border border-white/[0.05] opacity-50";
              }
            }

            return (
              <motion.button
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleAnswer(idx)}
                disabled={phase === "answered"}
                className={`w-full text-left p-4 rounded-2xl transition-all ${optionStyle} ${
                  phase === "playing" ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    showResult && isCorrect
                      ? "bg-green-500/20 text-green-400"
                      : showResult && isSelected && !isCorrect
                      ? "bg-red-500/20 text-red-400"
                      : "bg-white/[0.06] text-slate-500"
                  }`}>
                    {showResult && isCorrect ? "✓" : showResult && isSelected && !isCorrect ? "✗" : String.fromCharCode(65 + idx)}
                  </span>
                  <span className={`text-sm font-medium ${
                    showResult && isCorrect ? "text-green-400" : showResult && isSelected && !isCorrect ? "text-red-400" : "text-slate-300"
                  }`}>
                    {option}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        {phase === "answered" && q.explanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
          >
            <p className="text-slate-400 text-sm">
              <span className="text-neon-cyan font-semibold">Explication : </span>
              {q.explanation}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Score tracker */}
      <div className="text-center">
        <span className="text-slate-600 text-sm">Score : </span>
        <span className="text-neon-cyan font-bold">{score}</span>
        <span className="text-slate-600 text-sm">/{currentQ + (phase === "answered" ? 1 : 0)}</span>
      </div>
    </div>
  );
}
