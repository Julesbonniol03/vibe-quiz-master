"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ─── */
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface AdventureLevel {
  id: number;
  title: string;
  emoji: string;
  contextCheck: string;
  topoNoCap: string;
  cheatCodes: string;
  isBoss: boolean;
  quiz: QuizQuestion[];
}

/* ─── Sound Design (Web Audio API) ─── */
let audioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (audioCtx && audioCtx.state !== "closed") return audioCtx;
  try {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  } catch { /* no audio support */ }
  return audioCtx;
}

function playPop() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

function playDing() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

function playBuzz() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(150, ctx.currentTime);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

/* ─── Progress ─── */
const STORAGE_KEY = "vqm_adventure_progress";

function getProgress(): Record<number, { completed: boolean; score: number }> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveProgress(levelId: number, score: number) {
  const p = getProgress();
  p[levelId] = { completed: true, score };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

/* ─── S-Curve offset cycle: 0 → +50 → 0 → -50 → repeat ─── */
function getSOffset(i: number): number {
  const c = i % 4;
  return c === 1 ? 50 : c === 3 ? -50 : 0;
}

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */
export default function AdventureMap({ levels }: { levels: AdventureLevel[] }) {
  const [level, setLevel] = useState<AdventureLevel | null>(null);
  const [phase, setPhase] = useState<"map" | "brief" | "quiz" | "results">("map");
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [progress, setProgress] = useState<Record<number, { completed: boolean; score: number }>>({});
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setProgress(getProgress()); }, []);

  const isUnlocked = useCallback((idx: number) => idx === 0 || !!progress[levels[idx - 1]?.id]?.completed, [progress, levels]);

  const openLevel = (l: AdventureLevel) => {
    playPop();
    setLevel(l);
    setPhase("brief");
    setQIdx(0);
    setScore(0);
    setPicked(null);
    setAnswered(false);
  };

  const pickAnswer = (idx: number) => {
    if (answered || !level) return;
    playPop();
    setPicked(idx);
    setAnswered(true);
    const correct = level.quiz[qIdx].options[idx] === level.quiz[qIdx].answer;
    if (correct) {
      playDing();
      setScore((s: number) => s + 1);
    } else {
      playBuzz();
    }
  };

  const nextQ = () => {
    if (!level) return;
    if (qIdx + 1 < level.quiz.length) {
      setQIdx((q: number) => q + 1);
      setPicked(null);
      setAnswered(false);
    } else {
      // Boss requires 12/15 to pass; normal requires 3/5
      const required = level.isBoss ? 12 : 3;
      const passed = score >= required;
      if (passed) {
        saveProgress(level.id, score);
        setProgress(getProgress());
      }
      setPhase("results");
    }
  };

  const backToMap = () => {
    setPhase("map");
    setLevel(null);
  };

  /* ═══════════════════════════════════
     MAP VIEW — S-CURVE ZIGZAG
     ═══════════════════════════════════ */
  if (phase === "map") {
    const completedCount = Object.values(progress).filter((p) => p.completed).length;
    return (
      <div className="min-h-screen pb-28">
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-cyber-950/90 backdrop-blur-xl border-b border-purple-500/10 px-4 py-4"
             style={{ boxShadow: "0 4px 20px rgba(168,85,247,0.08)" }}>
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🗺️</span>
              <div>
                <h1 className="text-lg font-black text-white uppercase tracking-widest"
                    style={{ textShadow: "0 0 12px rgba(168,85,247,0.6), 0 0 24px rgba(168,85,247,0.25)" }}>
                  AVENTURE
                </h1>
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">
                  {completedCount}/{levels.length} niveaux
                </p>
              </div>
            </div>
            <div className="w-24 bg-white/[0.06] rounded-full h-2.5 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-neon-cyan transition-all duration-700"
                   style={{ width: `${(completedCount / levels.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* S-Curve Map */}
        <div ref={mapRef} className="max-w-md mx-auto px-6 pt-10 pb-12 relative">
          {/* Dotted SVG path connector */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            {levels.map((_, i) => {
              if (i >= levels.length - 1) return null;
              const y1 = 40 + i * (levels[i].isBoss ? 120 : 80);
              const y2 = 40 + (i + 1) * (levels[i + 1]?.isBoss ? 120 : 80);
              const x1 = 50 + getSOffset(i);
              const x2 = 50 + getSOffset(i + 1);
              return (
                <line key={i}
                  x1={`${x1}%`} y1={y1} x2={`${x2}%`} y2={y2}
                  stroke="rgba(168,85,247,0.12)" strokeWidth="2" strokeDasharray="6 6"
                />
              );
            })}
          </svg>

          {/* Level Nodes */}
          <div className="relative" style={{ zIndex: 1 }}>
            {levels.map((lv, i) => {
              const done = !!progress[lv.id]?.completed;
              const locked = !isUnlocked(i);
              const boss = lv.isBoss;
              const offset = getSOffset(i);
              const lvScore = progress[lv.id]?.score ?? 0;
              const size = boss ? 80 : 56;

              return (
                <div key={lv.id} className="flex items-center" style={{ marginBottom: boss ? 32 : 20, justifyContent: "center" }}>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.08, 0.6), type: "spring", bounce: 0.4 }}
                    onClick={() => !locked && openLevel(lv)}
                    disabled={locked}
                    style={{ marginLeft: offset, width: size, height: size }}
                    className={`relative rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                      ${locked
                        ? "bg-white/[0.02] border-2 border-white/[0.06] cursor-not-allowed"
                        : done
                          ? "bg-green-500/10 border-2 border-green-500/30 cursor-pointer hover:scale-110 active:scale-95"
                          : boss
                            ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-[3px] border-yellow-500/50 cursor-pointer hover:scale-110 active:scale-95"
                            : "bg-gradient-to-br from-purple-500/15 to-neon-cyan/15 border-2 border-purple-500/30 cursor-pointer hover:scale-110 active:scale-95"
                      }`}
                    whileHover={!locked ? { scale: 1.12 } : undefined}
                    whileTap={!locked ? { scale: 0.92 } : undefined}
                  >
                    {/* Boss animated golden ring */}
                    {boss && !locked && (
                      <div className="absolute inset-[-4px] rounded-full animate-glow-border opacity-70"
                           style={{ boxShadow: "0 0 20px rgba(234,179,8,0.3), 0 0 40px rgba(234,179,8,0.1)" }} />
                    )}

                    {/* Completed glow */}
                    {done && (
                      <div className="absolute inset-0 rounded-full"
                           style={{ boxShadow: "0 0 12px rgba(74,222,128,0.25)" }} />
                    )}

                    {/* Emoji / Lock */}
                    <span className={`relative ${boss ? "text-3xl" : "text-xl"}`}
                          style={locked ? { filter: "grayscale(1)", opacity: 0.3 } : undefined}>
                      {locked ? "🔒" : lv.emoji}
                    </span>

                    {/* Score dots */}
                    {done && (
                      <div className="absolute -bottom-2 flex gap-0.5">
                        {Array.from({ length: boss ? 5 : 5 }).map((_, j) => {
                          const maxDisplay = boss ? Math.min(Math.round((lvScore / 15) * 5), 5) : lvScore;
                          return <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < maxDisplay ? "bg-green-400" : "bg-white/10"}`} />;
                        })}
                      </div>
                    )}

                    {/* Level number badge */}
                    {!locked && !done && (
                      <div className={`absolute -top-1 -right-1 rounded-full flex items-center justify-center text-[9px] font-black
                        ${boss ? "w-6 h-6 bg-yellow-500 text-black" : "w-5 h-5 bg-purple-500 text-white"}`}>
                        {lv.id}
                      </div>
                    )}
                  </motion.button>

                  {/* Label next to node */}
                  <div className={`ml-4 max-w-[180px] ${locked ? "opacity-30" : ""}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-wider
                      ${locked ? "text-slate-700" : boss ? "text-yellow-400" : done ? "text-green-400/80" : "text-purple-400/80"}`}>
                      {boss ? `BOSS` : `Niv. ${lv.id}`}
                    </p>
                    <p className={`text-xs font-semibold leading-tight
                      ${locked ? "text-slate-700" : done ? "text-slate-500" : "text-slate-300"}`}>
                      {lv.title}
                    </p>
                    {boss && !locked && !done && (
                      <p className="text-[9px] text-yellow-400/50 mt-0.5">15 questions · 12/15 requis</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coming soon */}
          {levels.length < 30 && (
            <div className="mt-8 p-5 rounded-2xl border border-dashed border-white/[0.08] text-center">
              <p className="text-slate-600 text-sm">Niveaux 6-30 bientôt disponibles...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════
     BRIEF VIEW — 3 Sections
     ═══════════════════════════════════ */
  if (phase === "brief" && level) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <button onClick={backToMap} className="text-slate-600 hover:text-slate-400 transition-colors text-sm">&larr; Retour à la carte</button>

          {/* Hero */}
          <div className={`rounded-3xl overflow-hidden border ${level.isBoss ? "border-yellow-500/30" : "border-white/[0.08]"}`}>
            <div className={`relative h-36 flex items-center justify-center
              ${level.isBoss ? "bg-gradient-to-br from-yellow-900/50 to-orange-900/30" : "bg-gradient-to-br from-purple-900/40 to-neon-cyan/20"}`}>
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-950 to-transparent" />
              <span className="relative text-6xl">{level.emoji}</span>
              {level.isBoss && (
                <div className="absolute top-3 right-3 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                     style={{ boxShadow: "0 0 10px rgba(234,179,8,0.2)" }}>
                  BOSS
                </div>
              )}
            </div>

            <div className="p-5 bg-white/[0.02] space-y-5">
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-full
                  ${level.isBoss ? "text-yellow-400 bg-yellow-500/10 border border-yellow-500/20" : "text-purple-400 bg-purple-500/10 border border-purple-500/20"}`}>
                  Niveau {level.id} {level.isBoss ? `· ${level.quiz.length} questions · 12/${level.quiz.length} requis` : `· ${level.quiz.length} questions`}
                </span>
                <h2 className="text-xl font-bold text-white mt-3">{level.title}</h2>
              </div>

              {/* 📍 Context-Check */}
              <div className="p-4 rounded-xl bg-purple-500/[0.05] border border-purple-500/15">
                <p className="text-xs font-black uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-1.5">
                  <span>📍</span> Context-Check
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">{level.contextCheck}</p>
              </div>

              {/* 🎤 Topo No-Cap */}
              <div className="p-4 rounded-xl bg-neon-cyan/[0.03] border border-neon-cyan/15">
                <p className="text-xs font-black uppercase tracking-wider text-neon-cyan mb-2 flex items-center gap-1.5">
                  <span>🎤</span> Topo No-Cap
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">{level.topoNoCap}</p>
              </div>

              {/* 🎮 Cheat Codes */}
              <div className="p-4 rounded-xl bg-neon-rose/[0.03] border border-neon-rose/15">
                <p className="text-xs font-black uppercase tracking-wider text-neon-rose mb-2 flex items-center gap-1.5">
                  <span>🎮</span> Cheat Codes
                </p>
                <div className="space-y-1.5">
                  {level.cheatCodes.split(" • ").map((code: string, j: number) => (
                    <p key={j} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-neon-rose/60 mt-0.5">▸</span>
                      <span>{code}</span>
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => { playPop(); setPhase("quiz"); }}
            className={`w-full py-4 font-black rounded-2xl text-lg transition-all
              ${level.isBoss
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/20"
                : "bg-gradient-to-r from-purple-500 to-neon-cyan text-white shadow-lg shadow-purple-500/20"}`}
          >
            {level.isBoss ? "Affronter le Boss ⚔️" : "Lancer le Quiz →"}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════
     QUIZ VIEW
     ═══════════════════════════════════ */
  if (phase === "quiz" && level) {
    const q = level.quiz[qIdx];
    const correctIdx = q.options.indexOf(q.answer);
    const isCorrect = picked !== null && q.options[picked] === q.answer;

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <motion.div key={qIdx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-600 font-mono font-bold">{qIdx + 1}/{level.quiz.length}</span>
            <div className="flex-1 bg-white/[0.06] rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${level.isBoss ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-purple-500 to-neon-cyan"}`}
                initial={{ width: `${(qIdx / level.quiz.length) * 100}%` }}
                animate={{ width: `${((qIdx + 1) / level.quiz.length) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-bold ${level.isBoss ? "text-yellow-400" : "text-purple-400"}`}>{score} pts</span>
          </div>

          {level.isBoss && (
            <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400/50">
              BOSS FIGHT — 12/{level.quiz.length} requis
            </div>
          )}

          {/* Question */}
          <div className="glass-card !rounded-2xl p-5">
            <h3 className="text-base font-bold text-white leading-relaxed">{q.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt: string, idx: number) => {
              let style = "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.15]";
              if (answered) {
                if (idx === correctIdx) style = "border-green-500/40 bg-green-500/[0.08] ring-1 ring-green-500/20";
                else if (idx === picked && !isCorrect) style = "border-red-500/40 bg-red-500/[0.08] ring-1 ring-red-500/20 animate-shake";
                else style = "border-white/[0.04] bg-white/[0.01] opacity-40";
              }

              return (
                <motion.button
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  onClick={() => pickAnswer(idx)}
                  disabled={answered}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${style}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold
                      ${answered && idx === correctIdx ? "bg-green-500/20 text-green-400"
                        : answered && idx === picked && !isCorrect ? "bg-red-500/20 text-red-400"
                        : "bg-white/[0.06] text-slate-500"}`}>
                      {answered && idx === correctIdx ? "✓" : answered && idx === picked && !isCorrect ? "✗" : String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`font-medium text-sm
                      ${answered && idx === correctIdx ? "text-green-400" : answered && idx === picked && !isCorrect ? "text-red-400" : "text-slate-300"}`}>
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
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
                <div className={`p-3 rounded-xl border ${isCorrect ? "bg-green-500/[0.05] border-green-500/20" : "bg-red-500/[0.05] border-red-500/20"}`}>
                  <p className={`font-bold text-sm ${isCorrect ? "text-green-400" : "text-red-400"}`}>
                    {isCorrect ? "Banger ! 🔥" : `Raté — Réponse : ${q.answer}`}
                  </p>
                </div>
                <button
                  onClick={nextQ}
                  className={`w-full py-3 font-bold rounded-xl transition-all
                    ${level.isBoss ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black" : "bg-gradient-to-r from-purple-500 to-neon-cyan text-white"}`}
                >
                  {qIdx + 1 < level.quiz.length ? "Suivante →" : "Résultats"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  /* ═══════════════════════════════════
     RESULTS VIEW
     ═══════════════════════════════════ */
  if (phase === "results" && level) {
    const required = level.isBoss ? 12 : 3;
    const passed = score >= required;
    const perfect = score === level.quiz.length;

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 pb-28">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
          <div className="glass-card !rounded-3xl p-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="text-6xl mb-4"
            >
              {perfect ? "🏆" : passed ? "🔥" : "💀"}
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {perfect ? "Sans faute !" : passed ? (level.isBoss ? "Boss vaincu !" : "Niveau réussi !") : (level.isBoss ? "Boss trop fort..." : "Raté...")}
            </h2>
            {level.isBoss && (
              <p className={`text-sm font-bold mb-2 ${passed ? "text-yellow-400" : "text-red-400"}`}>
                {passed ? `Boss Niv.${level.id} terrassé` : `${required}/${level.quiz.length} requis pour passer`}
              </p>
            )}
            <p className="text-slate-500 mb-4">Niv. {level.id} — {level.title}</p>

            <div className="flex items-center justify-center gap-1.5 mb-4 flex-wrap">
              {Array.from({ length: Math.min(level.quiz.length, 15) }).map((_, j) => (
                <motion.div
                  key={j}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + j * 0.05 }}
                  className={`w-3 h-3 rounded-full ${j < score ? "bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.5)]" : "bg-white/10"}`}
                />
              ))}
            </div>

            <div className={`text-4xl font-black mb-1 ${perfect ? "text-yellow-400" : passed ? "text-green-400" : "text-red-400"}`}>
              {score}/{level.quiz.length}
            </div>
            <p className="text-slate-600 text-sm">
              {perfect ? "T'es un vrai OG de l'histoire" : passed ? "Niveau débloqué, on continue" : "Relis les Cheat Codes et retente"}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => openLevel(level)}
              className="flex-1 py-3 bg-white/[0.04] border border-white/[0.08] text-white font-semibold rounded-xl hover:bg-white/[0.07] transition-all"
            >
              Rejouer
            </button>
            <button
              onClick={backToMap}
              className={`flex-1 py-3 font-bold rounded-xl transition-all
                ${level.isBoss ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-black" : "bg-gradient-to-r from-purple-500 to-neon-cyan text-white"}`}
            >
              {passed ? "Continuer →" : "Retour"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
