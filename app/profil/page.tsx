"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useProgress, getLevel, GameHistoryEntry } from "@/hooks/useProgress";
import { useAchievements, ACHIEVEMENTS } from "@/hooks/useAchievements";
import { useProfile } from "@/hooks/useProfile";
import { getAvatarById } from "@/components/OnboardingModal";
import { categoryColors } from "@/lib/questions";

// ─── RANK SYSTEM ───
const RANKS = [
  { name: "Novice", icon: "🌱", minXp: 0, color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  { name: "Apprenti", icon: "📘", minXp: 200, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
  { name: "Initié", icon: "🔷", minXp: 600, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { name: "Érudit", icon: "🎓", minXp: 1500, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  { name: "Sage", icon: "🧙", minXp: 3500, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { name: "Maître", icon: "👑", minXp: 7000, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  { name: "Oracle", icon: "🔮", minXp: 15000, color: "text-neon-cyan", bg: "bg-neon-cyan/10", border: "border-neon-cyan/20" },
  { name: "Légende", icon: "⚡", minXp: 30000, color: "text-neon-rose", bg: "bg-neon-rose/10", border: "border-neon-rose/20" },
];

function getRank(xp: number) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r;
    else break;
  }
  const nextRank = RANKS[RANKS.indexOf(rank) + 1] || null;
  const progressToNext = nextRank
    ? Math.round(((xp - rank.minXp) / (nextRank.minXp - rank.minXp)) * 100)
    : 100;
  return { ...rank, nextRank, progressToNext };
}

// ─── SVG RADAR CHART (5 axes) ───
const RADAR_CATEGORIES = [
  { key: "Histoire", label: "Histoire", icon: "🏛️" },
  { key: "Maîtrise du Français", label: "Français", icon: "📝" },
  { key: "Actualités 2025-2026", label: "Actu", icon: "📰" },
  { key: "Sciences", label: "Sciences", icon: "🔬" },
  { key: "Pop Culture", label: "Pop Culture", icon: "🎬" },
] as const;

function RadarChart({ stats }: { stats: Record<string, { played: number; correct: number }> }) {
  const cx = 150, cy = 150, r = 105;
  const n = RADAR_CATEGORIES.length;
  const angleStep = (2 * Math.PI) / n;

  const values = RADAR_CATEGORIES.map(({ key }) => {
    const s = stats[key];
    if (!s || s.played === 0) return 0;
    return s.correct / s.played;
  });

  const pointAt = (val: number, i: number) => {
    const angle = angleStep * i - Math.PI / 2;
    return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle) };
  };

  const dataPoints = values.map((v, i) => pointAt(v, i));
  const polygonStr = dataPoints.map((p) => `${p.x},${p.y}`).join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[300px] mx-auto">
      {/* Grid pentagons */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const p = pointAt(level, i);
            return `${p.x},${p.y}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {RADAR_CATEGORIES.map((_, i) => {
        const p = pointAt(1, i);
        return (
          <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y}
            stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        points={polygonStr}
        fill="url(#radarGradient)"
        stroke="url(#radarStroke)"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Data points with glow */}
      {dataPoints.map((p, i) => (
        <motion.circle
          key={i}
          initial={{ r: 0 }}
          animate={{ r: values[i] > 0 ? 5 : 0 }}
          transition={{ delay: 0.6 + i * 0.08 }}
          cx={p.x} cy={p.y}
          fill="#00f0ff"
          filter="url(#glow)"
        />
      ))}

      {/* Labels */}
      {RADAR_CATEGORIES.map((cat, i) => {
        const lp = pointAt(1.28, i);
        const pct = values[i] > 0 ? Math.round(values[i] * 100) : 0;
        return (
          <g key={cat.key}>
            <text x={lp.x} y={lp.y - 6} textAnchor="middle" dominantBaseline="central"
              className="text-[10px] font-semibold" fill={pct > 0 ? "#e2e8f0" : "#475569"}>
              {cat.icon} {cat.label}
            </text>
            {pct > 0 && (
              <text x={lp.x} y={lp.y + 8} textAnchor="middle" className="text-[9px]" fill="#64748b">
                {pct}%
              </text>
            )}
          </g>
        );
      })}

      <defs>
        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(0,240,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,45,123,0.18)" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#ff2d7b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ─── FORMAT HELPERS ───
function formatTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m${String(s).padStart(2, "0")}s`;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const DIFF_LABELS: Record<string, string> = { easy: "Débutant", medium: "Inter.", hard: "Expert" };
const MODE_LABELS: Record<string, string> = { classique: "Classique", blitz: "Blitz", "mort-subite": "Mort Subite", daily: "Défi" };

// ─── MAIN PAGE ───
export default function ProfilPage() {
  const progress = useProgress();
  const { profile, hydrated: profileHydrated } = useProfile();
  const { unlocked, isUnlocked } = useAchievements();

  if (!progress.hydrated || !profileHydrated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6 animate-pulse">👤</div>
        <p className="text-slate-500 text-lg">Chargement du profil...</p>
      </div>
    );
  }

  const rank = getRank(progress.xp);
  const levelInfo = getLevel(progress.xp);
  const totalTimeStr = formatTime(progress.speedRecord.totalTime);
  const avatar = profile ? getAvatarById(profile.avatarId) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ── HERO CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card-strong p-8 mb-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-cyan/[0.04] rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-neon-rose/[0.04] rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar with XP ring */}
          <div className="flex flex-col items-center gap-2">
            {avatar && profile ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                className="relative"
              >
                <div className={`w-22 h-22 rounded-3xl ${avatar.bg} border-2 ${avatar.border} flex items-center justify-center shadow-xl`}
                  style={{ width: 88, height: 88 }}>
                  <avatar.Icon size={42} style={{ color: avatar.color }} strokeWidth={2} />
                </div>
                {/* Level badge */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-rose flex items-center justify-center text-xs font-black text-white shadow-lg shadow-neon-cyan/30">
                  {levelInfo.level}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                className={`w-20 h-20 rounded-3xl ${rank.bg} border-2 ${rank.border} flex items-center justify-center text-4xl shadow-xl`}
              >
                {rank.icon}
              </motion.div>
            )}
            {/* XP bar under avatar */}
            <div className="w-24 bg-white/[0.06] rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
                className="h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose animate-pulse-glow"
              />
            </div>
            <span className="text-slate-600 text-[10px] tabular-nums">
              {levelInfo.currentXp}/{levelInfo.xpForNext} XP
            </span>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-white mb-0.5">
              {profile?.pseudo || "Joueur"}
            </h1>
            <p className={`text-sm font-semibold ${levelInfo.titleColor} mb-1`}>
              {levelInfo.title}
            </p>
            <p className="text-slate-600 text-xs mb-2">
              {rank.icon} {rank.name} &middot; Niv. {levelInfo.level} &middot; {progress.xp.toLocaleString()} XP
            </p>
            {rank.nextRank && (
              <div>
                <div className="flex items-center gap-2 text-xs mb-1">
                  <span className="text-slate-500">Prochain rang :</span>
                  <span className={rank.nextRank.color}>{rank.nextRank.icon} {rank.nextRank.name}</span>
                </div>
                <div className="w-full max-w-xs bg-white/[0.06] rounded-full h-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${rank.progressToNext}%` }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    className="h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose"
                    style={{ boxShadow: "0 0 8px rgba(0, 240, 255, 0.4)" }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* XP Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-card !rounded-2xl px-5 py-3 text-center"
          >
            <p className="text-xl font-bold gradient-text">{progress.xp.toLocaleString()}</p>
            <p className="text-slate-600 text-[10px]">XP totale</p>
          </motion.div>
        </div>
      </motion.div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: "📝", label: "Questions", value: progress.totalPlayed.toLocaleString(), color: "text-neon-cyan", glow: "neon-cyan" },
          { icon: "🎯", label: "Précision", value: `${progress.accuracy}%`, color: progress.accuracy >= 70 ? "text-green-400" : "text-amber-400", glow: progress.accuracy >= 70 ? "green-500" : "amber-500" },
          { icon: "🔥", label: "Meilleur Streak", value: `${progress.globalBestStreak}x`, color: "text-neon-rose", glow: "neon-rose" },
          { icon: "⏱️", label: "Temps de jeu", value: totalTimeStr, color: "text-purple-400", glow: "purple-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-center group hover:border-${stat.glow}/30 transition-all`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-${stat.glow}/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
            <div className="relative">
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color} tabular-nums mb-1`}>{stat.value}</div>
              <div className="text-slate-600 text-xs">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── ACHIEVEMENTS GALLERY ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card !rounded-2xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
          <span>🏅</span> Succès
          <span className="ml-auto text-slate-600 text-xs font-normal">{unlocked.length}/{ACHIEVEMENTS.length}</span>
        </h2>
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mb-5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400"
            style={{ boxShadow: "0 0 8px rgba(245, 158, 11, 0.4)" }}
          />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((badge, i) => {
            const achieved = isUnlocked(badge.id);
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                className={`relative p-3 rounded-xl border text-center transition-all ${
                  achieved
                    ? "bg-white/[0.03] border-white/[0.1]"
                    : "bg-white/[0.01] border-white/[0.04] opacity-40"
                }`}
                style={achieved ? {
                  boxShadow: `0 0 15px ${badge.glowColor.replace("0.5", "0.15")}, 0 0 30px ${badge.glowColor.replace("0.5", "0.06")}`,
                } : undefined}
              >
                <div className={`text-2xl mb-1.5 ${achieved ? "" : "grayscale"}`}>
                  {badge.icon}
                </div>
                <div className={`text-[11px] font-bold leading-tight mb-0.5 ${achieved ? badge.color : "text-slate-700"}`}>
                  {badge.name}
                </div>
                <div className="text-[9px] text-slate-600 leading-tight">
                  {badge.desc}
                </div>
                {achieved && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-black"
                    style={{ backgroundColor: badge.glowColor.replace("0.5", "1").replace("rgba", "rgb").replace(",0.5)", ")").replace("rgba(", "rgb(") }}
                  >
                    &#10003;
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* ── RADAR CHART ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card !rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📊</span> Forces par thème
          </h2>
          {Object.keys(progress.categoryStats).length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-50">📊</div>
              <p className="text-slate-500 text-sm">Jouez quelques quiz pour voir vos forces !</p>
              <Link href="/quiz" className="inline-block mt-3 text-neon-cyan text-sm hover:underline">
                Jouer maintenant →
              </Link>
            </div>
          ) : (
            <RadarChart stats={progress.categoryStats} />
          )}
        </motion.div>

        {/* ── GAME HISTORY ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card !rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📜</span> Dernières parties
          </h2>
          {progress.gameHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-50">🎮</div>
              <p className="text-slate-500 text-sm">Aucune partie jouée pour le moment</p>
              <Link href="/quiz" className="inline-block mt-3 text-neon-cyan text-sm hover:underline">
                Lancer un quiz →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {progress.gameHistory.slice(0, 5).map((game, i) => (
                <GameRow key={`${game.date}-${i}`} game={game} index={i} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── RANK LADDER ── */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card !rounded-2xl p-6 mb-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🏅</span> Rangs
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {RANKS.map((r) => {
            const achieved = progress.xp >= r.minXp;
            const isCurrent = r.name === rank.name;
            return (
              <div
                key={r.name}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isCurrent
                    ? `${r.bg} ${r.border} shadow-lg`
                    : achieved
                    ? "bg-white/[0.02] border-white/[0.08] opacity-80"
                    : "bg-white/[0.01] border-white/[0.04] opacity-40"
                }`}
              >
                <div className={`text-2xl mb-1 ${achieved ? "" : "grayscale"}`}>{r.icon}</div>
                <div className={`text-xs font-bold ${achieved ? r.color : "text-slate-600"}`}>{r.name}</div>
                <div className="text-slate-600 text-[10px] mt-0.5">{r.minXp.toLocaleString()} XP</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ── CATEGORY RANKING ── */}
      {Object.keys(progress.categoryStats).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card !rounded-2xl p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>🏆</span> Classement par catégorie
          </h2>
          <div className="space-y-2">
            {Object.entries(progress.categoryStats)
              .filter(([, s]) => s.played >= 1)
              .map(([cat, s]) => ({ cat, accuracy: Math.round((s.correct / s.played) * 100), played: s.played }))
              .sort((a, b) => b.accuracy - a.accuracy)
              .map((item, i) => {
                const colors = categoryColors[item.cat] || { icon: "❓", text: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30" };
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <motion.div
                    key={item.cat}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.04 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="text-lg w-6 text-center">{medals[i] || `${i + 1}.`}</span>
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center text-sm flex-shrink-0`}>
                      {colors.icon}
                    </div>
                    <span className={`font-medium flex-1 text-sm ${colors.text}`}>{item.cat}</span>
                    <span className="text-slate-600 text-xs">{item.played}q</span>
                    <span className={`font-bold text-sm tabular-nums ${
                      item.accuracy >= 80 ? "text-green-400" : item.accuracy >= 60 ? "text-amber-400" : "text-neon-rose"
                    }`}>
                      {item.accuracy}%
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mb-10">
        <Link href="/quiz" className="flex-1 py-3 text-center bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-neon-cyan/15">
          Jouer un quiz →
        </Link>
        <Link href="/reviser" className="flex-1 py-3 text-center bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/8 transition-colors">
          📖 Réviser
        </Link>
      </div>

      {/* Reset Section */}
      <ResetSection onReset={progress.resetAll} />
    </div>
  );
}

// ─── GAME HISTORY ROW ───
function GameRow({ game, index }: { game: GameHistoryEntry; index: number }) {
  const accuracy = game.total > 0 ? Math.round((game.score / game.total) * 100) : 0;
  const catLabel = game.category === "All" ? "Tout" : game.category;
  const colors = game.category !== "All" ? categoryColors[game.category] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.35 + index * 0.06 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
    >
      <div className="text-center flex-shrink-0 w-10">
        <div className="text-slate-600 text-[10px]">{formatDate(game.date)}</div>
        <div className={`text-lg font-bold tabular-nums ${
          accuracy >= 80 ? "text-green-400" : accuracy >= 50 ? "text-amber-400" : "text-neon-rose"
        }`}>
          {game.score}/{game.total}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs">{colors?.icon || "🌍"}</span>
          <span className="text-white text-xs font-medium truncate">{catLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-600">
          <span>{MODE_LABELS[game.mode] || game.mode}</span>
          <span>&middot;</span>
          <span>{DIFF_LABELS[game.difficulty] || game.difficulty}</span>
          {game.streak > 0 && (
            <>
              <span>&middot;</span>
              <span className="text-orange-400">🔥{game.streak}</span>
            </>
          )}
        </div>
      </div>
      <div className={`text-sm font-bold tabular-nums ${
        accuracy >= 80 ? "text-green-400" : accuracy >= 50 ? "text-amber-400" : "text-neon-rose"
      }`}>
        {accuracy}%
      </div>
    </motion.div>
  );
}

// ─── RESET SECTION ───
function ResetSection({ onReset }: { onReset: () => void }) {
  const [step, setStep] = useState<0 | 1 | 2>(0); // 0=idle, 1=first confirm, 2=done

  const handleFirstClick = () => setStep(1);

  const handleConfirm = () => {
    onReset();
    // Also clear achievements and profile
    localStorage.removeItem("vqm_achievements");
    localStorage.removeItem("vqm_profile");
    setStep(2);
    setTimeout(() => window.location.reload(), 1200);
  };

  if (step === 2) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6"
      >
        <p className="text-green-400 font-semibold">&#10003; Progression réinitialisée. Rechargement...</p>
      </motion.div>
    );
  }

  return (
    <div className="border-t border-white/[0.04] pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">Zone dangereuse</p>
          <p className="text-slate-700 text-xs">Efface toutes vos données : XP, badges, historique</p>
        </div>
        {step === 0 ? (
          <button
            onClick={handleFirstClick}
            className="px-4 py-2 text-xs font-semibold text-red-400/70 border border-red-500/15 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            Réinitialiser
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => setStep(0)}
              className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-white transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-bold text-white bg-red-500/80 hover:bg-red-500 rounded-xl transition-all shadow-lg shadow-red-500/20"
            >
              Confirmer la suppression
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
