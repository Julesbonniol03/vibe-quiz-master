"use client";

import { useState, useEffect } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useHearts } from "@/hooks/useHearts";
import { useNotifications } from "@/hooks/useNotifications";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export function StatsGrid() {
  const { hydrated, levelInfo, gamesPlayed, globalBestStreak, accuracy, totalPlayed, dailyStreak } = useProgress();
  const hearts = useHearts();
  const notifs = useNotifications();

  // Schedule streak reminder + hearts regen notification on dashboard load
  useEffect(() => {
    if (!hydrated) return;
    if (dailyStreak > 0) notifs.scheduleStreakAlert(dailyStreak);
    if (hearts.hydrated && hearts.hearts < hearts.maxHearts && hearts.nextRegenIn > 0) {
      const missingHearts = hearts.maxHearts - hearts.hearts;
      const totalRegenMs = missingHearts * 30 * 60 * 1000;
      notifs.scheduleHeartsAlert(totalRegenMs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, hearts.hydrated]);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card !rounded-2xl p-5 animate-pulse">
            <div className="w-8 h-8 bg-white/5 rounded-lg mb-2" />
            <div className="w-16 h-6 bg-white/5 rounded mb-1" />
            <div className="w-20 h-4 bg-white/5 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    { label: "Niveau", value: `${levelInfo.level}`, sub: `${levelInfo.currentXp}/${levelInfo.xpForNext} XP`, icon: "⭐", color: "text-yellow-400" },
    { label: "Flamme Quotidienne", value: `${dailyStreak}`, sub: dailyStreak > 0 ? `jour${dailyStreak > 1 ? "s" : ""} d'affilée` : "Jouez le défi !", icon: "🔥", color: "text-orange-400" },
    { label: "Parties Jouées", value: `${gamesPlayed}`, sub: `${totalPlayed} questions · streak ${globalBestStreak}`, icon: "🎮", color: "text-neon-cyan" },
    { label: "Précision", value: `${accuracy}%`, sub: `${totalPlayed} réponses`, icon: "🎯", color: "text-green-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass-card !rounded-2xl p-5 hover:bg-white/[0.04] transition-colors"
        >
          <div className="text-3xl mb-2">{stat.icon}</div>
          <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
          <div className="text-slate-600 text-sm">{stat.label}</div>
          <div className="text-slate-700 text-xs mt-0.5">{stat.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}

export function XpBar() {
  const { hydrated, xp, levelInfo } = useProgress();

  if (!hydrated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 mt-3"
    >
      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
        <span className="text-amber-400 text-sm font-bold">Niv. {levelInfo.level}</span>
      </div>
      <div className="flex-1 bg-white/[0.06] rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${levelInfo.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose animate-xp-pulse"
        />
      </div>
      <span className="text-slate-600 text-xs tabular-nums whitespace-nowrap">
        {xp} XP total
      </span>
    </motion.div>
  );
}

export function DailyBanner() {
  const { hydrated, dailyStreak, isDailyCompleted } = useProgress();
  if (!hydrated) return null;

  return (
    <div className="relative overflow-hidden bg-obsidian-800/50 border border-neon-rose/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)" }}>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-neon-cyan/[0.03]" />
      <div className="relative flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl">
          🎯
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Défi du jour</span>
            {dailyStreak > 0 && (
              <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                🔥 {dailyStreak}j
              </span>
            )}
            {isDailyCompleted && (
              <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                ✅ Fait
              </span>
            )}
          </div>
          <p className="text-white font-semibold">5 questions identiques pour tout le monde</p>
          <p className="text-slate-500 text-sm">Toutes catégories · Timer 15s · Changent chaque jour</p>
        </div>
      </div>
      <a
        href="/quiz?mode=daily"
        className={`relative px-5 py-2.5 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg whitespace-nowrap ${
          isDailyCompleted
            ? "bg-white/5 border border-white/10 text-slate-400 shadow-none"
            : "bg-purple-500 hover:bg-purple-500/90 text-white shadow-purple-500/20"
        }`}
      >
        {isDailyCompleted ? "Revenir demain" : "Relever le défi →"}
      </a>
    </div>
  );
}

export function RevisionCta() {
  const { hydrated, wrongQuestions } = useProgress();
  if (!hydrated || wrongQuestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card !rounded-2xl p-5 mb-8 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
        📖
      </div>
      <div className="flex-1">
        <p className="text-white font-semibold">{wrongQuestions.length} question{wrongQuestions.length > 1 ? "s" : ""} à réviser</p>
        <p className="text-slate-500 text-sm">Revoyez vos erreurs avec des flashcards</p>
      </div>
      <a
        href="/reviser"
        className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold rounded-xl hover:bg-amber-500/20 transition-colors text-sm whitespace-nowrap"
      >
        Réviser →
      </a>
    </motion.div>
  );
}

// ─── DAILY ODYSSEY BANNER ───
function useCountdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, []);

  return timeLeft;
}

export function DailyOdyssey() {
  const { hydrated, isDailyCompleted, dailyStreak } = useProgress();
  const countdown = useCountdown();

  if (!hydrated) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-8 rounded-2xl overflow-hidden"
    >
      {/* Animated glow border */}
      <div className="absolute inset-0 rounded-2xl animate-glow-border" />

      {/* Inner content with 2px inset to show the glow border */}
      <div className="relative m-[2px] rounded-[14px] bg-obsidian-850 p-5 sm:p-6">
        <div className="absolute inset-0 overflow-hidden rounded-[14px]">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-neon-cyan/[0.04] rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-neon-rose/[0.03] rounded-full blur-[60px]" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-rose/20 border border-neon-cyan/20 flex items-center justify-center text-3xl flex-shrink-0"
            >
              🎯
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-neon-cyan font-bold text-sm uppercase tracking-wider">Quête du Jour</span>
                {dailyStreak > 0 && (
                  <span className="bg-orange-500/10 text-orange-400 text-xs px-2 py-0.5 rounded-full border border-orange-500/20 flex items-center gap-1">
                    🔥 {dailyStreak}j
                  </span>
                )}
                {isDailyCompleted && (
                  <span className="bg-green-500/10 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/20">
                    ✅ Accomplie
                  </span>
                )}
              </div>
              <p className="text-white font-semibold text-sm sm:text-base">
                5 questions &middot; Tous thèmes &middot; Timer 15s
              </p>
              {!isDailyCompleted && (
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-slate-600 text-xs">Prochaine quête dans</span>
                  <span className="text-neon-cyan font-mono text-xs font-bold tabular-nums bg-neon-cyan/5 border border-neon-cyan/10 rounded-lg px-2 py-0.5">
                    {countdown}
                  </span>
                </div>
              )}
            </div>
          </div>

          <Link
            href="/quiz?mode=daily"
            className={`px-5 py-2.5 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap ${
              isDailyCompleted
                ? "bg-white/5 border border-white/10 text-slate-500 shadow-none"
                : "bg-gradient-to-r from-neon-cyan to-neon-cyan/80 text-obsidian-950 shadow-lg shadow-neon-cyan/20"
            }`}
          >
            {isDailyCompleted ? "Revenir demain" : "Relever le défi →"}
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── ONLINE PLAYERS (simulated social proof) ───
export function OnlineCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Simulated: base 120-180, fluctuates slightly
    const base = 120 + Math.floor(Math.random() * 60);
    setCount(base);
    const interval = setInterval(() => {
      setCount((c) => c + Math.floor(Math.random() * 7) - 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (count === 0) return null;

  return (
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="text-slate-600 text-sm flex items-center gap-1.5 mt-1"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>⚡️ {count} joueurs en ligne actuellement</span>
    </motion.p>
  );
}

interface ActualiteItem {
  id: number;
  theme: string;
  emoji: string;
  color: string;
  headline: string;
  summary: string;
  tag: string;
  date: string;
  details?: string;
}

const COLOR_MAP_CLIENT: Record<string, { badge: string; border: string; glow: string }> = {
  blue:   { badge: "text-blue-300 bg-blue-500/10 border-blue-500/20",   border: "border-blue-500/40",   glow: "from-blue-500/[0.08]" },
  cyan:   { badge: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20", border: "border-neon-cyan/40",  glow: "from-neon-cyan/[0.08]" },
  green:  { badge: "text-green-300 bg-green-500/10 border-green-500/20", border: "border-green-500/40",  glow: "from-green-500/[0.08]" },
  yellow: { badge: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20", border: "border-yellow-500/40", glow: "from-yellow-500/[0.08]" },
  purple: { badge: "text-purple-300 bg-purple-500/10 border-purple-500/20", border: "border-purple-500/40", glow: "from-purple-500/[0.08]" },
  orange: { badge: "text-orange-300 bg-orange-500/10 border-orange-500/20", border: "border-orange-500/40", glow: "from-orange-500/[0.08]" },
};

export function ActualitesModal({ item, onClose }: { item: ActualiteItem; onClose: () => void }) {
  const c = COLOR_MAP_CLIENT[item.color] ?? COLOR_MAP_CLIENT.blue;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Parse markdown-like bold
  const renderDetails = (text: string) => {
    return text.split("\n").map((line, i) => {
      const boldParsed = line.split(/\*\*(.*?)\*\*/g).map((part, j) =>
        j % 2 === 1 ? <strong key={j} className="text-white font-semibold">{part}</strong> : part
      );
      return <p key={i} className={`${line.startsWith("•") ? "pl-2" : ""} text-slate-400 text-sm leading-relaxed mb-1`}>{boldParsed}</p>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`relative w-full max-w-lg bg-obsidian-900 rounded-3xl border ${c.border} overflow-hidden max-h-[80vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className={`absolute inset-0 bg-gradient-to-br ${c.glow} to-transparent pointer-events-none`} />

        {/* Header */}
        <div className="relative p-5 pb-3 flex items-start gap-3 border-b border-white/[0.06]">
          <span className="text-3xl mt-0.5">{item.emoji}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${c.badge}`}>
                {item.tag}
              </span>
              <span className="text-xs text-slate-600">{item.date}</span>
            </div>
            <h2 className="text-base font-bold text-white leading-snug">{item.headline}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.10] flex items-center justify-center text-slate-400 hover:text-white transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="relative overflow-y-auto p-5 space-y-1">
          {item.details ? renderDetails(item.details) : <p className="text-slate-400 text-sm">{item.summary}</p>}
        </div>

        {/* Footer */}
        <div className="relative p-4 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-xs text-slate-700">📰 Contenu éditorial · Teubé</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] text-slate-300 transition-all"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ActualitesGrid({ items }: { items: ActualiteItem[] }) {
  const [selected, setSelected] = useState<ActualiteItem | null>(null);

  const colorBorderMap: Record<string, string> = {
    blue: "hover:border-blue-500/30", cyan: "hover:border-neon-cyan/30",
    green: "hover:border-green-500/30", yellow: "hover:border-yellow-500/30",
    purple: "hover:border-purple-500/30", orange: "hover:border-orange-500/30",
  };
  const colorGlowMap: Record<string, string> = {
    blue: "from-blue-500/[0.04]", cyan: "from-neon-cyan/[0.04]",
    green: "from-green-500/[0.04]", yellow: "from-yellow-500/[0.04]",
    purple: "from-purple-500/[0.04]", orange: "from-orange-500/[0.04]",
  };
  const badgeMap: Record<string, string> = {
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/20",
    cyan: "text-neon-cyan bg-neon-cyan/10 border-neon-cyan/20",
    green: "text-green-300 bg-green-500/10 border-green-500/20",
    yellow: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
    purple: "text-purple-300 bg-purple-500/10 border-purple-500/20",
    orange: "text-orange-300 bg-orange-500/10 border-orange-500/20",
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(item)}
            className={`relative group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all duration-200 hover:bg-white/[0.04] ${colorBorderMap[item.color] ?? ""} w-full`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${colorGlowMap[item.color] ?? ""} to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{item.emoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${badgeMap[item.color] ?? ""}`}>
                  {item.tag}
                </span>
                <span className="ml-auto text-slate-700 group-hover:text-slate-400 transition-colors text-xs">+ infos</span>
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug mb-2 line-clamp-2">{item.headline}</h3>
              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{item.summary}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selected && <ActualitesModal item={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </>
  );
}

// ─── PAYWALL MINI (shown when tapping locked content like Actualités 2026) ───
export function PaywallMini() {
  const heartsSystem = useHearts();
  const [show, setShow] = useState(false);

  if (heartsSystem.premium) return null;

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="w-full mt-4 py-3 rounded-2xl border-2 border-amber-500/20 bg-gradient-to-r from-amber-500/[0.05] to-yellow-500/[0.05] hover:border-amber-500/40 transition-all flex items-center justify-center gap-2"
      >
        <span>🔒</span>
        <span className="text-amber-400 font-semibold text-sm">Actualités 2026 — Mode Légende</span>
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShow(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-sm w-full rounded-3xl border border-amber-500/20 bg-obsidian-900 p-8 text-center relative overflow-hidden"
            >
              {/* Glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-60 bg-amber-500/[0.08] rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10">
                <div className="text-6xl mb-4">👑</div>
                <h2 className="text-2xl font-black mb-2">
                  <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                    Mode Légende
                  </span>
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Débloque les Actualités 2026, l&apos;Oracle IA, les vies illimitées et le badge doré.
                </p>

                <div className="space-y-2 mb-6 text-left">
                  {[
                    { icon: "❤️", text: "Vies illimitées" },
                    { icon: "🔮", text: "L'Oracle — Explications IA" },
                    { icon: "📰", text: "Actualités 2026 exclusives" },
                    { icon: "👑", text: "Badge Légende sur ton profil" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3 p-2 rounded-xl bg-amber-500/5 border border-amber-500/10">
                      <span>{item.icon}</span>
                      <span className="text-white text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/premium"
                  className="block w-full py-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-base rounded-2xl hover:brightness-110 transition-all shadow-xl shadow-amber-500/20"
                >
                  Devenir Légende →
                </Link>
                <button
                  onClick={() => setShow(false)}
                  className="mt-3 text-slate-600 text-sm hover:text-slate-400 transition-colors"
                >
                  Peut-être plus tard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
