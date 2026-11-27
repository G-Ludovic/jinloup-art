import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Règlement du forum et de la galerie — Jinloup.Art",
  description: "Règles de bonne conduite sur Jinloup.Art",
};

const RULES = [
  {
    title: "1. Respect et bienveillance",
    description:
      "Toutes les discussions doivent rester courtoises. Les insultes, le harcèlement, les propos discriminatoires ou les attaques personnelles entraîneront la suppression immédiate des messages et un bannissement.",
  },
  {
    title: "2. Critiques constructives",
    description:
      "Sur le forum comme sous les dessins de la galerie, les critiques sont les bienvenues lorsqu'elles sont constructives et respectueuses du travail de l'artiste. Encouragez les progrès autant que vous donnez des conseils.",
  },
  {
    title: "3. Authenticité & Propriété des œuvres",
    description:
      "Ne proposez dans la Galerie des Membres que des créations dont vous êtes l'auteur. Le vol ou le repompage d'œuvres d'autres artistes sans autorisation est strictement interdit. Si une création utilise une assistance par IA, précisez-le honnêtement dans le titre ou la technique.",
  },
  {
    title: "4. Contenu approprié (Tout public)",
    description:
      "Jinloup.Art est un espace ouvert à un large public. Merci d'éviter tout contenu choquant, gore, pornographique (NSFW) ou illégal dans vos œuvres, avatars, citations et commentaires.",
  },
  {
    title: "5. Pas de spam ni de publicité abusive",
    description:
      "Le flood (poster en boucle uniquement pour monter son rang de prestige), le hors-sujet répété et la publicité non sollicitée ne sont pas autorisés.",
  },
  {
    title: "6. Décisions de l'équipe de modération",
    description:
      "Les administrateurs et modérateurs veillent à la bonne ambiance du site. Ils se réservent le droit de supprimer tout contenu non conforme ou de suspendre un compte en cas de manquement répété.",
  },
];

export default function ReglementPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
        Règlement du forum &amp; de la galerie
      </h1>
      <p className="mt-2 text-zinc-400">
        Quelques règles simples pour garder{" "}
        <strong className="text-zinc-200">Jinloup.Art</strong> convivial,
        créatif et respectueux pour tous.
      </p>

      <div className="mt-8 space-y-4">
        {RULES.map((rule) => (
          <div
            key={rule.title}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <h2 className="text-base font-semibold text-amber-400">
              {rule.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {rule.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/forum"
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
        >
          Accéder au forum
        </Link>
        <Link
          href="/faq"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-900"
        >
          Consulter la FAQ
        </Link>
      </div>
    </section>
  );
}
