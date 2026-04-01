"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  { href: "/dashboard",   label: "Accueil",     icon: HomeIcon },
  { href: "/leaderboard", label: "Classement",  icon: TrophyIcon },
  { href: "/quiz",        label: "Jouer",       icon: PlayIcon, center: true },
  { href: "/premium",     label: "Boutique",    icon: CrownIcon },
  { href: "/profil",      label: "Profil",      icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on quiz playing to avoid accidental navigation
  if (pathname === "/quiz" && typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    if (params.has("playing")) return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div
        className="mx-2 mb-1 rounded-2xl bg-obsidian-900/95 backdrop-blur-3xl border border-white/[0.04] flex items-end"
        style={{
          paddingBottom: "max(4px, env(safe-area-inset-bottom, 0px))",
          boxShadow: "0 -4px 40px rgba(0,0,0,0.5), 0 -1px 0 rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {tabs.map(({ href, label, icon: Icon, center }) => {
          const active = pathname === href || pathname.startsWith(href + "/");

          if (center) {
            return (
              <Link key={href} href={href} className="flex flex-col items-center flex-1 -mt-4 pb-1">
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`w-14 h-14 rounded-[18px] flex items-center justify-center transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-br from-neon-green via-obsidian-600 to-neon-red scale-105"
                      : "bg-obsidian-700 border border-white/[0.06]"
                  }`}
                  style={active ? {
                    boxShadow: "0 0 20px rgba(0,255,65,0.25), 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                  } : {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)",
                  }}
                >
                  <Icon size={22} active={active} />
                </motion.div>
                <span className={`text-[9px] font-semibold mt-1 transition-colors ${active ? "text-neon-green" : "text-slate-600"}`}>
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1 flex-1 py-2.5">
              <div className="relative flex items-center justify-center w-9 h-9">
                {active && (
                  <motion.div
                    layoutId="bottomnav-active"
                    className="absolute inset-0 rounded-xl bg-neon-green/[0.08] border border-neon-green/[0.1]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    style={{ boxShadow: "0 0 8px rgba(0,255,65,0.06)" }}
                  />
                )}
                <div className="relative z-10">
                  <Icon size={20} active={active} />
                </div>
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors ${
                active ? "text-neon-green" : "text-slate-600"
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ── SVG icons with smooth active states ── */
function HomeIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "rgba(0,255,65,0.15)" : "none"} stroke={active ? "#00FF41" : "#475569"} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function TrophyIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? "#00FF41" : "#475569"} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H3V4h3M18 9h3V4h-3" />
      <path d="M6 4h12v6a6 6 0 01-12 0V4z" />
      <path d="M12 15v3M8 21h8" />
    </svg>
  );
}
function PlayIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke={active ? "none" : "white"} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}
function CrownIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "rgba(0,255,65,0.15)" : "none"} stroke={active ? "#00FF41" : "#475569"} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20h20L19 8l-5 6-2-8-2 8-5-6-3 12z" />
      <path d="M2 20h20" />
    </svg>
  );
}
function ProfileIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "rgba(0,255,65,0.15)" : "none"} stroke={active ? "#00FF41" : "#475569"} strokeWidth={active ? 2 : 1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
