"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useProgress, getLevel } from "@/hooks/useProgress";
import { useProfile } from "@/hooks/useProfile";
import { getAvatarById } from "@/components/OnboardingModal";
import { useHearts } from "@/hooks/useHearts";
import HeartBar from "@/components/HeartBar";

interface Props {
  onNavigate: () => void;
}

/**
 * Vue profil compacte pour le Bottom Sheet.
 * Affiche avatar, niveau, XP, c\u0153urs et liens rapides.
 */
export default function ProfileSheet({ onNavigate }: Props) {
  const { hydrated, xp, accuracy, totalPlayed, gamesPlayed, dailyStreak } = useProgress();
  const { profile, hydrated: profileHydrated } = useProfile();
  const heartsSystem = useHearts();

  if (!hydrated || !profileHydrated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-4xl animate-pulse">👤</div>
      </div>
    );
  }

  const levelInfo = getLevel(xp);
  const avatar = profile ? getAvatarById(profile.avatarId) : null;

  return (
    <div className="space-y-5">
      {/* ── Avatar + Infos ── */}
      <div className="flex items-center gap-4">
        {avatar && profile ? (
          <div className="relative">
            <div
              className={`w-16 h-16 rounded-2xl ${avatar.bg} border-2 ${avatar.border} flex items-center justify-center`}
            >
              <avatar.Icon size={32} style={{ color: avatar.color }} strokeWidth={2} />
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-gradient-to-br from-neon-green to-neon-red flex items-center justify-center text-[10px] font-black text-white"
              style={{ boxShadow: "0 0 8px rgba(0,255,65,0.3)" }}>
              {levelInfo.level}
            </div>
          </div>
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
            👤
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-bold text-white">{profile?.pseudo || "Joueur"}</h3>
          <p className={`text-xs font-medium ${levelInfo.titleColor}`}>{levelInfo.title}</p>
          {/* XP bar */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-1.5 rounded-full bg-gradient-to-r from-neon-green to-neon-red"
              />
            </div>
            <span className="text-slate-600 text-[10px] nums">{xp} XP</span>
          </div>
        </div>
      </div>

      {/* ── C\u0153urs ── */}
      {heartsSystem.hydrated && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
          <HeartBar
            hearts={heartsSystem.hearts}
            maxHearts={heartsSystem.maxHearts}
            premium={heartsSystem.premium}
            size="md"
            showRegen={!heartsSystem.premium && heartsSystem.nextRegenIn > 0 ? heartsSystem.formatRegenTime(heartsSystem.nextRegenIn) : undefined}
          />
          {heartsSystem.premium && (
            <span className="ml-auto text-amber-400 text-xs font-bold">👑 L\u00e9gende</span>
          )}
        </div>
      )}

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: "🎮", value: `${gamesPlayed}`, label: "Parties" },
          { icon: "🎯", value: `${accuracy}%`, label: "Pr\u00e9cision" },
          { icon: "🔥", value: `${dailyStreak}`, label: "S\u00e9rie" },
        ].map((s) => (
          <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="text-base font-bold nums text-white">{s.value}</div>
            <div className="text-slate-600 text-[10px]">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Liens rapides ── */}
      <div className="space-y-2">
        <Link
          href="/profil"
          onClick={onNavigate}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all active:scale-[0.98]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
        >
          <span className="text-lg">📊</span>
          <span className="text-white text-sm font-medium flex-1">Statistiques compl&egrave;tes</span>
          <span className="text-slate-600">&rarr;</span>
        </Link>
        <Link
          href="/reviser"
          onClick={onNavigate}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all active:scale-[0.98]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
        >
          <span className="text-lg">📖</span>
          <span className="text-white text-sm font-medium flex-1">R&eacute;viser mes erreurs</span>
          <span className="text-slate-600">&rarr;</span>
        </Link>
        <Link
          href="/leaderboard"
          onClick={onNavigate}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-all active:scale-[0.98]"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
        >
          <span className="text-lg">🏆</span>
          <span className="text-white text-sm font-medium flex-1">Classement</span>
          <span className="text-slate-600">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
