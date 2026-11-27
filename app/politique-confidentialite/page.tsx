import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Jinloup.Art",
  description: "Gestion des données personnelles et RGPD sur Jinloup.Art",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 text-sm leading-relaxed text-zinc-300">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          Politique de confidentialité (RGPD)
        </h1>
        <p className="mt-2 text-xs text-zinc-500">
          Dernière mise à jour : Novembre 2026
        </p>
      </header>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">
          1. Données collectées
        </h2>
        <p>
          Lors de votre inscription et de votre utilisation de{" "}
          <strong>Jinloup.Art</strong>, nous collectons uniquement les données
          strictement nécessaires au fonctionnement du site :
        </p>
        <ul className="list-disc space-y-1 pl-5 text-zinc-300">
          <li>
            <strong>Données de compte :</strong> pseudonyme, adresse email et
            mot de passe chiffré (haché) via Better Auth.
          </li>
          <li>
            <strong>Données de profil (facultatives) :</strong> avatar (image
            48×48 px) et courte citation.
          </li>
          <li>
            <strong>Données d&apos;activité :</strong> sujets et réponses
            publiés sur le forum, mentions &laquo; J&apos;aime &raquo; sur les
            œuvres, date d&apos;inscription et rang de participation.
          </li>
        </ul>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">
          2. Finalité et partage des données
        </h2>
        <p>
          Vos données servent uniquement à vous permettre de vous connecter, de
          participer au forum et d&apos;interagir avec la galerie. Votre adresse
          email n&apos;est <strong>jamais rendue publique</strong> sur le site,
          ni vendue, ni partagée à des fins commerciales ou publicitaires.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">3. Cookies</h2>
        <p>
          Jinloup.Art utilise uniquement des{" "}
          <strong>cookies techniques strictement nécessaires</strong> au
          maintien de votre session de connexion (authentification). Aucun
          cookie publicitaire ou de suivi statistique tiers n&apos;est utilisé.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">
          4. Conservation et sécurité
        </h2>
        <p>
          Les données sont stockées sur une base PostgreSQL sécurisée (Neon,
          région Europe — Francfort) tant que votre compte reste actif. En cas
          de suppression de compte, vos données personnelles sont effacées de la
          base.
        </p>
      </section>

      <section className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
        <h2 className="text-lg font-semibold text-amber-400">
          5. Vos droits (RGPD)
        </h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données
          (RGPD), vous disposez d&apos;un droit d&apos;accès, de rectification
          et de suppression de vos données personnelles. Pour exercer ce droit,
          contactez :{" "}
          <a
            href="mailto:votre.email@exemple.fr"
            className="text-amber-400 underline"
          >
            loup.toundragaming@outlook.fr
          </a>
          .
        </p>
        <p className="text-xs text-zinc-400">
          Vous pouvez également introduire une réclamation auprès de la{" "}
          <a
            href="https://www.cnil.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 underline"
          >
            CNIL
          </a>
          .
        </p>
      </section>
    </article>
  );
}
