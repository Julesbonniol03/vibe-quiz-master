"use client";

import { motion } from "framer-motion";

interface VisualItem {
  description: string;
  color: string;
  name?: string;
  look?: string;
}

interface Visuals {
  avatar: VisualItem;
  carteVibe: VisualItem;
  meme: VisualItem;
}

interface Brief {
  contextCheck: string;
  topoNoCap: string;
  cheatCodes: string[];
  visuals?: Visuals;
}

interface LessonNarrativeProps {
  title: string;
  description: string;
  screenshot: string;
  lienModerne: string;
  day: number;
  brief?: Brief;
  onStart: () => void;
}

export default function LessonNarrative({ title, description, screenshot, lienModerne, day, brief, onStart }: LessonNarrativeProps) {
  const hasVisuals = brief?.visuals;
  const baseDelay = 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glass-card-strong !rounded-3xl p-8 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-cyan/[0.06] rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-rose/[0.04] rounded-full blur-[60px]" />

        <div className="relative z-10">
          {/* Day badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: baseDelay }}
            className="inline-flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-full px-4 py-1.5 mb-6"
          >
            <span className="text-neon-cyan font-bold text-sm">JOUR {day}</span>
            <span className="text-slate-500 text-sm">/30</span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: baseDelay + 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight"
          >
            {title}
          </motion.h1>

          {/* Brief sections */}
          {brief ? (
            <>
              {/* Context-Check */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: baseDelay + 0.15 }}
                className="bg-gradient-to-r from-purple-500/[0.08] to-neon-rose/[0.05] border border-purple-500/20 rounded-2xl p-5 mb-5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">📍</span>
                  <div>
                    <p className="text-purple-400 font-semibold text-sm uppercase tracking-wider mb-2">Context-Check</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{brief.contextCheck}</p>
                  </div>
                </div>
              </motion.div>

              {/* Avatar de l'Epoque */}
              {hasVisuals && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: baseDelay + 0.25 }}
                  className="rounded-2xl p-5 mb-5 border"
                  style={{
                    background: `linear-gradient(135deg, ${brief.visuals!.avatar.color}12, transparent)`,
                    borderColor: `${brief.visuals!.avatar.color}30`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🎭</span>
                    <div>
                      <p className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: brief.visuals!.avatar.color }}>
                        Avatar de l&apos;Epoque : {brief.visuals!.avatar.name}
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed italic">{brief.visuals!.avatar.look || brief.visuals!.avatar.description}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Topo No-Cap */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: baseDelay + 0.35 }}
                className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🎤</span>
                  <div>
                    <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider mb-2">Le Topo No-Cap</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{brief.topoNoCap}</p>
                  </div>
                </div>
              </motion.div>

              {/* Carte Mentale Vibe */}
              {hasVisuals && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: baseDelay + 0.45 }}
                  className="rounded-2xl p-5 mb-5 border"
                  style={{
                    background: `linear-gradient(135deg, ${brief.visuals!.carteVibe.color}10, ${brief.visuals!.carteVibe.color}05)`,
                    borderColor: `${brief.visuals!.carteVibe.color}25`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🗺️</span>
                    <div>
                      <p className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: brief.visuals!.carteVibe.color }}>
                        Carte Mentale Vibe
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed">{brief.visuals!.carteVibe.description}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cheat Codes */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: baseDelay + 0.55 }}
                className="bg-gradient-to-r from-neon-cyan/[0.06] to-green-500/[0.04] border border-neon-cyan/20 rounded-2xl p-5 mb-5"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">🎮</span>
                  <div>
                    <p className="text-neon-cyan font-semibold text-sm uppercase tracking-wider mb-3">Cheat Codes Visuels</p>
                    <div className="space-y-3">
                      {brief.cheatCodes.map((code, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-neon-cyan font-bold text-xs mt-0.5 bg-neon-cyan/10 rounded-md px-1.5 py-0.5 flex-shrink-0">
                            #{idx + 1}
                          </span>
                          <p className="text-slate-300 text-sm leading-relaxed">{code}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Meme Historique */}
              {hasVisuals && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: baseDelay + 0.65 }}
                  className="rounded-2xl p-5 mb-5 border"
                  style={{
                    background: `linear-gradient(135deg, ${brief.visuals!.meme.color}10, transparent)`,
                    borderColor: `${brief.visuals!.meme.color}30`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">😂</span>
                    <div>
                      <p className="font-semibold text-sm uppercase tracking-wider mb-2" style={{ color: brief.visuals!.meme.color }}>
                        Meme Historique
                      </p>
                      <div className="bg-black/30 rounded-xl p-4 border border-white/[0.06]">
                        <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{brief.visuals!.meme.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          ) : (
            /* Fallback: original simple layout */
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-slate-400 mb-8"
            >
              {description}
            </motion.p>
          )}

          {/* Screenshot Mental */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasVisuals ? baseDelay + 0.75 : brief ? baseDelay + 0.55 : baseDelay + 0.3 }}
            className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-5"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🧠</span>
              <div>
                <p className="text-neon-cyan font-semibold text-sm uppercase tracking-wider mb-1">Screenshot Mental</p>
                <p className="text-slate-300 text-sm leading-relaxed">{screenshot}</p>
              </div>
            </div>
          </motion.div>

          {/* Lien Moderne */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasVisuals ? baseDelay + 0.8 : brief ? baseDelay + 0.6 : baseDelay + 0.4 }}
            className="bg-white/[0.03] border border-neon-rose/10 rounded-2xl p-5 mb-8"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">🔗</span>
              <div>
                <p className="text-neon-rose font-semibold text-sm uppercase tracking-wider mb-1">Lien Moderne</p>
                <p className="text-slate-300 text-sm leading-relaxed">{lienModerne}</p>
              </div>
            </div>
          </motion.div>

          {/* Start Quiz Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: hasVisuals ? baseDelay + 0.9 : brief ? baseDelay + 0.7 : baseDelay + 0.5 }}
            onClick={onStart}
            className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-cyan/80 text-cyber-950 font-bold text-lg rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-neon-cyan/20"
          >
            Lancer le Quiz du Jour
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
