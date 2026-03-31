"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useHearts } from "@/hooks/useHearts";
import { useOptionalAuth } from "@/contexts/AuthContext";

const KEY_PREMIUM = "vqm_premium";

function loadPremium(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return JSON.parse(localStorage.getItem(KEY_PREMIUM) || "false");
  } catch {
    return false;
  }
}

// ─── DATA ───

const ADVANTAGES = [
  {
    icon: "❤️",
    gold: "✦",
    title: "Vies Illimitées",
    desc: "Plus besoin d'attendre la régénération. Jouez autant que vous voulez, sans interruption.",
    glow: "from-rose-500/20 to-red-500/20",
  },
  {
    icon: "🚫",
    gold: "✦",
    title: "Zéro Pub",
    desc: "Une expérience immersive, sans aucune interruption ni distraction.",
    glow: "from-amber-500/20 to-yellow-500/20",
  },
  {
    icon: "📰",
    gold: "✦",
    title: "Actualités 2026",
    desc: "Accès exclusif aux questions sur l'actualité la plus récente, mises à jour chaque semaine.",
    glow: "from-blue-500/20 to-indigo-500/20",
  },
  {
    icon: "🔥",
    gold: "✦",
    title: "Difficulté Expert Illimitée",
    desc: "Accès permanent au mode Expert dans toutes les catégories, sans limite de questions.",
    glow: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: "🤖",
    gold: "✦",
    title: "Explications IA",
    desc: "Chaque réponse est accompagnée d'une explication enrichie par intelligence artificielle.",
    glow: "from-purple-500/20 to-blue-500/20",
  },
  {
    icon: "⚡",
    gold: "✦",
    title: "Multiplicateur x3",
    desc: "Vos streaks rapportent jusqu'à 3x plus de XP pour grimper au classement.",
    glow: "from-rose-500/20 to-pink-500/20",
  },
];

type Plan = "monthly" | "annual" | "lifetime";

const PLANS: { id: Plan; name: string; price: string; period: string; badge?: string; highlight?: boolean; saving?: string; desc: string }[] = [
  {
    id: "monthly",
    name: "Mensuel",
    price: "4,99€",
    period: "/mois",
    desc: "Flexibilité totale, sans engagement.",
  },
  {
    id: "annual",
    name: "Annuel",
    price: "2,49€",
    period: "/mois",
    badge: "POPULAIRE",
    highlight: true,
    saving: "Économisez 50%",
    desc: "Facturé 29,90€/an. Le choix malin.",
  },
  {
    id: "lifetime",
    name: "À Vie",
    price: "49,90€",
    period: "une seule fois",
    badge: "MEILLEUR DEAL",
    saving: "Payez une fois, c'est fini",
    desc: "Accès permanent, pas d'abonnement.",
  },
];

// ─── ANIMATED MESH BACKGROUND ───

function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Mesh gradient orbs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,183,0,0.08) 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 30, -30, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,45,123,0.06) 0%, transparent 70%)",
        }}
      />
      <motion.div
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -20, 40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(255,200,0,0.05) 0%, transparent 70%)",
        }}
      />
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,183,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,183,0,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

// ─── MAIN PAGE ───

export default function PremiumPage() {
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");
  const [showActivated, setShowActivated] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setIsPremium(loadPremium());
    setHydrated(true);
  }, []);

  const heartsSystem = useHearts();
  const auth = useOptionalAuth();

  const activatePremium = useCallback(() => {
    localStorage.setItem(KEY_PREMIUM, "true");
    setIsPremium(true);
    setShowActivated(true);
    heartsSystem.refillHearts();
    // Sync premium status to Supabase if logged in
    if (auth?.updateProfileField) {
      auth.updateProfileField({ premium_status: true });
    }
  }, [heartsSystem, auth]);

  if (!hydrated) return null;

  // ─── ALREADY PREMIUM ───
  if (isPremium && !showActivated) {
    return (
      <div className="relative min-h-[80vh]">
        <MeshBackground />
        <div className="relative z-10 max-w-lg mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-7xl mb-6"
          >
            👑
          </motion.div>
          <h1 className="text-3xl font-bold mb-3">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
              Vous êtes Légende
            </span>
          </h1>
          <p className="text-slate-400 mb-8">Tous les avantages Premium sont actifs.</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {ADVANTAGES.slice(0, 3).map((a) => (
              <div key={a.title} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{a.icon}</div>
                <div className="text-amber-400/80 text-xs font-medium">{a.title}</div>
              </div>
            ))}
          </div>
          <Link
            href="/quiz"
            className="inline-block px-8 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold rounded-xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/20"
          >
            Jouer en mode Légende →
          </Link>
        </div>
      </div>
    );
  }

  // ─── JUST ACTIVATED (celebration) ───
  if (showActivated) {
    return (
      <div className="relative min-h-[80vh]">
        <MeshBackground />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-lg mx-auto px-4 py-16 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
            className="text-8xl mb-6 inline-block"
          >
            👑
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl font-bold mb-3"
          >
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
              Bienvenue, Légende !
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-lg mb-4"
          >
            Votre statut Premium est maintenant actif.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3 mb-8"
          >
            {ADVANTAGES.slice(0, 3).map((a, i) => (
              <motion.div
                key={a.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.15 }}
                className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-left"
              >
                <span className="text-2xl">{a.icon}</span>
                <div>
                  <span className="text-amber-400 font-semibold text-sm">{a.title}</span>
                  <span className="text-slate-500 text-xs ml-2">Débloqué</span>
                </div>
                <span className="ml-auto text-green-400">✓</span>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <Link
              href="/quiz"
              className="inline-block px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-lg rounded-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-500/25"
            >
              Commencer maintenant →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ─── SALES PAGE ───
  return (
    <div className="relative">
      <MeshBackground />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
            className="text-7xl mb-6 inline-block"
          >
            👑
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,183,0,0.3)]">
              Devenir Légende
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-xl mx-auto mb-2">
            Débloquez l&apos;expérience ultime de quiz.
          </p>
          <p className="text-amber-400/50 text-sm font-medium tracking-widest uppercase">
            Premium &middot; Exclusif &middot; Sans limites
          </p>
        </motion.div>

        {/* Advantages Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {ADVANTAGES.map((adv, i) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="group relative overflow-hidden rounded-2xl border border-amber-500/10 bg-black/40 p-6 hover:border-amber-500/30 transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${adv.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              <div className="relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{adv.icon}</span>
                  <span className="text-amber-400/30 text-xl font-bold">{adv.gold}</span>
                </div>
                <h3 className="font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {adv.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{adv.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-center text-2xl md:text-3xl font-bold text-white mb-2">
            Choisissez votre <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent">plan</span>
          </h2>
          <p className="text-center text-slate-500 mb-10">Un investissement dans votre savoir.</p>

          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan, i) => {
              const isSelected = selectedPlan === plan.id;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative cursor-pointer rounded-3xl p-8 transition-all duration-300 ${
                    plan.highlight
                      ? isSelected
                        ? "bg-gradient-to-br from-amber-900/40 via-black to-yellow-900/30 border-2 border-amber-400/60 shadow-2xl shadow-amber-500/15 scale-[1.03]"
                        : "bg-gradient-to-br from-amber-900/20 via-black to-yellow-900/10 border-2 border-amber-500/20 hover:border-amber-500/40"
                      : isSelected
                        ? "bg-black/60 border-2 border-amber-400/40 shadow-xl shadow-amber-500/10"
                        : "bg-black/40 border-2 border-white/[0.06] hover:border-amber-500/20"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-lg ${
                        plan.id === "lifetime"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-gradient-to-r from-amber-400 to-yellow-500 text-black"
                      }`}>
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6 mt-2">
                    <h3 className={`text-xl font-bold mb-1 ${isSelected ? "text-amber-300" : "text-white"}`}>
                      {plan.name}
                    </h3>
                    {plan.saving && (
                      <span className="text-green-400 text-xs font-semibold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                        {plan.saving}
                      </span>
                    )}
                  </div>

                  <div className="mb-4">
                    <span className={`text-4xl font-black ${isSelected ? "text-amber-300" : "text-white"}`}>
                      {plan.price}
                    </span>
                    <span className="text-slate-500 text-sm ml-2">{plan.period}</span>
                  </div>

                  <p className="text-slate-500 text-sm mb-6">{plan.desc}</p>

                  {/* Selected indicator */}
                  <div className={`w-full py-2 rounded-xl text-center text-sm font-semibold transition-all ${
                    isSelected
                      ? "bg-amber-400/10 border border-amber-400/30 text-amber-400"
                      : "bg-white/[0.03] border border-white/[0.06] text-slate-600"
                  }`}>
                    {isSelected ? "✓ Sélectionné" : "Choisir"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={activatePremium}
            className="relative px-12 py-5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 text-black font-black text-xl rounded-2xl shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-shadow"
          >
            <span className="relative z-10">Essayer Gratuitement →</span>
            {/* Glow pulse behind button */}
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 blur-xl -z-10"
            />
          </motion.button>
          <p className="text-slate-600 text-sm mt-4">
            ✓ 7 jours gratuits &middot; ✓ Sans carte bancaire &middot; ✓ Annulation instantanée
          </p>
        </motion.div>

        {/* Social Proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-amber-400 text-xl">★</span>
            ))}
          </div>
          <p className="text-slate-500 text-sm">
            Rejoint par <span className="text-amber-400 font-semibold">12 400+</span> joueurs Légende
          </p>
        </motion.div>

        {/* Comparison Table */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
            className="rounded-3xl border border-amber-500/10 bg-black/40 overflow-hidden mb-12"
          >
            <div className="grid grid-cols-3 text-center border-b border-white/[0.06]">
              <div className="p-4" />
              <div className="p-4 text-slate-400 font-semibold text-sm">Gratuit</div>
              <div className="p-4 bg-amber-500/5">
                <span className="bg-gradient-to-r from-amber-300 to-yellow-400 bg-clip-text text-transparent font-bold text-sm">
                  Légende 👑
                </span>
              </div>
            </div>
            {[
              { feature: "Vies", free: "5 (régén. 30min)", legend: "Illimitées ❤️" },
              { feature: "Actualités 2026", free: "—", legend: "✓" },
              { feature: "Mode Expert", free: "10/jour", legend: "Illimité" },
              { feature: "Explications IA", free: "—", legend: "✓" },
              { feature: "Badge doré", free: "—", legend: "👑" },
              { feature: "Multiplicateur XP", free: "x1", legend: "x3" },
            ].map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-3 text-center text-sm ${
                  i % 2 === 0 ? "" : "bg-white/[0.01]"
                } border-b border-white/[0.04]`}
              >
                <div className="p-3 text-slate-400 text-left pl-6">{row.feature}</div>
                <div className="p-3 text-slate-600">{row.free}</div>
                <div
                  className="p-3 text-amber-400 font-semibold bg-amber-500/[0.03]"
                  dangerouslySetInnerHTML={{ __html: row.legend }}
                />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="relative overflow-hidden rounded-3xl border border-amber-500/15 bg-gradient-to-br from-amber-900/20 via-black to-yellow-900/10 p-10 text-center"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/[0.06] rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-yellow-500/[0.04] rounded-full blur-[80px]" />
          </div>
          <div className="relative z-10">
            <div className="text-5xl mb-4">👑</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
                Prêt à devenir Légende ?
              </span>
            </h2>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">
              Rejoignez l&apos;élite des quiz et débloquez tout le potentiel de votre savoir.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={activatePremium}
              className="px-10 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-bold text-lg rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-amber-500/20"
            >
              Essayer Gratuitement →
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
