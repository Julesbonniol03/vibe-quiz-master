"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { getAvatarById } from "@/components/OnboardingModal";
import { useOptionalAuth } from "@/contexts/AuthContext";
import { useHearts } from "@/hooks/useHearts";
import { useProgress } from "@/hooks/useProgress";
import { LogIn, LogOut } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Accueil", icon: "🏠" },
  { href: "/quiz", label: "Quiz", icon: "🧠" },
  { href: "/profil", label: "Profil", icon: "👤", isProfile: true },
  { href: "/reviser", label: "R\u00e9viser", icon: "📖" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
  { href: "/premium", label: "L\u00e9gende", icon: "👑" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { profile, hydrated } = useProfile();
  const auth = useOptionalAuth();
  const heartsSystem = useHearts();
  const { dailyStreak, hydrated: progressHydrated } = useProgress();

  return (
    <nav
      className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-obsidian-950/80 backdrop-blur-3xl border-b border-white/[0.04] safe-nav-top"
      style={{ boxShadow: "0 4px 30px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(255,255,255,0.03)" }}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between" style={{ paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))", paddingRight: "max(1rem, env(safe-area-inset-right, 0px))" }}>
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-green via-obsidian-600 to-neon-red flex items-center justify-center text-sm font-bold text-white group-hover:scale-110 transition-all"
            style={{ boxShadow: "0 0 12px rgba(0,255,65,0.2), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            T
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-neon-green to-neon-red bg-clip-text text-transparent">
            Teub&eacute;
          </span>
        </Link>

        {/* Hearts + Flame */}
        <div className="flex items-center gap-2">
          {/* Daily streak flame */}
          {progressHydrated && dailyStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-500/8 border border-orange-500/15 rounded-lg px-2 py-1">
              <span className="text-sm">🔥</span>
              <span className="text-orange-400 text-xs font-bold">{dailyStreak}</span>
            </div>
          )}
          {/* Hearts */}
          {heartsSystem.hydrated && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: heartsSystem.maxHearts }).map((_, i) => (
                <span key={i} className="text-xs">
                  {i < heartsSystem.hearts ? (heartsSystem.premium ? "💛" : "❤️") : <span className="opacity-20">🖤</span>}
                </span>
              ))}
              {heartsSystem.premium && (
                <span className="text-[9px] text-amber-400 ml-0.5 font-bold">∞</span>
              )}
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            // Profile button with avatar
            if (item.isProfile && hydrated && profile) {
              const av = getAvatarById(profile.avatarId);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? `${av.bg} border ${av.border}`
                      : "text-slate-500 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full ${av.bg} border ${av.border} flex items-center justify-center flex-shrink-0`}
                  >
                    <av.Icon size={14} style={{ color: av.color }} strokeWidth={2.2} />
                  </div>
                  <span className={isActive ? "text-white" : ""}>{profile.pseudo}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-neon-green/8 text-neon-green border border-neon-green/15"
                    : "text-slate-500 hover:text-white hover:bg-white/[0.03]"
                }`}
                style={isActive ? { boxShadow: "0 0 8px rgba(0,255,65,0.06)" } : undefined}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/quiz"
            className="ml-2 px-4 py-2 bg-gradient-to-r from-neon-green via-obsidian-600 to-neon-red text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: "0 0 16px rgba(0,255,65,0.15), 0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}
          >
            Jouer →
          </Link>
          {auth && !auth.loading && (
            auth.user ? (
              <button
                onClick={() => auth.signOut()}
                className="ml-1 p-2 rounded-lg text-slate-500 hover:text-neon-red hover:bg-neon-red/5 transition-all"
                title="D\u00e9connexion"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <Link
                href="/connexion"
                className="ml-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-neon-green hover:bg-neon-green/5 border border-transparent hover:border-neon-green/15 transition-all"
              >
                <LogIn size={14} />
                Connexion
              </Link>
            )
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            // Profile button with avatar on mobile
            if (item.isProfile && hydrated && profile) {
              const av = getAvatarById(profile.avatarId);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`p-1.5 rounded-lg transition-all ${
                    isActive ? av.bg : "hover:bg-white/5"
                  }`}
                  title={profile.pseudo}
                >
                  <div
                    className={`w-7 h-7 rounded-full ${av.bg} border ${av.border} flex items-center justify-center`}
                  >
                    <av.Icon size={14} style={{ color: av.color }} strokeWidth={2.2} />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-lg text-lg transition-all ${
                  isActive ? "bg-neon-green/10" : "hover:bg-white/5"
                }`}
                title={item.label}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
