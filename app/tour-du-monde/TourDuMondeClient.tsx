"use client";

import { useState, useCallback, useMemo, useRef, memo } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useProgress, calculateGameXp } from "@/hooks/useProgress";
import { useHearts } from "@/hooks/useHearts";
import { useFeedback } from "@/hooks/useFeedback";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface GeoEntry {
  code: string;
  country: string;
  capital: string;
  continent: string;
}

type QuestionType = "capital" | "country";
type Phase = "menu" | "playing" | "answered" | "finished";

interface HighlightState {
  clickedCode: string | null;
  correctCode: string | null;
  wasCorrect: boolean;
}

interface Props {
  geoData: GeoEntry[];
}

const WorldMap = memo(function WorldMap({
  clickedCode,
  correctCode,
  wasCorrect,
  onCountryClick,
  disabled,
}: {
  clickedCode: string | null;
  correctCode: string | null;
  wasCorrect: boolean;
  onCountryClick: (code: string) => void;
  disabled: boolean;
}) {
  return (
    <ComposableMap
      projectionConfig={{ scale: 147, center: [10, 10] }}
      className="w-full h-full"
      style={{ backgroundColor: "transparent" }}
      width={800}
      height={450}
    >
      <ZoomableGroup minZoom={1} maxZoom={8}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const code = geo.properties?.["ISO_A3"] || geo.id;
              const isCorrectCountry = correctCode === code;
              const isClickedCountry = clickedCode === code;

              let fill = "#12122a";
              let stroke = "#1e1e40";
              let strokeWidth = 0.4;

              if (disabled && isCorrectCountry) {
                // ALWAYS show correct country in bright green
                fill = "#22c55e";
                stroke = "#4ade80";
                strokeWidth = 2.5;
              }
              if (disabled && isClickedCountry && !wasCorrect) {
                // Wrong click in rose (correct is already green above)
                fill = "#ff2d7b";
                stroke = "#ff2d7b";
                strokeWidth = 2;
              }

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  onClick={() => !disabled && onCountryClick(code)}
                  style={{
                    default: {
                      fill,
                      stroke,
                      strokeWidth,
                      outline: "none",
                      cursor: disabled ? "default" : "pointer",
                      transition: "fill 0.3s, stroke 0.3s",
                    },
                    hover: {
                      fill: disabled ? fill : "#1f1f4a",
                      stroke: disabled ? stroke : "#00f0ff",
                      strokeWidth: disabled ? strokeWidth : 1.2,
                      outline: "none",
                      cursor: disabled ? "default" : "pointer",
                    },
                    pressed: {
                      fill: "#00f0ff",
                      stroke: "#00f0ff",
                      strokeWidth: 1.5,
                      outline: "none",
                    },
                  }}
                />
              );
            })
          }
        </Geographies>
      </ZoomableGroup>
    </ComposableMap>
  );
});

export default function TourDuMondeClient({ geoData }: Props) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [questionType, setQuestionType] = useState<QuestionType>("capital");
  const [questions, setQuestions] = useState<GeoEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [highlight, setHighlight] = useState<HighlightState>({ clickedCode: null, correctCode: null, wasCorrect: false });
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; correctCountry: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isAnswering, setIsAnswering] = useState(false);
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progress = useProgress();
  const heartsSystem = useHearts();
  const { correctFeedback, wrongFeedback } = useFeedback();

  const continents = useMemo(() => Array.from(new Set(geoData.map((g) => g.continent))), [geoData]);

  const startGame = useCallback((type: QuestionType, continent?: string) => {
    const pool = continent ? geoData.filter((g) => g.continent === continent) : [...geoData];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    setQuestions(pool.slice(0, 10));
    setQuestionType(type);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setHighlight({ clickedCode: null, correctCode: null, wasCorrect: false });
    setLastAnswer(null);
    setIsAnswering(false);
    setPhase("playing");
  }, [geoData]);

  const currentQ = questions[currentIndex];

  const questionText = useMemo(() => {
    if (!currentQ) return "";
    return questionType === "capital"
      ? `Où se trouve le pays dont la capitale est ${currentQ.capital} ?`
      : `Clique sur : ${currentQ.country}`;
  }, [currentQ, questionType]);

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
    setHighlight({ clickedCode: null, correctCode: null, wasCorrect: false });
    setLastAnswer(null);
    setPhase("playing");
  }, [currentIndex, questions.length, heartsSystem.canPlay]);

  const handleCountryClick = useCallback((clickedCode: string) => {
    if (phase !== "playing" || !currentQ || isAnswering) return;
    setIsAnswering(true);

    const isCorrect = clickedCode === currentQ.code;

    // Highlight both the clicked country AND the correct country
    setHighlight({
      clickedCode,
      correctCode: currentQ.code,
      wasCorrect: isCorrect,
    });
    setLastAnswer({ correct: isCorrect, correctCountry: currentQ.country });

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

    // Auto-advance only if correct
    if (isCorrect) {
      autoAdvanceRef.current = setTimeout(() => {
        handleNext();
      }, 1800);
    }
  }, [phase, currentQ, isAnswering, correctFeedback, wrongFeedback, heartsSystem, handleNext]);

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
      mode: questionType === "capital" ? "Capitales" : "Pays",
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
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-6xl mb-4"
          >
            🌍
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Tour du <span className="gradient-text">Monde</span>
          </h1>
          <p className="text-slate-500">Clique sur le bon pays sur la carte</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startGame("capital")}
            className="p-6 rounded-2xl border-2 border-neon-cyan/30 bg-neon-cyan/5 hover:bg-neon-cyan/10 transition-all text-center"
          >
            <div className="text-4xl mb-3">🏛️</div>
            <div className="text-neon-cyan font-bold text-lg mb-1">Capitales</div>
            <div className="text-slate-500 text-xs">Trouve le pays à partir de sa capitale</div>
          </motion.button>
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => startGame("country")}
            className="p-6 rounded-2xl border-2 border-neon-rose/30 bg-neon-rose/5 hover:bg-neon-rose/10 transition-all text-center"
          >
            <div className="text-4xl mb-3">🗺️</div>
            <div className="text-neon-rose font-bold text-lg mb-1">Pays</div>
            <div className="text-slate-500 text-xs">Localise le pays sur la carte</div>
          </motion.button>
        </div>

        <div className="mb-6">
          <p className="text-slate-600 text-xs font-medium uppercase tracking-wider mb-3">Par continent</p>
          <div className="flex flex-wrap gap-2">
            {continents.map((c) => (
              <button
                key={c}
                onClick={() => startGame("country", c)}
                className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-400 text-sm hover:border-neon-cyan/30 hover:text-white hover:bg-neon-cyan/5 transition-all"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <Link
          href="/dashboard"
          className="block text-center text-slate-600 text-sm hover:text-slate-400 transition-colors mt-8"
        >
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-lg mx-auto px-4 py-10 text-center"
      >
        <div className="text-6xl mb-4">
          {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "🌍" : "📚"}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">
          {accuracy >= 80 ? "Géographe Expert !" : accuracy >= 50 ? "Pas mal !" : "Continue d'explorer !"}
        </h2>
        <p className="text-slate-500 mb-6">{score} / {total} pays trouvés</p>

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
          <button
            onClick={() => { setXpRecorded(false); setPhase("menu"); }}
            className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-2xl hover:bg-white/8 transition-colors"
          >
            Menu
          </button>
          <button
            onClick={() => { setXpRecorded(false); startGame(questionType); }}
            className="flex-1 py-4 bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-2xl hover:brightness-110 transition-all"
          >
            Rejouer 🌍
          </button>
        </div>
      </motion.div>
    );
  }

  // ─── PLAYING / ANSWERED ───
  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="glass-card !rounded-lg px-2.5 py-1 flex items-center gap-1.5">
            <span className="text-slate-500 text-xs">Score</span>
            <span className="text-neon-cyan font-bold text-sm">{score}</span>
          </div>
          <div className="flex items-center gap-0.5">
            {Array.from({ length: heartsSystem.maxHearts }).map((_, i) => (
              <span key={i} className="text-xs">
                {i < heartsSystem.hearts ? (heartsSystem.premium ? "💛" : "❤️") : <span className="opacity-20">🖤</span>}
              </span>
            ))}
          </div>
          {streak > 0 && (
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1 flex items-center gap-1">
              <span className="text-orange-400 text-xs font-bold">{streak}x</span>
              <span className="text-xs">🔥</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-600 text-xs tabular-nums">{currentIndex + 1}/{questions.length}</span>
          <button
            onClick={() => setPhase("menu")}
            className="text-slate-600 hover:text-slate-300 text-xs px-2 py-1 rounded-lg hover:bg-white/5 transition-all"
          >
            Quitter
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-white/[0.06] rounded-full h-1 mb-3 overflow-hidden">
        <motion.div
          className="h-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose"
          animate={{ width: `${((currentIndex + (phase === "answered" ? 1 : 0)) / questions.length) * 100}%` }}
          transition={{ duration: 0.4 }}
          style={{ boxShadow: "0 0 10px rgba(0, 240, 255, 0.4)" }}
        />
      </div>

      {/* Question */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-strong !rounded-2xl px-4 py-3 mb-3 text-center"
      >
        <p className="text-white font-semibold text-base sm:text-lg">{questionText}</p>
      </motion.div>

      {/* Map — takes maximum space */}
      <div
        className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#08081a] mb-3"
        style={{ height: "clamp(250px, 55vh, 550px)" }}
      >
        {/* Glow effects when answered */}
        {phase === "answered" && (
          <div className="absolute inset-0 pointer-events-none z-10">
            {highlight.wasCorrect ? (
              <div className="absolute inset-0 border-2 border-green-400/30 rounded-2xl" style={{ boxShadow: "inset 0 0 40px rgba(0, 240, 255, 0.08)" }} />
            ) : (
              <div className="absolute inset-0 border-2 border-neon-rose/20 rounded-2xl" style={{ boxShadow: "inset 0 0 40px rgba(255, 45, 123, 0.06)" }} />
            )}
          </div>
        )}
        <WorldMap
          clickedCode={highlight.clickedCode}
          correctCode={highlight.correctCode}
          wasCorrect={highlight.wasCorrect}
          onCountryClick={handleCountryClick}
          disabled={phase === "answered"}
        />
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {phase === "answered" && lastAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {lastAnswer.correct ? (
              <>
                <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-3 mb-2 text-center">
                  <p className="text-green-400 font-semibold">
                    ✓ Bravo ! C&apos;est bien {lastAnswer.correctCountry}
                    {streak > 1 && ` 🔥 x${streak}`}
                  </p>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 1.8, ease: "linear" }}
                    className="h-1 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose"
                    style={{ boxShadow: "0 0 8px rgba(0, 240, 255, 0.4)" }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="bg-neon-rose/5 border border-neon-rose/20 rounded-2xl p-3 mb-2 text-center">
                  <p className="text-neon-rose font-semibold">✗ Raté !</p>
                  <p className="text-slate-500 text-sm mt-1">
                    La bonne réponse : <span className="text-green-400 font-semibold">{lastAnswer.correctCountry}</span>
                    <span className="text-slate-600 text-xs ml-1">(en vert sur la carte)</span>
                  </p>
                </div>
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => { handleNext(); setIsAnswering(false); }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold text-base hover:brightness-110 transition-all"
                  style={{ boxShadow: "0 0 20px rgba(0, 240, 255, 0.2)" }}
                >
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
