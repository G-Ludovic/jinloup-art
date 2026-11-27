import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nouveautés & Mises à jour — Jinloup.Art",
  description: "Journal de développement et mises à jour de Jinloup.Art",
};

type UpdateEntry = {
  version: string;
  date: string;
  title: string;
  badge: string;
  items: string[];
};

const UPDATES: UpdateEntry[] = [
  {
    version: "v1.3",
    date: "27 novembre 2026",
    title: "Sécurité des comptes & Réinitialisation",
    badge: "Sécurité",
    items: [
      "Confirmation obligatoire de l'adresse email lors de l'inscription.",
      "Ajout complet du parcours « Mot de passe oublié » par email.",
      "Optimisation de toutes les œuvres de la galerie au format WebP ultra-léger.",
    ],
  },
  {
    version: "v1.2",
    date: "27 novembre 2026",
    title: "La Galerie des Membres & Notifications",
    badge: "Communauté",
    items: [
      "Nouvel espace permettant aux membres de proposer leurs propres œuvres.",
      "Ajout de la cloche de notifications en direct (validation, refus, lecture et suppression).",
      "Affichage en proportions naturelles sur les fiches œuvres (fini les portraits coupés !).",
      "Commentaires directement sous chaque dessin et compteur sur la galerie.",
    ],
  },
  {
    version: "v1.1",
    date: "26 novembre 2026",
    title: "Profils personnalisés, Likes & Responsive",
    badge: "Expérience",
    items: [
      "Avatar personnalisé (recadré automatiquement à 48×48 px), citation et barre de prestige sur /profil.",
      "Système de J'aime instantané avec modale affichant les membres qui ont aimé.",
      "Création de l'annuaire /membres et menu burger complet pour mobile et tablette.",
    ],
  },
  {
    version: "v1.0",
    date: "25 novembre 2026",
    title: "Lancement officiel de Jinloup.Art",
    badge: "Lancement",
    items: [
      "Ouverture de la galerie d'art et du forum communautaire.",
      "Système de grades hybrides (rôles de modération + rangs de prestige).",
    ],
  },
];

export default function NouveautesPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
        Journal du développeur
      </h1>
      <p className="mt-2 text-zinc-400">
        Suivez l&apos;évolution de{" "}
        <strong className="text-zinc-200">Jinloup.Art</strong>, les nouvelles
        fonctionnalités et les améliorations techniques.
      </p>

      <div className="mt-8 space-y-6">
        {UPDATES.map((update) => (
          <article
            key={update.version}
            className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="rounded-md bg-amber-500 px-2 py-0.5 text-xs font-bold text-zinc-950">
                  {update.version}
                </span>
                <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-300">
                  {update.badge}
                </span>
              </div>
              <time className="text-xs text-zinc-500">{update.date}</time>
            </div>

            <h2 className="mt-3 text-xl font-semibold text-zinc-100">
              {update.title}
            </h2>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-300">
              {update.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 text-sm text-zinc-400">
        Une idée d&apos;amélioration ou un bug repéré ? Venez en parler dans le{" "}
        <Link
          href="/forum"
          className="font-semibold text-amber-400 hover:underline"
        >
          forum communautaire
        </Link>{" "}
        !
      </div>
    </section>
  );
}
