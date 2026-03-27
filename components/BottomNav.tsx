"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard",   label: "Accueil",    icon: HomeIcon },
  { href: "/story-mode",  label: "Aventure",     icon: SwordIcon },
  { href: "/quiz",        label: "Jouer",      icon: PlayIcon },
  { href: "/leaderboard", label: "Classement", icon: TrophyIcon },
  { href: "/premium",     label: "Premium",    icon: StarIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-lg bg-[#11111e]/95 backdrop-blur-xl border-t border-white/10
                      flex items-stretch px-1 pb-safe" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-3 transition-all duration-200
                          ${active ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"}`}
            >
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200
                               ${active ? "bg-indigo-500/20" : ""}`}>
                <Icon size={20} active={active} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400" />
                )}
              </div>
              <span className={`text-[10px] font-medium leading-none transition-colors duration-200
                                ${active ? "text-indigo-400" : "text-slate-500"}`}>
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
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
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
