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
  { href: "/reviser", label: "Réviser", icon: "📖" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
  { href: "/premium", label: "Légende", icon: "👑" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { profile, hydrated } = useProfile();
  const auth = useOptionalAuth();
  const heartsSystem = useHearts();
  const { dailyStreak, hydrated: progressHydrated } = useProgress();

  return (
    <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-cyber-950/70 backdrop-blur-2xl border-b border-white/[0.06] safe-nav-top">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between" style={{ paddingLeft: "max(1rem, env(safe-area-inset-left, 0px))", paddingRight: "max(1rem, env(safe-area-inset-right, 0px))" }}>
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-rose flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-neon-cyan/20 group-hover:scale-110 group-hover:shadow-neon-cyan/40 transition-all">
            T
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-neon-cyan to-neon-rose bg-clip-text text-transparent">
            Teubé
          </span>
        </Link>

        {/* Hearts + Flame (visible on all screens) */}
        <div className="flex items-center gap-2">
          {/* Daily streak flame */}
          {progressHydrated && dailyStreak > 0 && (
            <div className="flex items-center gap-1 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2 py-1">
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
                    ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/quiz"
            className="ml-2 px-4 py-2 bg-gradient-to-r from-neon-cyan to-neon-rose text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neon-cyan/20"
          >
            Jouer →
          </Link>
          {auth && !auth.loading && (
            auth.user ? (
              <button
                onClick={() => auth.signOut()}
                className="ml-1 p-2 rounded-lg text-slate-500 hover:text-neon-rose hover:bg-neon-rose/5 transition-all"
                title="Déconnexion"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <Link
                href="/connexion"
                className="ml-1 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-neon-cyan hover:bg-neon-cyan/5 border border-transparent hover:border-neon-cyan/20 transition-all"
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
                  isActive ? "bg-neon-cyan/10" : "hover:bg-white/5"
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
