import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ — Jinloup.Art",
  description: "Questions fréquentes sur le fonctionnement de Jinloup.Art",
};

const FAQ_ITEMS = [
  {
    question:
      "Comment proposer l'un de mes dessins dans la Galerie des Membres ?",
    answer:
      "Connectez-vous à votre compte, allez dans l'onglet Galerie puis cliquez sur « + Proposer mon œuvre ». Choisissez votre image (PNG, JPG ou WebP) : elle est automatiquement optimisée puis envoyée à l'équipe pour validation.",
  },
  {
    question:
      "Pourquoi mon œuvre n'apparaît-elle pas tout de suite dans la galerie ?",
    answer:
      "Toutes les propositions des membres passent par une validation manuelle de Jinloup avant publication. Vous recevrez une notification dans la petite cloche en haut du site dès qu'elle est acceptée (ou si une modification est demandée). Vous pouvez aussi suivre son statut dans votre Profil.",
  },
  {
    question:
      "Comment fonctionnent les rangs de prestige (Novice, Apprenti, Maître d'Art...) ?",
    answer:
      "Votre rang évolue automatiquement en fonction de deux critères : votre ancienneté sur le site (+1 point par jour depuis votre inscription) et votre participation (+10 points par réponse sur le forum, commentaire sous une œuvre ou création acceptée). Les paliers sont : Novice (0), Apprenti (30), Amateur Éclairé (100), Connaisseur (300) et Maître d'Art (700).",
  },
  {
    question: "Pourquoi je ne peux pas créer un nouveau sujet sur le forum ?",
    answer:
      "Pour garder le forum clair et bien structuré, l'ouverture de nouveaux sujets principaux est réservée aux administrateurs et modérateurs. En revanche, tous les membres connectés peuvent répondre librement dans les discussions existantes et proposer des idées de nouveaux sujets !",
  },
  {
    question: "Comment ajouter mon avatar et ma citation personnelle ?",
    answer:
      "Rendez-vous sur votre page Profil (en cliquant sur votre pseudo en haut à droite). Vous pouvez y importer n'importe quelle image (elle sera automatiquement recadrée en 48×48 px) et écrire une citation de 3 lignes maximum qui s'affichera en signature sous vos messages.",
  },
  {
    question:
      "Je n'ai pas reçu l'email de confirmation ou j'ai oublié mon mot de passe.",
    answer:
      "Vérifiez d'abord votre dossier Spams / Courriers indésirables. Sur la page Connexion, vous pouvez cliquer sur « Renvoyer le lien de confirmation » ou utiliser le lien « Mot de passe oublié ? » pour recevoir un nouveau lien valable 1 heure.",
  },
  {
    question: "L'inscription et l'utilisation du site sont-elles gratuites ?",
    answer:
      "Oui, Jinloup.Art est un espace personnel et communautaire 100 % gratuit.",
  },
];

export default function FaqPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
        Foire Aux Questions (FAQ)
      </h1>
      <p className="mt-2 text-zinc-400">
        Tout ce qu&apos;il faut savoir pour utiliser la galerie, le forum et
        faire évoluer votre profil.
      </p>

      <div className="mt-8 space-y-3">
        {FAQ_ITEMS.map((item) => (
          <details
            key={item.question}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 open:border-amber-500/40"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-zinc-100">
              <span>{item.question}</span>
              <span className="shrink-0 text-amber-400 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 border-t border-zinc-800/80 pt-3 text-sm leading-relaxed text-zinc-300">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <p className="mt-8 text-sm text-zinc-400">
        Pensez également à consulter le{" "}
        <Link
          href="/reglement"
          className="font-semibold text-amber-400 underline"
        >
          règlement du forum et de la galerie
        </Link>
        .
      </p>
    </section>
  );
}
