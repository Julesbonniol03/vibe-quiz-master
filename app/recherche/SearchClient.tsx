"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { categoryColors } from "@/lib/questions";

interface Question {
  id: number;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface SearchResponse {
  questions: Question[];
  total: number;
  returned: number;
  categories: string[];
}

const DIFFICULTY_CONFIG = {
  easy: { label: "Facile", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  medium: { label: "Moyen", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  hard: { label: "Difficile", color: "text-neon-red", bg: "bg-neon-red/10", border: "border-neon-red/20" },
};

export default function SearchClient() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("");
  const [results, setResults] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery && category === "All" && !difficulty) {
        setResults([]);
        setTotal(0);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "30" });
        if (debouncedQuery) params.set("q", debouncedQuery);
        if (category && category !== "All") params.set("category", category);
        if (difficulty) params.set("difficulty", difficulty);

        const res = await fetch(`/api/questions/search?${params}`);
        if (!res.ok) throw new Error("Failed");
        const data: SearchResponse = await res.json();
        setResults(data.questions);
        setTotal(data.total);
        if (data.categories.length > 0) setCategories(data.categories);
      } catch {
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery, category, difficulty]);

  useEffect(() => {
    // Load categories on mount
    fetch("/api/questions/search?limit=1")
      .then((r) => r.json())
      .then((data: SearchResponse) => {
        if (data.categories?.length > 0) setCategories(data.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleToggle = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const hasActiveFilter = !!debouncedQuery || category !== "All" || !!difficulty;
  const showHint = !loading && !hasActiveFilter;
  const showEmpty = !loading && results.length === 0 && hasActiveFilter;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pb-28">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          <span className="gradient-text">Recherche</span>
        </h1>
        <p className="text-slate-500 text-sm">Explorez les questions et découvrez les réponses</p>
      </div>

      {/* Search input */}
      <div className="relative mb-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
          <SearchSvg />
        </div>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher une question, une réponse…"
          className="w-full pl-11 pr-10 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:border-neon-green/30 focus:bg-white/[0.06] transition-all text-sm"
          style={{ caretColor: "#00FF41" }}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors text-sm"
          >
            ✕
          </button>
        )}
      </div>

      {/* Difficulty pills */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {(["", "easy", "medium", "hard"] as const).map((d) => {
          const cfg = d ? DIFFICULTY_CONFIG[d] : null;
          const label = cfg ? cfg.label : "Tous";
          const active = difficulty === d;
          return (
            <button
              key={d || "all-diff"}
              onClick={() => setDifficulty(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                active
                  ? cfg
                    ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                    : "bg-neon-green/10 border-neon-green/20 text-neon-green"
                  : "bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Category scroll pills */}
      {categories.length > 0 && (
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setCategory("All")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              category === "All"
                ? "bg-neon-green/10 border-neon-green/20 text-neon-green"
                : "bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-white"
            }`}
          >
            Toutes
          </button>
          {categories.map((cat) => {
            const colors = categoryColors[cat] || { icon: "❓", text: "text-slate-400" };
            const active = category === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-neon-green/10 border-neon-green/20 text-neon-green"
                    : "bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-white"
                }`}
              >
                <span>{colors.icon}</span>
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Results count */}
      {!loading && hasActiveFilter && (
        <p className="text-slate-600 text-xs mb-4 nums">
          {total} résultat{total !== 1 ? "s" : ""}
          {results.length < total && ` · ${results.length} affichés`}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card !rounded-2xl p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-24 bg-white/[0.06] rounded-lg" />
                <div className="h-5 w-14 bg-white/[0.06] rounded-lg" />
              </div>
              <div className="h-4 bg-white/[0.06] rounded w-3/4 mb-2" />
              <div className="h-4 bg-white/[0.06] rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Hint (no active search) */}
      {showHint && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-slate-500 text-sm">Tapez un mot-clé pour chercher</p>
          <p className="text-slate-700 text-xs mt-2">Questions, réponses, explications…</p>
        </div>
      )}

      {/* Empty state */}
      {showEmpty && (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-slate-500 text-sm">Aucun résultat trouvé</p>
          <button
            onClick={() => { setQuery(""); setCategory("All"); setDifficulty(""); }}
            className="mt-4 text-neon-green text-xs hover:underline"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {/* Results list */}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {results.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                expanded={expandedId === q.id}
                onToggle={() => handleToggle(q.id)}
                index={i}
              />
            ))}
          </AnimatePresence>
          {total > results.length && (
            <p className="text-center text-slate-700 text-xs py-4">
              Affinez votre recherche pour voir plus de résultats
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  question,
  expanded,
  onToggle,
  index,
}: {
  question: Question;
  expanded: boolean;
  onToggle: () => void;
  index: number;
}) {
  const colors = categoryColors[question.category] || {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    border: "border-slate-500/20",
    icon: "❓",
  };
  const diffCfg = DIFFICULTY_CONFIG[question.difficulty];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.18, delay: Math.min(index * 0.03, 0.3) }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left glass-card !rounded-2xl p-5 hover:bg-white/[0.03] transition-colors active:scale-[0.99] cursor-pointer"
      >
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span
            className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${colors.bg} border ${colors.border} ${colors.text} flex items-center gap-1`}
          >
            <span>{colors.icon}</span>
            <span>{question.category}</span>
          </span>
          <span
            className={`text-[10px] font-medium px-2 py-1 rounded-lg ${diffCfg.bg} border ${diffCfg.border} ${diffCfg.color}`}
          >
            {diffCfg.label}
          </span>
        </div>

        {/* Question */}
        <p className="text-white text-sm font-medium leading-relaxed mb-3">
          {question.question}
        </p>

        {/* Expand toggle row */}
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-xs">
            {expanded ? "Masquer la réponse" : "Voir la réponse"}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-slate-600 text-xs"
          >
            ↓
          </motion.span>
        </div>

        {/* Expanded section */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                {/* Options grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {question.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl text-xs font-medium border ${
                        i === question.correctIndex
                          ? "bg-green-500/10 border-green-500/20 text-green-400"
                          : "bg-white/[0.02] border-white/[0.05] text-slate-600"
                      }`}
                    >
                      {i === question.correctIndex && <span className="mr-1">✓</span>}
                      {opt}
                    </div>
                  ))}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
                    <p className="text-slate-400 text-xs leading-relaxed">
                      <span className="text-neon-green mr-1.5">💡</span>
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

function SearchSvg() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}
