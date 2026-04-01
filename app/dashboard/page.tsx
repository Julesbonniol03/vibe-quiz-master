import Link from "next/link";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { categoryColors } from "@/lib/questions";
import { StatsGrid, XpBar, RevisionCta, DailyBanner, DailyOdyssey, ActualitesGrid, PaywallMini, BentoTile, NeonLink } from "./DashboardClient";

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

/* ─── Bento tile glass style ─── */
const TILE_BASE = "relative overflow-hidden rounded-2xl backdrop-blur-xl border border-white/[0.04] transition-all hover:scale-[1.015] active:scale-[0.985]";
const TILE_SHADOW = "0 4px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px rgba(255,255,255,0.02)";

export default function DashboardPage() {
  const categories = loadCategories();
  const totalQ = categories.reduce((sum, c) => sum + c.questions, 0);
  const actualites = loadActualites();

  const featured = categories.filter((c) => FEATURED_CATEGORIES.includes(c.name));
  const regular = categories.filter((c) => !FEATURED_CATEGORIES.includes(c.name));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      {/* ═══════ HERO TILE ═══════ */}
      <div
        className={`${TILE_BASE} p-6 mb-5`}
        style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.03), rgba(255,255,255,0.008))", boxShadow: TILE_SHADOW }}
      >
        {/* Mesh orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-28 -right-28 w-64 h-64 bg-neon-green/[0.04] rounded-full blur-[100px]" />
          <div className="absolute -bottom-28 -left-28 w-64 h-64 bg-neon-red/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="absolute inset-0 shimmer-bg rounded-2xl pointer-events-none" />

        <div className="relative z-10">
          <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-[0.2em] mb-1.5">Bienvenue sur</p>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tight">
            Teub&eacute;<span className="text-neon-green animate-neon-flicker">.</span>
          </h1>
          <p className="text-slate-500 text-sm mb-4 nums">
            {totalQ} questions &middot; {categories.length} cat&eacute;gories
          </p>
          <XpBar />
          <div className="flex gap-2.5 mt-5">
            <NeonLink
              href="/quiz"
              className="flex-1 py-3 text-center bg-gradient-to-r from-neon-green to-neon-green/70 text-obsidian-950 font-bold text-sm rounded-xl hover:brightness-110 transition-all active:scale-[0.97]"
              style={{ boxShadow: "0 0 24px rgba(0,255,65,0.18), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
            >
              Jouer →
            </NeonLink>
            <Link
              href="/leaderboard"
              className="py-3 px-5 bg-white/[0.03] border border-white/[0.06] text-white font-semibold text-sm rounded-xl hover:bg-white/[0.06] transition-all active:scale-[0.97]"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
              🏆
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════ BENTO GRID PRINCIPALE ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">

        {/* ── Tuile dominante : Actualités 2025-2026 (col-span-2, row-span-2) ── */}
        {featured[0] && (() => {
          const cat = featured.find((c) => c.name.includes("Actualit")) || featured[0];
          const colors = categoryColors[cat.name] || { bg: "bg-lime-500/20", text: "text-lime-400", border: "border-lime-500/30", icon: "📰" };
          return (
            <BentoTile
              href={`/quiz?category=${cat.name}`}
              className={`${TILE_BASE} col-span-2 row-span-2 p-6 group`}
              style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
            >
              {/* Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/[0.06] to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-2xl`}>
                      {colors.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neon-red/10 text-neon-red border border-neon-red/20">
                      🔥 TENDANCE
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold ${colors.text} mb-1.5 group-hover:text-white transition-colors`}>{cat.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Questions sur l&apos;actualit&eacute; br&ucirc;lante. Mis &agrave; jour chaque semaine.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-slate-600 text-xs nums">{cat.questions} questions</span>
                  <span className="text-slate-600 group-hover:text-neon-green group-hover:translate-x-1 transition-all text-lg">&rarr;</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-white/[0.04] rounded-full h-1 mt-2" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}>
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-lime-400 to-neon-green"
                    style={{ width: `${Math.min(100, Math.round((cat.questions / 50) * 100))}%`, boxShadow: "0 0 6px rgba(0,255,65,0.3)" }}
                  />
                </div>
              </div>
            </BentoTile>
          );
        })()}

        {/* ── Mode &Eacute;pop&eacute;e ── */}
        <Link
          href="/story-mode"
          className={`${TILE_BASE} col-span-2 p-4 group`}
          style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl flex-shrink-0">📖</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-white text-sm">Mode &Eacute;pop&eacute;e</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/20">NOUVEAU</span>
              </div>
              <p className="text-slate-500 text-xs truncate">L&apos;Odyss&eacute;e de la Culture G</p>
            </div>
            <span className="text-slate-700 group-hover:text-purple-400 group-hover:translate-x-1 transition-all">&rarr;</span>
          </div>
        </Link>

        {/* ── Tour du Monde ── */}
        <Link
          href="/tour-du-monde"
          className={`${TILE_BASE} col-span-2 p-4 group`}
          style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-xl flex-shrink-0">🌍</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-bold text-white text-sm">Tour du Monde</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">NOUVEAU</span>
              </div>
              <p className="text-slate-500 text-xs truncate">Capitales &amp; G&eacute;ographie</p>
            </div>
            <span className="text-slate-700 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all">&rarr;</span>
          </div>
        </Link>
      </div>

      {/* ═══════ QUÊTE DU JOUR ═══════ */}
      <DailyOdyssey />

      {/* ═══════ BENTO: TUILE FRANÇAIS + MODES DE JEU ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">

        {/* ── Tuile dominante : Maîtrise du Français (col-span-2, row-span-2) ── */}
        {(() => {
          const cat = featured.find((c) => c.name.includes("Fran")) || featured[1];
          if (!cat) return null;
          const colors = categoryColors[cat.name] || { bg: "bg-blue-600/20", text: "text-blue-300", border: "border-blue-500/30", icon: "📝" };
          return (
            <BentoTile
              href={`/quiz?category=${cat.name}`}
              className={`${TILE_BASE} col-span-2 row-span-2 p-6 group`}
              style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.06] to-transparent opacity-60 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-11 h-11 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-2xl`}>
                      {colors.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/20">
                      ✨ POPULAIRE
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold ${colors.text} mb-1.5 group-hover:text-white transition-colors`}>{cat.name}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Orthographe, conjugaison, vocabulaire. Teste ta ma&icirc;trise de la langue.
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-slate-600 text-xs nums">{cat.questions} questions</span>
                  <span className="text-slate-600 group-hover:text-neon-green group-hover:translate-x-1 transition-all text-lg">&rarr;</span>
                </div>
                <div className="w-full bg-white/[0.04] rounded-full h-1 mt-2" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}>
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-blue-400 to-neon-green"
                    style={{ width: `${Math.min(100, Math.round((cat.questions / 50) * 100))}%`, boxShadow: "0 0 6px rgba(0,255,65,0.3)" }}
                  />
                </div>
              </div>
            </BentoTile>
          );
        })()}

        {/* ── 3 Modes de jeu (colonne droite, empilés) ── */}
        <BentoTile
          href="/quiz?mode=classique"
          className={`${TILE_BASE} col-span-1 p-4 group`}
          style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-green/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10">
            <div className="text-2xl mb-2">📝</div>
            <h3 className="text-sm font-bold text-neon-green mb-0.5">Classique</h3>
            <p className="text-slate-600 text-[11px] leading-tight">10 questions &middot; 15s</p>
          </div>
        </BentoTile>

        <BentoTile
          href="/quiz?mode=blitz"
          className={`${TILE_BASE} col-span-1 p-4 group`}
          style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="text-sm font-bold text-amber-400 mb-0.5">Blitz</h3>
            <p className="text-slate-600 text-[11px] leading-tight">60s chrono</p>
          </div>
        </BentoTile>

        <BentoTile
          href="/quiz?mode=mort-subite"
          className={`${TILE_BASE} col-span-1 p-4 group`}
          style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-neon-red/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10">
            <div className="text-2xl mb-2">💀</div>
            <h3 className="text-sm font-bold text-neon-red mb-0.5">Mort Subite</h3>
            <p className="text-slate-600 text-[11px] leading-tight">0 erreur tol&eacute;r&eacute;e</p>
          </div>
        </BentoTile>

        <BentoTile
          href="/quiz?mode=daily"
          className={`${TILE_BASE} col-span-1 p-4 group`}
          style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="text-sm font-bold text-purple-400 mb-0.5">D&eacute;fi du Jour</h3>
            <p className="text-slate-600 text-[11px] leading-tight">5 questions</p>
          </div>
        </BentoTile>
      </div>

      {/* ═══════ ACTUALITÉS DU JOUR ═══════ */}
      {actualites.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>📰</span> Actualit&eacute; du Jour
            </h2>
            <span className="text-xs text-slate-600 nums">{actualites[0]?.date}</span>
          </div>
          <ActualitesGrid items={actualites} />
        </div>
      )}

      {/* Premium lock */}
      <PaywallMini />

      {/* ═══════ STATS BENTO ═══════ */}
      <StatsGrid />

      {/* Revision CTA */}
      <RevisionCta />

      {/* ═══════ BENTO: TOUTES CATÉGORIES ═══════ */}
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <span>📚</span> Toutes les cat&eacute;gories
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {regular.map((cat) => {
            const colors = categoryColors[cat.name] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "❓" };
            const progress = Math.min(100, Math.round((cat.questions / 50) * 100));

            return (
              <Link
                key={cat.name}
                href={`/quiz?category=${cat.name}`}
                className={`${TILE_BASE} p-4 group`}
                style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-9 h-9 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center text-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      {colors.icon}
                    </div>
                    <span className="text-slate-600 text-[10px] nums ml-auto">{cat.questions}q</span>
                  </div>
                  <span className={`text-sm font-semibold ${colors.text} group-hover:text-white transition-colors line-clamp-1`}>{cat.name}</span>
                  <div className="w-full bg-white/[0.04] rounded-full h-1 mt-2" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)" }}>
                    <div
                      className="h-1 rounded-full bg-gradient-to-r from-neon-green/70 to-neon-green"
                      style={{ width: `${progress}%`, boxShadow: "0 0 4px rgba(0,255,65,0.2)" }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══════ SYSTÈME XP ═══════ */}
      <div
        className={`${TILE_BASE} p-6 mb-5`}
        style={{ background: "rgba(255,255,255,0.025)", boxShadow: TILE_SHADOW }}
      >
        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <span>✨</span> Syst&egrave;me XP
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "✅", label: "Bonne r\u00e9ponse", value: "+10 XP", color: "text-green-400" },
            { icon: "🔥", label: "Bonus s\u00e9rie", value: "+5 XP", color: "text-neon-red" },
            { icon: "🎮", label: "Partie termin\u00e9e", value: "+20 XP", color: "text-neon-green" },
            { icon: "💯", label: "Sans faute", value: "+50 XP", color: "text-yellow-400" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04]"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-slate-400 text-xs block truncate">{item.label}</span>
                <span className={`font-bold text-sm nums ${item.color}`}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <DailyBanner />

      {/* Footer */}
      <div className="mt-10 pt-5 border-t border-white/[0.03] flex items-center justify-center gap-4 text-xs text-slate-700 pb-4">
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
