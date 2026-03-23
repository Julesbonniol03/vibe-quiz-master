"use client";

import { useState } from "react";
import Link from "next/link";

type BillingPeriod = "monthly" | "annual";

const features = [
  {
    icon: "🧠",
    title: "Questions illimitées",
    description: "Accès à plus de 1 000 questions exclusives dans toutes les catégories",
    free: false,
    premium: true,
  },
  {
    icon: "⚡",
    title: "Modes de jeu exclusifs",
    description: "Mode survie, défi chronométré et quiz multijoueur en temps réel",
    free: false,
    premium: true,
  },
  {
    icon: "📊",
    title: "Statistiques avancées",
    description: "Graphiques de progression, analyses de performance et points faibles",
    free: false,
    premium: true,
  },
  {
    icon: "🔥",
    title: "Multiplicateur de streak",
    description: "Gagnez jusqu'à 3x plus de points avec vos séries de bonnes réponses",
    free: false,
    premium: true,
  },
  {
    icon: "🏆",
    title: "Tournois hebdomadaires",
    description: "Participez aux compétitions exclusives avec des prix à gagner",
    free: false,
    premium: true,
  },
  {
    icon: "🎨",
    title: "Thèmes et avatars",
    description: "Personnalisez votre profil avec des skins et avatars exclusifs",
    free: false,
    premium: true,
  },
  {
    icon: "📚",
    title: "Cours et explications",
    description: "Accès aux explications détaillées et fiches de révision",
    free: false,
    premium: true,
  },
  {
    icon: "🚫",
    title: "Sans publicité",
    description: "Profitez d'une expérience fluide sans aucune interruption",
    free: false,
    premium: true,
  },
];

const freeFeatures = [
  "8 questions par catégorie",
  "4 catégories disponibles",
  "Classement général",
  "Statistiques de base",
  "Timer de 15 secondes",
];

const testimonials = [
  {
    name: "Alexandre M.",
    avatar: "🧑‍💻",
    text: "Vibe Quiz Master Premium m'a aidé à préparer mon concours de culture générale. Les 1000+ questions sont incroyables !",
    rating: 5,
    badge: "🏆 Top 1 cette semaine",
  },
  {
    name: "Sophie L.",
    avatar: "👩‍🔬",
    text: "Les statistiques avancées m'ont permis d'identifier mes lacunes. Mon score a progressé de 40% en un mois !",
    rating: 5,
    badge: "⭐ Membre Premium",
  },
  {
    name: "Camille D.",
    avatar: "👩‍🍳",
    text: "Les tournois hebdomadaires sont addictifs. J'ai gagné 3 fois le défi cette semaine grâce au multiplicateur de streak.",
    rating: 5,
    badge: "🔥 Streak record : 47",
  },
];

export default function PremiumPage() {
  const [billing, setBilling] = useState<BillingPeriod>("annual");

  const monthlyPrice = 7.99;
  const annualMonthlyPrice = 4.99;
  const annualTotal = (annualMonthlyPrice * 12).toFixed(2);
  const savings = Math.round(((monthlyPrice - annualMonthlyPrice) / monthlyPrice) * 100);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
          ⭐ Passez au niveau supérieur
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Débloquez{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent">
            tout le potentiel
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          Rejoignez plus de 50 000 passionnés qui utilisent Vibe Quiz Master Premium pour améliorer leur culture générale.
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mb-10">
        <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 gap-1 items-center">
          <button
            onClick={() => setBilling("monthly")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              billing === "monthly"
                ? "bg-white/10 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling("annual")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              billing === "annual"
                ? "bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Annuel
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full border border-green-500/30">
              -{savings}%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-16">
        {/* Free Plan */}
        <div
          className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-all"
        >
          <div className="mb-6">
            <div className="text-2xl mb-2">🎮</div>
            <h3 className="text-xl font-bold text-white mb-1">Gratuit</h3>
            <p className="text-slate-400 text-sm">Pour découvrir Vibe Quiz Master</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold text-white">0€</span>
            <span className="text-slate-400 text-sm ml-2">pour toujours</span>
          </div>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs text-slate-400 flex-shrink-0">
                  ✓
                </span>
                {f}
              </li>
            ))}
            <li className="flex items-center gap-3 text-slate-500 text-sm line-through">
              <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-xs flex-shrink-0">
                ✗
              </span>
              Questions illimitées
            </li>
            <li className="flex items-center gap-3 text-slate-500 text-sm line-through">
              <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-xs flex-shrink-0">
                ✗
              </span>
              Statistiques avancées
            </li>
          </ul>
          <Link
            href="/quiz"
            className="block w-full py-3.5 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/15 transition-all text-center"
          >
            Continuer gratuitement
          </Link>
        </div>

        {/* Premium Plan */}
        <div className="relative bg-gradient-to-br from-indigo-900/60 via-[#1a1030] to-rose-900/40 border-2 border-indigo-500/50 rounded-3xl p-8 shadow-2xl shadow-indigo-500/10">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              ⭐ RECOMMANDÉ
            </span>
          </div>

          <div className="mb-6">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="text-xl font-bold text-white mb-1">Premium</h3>
            <p className="text-slate-400 text-sm">Pour les passionnés de culture générale</p>
          </div>

          <div className="mb-6">
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-white">
                {billing === "annual" ? `${annualMonthlyPrice}€` : `${monthlyPrice}€`}
              </span>
              <span className="text-slate-400 text-sm mb-1">/mois</span>
            </div>
            {billing === "annual" && (
              <p className="text-slate-500 text-xs mt-1">
                Facturé {annualTotal}€/an · Économisez {savings}%
              </p>
            )}
          </div>

          <ul className="space-y-3 mb-8">
            {features.slice(0, 6).map((f) => (
              <li key={f.title} className="flex items-center gap-3 text-slate-200 text-sm">
                <span className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500/50 flex items-center justify-center text-xs text-indigo-400 flex-shrink-0">
                  ✓
                </span>
                <span>
                  <span className="mr-1">{f.icon}</span>
                  {f.title}
                </span>
              </li>
            ))}
            <li className="flex items-center gap-3 text-slate-200 text-sm">
              <span className="w-5 h-5 rounded-full bg-indigo-500/30 border border-indigo-500/50 flex items-center justify-center text-xs text-indigo-400 flex-shrink-0">
                +
              </span>
              <span className="text-slate-400">Et bien plus encore...</span>
            </li>
          </ul>

          <button className="w-full py-4 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-indigo-500/20">
            Commencer l&apos;essai gratuit →
          </button>
          <p className="text-slate-500 text-xs text-center mt-3">
            7 jours gratuits · Annulation à tout moment
          </p>
        </div>
      </div>

      {/* All Features */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Tout ce qui est inclus dans Premium
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-indigo-300 transition-colors">
                {f.title}
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          Ce que disent nos membres Premium
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-xl">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{t.name}</div>
                  <div className="text-indigo-400 text-xs">{t.badge}</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-3">&ldquo;{t.text}&rdquo;</p>
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <span key={i} className="text-yellow-400 text-sm">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Questions fréquentes</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            {
              q: "Puis-je annuler à tout moment ?",
              a: "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre compte. Votre accès Premium continuera jusqu'à la fin de la période payée.",
            },
            {
              q: "L'essai gratuit nécessite-t-il une carte bancaire ?",
              a: "Non, votre essai de 7 jours est complètement gratuit et ne nécessite aucune information de paiement.",
            },
            {
              q: "Combien de questions sont disponibles en Premium ?",
              a: "Plus de 1 000 questions réparties dans 12 catégories, avec de nouvelles questions ajoutées chaque semaine.",
            },
            {
              q: "Y a-t-il des réductions pour les étudiants ?",
              a: "Oui ! Les étudiants bénéficient de 50% de réduction sur l'abonnement annuel avec une adresse email universitaire valide.",
            },
          ].map((faq) => (
            <div key={faq.q} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-semibold text-white text-sm mb-2">{faq.q}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/50 to-rose-900/30 border border-indigo-500/20 rounded-3xl p-10 text-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-3">
            Prêt à dominer le classement ?
          </h2>
          <p className="text-slate-400 mb-6 max-w-md mx-auto">
            Rejoignez Vibe Quiz Master Premium aujourd&apos;hui et commencez votre essai gratuit de 7 jours.
          </p>
          <button className="px-10 py-4 bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-bold text-lg rounded-2xl hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/20">
            Essayer Premium gratuitement →
          </button>
          <p className="text-slate-500 text-sm mt-4">
            ✓ 7 jours gratuits · ✓ Sans carte bancaire · ✓ Annulation facile
          </p>
        </div>
      </div>
    </div>
  );
}
