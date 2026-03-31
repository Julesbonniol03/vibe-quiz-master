"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface StoryLevel {
  id: number;
  title: string;
  brief: string;
  visualDescription: string;
  imagePlaceholder: string;
  quiz: QuizQuestion[];
}

interface CategoryQuestion {
  category: string;
  difficulty: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation?: string;
}

interface ExpertCategory {
  key: string;
  name: string;
  emoji: string;
  questions: CategoryQuestion[];
  story?: StoryLevel[];
}

const STORAGE_KEY = "vqm_story_progress";
const EXPERT_KEY = "vqm_expert_progress";
const EXPERT_STORY_PREFIX = "vqm_expert_story_";

function getProgress(): Record<number, { completed: boolean; score: number }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(levelId: number, score: number) {
  const progress = getProgress();
  progress[levelId] = { completed: true, score };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function getExpertProgress(): Record<string, { completed: boolean; score: number }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(EXPERT_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveExpertProgress(categoryKey: string, score: number) {
  const progress = getExpertProgress();
  progress[categoryKey] = { completed: true, score };
  localStorage.setItem(EXPERT_KEY, JSON.stringify(progress));
}

function getExpertStoryProgress(categoryKey: string): Record<number, { completed: boolean; score: number }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(EXPERT_STORY_PREFIX + categoryKey) || "{}");
  } catch {
    return {};
  }
}

function saveExpertStoryProgress(categoryKey: string, levelId: number, score: number) {
  const progress = getExpertStoryProgress(categoryKey);
  progress[levelId] = { completed: true, score };
  localStorage.setItem(EXPERT_STORY_PREFIX + categoryKey, JSON.stringify(progress));
}

function sampleExpertQuestions(questions: CategoryQuestion[], count: number): QuizQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((q) => ({
    question: q.question,
    options: q.options,
    answer: q.options[q.correct_index],
  }));
}

export default function StoryModeClient({ levels, expertCategories }: { levels: StoryLevel[]; expertCategories: ExpertCategory[] }) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const [selectedLevel, setSelectedLevel] = useState<StoryLevel | null>(null);
  const [phase, setPhase] = useState<"map" | "brief" | "quiz" | "results">("map");
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [progress, setProgress] = useState<Record<number, { completed: boolean; score: number }>>({});
  const [expertProgress, setExpertProgress] = useState<Record<string, { completed: boolean; score: number }>>({});
  const [activeExpertCategory, setActiveExpertCategory] = useState<ExpertCategory | null>(null);
  const [expertStoryCategory, setExpertStoryCategory] = useState<ExpertCategory | null>(null);
  const [expertStoryProgress, setExpertStoryProgress] = useState<Record<number, { completed: boolean; score: number }>>({});

  useEffect(() => {
    setProgress(getProgress());
    setExpertProgress(getExpertProgress());
  }, []);

  const handleSelectLevel = (level: StoryLevel) => {
    setSelectedLevel(level);
    setPhase("brief");
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  };

  const handleSelectExpertStory = (cat: ExpertCategory) => {
    setExpertStoryCategory(cat);
    setExpertStoryProgress(getExpertStoryProgress(cat.key));
  };

  const handleBackToMainMap = () => {
    setExpertStoryCategory(null);
    setExpertStoryProgress({});
  };

  const handleSelectExpertCategory = (cat: ExpertCategory) => {
    const questions = sampleExpertQuestions(cat.questions, 10);
    const syntheticLevel: StoryLevel = {
      id: -1,
      title: `${cat.emoji} ${cat.name} — Mode Expert`,
      brief: `Mode Expert débloqué. 10 questions aléatoires sur ${cat.name}, tirées depuis une banque de ${cat.questions.length} questions. Chaque partie est différente. Prouve que t'as le niveau.`,
      visualDescription: `Challenge ${cat.name} en mode full random. Tes connaissances mises à l'épreuve sans filet.`,
      imagePlaceholder: "",
      quiz: questions,
    };
    setActiveExpertCategory(cat);
    handleSelectLevel(syntheticLevel);
  };

  const handleStartQuiz = () => {
    setPhase("quiz");
  };

  const handleSeedProgress = () => {
    const seeded: Record<number, { completed: boolean; score: number }> = {};
    levels.forEach((l) => { seeded[l.id] = { completed: true, score: l.quiz.length }; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    setProgress(seeded);
  };

  const handleAnswer = (idx: number) => {
    if (answered || !selectedLevel) return;
    setSelected(idx);
    setAnswered(true);
    const correct = selectedLevel.quiz[currentQ].options[idx] === selectedLevel.quiz[currentQ].answer;
    if (correct) setScore((s: number) => s + 1);
  };

  const handleNext = () => {
    if (!selectedLevel) return;
    if (currentQ + 1 < selectedLevel.quiz.length) {
      setCurrentQ((q: number) => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const finalScore = score;
      if (expertStoryCategory) {
        saveExpertStoryProgress(expertStoryCategory.key, selectedLevel.id, finalScore);
        setExpertStoryProgress(getExpertStoryProgress(expertStoryCategory.key));
      } else if (activeExpertCategory) {
        saveExpertProgress(activeExpertCategory.key, finalScore);
        setExpertProgress(getExpertProgress());
      } else {
        saveProgress(selectedLevel.id, finalScore);
        setProgress(getProgress());
      }
      setPhase("results");
    }
  };

  const handleBackToMap = () => {
    setPhase("map");
    setSelectedLevel(null);
    setActiveExpertCategory(null);
    // Keep expertStoryCategory so we return to the expert story map
  };

  // ─── EXPERT STORY MAP VIEW ───
  if (phase === "map" && expertStoryCategory && expertStoryCategory.story) {
    const story = expertStoryCategory.story;
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-cyber-900 border border-white/[0.06] p-6 mb-6">
          <div className="relative z-10">
            <button onClick={handleBackToMainMap} className="text-slate-600 hover:text-slate-400 text-sm mb-3 flex items-center gap-1">
              &larr; Mode Expert
            </button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{expertStoryCategory.emoji}</span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full">
                Mode Histoire — {expertStoryCategory.name}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              L&apos;Histoire du <span className="gradient-text">{expertStoryCategory.name}</span>
            </h1>
            <p className="text-slate-500 text-sm">{story.length} niveaux — les grandes étapes à connaître.</p>
          </div>
        </div>

        {/* Story Levels */}
        <div className="space-y-3">
          {story.map((level, i) => {
            const done = expertStoryProgress[level.id]?.completed;
            const lvlScore = expertStoryProgress[level.id]?.score ?? 0;
            const isLocked = !isPreview && i > 0 && !expertStoryProgress[story[i - 1].id]?.completed;
            const isBoss = level.id === story.length;

            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => !isLocked && handleSelectLevel(level)}
                disabled={isLocked}
                className={`w-full text-left group relative overflow-hidden rounded-2xl border transition-all duration-300
                  ${isLocked
                    ? "opacity-40 cursor-not-allowed border-white/[0.04] bg-white/[0.01]"
                    : isBoss
                      ? done
                        ? "border-yellow-500/30 bg-yellow-500/[0.04] hover:bg-yellow-500/[0.08] hover:scale-[1.01] active:scale-[0.99]"
                        : "border-yellow-500/30 bg-yellow-500/[0.04] hover:border-yellow-400/50 hover:scale-[1.01] active:scale-[0.99]"
                      : done
                        ? "border-purple-500/20 bg-purple-500/[0.03] hover:bg-purple-500/[0.06] hover:scale-[1.01] active:scale-[0.99]"
                        : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-purple-400/30 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
              >
                <div className="relative p-4 flex items-center gap-4">
                  <div className={`flex-shrink-0 rounded-xl flex items-center justify-center font-bold border
                    ${isBoss ? "w-14 h-14 text-xl" : "w-12 h-12 text-base"}
                    ${isLocked ? "bg-white/[0.03] border-white/[0.06] text-slate-700"
                      : isBoss ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300"
                      : done ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      : "bg-gradient-to-br from-purple-500/10 to-neon-cyan/10 border-purple-400/20 text-purple-300"}`}>
                    {isLocked ? "🔒" : done ? (isBoss ? "🏆" : "✅") : isBoss ? "⚡" : `N${level.id}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${done ? "text-purple-400" : "text-white"}`}>
                      {level.title}
                    </h3>
                    <p className="text-slate-500 text-xs line-clamp-1 mt-0.5">{level.brief.slice(0, 100)}...</p>
                    {done && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {Array.from({ length: Math.min(level.quiz.length, 5) }).map((_, j) => (
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < lvlScore ? "bg-purple-400" : "bg-white/10"}`} />
                        ))}
                        <span className="text-purple-400/60 text-xs">{lvlScore}/{level.quiz.length}</span>
                      </div>
                    )}
                  </div>
                  {!isLocked && <span className="text-slate-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all text-lg flex-shrink-0">&rarr;</span>}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button onClick={handleBackToMainMap} className="text-slate-600 hover:text-slate-400 transition-colors text-sm">
            &larr; Retour au Mode Expert
          </button>
        </div>
      </div>
    );
  }

  // ─── MAP VIEW ───
  if (phase === "map") {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl bg-cyber-900 border border-white/[0.06] p-8 mb-8">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-purple-500/[0.04] rounded-full blur-[100px]" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-neon-cyan/[0.04] rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">📖</span>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-full">
                Story Mode
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              L&apos;Odyssée de la{" "}
              <span className="gradient-text">Culture G</span>
            </h1>
            <p className="text-slate-500 max-w-lg">
              De la Préhistoire à l&apos;Ère Numérique. 30 niveaux, chaque époque racontée comme un débrief en terrasse.
            </p>
          </div>
        </div>

        {/* Preview mode banner */}
        {isPreview && (
          <div className="mb-4 px-4 py-3 rounded-xl border border-yellow-500/30 bg-yellow-500/[0.06] flex flex-wrap items-center gap-3">
            <span className="text-yellow-400 text-sm font-bold">⚡ MODE PREVIEW</span>
            <span className="text-yellow-400/60 text-xs flex-1">Tous les niveaux débloqués pour test.</span>
            <button
              onClick={handleSeedProgress}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30 transition-colors"
            >
              🎮 Simuler joueur niveau 30
            </button>
            <Link href="/story-mode" className="text-xs text-yellow-400/50 underline hover:text-yellow-300">
              Quitter
            </Link>
          </div>
        )}

        {/* Level Cards */}
        <div className="space-y-4">
          {levels.map((level, i) => {
            const done = progress[level.id]?.completed;
            const levelScore = progress[level.id]?.score ?? 0;
            const isLocked = !isPreview && i > 0 && !progress[levels[i - 1].id]?.completed;

            return (
              <motion.button
                key={level.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => !isLocked && handleSelectLevel(level)}
                disabled={isLocked}
                className={`w-full text-left group relative overflow-hidden rounded-2xl border transition-all duration-300
                  ${isLocked
                    ? "opacity-40 cursor-not-allowed border-white/[0.04] bg-white/[0.01]"
                    : [15, 21, 30].includes(level.id)
                      ? done
                        ? "border-yellow-500/30 bg-yellow-500/[0.04] hover:bg-yellow-500/[0.08] hover:scale-[1.01] active:scale-[0.99]"
                        : "border-yellow-500/30 bg-yellow-500/[0.04] hover:bg-yellow-500/[0.08] hover:border-yellow-400/50 hover:scale-[1.01] active:scale-[0.99]"
                      : done
                        ? "border-green-500/20 bg-green-500/[0.03] hover:bg-green-500/[0.06] hover:scale-[1.01] active:scale-[0.99]"
                        : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-neon-cyan/30 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
              >
                {!isLocked && (
                  <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/[0.02] to-purple-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <div className="relative p-5 flex items-center gap-5">
                  {/* Day Number */}
                  <div className={`flex-shrink-0 rounded-2xl flex items-center justify-center font-bold border
                    ${[15, 21, 30].includes(level.id) ? "w-16 h-16 text-2xl" : "w-14 h-14 text-lg"}
                    ${isLocked
                      ? "bg-white/[0.03] border-white/[0.06] text-slate-700"
                      : [15, 21, 30].includes(level.id)
                        ? done
                          ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-300"
                          : "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300"
                        : done
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-gradient-to-br from-neon-cyan/10 to-purple-500/10 border-neon-cyan/20 text-neon-cyan"
                    }`}>
                    {isLocked ? "🔒" : done ? ([15, 21, 30].includes(level.id) ? "🏆" : "✅") : [15, 21, 30].includes(level.id) ? "⚡" : `J${level.id}`}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-bold truncate ${done ? "text-green-400" : "text-white"}`}>
                        Jour {level.id} — {level.title}
                      </h3>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2">
                      {level.brief.slice(0, 120)}...
                    </p>
                    {done && (
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex gap-1">
                          {Array.from({ length: Math.min(level.quiz.length, 10) }).map((_, j) => (
                            <div
                              key={j}
                              className={`w-2 h-2 rounded-full ${j < levelScore ? "bg-green-400" : "bg-white/10"}`}
                            />
                          ))}
                        </div>
                        <span className="text-green-400/70 text-xs font-medium">{levelScore}/{level.quiz.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Arrow */}
                  {!isLocked && (
                    <span className="text-slate-700 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all text-xl flex-shrink-0">
                      &rarr;
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Expert Mode — unlocked after completing all 30 levels */}
        {(isPreview || levels.every((l) => progress[l.id]?.completed)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10"
          >
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900/30 to-yellow-900/20 border border-yellow-500/20 p-6 mb-6">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-yellow-500/[0.06] rounded-full blur-[80px]" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🔓</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-yellow-300 bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded-full">
                    Mode Expert Débloqué
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Choisis ta catégorie</h2>
                <p className="text-slate-500 text-sm">
                  10 questions aléatoires par catégorie. Chaque partie est différente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {expertCategories.map((cat) => {
                const done = expertProgress[cat.key]?.completed;
                const catScore = expertProgress[cat.key]?.score ?? 0;
                const storyProg = getExpertStoryProgress(cat.key);
                const storyDone = cat.story ? cat.story.filter((l) => storyProg[l.id]?.completed).length : 0;
                return (
                  <div
                    key={cat.key}
                    className={`p-4 rounded-2xl border transition-all duration-200
                      ${done
                        ? "border-purple-500/30 bg-purple-500/[0.05]"
                        : "border-white/[0.08] bg-white/[0.02]"
                      }`}
                  >
                    <div className="text-2xl mb-2">{cat.emoji}</div>
                    <div className={`font-semibold text-sm mb-1 ${done ? "text-purple-300" : "text-white"}`}>
                      {cat.name}
                    </div>
                    {done && (
                      <div className="flex items-center gap-1 mb-2">
                        {Array.from({ length: 10 }).map((_, j) => (
                          <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < catScore ? "bg-purple-400" : "bg-white/10"}`} />
                        ))}
                        <span className="text-purple-400/70 text-xs ml-1">{catScore}/10</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectExpertCategory(cat)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 transition-all text-left"
                      >
                        🎲 Quiz Random
                      </motion.button>
                      {cat.story && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectExpertStory(cat)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/20 text-neon-cyan transition-all text-left flex items-center justify-between"
                        >
                          <span>📖 Mode Histoire</span>
                          {storyDone > 0 && (
                            <span className="text-neon-cyan/60">{storyDone}/{cat.story.length}</span>
                          )}
                        </motion.button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="/dashboard"
            className="text-slate-600 hover:text-slate-400 transition-colors text-sm"
          >
            &larr; Retour au dashboard
          </Link>
          {!levels.every((l) => progress[l.id]?.completed) && (
            <button
              onClick={handleSeedProgress}
              className="text-xs text-slate-700 hover:text-slate-500 transition-colors underline"
            >
              [Dev] Simuler joueur niveau 30
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── BRIEF VIEW ───
  if (phase === "brief" && selectedLevel) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back button */}
          <button
            onClick={handleBackToMap}
            className="text-slate-600 hover:text-slate-400 transition-colors text-sm flex items-center gap-1"
          >
            &larr; Retour à la carte
          </button>

          {/* Header */}
          <div className="rounded-3xl overflow-hidden border border-white/[0.08]">
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-purple-900/40 to-neon-cyan/20 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-950 to-transparent" />
              <span className="relative text-6xl">
                {selectedLevel.id === -1 ? (activeExpertCategory?.emoji ?? "🎯") : selectedLevel.id === 1 ? "🦴" : selectedLevel.id === 2 ? "🏺" : selectedLevel.id === 3 ? "🏛️" : selectedLevel.id === 4 ? "💀" : selectedLevel.id === 5 ? "⚔️" : selectedLevel.id === 6 ? "👑" : selectedLevel.id === 7 ? "⛪" : selectedLevel.id === 8 ? "🦠" : selectedLevel.id === 9 ? "🗡️" : selectedLevel.id === 10 ? "📜" : selectedLevel.id === 11 ? "🎨" : selectedLevel.id === 12 ? "🌊" : selectedLevel.id === 13 ? "📌" : selectedLevel.id === 14 ? "⚔️" : selectedLevel.id === 15 ? "⚡" : selectedLevel.id === 16 ? "💡" : selectedLevel.id === 17 ? "🏴" : selectedLevel.id === 18 ? "🗺️" : selectedLevel.id === 19 ? "⚙️" : selectedLevel.id === 20 ? "✊" : selectedLevel.id === 21 ? "⚡" : selectedLevel.id === 22 ? "🪖" : selectedLevel.id === 23 ? "📈" : selectedLevel.id === 24 ? "💣" : selectedLevel.id === 25 ? "☢️" : selectedLevel.id === 26 ? "🌍" : selectedLevel.id === 27 ? "🚀" : selectedLevel.id === 28 ? "🌐" : selectedLevel.id === 29 ? "📱" : selectedLevel.id === 30 ? "⚡" : "🏛️"}
              </span>
            </div>

            {/* Content */}
            <div className="p-6 bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${
                  selectedLevel.id === -1
                    ? "text-purple-300 bg-purple-500/10 border-purple-500/20"
                    : expertStoryCategory
                    ? "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20"
                    : [15, 21, 30].includes(selectedLevel.id)
                    ? "text-yellow-300 bg-yellow-500/10 border-yellow-500/20"
                    : "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20"
                }`}>
                  {selectedLevel.id === -1
                    ? `🔓 MODE EXPERT — ${activeExpertCategory?.name}`
                    : expertStoryCategory
                    ? `📖 MODE HISTOIRE — ${expertStoryCategory.name} · Niveau ${selectedLevel.id}`
                    : selectedLevel.id === 30
                    ? "⚡ ULTIMATE BOSS — Jour 30"
                    : [15, 21].includes(selectedLevel.id)
                    ? `⚡ BOSS — Jour ${selectedLevel.id}`
                    : `Jour ${selectedLevel.id}`}
                </span>
                <span className="text-xs text-slate-600">{selectedLevel.quiz.length} questions</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{selectedLevel.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">
                {selectedLevel.brief}
              </p>

              {/* Visual description */}
              <div className="mt-5 p-4 rounded-xl bg-purple-500/[0.05] border border-purple-500/10">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Visualise le truc</p>
                <p className="text-slate-500 text-sm italic">{selectedLevel.visualDescription}</p>
              </div>
            </div>
          </div>

          {/* Start Quiz Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleStartQuiz}
            className="w-full py-4 bg-gradient-to-r from-neon-cyan to-purple-500 text-white font-bold rounded-2xl text-lg shadow-lg shadow-neon-cyan/20 hover:shadow-neon-cyan/30 transition-shadow"
          >
            Lancer le Quiz &rarr;
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ─── QUIZ VIEW ───
  if (phase === "quiz" && selectedLevel) {
    const q = selectedLevel.quiz[currentQ];
    const correctIdx = q.options.indexOf(q.answer);
    const isCorrect = selected !== null && q.options[selected] === q.answer;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Progress bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-medium">
              {currentQ + 1}/{selectedLevel.quiz.length}
            </span>
            <div className="flex-1 bg-white/[0.06] rounded-full h-2">
              <motion.div
                className="h-2 rounded-full bg-gradient-to-r from-neon-cyan to-purple-500"
                initial={{ width: `${(currentQ / selectedLevel.quiz.length) * 100}%` }}
                animate={{ width: `${((currentQ + 1) / selectedLevel.quiz.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-bold text-neon-cyan">{score} pts</span>
          </div>

          {/* Question */}
          <div className="glass-card !rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white leading-relaxed">{q.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let style = "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]";
              if (answered) {
                if (idx === correctIdx) {
                  style = "border-green-500/40 bg-green-500/[0.08] ring-1 ring-green-500/20";
                } else if (idx === selected && !isCorrect) {
                  style = "border-red-500/40 bg-red-500/[0.08] ring-1 ring-red-500/20 animate-shake";
                } else {
                  style = "border-white/[0.04] bg-white/[0.01] opacity-50";
                }
              } else if (idx === selected) {
                style = "border-neon-cyan/40 bg-neon-cyan/[0.05]";
              }

              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  onClick={() => handleAnswer(idx)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                      ${answered && idx === correctIdx
                        ? "bg-green-500/20 text-green-400"
                        : answered && idx === selected && !isCorrect
                          ? "bg-red-500/20 text-red-400"
                          : "bg-white/[0.06] text-slate-500"
                      }`}>
                      {answered && idx === correctIdx ? "✓" : answered && idx === selected && !isCorrect ? "✗" : String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`font-medium text-sm ${answered && idx === correctIdx ? "text-green-400" : answered && idx === selected && !isCorrect ? "text-red-400" : "text-slate-300"}`}>
                      {opt}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback + Next */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className={`p-4 rounded-xl border ${isCorrect ? "bg-green-500/[0.05] border-green-500/20" : "bg-red-500/[0.05] border-red-500/20"}`}>
                  <p className={`font-bold text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {isCorrect ? "Bien joué ! 🔥" : `Raté ! La bonne réponse : ${q.answer}`}
                  </p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-3 bg-gradient-to-r from-neon-cyan to-neon-cyan/80 text-cyber-950 font-bold rounded-xl hover:opacity-90 transition-all"
                >
                  {currentQ + 1 < selectedLevel.quiz.length ? "Question suivante &rarr;" : "Voir les résultats"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  // ─── RESULTS VIEW ───
  if (phase === "results" && selectedLevel) {
    const perfect = score === selectedLevel.quiz.length;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <div className="glass-card !rounded-3xl p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              {perfect ? "🏆" : score >= 3 ? "🔥" : "💪"}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {perfect ? "Sans faute !" : score >= 3 ? "Bien joué !" : "Continue comme ça !"}
            </h2>
            <p className="text-slate-500 mb-4">Jour {selectedLevel.id} — {selectedLevel.title}</p>

            {/* Score circles */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {Array.from({ length: selectedLevel.quiz.length }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className={`w-4 h-4 rounded-full ${i < score ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-white/10"}`}
                />
              ))}
            </div>

            <div className={`text-4xl font-bold mb-1 ${perfect ? "text-yellow-400" : score >= 3 ? "text-green-400" : "text-neon-cyan"}`}>
              {score}/{selectedLevel.quiz.length}
            </div>
            <p className="text-slate-600 text-sm">
              {perfect ? "T'es un vrai OG de l'histoire" : score >= 3 ? "Pas mal du tout, t'as capté l'essentiel" : "Relis le brief et retente ta chance"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleSelectLevel(selectedLevel)}
              className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] text-white font-semibold rounded-xl hover:bg-white/[0.07] transition-all"
            >
              Rejouer
            </button>
            <button
              onClick={handleBackToMap}
              className="flex-1 py-3 bg-gradient-to-r from-neon-cyan to-neon-cyan/80 text-cyber-950 font-bold rounded-xl hover:opacity-90 transition-all"
            >
              Continuer &rarr;
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
