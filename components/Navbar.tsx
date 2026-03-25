"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/quiz", label: "Quiz", icon: "🧠" },
  { href: "/reviser", label: "Réviser", icon: "📖" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
  { href: "/premium", label: "Premium", icon: "⭐" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-cyber-950/70 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-rose flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-neon-cyan/20 group-hover:scale-110 group-hover:shadow-neon-cyan/40 transition-all">
            V
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-neon-cyan to-neon-rose bg-clip-text text-transparent">
            Vibe Quiz Master
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
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
