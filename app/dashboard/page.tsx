import Link from "next/link";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { categoryColors } from "@/lib/questions";
import { StatsGrid, XpBar, RevisionCta, DailyBanner, DailyOdyssey, ActualitesGrid, PaywallMini } from "./DashboardClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadActualites(): any[] {
  try {
    const filePath = join(process.cwd(), "data", "actualites-du-jour.json");
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

const FEATURED_CATEGORIES = ["Actualit\u00e9s 2025-2026", "Ma\u00eetrise du Fran\u00e7ais"];

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
  const actualites = loadActualites();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Hero — obsidian premium */}
      <div className="relative overflow-hidden card-obsidian p-6 mb-6">
        {/* Mesh glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-28 -right-28 w-64 h-64 bg-neon-cyan/[0.04] rounded-full blur-[100px]" />
          <div className="absolute -bottom-28 -left-28 w-64 h-64 bg-neon-rose/[0.03] rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#6366f1]/[0.02] rounded-full blur-[60px]" />
        </div>
        {/* Shimmer overlay */}
        <div className="absolute inset-0 shimmer-bg rounded-3xl pointer-events-none" />

        <div className="relative z-10">
          <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5">Bienvenue sur</p>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
            Teub&eacute;<span className="text-neon-cyan animate-neon-flicker">.</span>
          </h1>
          <p className="text-slate-500 text-sm mb-4">
            {totalQ} questions &middot; {categories.length} cat&eacute;gories
          </p>
          <XpBar />
          <div className="flex gap-2.5 mt-5">
            <Link
              href="/quiz"
              className="flex-1 py-3 text-center bg-gradient-to-r from-neon-cyan via-[#6366f1] to-neon-rose text-white font-bold text-sm rounded-xl hover:opacity-90 transition-all active:scale-[0.97]"
              style={{ boxShadow: "0 0 20px rgba(0,240,255,0.15), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}
            >
              Jouer →
            </Link>
            <Link
              href="/leaderboard"
              className="py-3 px-5 bg-white/[0.03] border border-white/[0.06] text-white font-semibold text-sm rounded-xl hover:bg-white/[0.06] transition-all active:scale-[0.97]"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
            >
              🏆
            </Link>
          </div>
        </div>
      </div>

      {/* Mode &Eacute;pop&eacute;e CTA */}
      <Link
        href="/story-mode"
        className="group relative block overflow-hidden rounded-2xl border border-purple-500/15 bg-gradient-to-r from-purple-500/[0.04] to-neon-cyan/[0.02] p-5 mb-8 hover:border-purple-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-neon-cyan/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            📖
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-white text-sm">Mode &Eacute;pop&eacute;e</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/20">
                NOUVEAU
              </span>
            </div>
            <p className="text-slate-500 text-xs">L&apos;Odyss&eacute;e de la Culture G — De Rome au Moyen-&Acirc;ge</p>
          </div>
          <span className="text-slate-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all text-lg">&rarr;</span>
        </div>
      </Link>

      {/* Tour du Monde CTA */}
      <Link
        href="/tour-du-monde"
        className="group relative block overflow-hidden rounded-2xl border border-emerald-500/15 bg-gradient-to-r from-emerald-500/[0.04] to-neon-cyan/[0.02] p-5 mb-8 hover:border-emerald-500/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.03)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.03] to-neon-cyan/[0.03] opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl flex-shrink-0">
            🌍
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-white text-sm">Tour du Monde</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                NOUVEAU
              </span>
            </div>
            <p className="text-slate-500 text-xs">Trouve les pays sur la carte — Capitales &amp; G&eacute;ographie</p>
          </div>
          <span className="text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all text-lg">&rarr;</span>
        </div>
      </Link>

      {/* Daily Odyssey */}
      <DailyOdyssey />

      {/* Actualit&eacute; du Jour */}
      {actualites.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span>📰</span> Actualit&eacute; du Jour
            </h2>
            <span className="text-xs text-slate-600">{actualites[0]?.date}</span>
          </div>
          <ActualitesGrid items={actualites} />
          <p className="text-xs text-slate-700 text-center mt-3">
            Appuie sur une carte pour en savoir plus &middot; Contenu &eacute;ditorial
          </p>
        </div>
      )}

      {/* Premium lock for Actualit&eacute;s 2026 */}
      <PaywallMini />

      {/* Game Modes — obsidian cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/quiz?mode=classique"
          className="group relative overflow-hidden rounded-2xl p-6 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/[0.04] hover:border-neon-cyan/20"
          style={{ background: "linear-gradient(155deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)" }}
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
          className="group relative overflow-hidden rounded-2xl p-6 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/[0.04] hover:border-amber-400/20"
          style={{ background: "linear-gradient(155deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)" }}
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
          className="group relative overflow-hidden rounded-2xl p-6 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/[0.04] hover:border-neon-rose/20"
          style={{ background: "linear-gradient(155deg, rgba(255,255,255,0.025), rgba(255,255,255,0.008))", boxShadow: "0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-rose/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <div className="text-4xl mb-3">💀</div>
            <h3 className="text-lg font-bold text-neon-rose mb-1">Mort Subite</h3>
            <p className="text-slate-500 text-sm">Premi&egrave;re erreur = fin de partie. Combien tiendrez-vous ?</p>
          </div>
        </Link>
      </div>

      {/* Dynamic Stats */}
      <StatsGrid />

      {/* Revision CTA */}
      <RevisionCta />

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Categories */}
        <div className="card-obsidian p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <span>📚</span> Cat&eacute;gories
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
                      ? "p-4 bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/[0.06] hover:border-neon-cyan/30 hover:bg-white/[0.05]"
                      : "p-3 hover:bg-white/[0.03]"
                    }`}
                  style={isFeatured ? { boxShadow: "0 2px 12px rgba(0,0,0,0.2)" } : undefined}
                >
                  {/* Neon highlight on hover */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-cyan/[0.02] to-neon-rose/[0.01] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

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
                    <div className="w-full bg-white/[0.04] rounded-full h-1.5" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.3)" }}>
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-neon-cyan to-neon-rose transition-all duration-300 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                        style={{
                          width: `${progress}%`,
                          boxShadow: "0 0 6px rgba(0, 240, 255, 0.2)",
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
        <div className="card-obsidian p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <span>✨</span> Syst&egrave;me XP
          </h2>
          <div className="space-y-4">
            {[
              { icon: "✅", label: "Bonne r\u00e9ponse", value: "+10 XP", color: "text-green-400" },
              { icon: "🔥", label: "Bonus s\u00e9rie", value: "+5 XP / s\u00e9rie", color: "text-neon-rose" },
              { icon: "🎮", label: "Partie termin\u00e9e", value: "+20 XP", color: "text-neon-cyan" },
              { icon: "💯", label: "Sans faute", value: "+50 XP", color: "text-yellow-400" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]"
                style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)" }}
              >
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
      <div className="mt-12 pt-6 border-t border-white/[0.03] flex items-center justify-center gap-4 text-xs text-slate-700 pb-4">
        <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">
          Mentions L&eacute;gales
        </Link>
        <span>&middot;</span>
        <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">
          Confidentialit&eacute;
        </Link>
        <span>&middot;</span>
        <span>Teub&eacute; &copy; 2026</span>
      </div>
    </div>
  );
}
