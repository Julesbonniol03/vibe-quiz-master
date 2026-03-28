"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard",   label: "Accueil",    icon: HomeIcon,    neon: false },
  { href: "/aventure",    label: "Aventure",   icon: SwordIcon,   neon: true },
  { href: "/quiz",        label: "Jouer",      icon: PlayIcon,    neon: false },
  { href: "/leaderboard", label: "Classement", icon: TrophyIcon,  neon: false },
  { href: "/profil",      label: "Profil",     icon: StarIcon,    neon: false },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-lg bg-[#11111e]/95 backdrop-blur-xl border-t border-white/10
                      flex items-stretch px-1 pb-safe" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map(({ href, label, icon: Icon, neon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const neonActive = neon && active;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-3 transition-all duration-200
                          ${neonActive ? "text-purple-400" : active ? "text-indigo-400" : neon ? "text-purple-500/70 hover:text-purple-400" : "text-slate-500 hover:text-slate-300"}`}
              style={neonActive ? { filter: "drop-shadow(0 0 6px rgba(168,85,247,0.6))" } : undefined}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
                               ${neonActive ? "bg-purple-500/20" : active ? "bg-indigo-500/20" : ""}`}
                   style={neonActive ? { boxShadow: "0 0 12px rgba(168,85,247,0.4), 0 0 24px rgba(168,85,247,0.15)" } : undefined}>
                <Icon size={20} active={active} />
                {active && (
                  <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${neon ? "bg-purple-400" : "bg-indigo-400"}`} />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider leading-none transition-colors duration-200
                                ${neonActive ? "text-purple-400" : active ? "text-indigo-400" : "text-slate-500"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ── Inline SVG icons ── */
function HomeIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
      <path d="M9 21V12h6v9" />
    </svg>
  );
}
function PlayIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      {active
        ? <path d="M5 3l14 9-14 9V3z" />
        : <polygon points="5 3 19 12 5 21 5 3" />}
    </svg>
  );
}
function TrophyIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H3V4h3M18 9h3V4h-3" />
      <path d="M6 4h12v6a6 6 0 01-12 0V4z" />
      <path d="M12 15v3M8 21h8" />
    </svg>
  );
}
function SwordIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
    </svg>
  );
}
function StarIcon({ size, active }: { size: number; active: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
