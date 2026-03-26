import Link from "next/link";

export default function MentionsLegales() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/dashboard" className="text-slate-500 hover:text-neon-cyan text-sm transition-colors">
          &larr; Retour au dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold text-white mb-2">
        Mentions <span className="gradient-text">Légales</span>
      </h1>
      <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : mars 2026</p>

      <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
        <Section title="1. Éditeur du site">
          <p>
            <strong className="text-white">Teubé</strong> est une application web de quiz éducatif
            de culture générale, éditée à titre personnel.
          </p>
          <p className="mt-2">
            Responsable de la publication : Équipe Teubé<br />
            Contact : contact@vibequizmaster.app<br />
            Hébergement : Vercel Inc. — 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
          </p>
        </Section>

        <Section title="2. Propriété intellectuelle">
          <p>
            L&apos;ensemble des contenus présents sur Teubé (textes, questions, graphismes,
            logo, code source, animations) sont protégés par le droit d&apos;auteur et restent la
            propriété exclusive de l&apos;éditeur, sauf mentions contraires.
          </p>
          <p className="mt-2">
            Toute reproduction, distribution ou utilisation des contenus sans autorisation
            préalable est interdite conformément aux articles L.335-2 et suivants du Code
            de la propriété intellectuelle.
          </p>
        </Section>

        <Section title="3. Hébergement">
          <p>
            L&apos;application est hébergée par <strong className="text-white">Vercel Inc.</strong>,
            dont le siège social est situé au 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
          </p>
        </Section>

        <Section title="4. Données personnelles">
          <p>
            Les données de progression (scores, XP, préférences) sont stockées exclusivement
            dans le <strong className="text-white">localStorage</strong> de votre navigateur.
            Aucune donnée personnelle n&apos;est collectée, transmise ou stockée sur nos serveurs.
          </p>
          <p className="mt-2">
            Pour plus de détails, consultez notre{" "}
            <Link href="/confidentialite" className="text-neon-cyan hover:underline">
              Politique de Confidentialité
            </Link>.
          </p>
        </Section>

        <Section title="5. Cookies">
          <p>
            Teubé n&apos;utilise aucun cookie de tracking ni cookie publicitaire.
            Seul le stockage local du navigateur (localStorage) est utilisé pour sauvegarder
            votre progression de jeu.
          </p>
        </Section>

        <Section title="6. Limitation de responsabilité">
          <p>
            Les questions et explications sont fournies à titre éducatif et informatif.
            Malgré le soin apporté à la rédaction, l&apos;éditeur ne garantit pas
            l&apos;exactitude absolue de toutes les informations et décline toute
            responsabilité en cas d&apos;erreur factuelle.
          </p>
          <p className="mt-2">
            L&apos;accès à l&apos;application peut être interrompu à tout moment pour
            maintenance ou mise à jour, sans préavis ni indemnité.
          </p>
        </Section>

        <Section title="7. Liens hypertextes">
          <p>
            L&apos;application peut contenir des liens vers des sites externes.
            L&apos;éditeur ne saurait être tenu responsable du contenu de ces sites
            tiers ni des éventuels dommages résultant de leur consultation.
          </p>
        </Section>

        <Section title="8. Droit applicable">
          <p>
            Les présentes mentions légales sont régies par le droit français.
            En cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </Section>

        <Section title="9. Contact">
          <p>
            Pour toute question relative aux présentes mentions, contactez-nous
            à l&apos;adresse : <span className="text-neon-cyan">contact@vibequizmaster.app</span>
          </p>
        </Section>
      </div>

      <div className="mt-12 pt-6 border-t border-white/[0.06] flex gap-4 text-xs text-slate-600">
        <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">
          Politique de Confidentialité
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
