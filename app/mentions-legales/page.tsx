import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Jinloup.Art",
  description: "Mentions légales du site Jinloup.Art",
};

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 text-sm leading-relaxed text-zinc-300">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          Mentions légales
        </h1>
        <p className="mt-2 text-xs text-zinc-500">
          Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004
          pour la confiance dans l&apos;économie numérique (LCEN).
        </p>
      </header>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">
          1. Éditeur du site
        </h2>
        <p>
          Le site <strong>Jinloup.Art</strong> (accessible à l&apos;adresse{" "}
          <span className="text-zinc-100">https://jinloup-art.vercel.app</span>)
          est un site personnel et communautaire à but non commercial édité par{" "}
          <strong>[Jinloup, particulier]</strong>.
        </p>
        <p className="text-xs text-zinc-400">
          Contact :{" "}
          <a
            href="mailto:loup.toundragaming@outlook.fr"
            className="text-amber-400 underline"
          >
            loup.toundragaming@outlook.fr
          </a>
        </p>
        <p className="text-xs text-zinc-500">
          *(Note : si vous éditez à titre strictement non professionnel et
          souhaitez rester sous pseudonyme, la LCEN autorise à ne pas publier
          votre identité/adresse à condition d&apos;avoir fourni vos coordonnées
          exactes à votre hébergeur Vercel.)*
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">2. Hébergement</h2>
        <p>
          L&apos;application web est hébergée par <strong>Vercel Inc.</strong>,
          440 N Barranca Ave #4133, Covina, CA 91723, États-Unis (
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 underline"
          >
            vercel.com
          </a>
          ).
        </p>
        <p>
          La base de données PostgreSQL est hébergée par <strong>Neon</strong>{" "}
          (région Europe / Francfort —{" "}
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 underline"
          >
            neon.tech
          </a>
          ).
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">
          3. Propriété intellectuelle
        </h2>
        <p>
          L&apos;ensemble des œuvres graphiques, dessins, illustrations, logos
          et textes publiés dans la galerie sont la propriété exclusive de leur
          auteur (<strong>Jinloup</strong>), sauf mention contraire explicite.
          Toute reproduction, distribution ou réutilisation sans autorisation
          préalable est interdite.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">
          4. Responsabilité &amp; Forum communautaire
        </h2>
        <p>
          Les messages publiés sur le forum engagent la seule responsabilité de
          leurs auteurs. L&apos;équipe de modération se réserve le droit de
          supprimer sans préavis tout contenu illicite, injurieux ou contraire
          aux règles de courtoisie de la communauté.
        </p>
      </section>
    </article>
  );
}
