"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useHearts } from "@/hooks/useHearts";
import { useProgress } from "@/hooks/useProgress";

const tabs = [
  { href: "/dashboard",   label: "Accueil",     icon: HomeIcon },
  { href: "/leaderboard", label: "Classement",  icon: TrophyIcon },
  { href: "/quiz",        label: "Jouer",       icon: PlayIcon, center: true },
  { href: "/premium",     label: "Boutique",    icon: CrownIcon },
  { href: "/profil",      label: "Profil",      icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const heartsSystem = useHearts();
  const { dailyStreak, hydrated } = useProgress();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="w-full bg-[#0a0a18]/95 backdrop-blur-2xl border-t border-white/[0.06] flex items-end"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {tabs.map(({ href, label, icon: Icon, center }) => {
          const active = pathname === href || pathname.startsWith(href + "/");

          // Central "Jouer" button — raised circle
          if (center) {
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center flex-1 -mt-5"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-br from-neon-cyan to-neon-rose shadow-neon-cyan/30 scale-110"
                      : "bg-gradient-to-br from-neon-cyan/80 to-neon-rose/80 shadow-neon-cyan/10"
                  }`}
                >
                  <Icon size={24} active={active} />
                </div>
                <span className={`text-[9px] font-semibold mt-1 ${active ? "text-neon-cyan" : "text-slate-500"}`}>
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-all duration-200"
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                active ? "bg-neon-cyan/10" : ""
              }`}>
                <Icon size={20} active={active} />
                {active && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-neon-cyan" />
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none ${
                active ? "text-neon-cyan" : "text-slate-600"
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Floating indicators: hearts + streak */}
      {heartsSystem.hydrated && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none"
        >
          {hydrated && dailyStreak > 0 && (
            <div className="flex items-center gap-0.5 bg-[#0a0a18]/90 backdrop-blur-xl rounded-full px-2 py-0.5 border border-orange-500/20">
              <span className="text-[10px]">🔥</span>
              <span className="text-orange-400 text-[10px] font-bold">{dailyStreak}</span>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

/* ── Inline SVG icons ── */
function HomeIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function TrophyIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H3V4h3M18 9h3V4h-3" />
      <path d="M6 4h12v6a6 6 0 01-12 0V4z" />
      <path d="M12 15v3M8 21h8" />
    </svg>
  );
}
function PlayIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "none" : "white"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
function CrownIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20L19 8l-5 6-2-8-2 8-5-6-3 12z" />
      <path d="M2 20h20" />
    </svg>
  );
}
function ProfileIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
