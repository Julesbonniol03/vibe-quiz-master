"use client";

import { useState } from "react";
import Link from "next/link";
type Period = "week" | "month" | "alltime";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  gamesPlayed: number;
  accuracy: number;
  badge: string;
  isPremium: boolean;
  isYou?: boolean;
}

const leaderboardData: Record<Period, LeaderboardEntry[]> = {
  week: [
    { rank: 1, name: "Alexandre M.", avatar: "🧑‍💻", score: 4820, streak: 18, gamesPlayed: 42, accuracy: 91, badge: "🏆", isPremium: true },
    { rank: 2, name: "Sophie L.", avatar: "👩‍🔬", score: 4210, streak: 14, gamesPlayed: 38, accuracy: 87, badge: "⭐", isPremium: true },
    { rank: 3, name: "Thomas K.", avatar: "👨‍🎨", score: 3980, streak: 11, gamesPlayed: 35, accuracy: 84, badge: "🥉", isPremium: false },
    { rank: 4, name: "Marie P.", avatar: "👩‍🏫", score: 3640, streak: 9, gamesPlayed: 31, accuracy: 79, badge: "🎯", isPremium: false },
    { rank: 5, name: "Lucas B.", avatar: "🧑‍🚀", score: 3420, streak: 8, gamesPlayed: 29, accuracy: 76, badge: "🔥", isPremium: true },
    { rank: 6, name: "Emma R.", avatar: "👩‍🎤", score: 3210, streak: 7, gamesPlayed: 28, accuracy: 73, badge: "⚡", isPremium: false },
    { rank: 7, name: "Julien F.", avatar: "👨‍💼", score: 2980, streak: 6, gamesPlayed: 25, accuracy: 71, badge: "💫", isPremium: false },
    { rank: 8, name: "Camille D.", avatar: "👩‍🍳", score: 2760, streak: 5, gamesPlayed: 23, accuracy: 68, badge: "🌟", isPremium: true },
    { rank: 9, name: "Nathan V.", avatar: "👨‍🎓", score: 2540, streak: 4, gamesPlayed: 21, accuracy: 65, badge: "✨", isPremium: false },
    { rank: 10, name: "Vous", avatar: "😎", score: 2480, streak: 12, gamesPlayed: 34, accuracy: 74, badge: "🎮", isPremium: false, isYou: true },
  ],
  month: [
    { rank: 1, name: "Sophie L.", avatar: "👩‍🔬", score: 18200, streak: 22, gamesPlayed: 160, accuracy: 89, badge: "🏆", isPremium: true },
    { rank: 2, name: "Alexandre M.", avatar: "🧑‍💻", score: 17640, streak: 19, gamesPlayed: 152, accuracy: 87, badge: "⭐", isPremium: true },
    { rank: 3, name: "Emma R.", avatar: "👩‍🎤", score: 15820, streak: 16, gamesPlayed: 138, accuracy: 83, badge: "🥉", isPremium: false },
    { rank: 4, name: "Lucas B.", avatar: "🧑‍🚀", score: 14910, streak: 13, gamesPlayed: 125, accuracy: 81, badge: "🎯", isPremium: true },
    { rank: 5, name: "Thomas K.", avatar: "👨‍🎨", score: 13750, streak: 12, gamesPlayed: 118, accuracy: 78, badge: "🔥", isPremium: false },
    { rank: 6, name: "Camille D.", avatar: "👩‍🍳", score: 12840, streak: 10, gamesPlayed: 109, accuracy: 76, badge: "⚡", isPremium: true },
    { rank: 7, name: "Vous", avatar: "😎", score: 11200, streak: 12, gamesPlayed: 98, accuracy: 74, badge: "🎮", isPremium: false, isYou: true },
    { rank: 8, name: "Marie P.", avatar: "👩‍🏫", score: 10950, streak: 9, gamesPlayed: 95, accuracy: 72, badge: "💫", isPremium: false },
    { rank: 9, name: "Julien F.", avatar: "👨‍💼", score: 9820, streak: 7, gamesPlayed: 88, accuracy: 69, badge: "🌟", isPremium: false },
    { rank: 10, name: "Nathan V.", avatar: "👨‍🎓", score: 8640, streak: 6, gamesPlayed: 79, accuracy: 66, badge: "✨", isPremium: false },
  ],
  alltime: [
    { rank: 1, name: "QuantumBrain", avatar: "🤖", score: 98420, streak: 47, gamesPlayed: 892, accuracy: 95, badge: "👑", isPremium: true },
    { rank: 2, name: "Sophie L.", avatar: "👩‍🔬", score: 87310, streak: 38, gamesPlayed: 761, accuracy: 91, badge: "🏆", isPremium: true },
    { rank: 3, name: "Alexandre M.", avatar: "🧑‍💻", score: 76890, streak: 34, gamesPlayed: 684, accuracy: 89, badge: "⭐", isPremium: true },
    { rank: 4, name: "MindMaster99", avatar: "🧙", score: 65420, streak: 29, gamesPlayed: 578, accuracy: 87, badge: "🥉", isPremium: true },
    { rank: 5, name: "Emma R.", avatar: "👩‍🎤", score: 54810, streak: 24, gamesPlayed: 495, accuracy: 84, badge: "🎯", isPremium: false },
    { rank: 6, name: "Lucas B.", avatar: "🧑‍🚀", score: 48650, streak: 21, gamesPlayed: 441, accuracy: 82, badge: "🔥", isPremium: true },
    { rank: 7, name: "QuizKing", avatar: "👑", score: 43290, streak: 19, gamesPlayed: 398, accuracy: 80, badge: "⚡", isPremium: true },
    { rank: 8, name: "Thomas K.", avatar: "👨‍🎨", score: 38140, streak: 17, gamesPlayed: 352, accuracy: 78, badge: "💫", isPremium: false },
    { rank: 9, name: "Camille D.", avatar: "👩‍🍳", score: 34870, streak: 15, gamesPlayed: 318, accuracy: 76, badge: "🌟", isPremium: true },
    { rank: 10, name: "Vous", avatar: "😎", score: 24800, streak: 12, gamesPlayed: 340, accuracy: 74, badge: "🎮", isPremium: false, isYou: true },
  ],
};

const periodLabels: Record<Period, string> = {
  week: "Cette semaine",
  month: "Ce mois",
  alltime: "All Time",
};

const podiumColors = [
  "from-yellow-500 to-amber-400",
  "from-slate-400 to-slate-300",
  "from-amber-600 to-amber-500",
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>("week");

  const data = leaderboardData[period];
  const top3 = data.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🏆</div>
        <h1 className="text-3xl font-bold text-white mb-2">Classement</h1>
        <p className="text-slate-400">Les meilleurs joueurs de Vibe Quiz Master</p>
      </div>

      {/* Period selector */}
      <div className="flex justify-center mb-8">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
          {(["week", "month", "alltime"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 shadow-lg"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-4 mb-10">
        {[top3[1], top3[0], top3[2]].map((entry, displayIdx) => {
          const heights = ["h-24", "h-32", "h-20"];
          const sizes = ["w-16 h-16", "w-20 h-20", "w-14 h-14"];
          return (
            <div key={entry.rank} className="flex flex-col items-center gap-2">
              <div className="text-2xl">{entry.badge}</div>
              <div
                className={`${sizes[displayIdx]} rounded-2xl bg-gradient-to-br ${podiumColors[entry.rank - 1]} flex items-center justify-center text-2xl shadow-lg`}
              >
                {entry.avatar}
              </div>
              <div className="text-center">
                <div className="text-white text-sm font-semibold">{entry.name.split(" ")[0]}</div>
                <div className="text-indigo-400 text-xs font-bold">{entry.score.toLocaleString()}</div>
              </div>
              <div
                className={`${heights[displayIdx]} w-full min-w-[80px] rounded-t-xl bg-gradient-to-t ${podiumColors[entry.rank - 1]} opacity-30 flex items-start justify-center pt-2`}
              >
                <span className="text-white font-bold text-lg">#{entry.rank}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full ranking */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-6">
        <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 text-xs text-slate-500 font-medium uppercase tracking-wider px-6 py-3 border-b border-white/5">
          <span className="w-8">#</span>
          <span>Joueur</span>
          <span className="w-20 text-center hidden sm:block">Score</span>
          <span className="w-20 text-center hidden md:block">Streak</span>
          <span className="w-20 text-center">Précision</span>
        </div>

        {data.map((entry) => (
          <div
            key={entry.rank}
            className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-0 items-center px-6 py-4 border-b border-white/5 last:border-0 transition-colors ${
              entry.isYou
                ? "bg-indigo-500/10 border-l-2 border-indigo-500"
                : "hover:bg-white/3"
            }`}
          >
            <span
              className={`w-8 font-bold text-sm ${
                entry.rank === 1
                  ? "text-yellow-400"
                  : entry.rank === 2
                  ? "text-slate-300"
                  : entry.rank === 3
                  ? "text-amber-500"
                  : "text-slate-500"
              }`}
            >
              {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
            </span>

            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
                {entry.avatar}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm truncate ${entry.isYou ? "text-indigo-300" : "text-white"}`}>
                    {entry.name}
                  </span>
                  {entry.isPremium && (
                    <span className="text-yellow-400 text-xs">⭐</span>
                  )}
                  {entry.isYou && (
                    <span className="bg-indigo-500/30 text-indigo-400 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Vous
                    </span>
                  )}
                </div>
                <div className="text-slate-500 text-xs">{entry.gamesPlayed} parties</div>
              </div>
            </div>

            <div className="w-20 text-center hidden sm:block">
              <span className="text-indigo-400 font-bold text-sm">{entry.score.toLocaleString()}</span>
            </div>

            <div className="w-20 text-center hidden md:block">
              <span className="text-rose-400 text-sm font-medium">{entry.streak} 🔥</span>
            </div>

            <div className="w-20 text-center">
              <span
                className={`text-sm font-medium ${
                  entry.accuracy >= 85
                    ? "text-green-400"
                    : entry.accuracy >= 70
                    ? "text-yellow-400"
                    : "text-rose-400"
                }`}
              >
                {entry.accuracy}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-bold rounded-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20"
        >
          Améliorer mon rang 🚀
        </Link>
        <p className="text-slate-500 text-sm mt-3">Classement mis à jour en temps réel</p>
      </div>
    </div>
  );
}
