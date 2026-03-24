import Link from "next/link";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { categoryColors } from "@/lib/questions";

const stats = [
  { label: "Score Total", value: "2 480", icon: "⭐", color: "text-yellow-400" },
  { label: "Parties Jouées", value: "34", icon: "🎮", color: "text-indigo-400" },
  { label: "Meilleur Streak", value: "12", icon: "🔥", color: "text-rose-400" },
  { label: "Précision", value: "74%", icon: "🎯", color: "text-green-400" },
];

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

const recentActivity = [
  { category: "Sport", score: 7, total: 8, streak: 5, time: "Il y a 2h" },
  { category: "Sciences", score: 5, total: 8, streak: 3, time: "Il y a 5h" },
  { category: "Histoire", score: 6, total: 8, streak: 6, time: "Hier" },
  { category: "Arts & Littérature", score: 4, total: 8, streak: 2, time: "Il y a 2j" },
];

export default function DashboardPage() {
  const categories = loadCategories();
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900/50 via-[#1a1030] to-rose-900/30 border border-white/10 p-8 mb-8">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">👋</span>
              <span className="text-slate-400 text-sm font-medium">Bienvenue de retour !</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Prêt à tester vos{" "}
              <span className="bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
                connaissances ?
              </span>
            </h1>
            <p className="text-slate-400 max-w-md">
              Choisissez une catégorie et défiez vos limites avec notre timer de 15 secondes. Construisez votre streak !
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/quiz"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30 whitespace-nowrap"
            >
              Jouer maintenant →
            </Link>
            <Link
              href="/leaderboard"
              className="px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all whitespace-nowrap"
            >
              Classement 🏆
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors"
          >
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className={`text-2xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Categories */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <span>📚</span> Catégories
          </h2>
          <div className="space-y-3">
            {categories.map((cat) => {
              const colors = categoryColors[cat.name] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "❓" };
              const progress = Math.min(100, Math.round((cat.questions / 50) * 100));
              return (
                <Link
                  key={cat.name}
                  href={`/quiz?category=${cat.name}`}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-lg flex-shrink-0`}
                  >
                    {colors.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${colors.text}`}>{cat.name}</span>
                      <span className="text-slate-500 text-xs">{cat.questions} questions</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-rose-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-slate-600 group-hover:text-slate-400 transition-colors text-lg">→</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
            <span>📊</span> Activité récente
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => {
              const colors = categoryColors[activity.category] || { bg: "bg-slate-500/20", text: "text-slate-400", border: "border-slate-500/30", icon: "❓" };
              const percent = Math.round((activity.score / activity.total) * 100);
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/3 border border-white/5"
                >
                  <div
                    className={`w-10 h-10 rounded-xl ${colors.bg} border ${colors.border} flex items-center justify-center text-lg flex-shrink-0`}
                  >
                    {colors.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-medium text-sm ${colors.text}`}>{activity.category}</span>
                      <span className="text-slate-500 text-xs">{activity.time}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white text-sm font-semibold">
                        {activity.score}/{activity.total}
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          percent >= 70 ? "text-green-400" : percent >= 50 ? "text-yellow-400" : "text-rose-400"
                        }`}
                      >
                        {percent}%
                      </span>
                      <span className="text-rose-400 text-xs flex items-center gap-1">
                        🔥 {activity.streak}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Challenge Banner */}
      <div className="bg-gradient-to-r from-rose-900/40 to-indigo-900/40 border border-rose-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-rose-400 text-sm font-semibold uppercase tracking-wider">Défi du jour</span>
              <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-0.5 rounded-full border border-rose-500/30">
                +2x points
              </span>
            </div>
            <p className="text-white font-semibold">Quiz Mixte — Toutes catégories confondues</p>
            <p className="text-slate-400 text-sm">10 questions · Timer 15s · Difficulté aléatoire</p>
          </div>
        </div>
        <Link
          href="/quiz?mode=daily"
          className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/20 whitespace-nowrap"
        >
          Relever le défi →
        </Link>
      </div>
    </div>
  );
}
