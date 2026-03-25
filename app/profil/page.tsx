"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useProgress, getLevel } from "@/hooks/useProgress";
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

// ─── SVG RADAR CHART ───
const RADAR_CATEGORIES = [
  "Histoire", "Sciences", "Géographie", "Sport", "Cinéma",
  "Musique", "Technologie", "Nature & Animaux",
] as const;

function RadarChart({ stats }: { stats: Record<string, { played: number; correct: number }> }) {
  const cx = 150, cy = 150, r = 110;
  const n = RADAR_CATEGORIES.length;
  const angleStep = (2 * Math.PI) / n;

  // Compute accuracy per category (0-1)
  const values = RADAR_CATEGORIES.map((cat) => {
    const s = stats[cat];
    if (!s || s.played === 0) return 0;
    return s.correct / s.played;
  });

  // Generate polygon points
  const pointsAt = (vals: number[]) =>
    vals.map((v, i) => {
      const angle = angleStep * i - Math.PI / 2;
      return `${cx + r * v * Math.cos(angle)},${cy + r * v * Math.sin(angle)}`;
    }).join(" ");

  // Grid levels
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox="0 0 300 300" className="w-full max-w-[320px] mx-auto">
      {/* Grid circles */}
      {gridLevels.map((level) => (
        <polygon
          key={level}
          points={Array.from({ length: n }, (_, i) => {
            const angle = angleStep * i - Math.PI / 2;
            return `${cx + r * level * Math.cos(angle)},${cy + r * level * Math.sin(angle)}`;
          }).join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      ))}

      {/* Axis lines */}
      {RADAR_CATEGORIES.map((_, i) => {
        const angle = angleStep * i - Math.PI / 2;
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={cx + r * Math.cos(angle)}
            y2={cy + r * Math.sin(angle)}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <motion.polygon
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        style={{ transformOrigin: `${cx}px ${cy}px` }}
        points={pointsAt(values)}
        fill="url(#radarGradient)"
        stroke="url(#radarStroke)"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {values.map((v, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const px = cx + r * v * Math.cos(angle);
        const py = cy + r * v * Math.sin(angle);
        return (
          <motion.circle
            key={i}
            initial={{ r: 0 }}
            animate={{ r: v > 0 ? 4 : 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
            cx={px} cy={py}
            fill="#00f0ff"
            filter="url(#glow)"
          />
        );
      })}

      {/* Labels */}
      {RADAR_CATEGORIES.map((cat, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const labelR = r + 22;
        const lx = cx + labelR * Math.cos(angle);
        const ly = cy + labelR * Math.sin(angle);
        const colors = categoryColors[cat];
        const pct = values[i] > 0 ? Math.round(values[i] * 100) : 0;
        return (
          <text
            key={cat}
            x={lx} y={ly}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[9px] font-medium"
            fill={pct > 0 ? (colors?.text ? "currentColor" : "#94a3b8") : "#475569"}
          >
            <tspan className={colors?.text || "text-slate-400"}>
              {colors?.icon || "?"} {cat.length > 10 ? cat.slice(0, 9) + "." : cat}
            </tspan>
            {pct > 0 && (
              <tspan x={lx} dy="12" className="text-[8px]" fill="#64748b">{pct}%</tspan>
            )}
          </text>
        );
      })}

      {/* Defs */}
      <defs>
        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(0,240,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,45,123,0.15)" />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="100%" stopColor="#ff2d7b" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// ─── MAIN PAGE ───
export default function ProfilPage() {
  const progress = useProgress();

  if (!progress.hydrated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6 animate-pulse">👤</div>
        <p className="text-slate-500 text-lg">Chargement du profil...</p>
      </div>
    );
  }

  const rank = getRank(progress.xp);
  const levelInfo = getLevel(progress.xp);
  const avgSpeed = progress.speedRecord.totalAnswered > 0
    ? (progress.speedRecord.totalTime / progress.speedRecord.totalAnswered).toFixed(1)
    : null;
  const bestAvg = progress.speedRecord.bestAvg > 0
    ? progress.speedRecord.bestAvg.toFixed(1)
    : null;

  // Sort categories by accuracy for the ranking list
  const catRanking = Object.entries(progress.categoryStats)
    .filter(([, s]) => s.played >= 3)
    .map(([cat, s]) => ({ cat, accuracy: Math.round((s.correct / s.played) * 100), played: s.played }))
    .sort((a, b) => b.accuracy - a.accuracy);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card-strong p-8 mb-8"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-cyan/[0.04] rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-neon-rose/[0.04] rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
          {/* Rank Badge */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.15 }}
              className={`w-24 h-24 rounded-3xl ${rank.bg} border-2 ${rank.border} flex items-center justify-center text-5xl shadow-xl`}
            >
              {rank.icon}
            </motion.div>
            <div className="text-center sm:text-left flex-1">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-slate-500 text-sm mb-1">Rang actuel</p>
                <h1 className={`text-3xl font-bold ${rank.color} mb-1`}>{rank.name}</h1>
                {rank.nextRank && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <span className="text-slate-500">Prochain :</span>
                      <span className={rank.nextRank.color}>{rank.nextRank.icon} {rank.nextRank.name}</span>
                      <span className="text-slate-600">({rank.nextRank.minXp.toLocaleString()} XP)</span>
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
              </motion.div>
            </div>

            {/* XP / Level badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="glass-card !rounded-2xl px-6 py-4">
                <p className="text-2xl font-bold gradient-text">{progress.xp.toLocaleString()}</p>
                <p className="text-slate-500 text-xs mt-1">XP totale</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-amber-400 text-sm font-bold">Niv. {levelInfo.level}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Rank Ladder */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
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
                    ? `bg-white/[0.02] border-white/[0.08] opacity-80`
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

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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

        {/* Stats & Speed */}
        <div className="space-y-6">
          {/* Speed Record */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card !rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>⚡</span> Vitesse
            </h2>
            {avgSpeed ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neon-cyan/5 border border-neon-cyan/15 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-neon-cyan tabular-nums">{avgSpeed}s</div>
                  <div className="text-slate-500 text-xs mt-1">Moyenne / question</div>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-amber-400 tabular-nums">{bestAvg}s</div>
                  <div className="text-slate-500 text-xs mt-1">Record de vitesse</div>
                </div>
                <div className="col-span-2 text-center">
                  <p className="text-slate-600 text-xs">
                    {progress.speedRecord.totalAnswered} questions en {Math.round(progress.speedRecord.totalTime)}s au total
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2 opacity-50">⏱️</div>
                <p className="text-slate-500 text-sm">Terminez un quiz pour voir vos stats de vitesse</p>
              </div>
            )}
          </motion.div>

          {/* General Stats */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card !rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>📈</span> Statistiques
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Parties jouées", value: progress.gamesPlayed, icon: "🎮", color: "text-neon-cyan" },
                { label: "Précision", value: `${progress.accuracy}%`, icon: "🎯", color: progress.accuracy >= 70 ? "text-green-400" : "text-amber-400" },
                { label: "Meilleur streak", value: `${progress.globalBestStreak}x`, icon: "🔥", color: "text-neon-rose" },
                { label: "Questions jouées", value: progress.totalPlayed, icon: "📝", color: "text-purple-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3 text-center">
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className={`text-lg font-bold ${stat.color} tabular-nums`}>{stat.value}</div>
                  <div className="text-slate-600 text-[10px] mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Category Ranking */}
      {catRanking.length > 0 && (
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
            {catRanking.map((item, i) => {
              const colors = categoryColors[item.cat] || { icon: "❓", text: "text-slate-400", bg: "bg-slate-500/20", border: "border-slate-500/30" };
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <motion.div
                  key={item.cat}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                >
                  <span className="text-lg w-6 text-center">{medals[i] || `${i + 1}.`}</span>
                  <div className={`w-8 h-8 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center text-sm flex-shrink-0`}>
                    {colors.icon}
                  </div>
                  <span className={`font-medium flex-1 ${colors.text}`}>{item.cat}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 text-xs">{item.played} Q</span>
                    <span className={`font-bold text-sm tabular-nums ${
                      item.accuracy >= 80 ? "text-green-400" : item.accuracy >= 60 ? "text-amber-400" : "text-neon-rose"
                    }`}>
                      {item.accuracy}%
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href="/quiz"
          className="flex-1 py-3 text-center bg-gradient-to-r from-neon-cyan to-neon-rose text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-neon-cyan/15"
        >
          Jouer un quiz →
        </Link>
        <Link
          href="/reviser"
          className="flex-1 py-3 text-center bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/8 transition-colors"
        >
          📖 Réviser
        </Link>
      </div>
    </div>
  );
}
