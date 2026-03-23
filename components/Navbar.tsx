"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/quiz", label: "Quiz", icon: "🧠" },
  { href: "/leaderboard", label: "Classement", icon: "🏆" },
  { href: "/premium", label: "Premium", icon: "⭐" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
            V
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
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
                    ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/quiz"
            className="ml-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/20"
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
                  isActive ? "bg-indigo-500/20" : "hover:bg-white/5"
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
