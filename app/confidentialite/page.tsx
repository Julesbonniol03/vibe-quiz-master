import Link from "next/link";

export default function Confidentialite() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/dashboard" className="text-slate-500 hover:text-neon-green text-sm transition-colors">
          &larr; Retour au dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        Politique de <span className="gradient-text">Confidentialité</span>
      </h1>
      <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : mars 2026</p>

      {/* RGPD Summary Card */}
      <div className="glass-card !rounded-2xl p-6 mb-10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>🛡️</span> En résumé
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: "🚫", title: "Aucune collecte", desc: "Nous ne collectons aucune donnée personnelle." },
            { icon: "💾", title: "Stockage local", desc: "Tout reste dans votre navigateur (localStorage)." },
            { icon: "🔒", title: "Zéro tracking", desc: "Pas de cookies, pas d'analytics, pas de pub." },
          ].map((item) => (
            <div key={item.title} className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-white text-sm font-semibold mb-1">{item.title}</div>
              <div className="text-slate-500 text-xs">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
        <Section title="1. Introduction">
          <p>
            La présente politique de confidentialité décrit comment <strong className="text-white">Inkult</strong> traite
            vos informations lorsque vous utilisez notre application de quiz.
            Nous nous engageons à respecter votre vie privée conformément au
            Règlement Général sur la Protection des Données (RGPD) et à la loi
            Informatique et Libertés.
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p>
            <strong className="text-neon-green">Inkult ne collecte aucune donnée personnelle.</strong>
          </p>
          <p className="mt-2">
            Les seules données stockées sont vos données de progression de jeu :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Scores et résultats de quiz</li>
            <li>Points d&apos;expérience (XP) et niveau</li>
            <li>Statistiques de jeu (précision, streak, vitesse)</li>
            <li>Questions marquées pour révision</li>
            <li>Préférence Premium (activée localement)</li>
          </ul>
          <p className="mt-3">
            Ces données sont stockées <strong className="text-white">exclusivement dans le localStorage</strong> de
            votre navigateur. Elles ne quittent jamais votre appareil et ne sont transmises
            à aucun serveur.
          </p>
        </Section>

        <Section title="3. Cookies et technologies de suivi">
          <p>
            Nous n&apos;utilisons <strong className="text-white">aucun cookie</strong>, aucun pixel de
            tracking, aucun outil d&apos;analytics tiers (Google Analytics, Meta Pixel, etc.)
            et aucune technologie de fingerprinting.
          </p>
          <p className="mt-2">
            Le Service Worker utilisé pour le mode hors-ligne ne collecte aucune donnée.
            Il met uniquement en cache les questions de quiz pour permettre une utilisation
            sans connexion internet.
          </p>
        </Section>

        <Section title="4. Partage de données">
          <p>
            Aucune donnée n&apos;est partagée avec des tiers. Aucune donnée n&apos;est
            transmise, vendue ou louée à des partenaires commerciaux, publicitaires
            ou autres.
          </p>
        </Section>

        <Section title="5. Hébergement">
          <p>
            L&apos;application est hébergée par <strong className="text-white">Vercel Inc.</strong> (États-Unis).
            Les fichiers statiques de l&apos;application (code, questions) sont servis
            depuis leurs serveurs. Vercel peut collecter des logs d&apos;accès standards
            (adresse IP, user-agent) conformément à leur propre politique de confidentialité.
          </p>
        </Section>

        <Section title="6. Vos droits (RGPD)">
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong className="text-white">Droit d&apos;accès</strong> : toutes vos données sont visibles dans votre navigateur (localStorage).</li>
            <li><strong className="text-white">Droit de suppression</strong> : effacez toutes vos données en vidant le localStorage de votre navigateur, ou depuis la page Profil.</li>
            <li><strong className="text-white">Droit à la portabilité</strong> : vos données sont au format JSON standard dans le localStorage.</li>
          </ul>
          <p className="mt-3">
            Puisqu&apos;aucune donnée personnelle n&apos;est stockée sur nos serveurs,
            les droits de rectification et d&apos;opposition ne s&apos;appliquent pas dans ce contexte.
          </p>
        </Section>

        <Section title="7. Sécurité">
          <p>
            Vos données de jeu sont stockées localement et ne transitent pas par internet.
            L&apos;application est servie en HTTPS pour garantir l&apos;intégrité du code
            et des questions transmises.
          </p>
        </Section>

        <Section title="8. Mineurs">
          <p>
            Inkult est une application éducative adaptée à tous les âges.
            Aucune donnée personnelle n&apos;étant collectée, aucun consentement parental
            spécifique n&apos;est requis.
          </p>
        </Section>

        <Section title="9. Modifications">
          <p>
            Cette politique peut être mise à jour ponctuellement. La date de dernière
            modification est indiquée en haut de page. Nous vous encourageons à la
            consulter régulièrement.
          </p>
        </Section>

        <Section title="10. Contact">
          <p>
            Pour toute question relative à cette politique de confidentialité :<br />
            <span className="text-neon-green">contact@vibequizmaster.app</span>
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-6 border-t border-white/[0.06] flex gap-4 text-xs text-slate-600">
        <Link href="/mentions-legales" className="hover:text-slate-400 transition-colors">
          Mentions Légales
        </Link>
        <Link href="/dashboard" className="hover:text-slate-400 transition-colors">
          Dashboard
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
      {children}
    </section>
  );
}
