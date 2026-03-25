import Link from "next/link";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { categoryColors } from "@/lib/questions";
import { StatsGrid, XpBar, RevisionCta, DailyBanner, DailyOdyssey, OnlineCount } from "./DashboardClient";

const FEATURED_CATEGORIES = ["Actualités 2025-2026", "Maîtrise du Français"];

function loadCategories() {
  const dataDir = join(process.cwd(), "data", "questions");
  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  const categoryMap: Record<string, number> = {};

  for (const file of files) {
    const raw = readFileSync(join(dataDir, file), "utf-8");
    const parsed: { category: string }[] = JSON.parse(raw);
    for (const q of parsed) {
      categoryMap[q.category] = (categoryMap[q.category] || 0) + 1;
    }
  }

  return Object.entries(categoryMap)
    .map(([name, count]) => ({ name, questions: count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export default function DashboardPage() {
  const categories = loadCategories();
  const totalQ = categories.reduce((sum, c) => sum + c.questions, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-cyber-900 border border-white/[0.06] p-8 mb-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-neon-cyan/[0.04] rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-neon-rose/[0.04] rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👋</span>
              <span className="text-slate-500 text-sm font-medium">Bienvenue de retour !</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Prêt à tester vos{" "}
              <span className="gradient-text">
                connaissances ?
              </span>
            </h1>
            <p className="text-slate-500 max-w-md">
              {totalQ} questions · 3 modes de jeu · Système XP
            </p>
            <OnlineCount />
            <XpBar />
          </div>
          <div className="flex gap-3">
            <Link
              href="/quiz"
              className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-cyan/80 text-cyber-950 font-semibold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-neon-cyan/20 whitespace-nowrap"
            >
              Jouer maintenant →
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 bg-white/[0.04] border border-white/[0.08] text-white font-semibold rounded-xl hover:bg-white/[0.07] transition-all whitespace-nowrap"
            >
              Classement 🏆
            </Link>
          </div>
        </div>
      </div>

      {/* Daily Odyssey */}
      <DailyOdyssey />

      {/* Game Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/quiz?mode=classique"
          className="group relative overflow-hidden glass-card !rounded-2xl p-6 hover:bg-white/[0.04] transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-neon-cyan/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="text-lg font-bold text-neon-cyan mb-1">Classique</h3>
            <p className="text-slate-500 text-sm">10 questions tranquilles avec timer de 15s par question.</p>
          </div>
        </Link>
        <Link
          href="/quiz?mode=blitz"
          className="group relative overflow-hidden glass-card !rounded-2xl p-6 hover:bg-white/[0.04] transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-amber-400/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-lg font-bold text-amber-400 mb-1">Blitz</h3>
            <p className="text-slate-500 text-sm">60 secondes au chrono pour marquer un max de points !</p>
          </div>
        </Link>
        <Link
          href="/quiz?mode=mort-subite"
          className="group relative overflow-hidden glass-card !rounded-2xl p-6 hover:bg-white/[0.04] transition-all hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-neon-rose/30"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-rose/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-4xl mb-3">💀</div>
            <h3 className="text-lg font-bold text-neon-rose mb-1">Mort Subite</h3>
            <p className="text-slate-500 text-sm">Première erreur = fin de partie. Combien tiendrez-vous ?</p>
          </div>
        </Link>
      </div>

      {/* Dynamic Stats */}
      <StatsGrid />

      {/* Revision CTA */}
      <RevisionCta />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Categories */}
        <div className="glass-card !rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <span>📚</span> Catégories
          </h2>
          <div className="space-y-2">
            {categories.map((cat) => {
              const colors = categoryColors[cat.name] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "❓" };
              const progress = Math.min(100, Math.round((cat.questions / 50) * 100));
              const isFeatured = FEATURED_CATEGORIES.includes(cat.name);

              return (
                <Link
                  key={cat.name}
                  href={`/quiz?category=${cat.name}`}
                  className={`group relative flex items-center gap-4 rounded-xl transition-all duration-200
                    hover:scale-[1.025] hover:z-10 active:scale-[0.98]
                    ${isFeatured
                      ? "p-4 bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/[0.08] hover:border-neon-cyan/40 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-neon-cyan/5"
                      : "p-3 hover:bg-white/[0.04] hover:shadow-md hover:shadow-neon-cyan/[0.03]"
                    }`}
                >
                  {/* Neon highlight on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-cyan/[0.03] to-neon-rose/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div
                    className={`relative flex-shrink-0 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
                      isFeatured ? "w-12 h-12 text-xl" : "w-10 h-10 text-lg"
                    }`}
                  >
                    {colors.icon}
                  </div>
                  <div className="relative flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium group-hover:text-white transition-colors ${
                        isFeatured ? `${colors.text} text-base` : colors.text
                      }`}>
                        {cat.name}
                      </span>
                      {isFeatured && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/20 whitespace-nowrap">
                          🔥 TENDANCE
                        </span>
                      )}
                      <span className="ml-auto text-slate-600 text-xs flex-shrink-0">{cat.questions}q</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                        style={{
                          width: `${progress}%`,
                          boxShadow: "0 0 8px rgba(0, 240, 255, 0.3)",
                        }}
                      />
                    </div>
                  </div>
                  <span className="relative text-slate-700 group-hover:text-neon-cyan group-hover:translate-x-1 transition-all duration-200 text-lg">&rarr;</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* How XP Works */}
        <div className="glass-card !rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <span>✨</span> Système XP
          </h2>
          <div className="space-y-4">
            {[
              { icon: "✅", label: "Bonne réponse", value: "+10 XP", color: "text-green-400" },
              { icon: "🔥", label: "Bonus streak", value: "+5 XP / streak", color: "text-neon-rose" },
              { icon: "🎮", label: "Partie terminée", value: "+20 XP", color: "text-neon-cyan" },
              { icon: "💯", label: "Sans faute", value: "+50 XP", color: "text-yellow-400" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <span className="text-2xl">{item.icon}</span>
                <div className="flex-1">
                  <span className="text-slate-300 text-sm font-medium">{item.label}</span>
                </div>
                <span className={`font-bold text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <DailyBanner />

      {/* Footer */}
      <div className="mt-12 pt-6 border-t border-white/[0.04] flex items-center justify-center gap-4 text-xs text-slate-700 pb-4">
        <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">
          Mentions Légales
        </Link>
        <span>&middot;</span>
        <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">
          Confidentialité
        </Link>
        <span>&middot;</span>
        <span>Vibe Quiz Master &copy; 2026</span>
      </div>
    </div>
  );
}
