import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Bannière principale */}
      <section className="relative aspect-2057/764 w-full overflow-hidden rounded-2xl border border-indigo-500/20 shadow-2xl shadow-indigo-950/20">
        <Image
          src="/images/BannerJA.png"
          alt="Jinloup.Art"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1152px"
          className="object-cover"
        />
      </section>

      {/* Bloc d'accueil principal */}
      <section className="flex items-center justify-center py-6 text-center md:py-12">
        <div className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            L&apos;art et la communauté,{" "}
            <span className="text-amber-400">réunis</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
            Explorez notre collection d&apos;œuvres sélectionnées, discutez avec
            d&apos;autres passionnés et évoluez au sein de la communauté.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/galerie"
              className="w-full rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-400 sm:w-auto"
            >
              Visiter la galerie
            </Link>
            <Link
              href="/forum"
              className="w-full rounded-lg border border-zinc-700 px-5 py-2.5 font-semibold transition hover:bg-zinc-900 sm:w-auto"
            >
              Accéder au forum
            </Link>
          </div>
        </div>
      </section>

      {/* Article : Mise en avant de la Galerie des Membres */}
      <article className="rounded-2xl border border-indigo-500/30 bg-zinc-900/50 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
              Nouveau • Espace Créateurs
            </span>

            <h2 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              Exposez vos propres œuvres dans la{" "}
              <span className="text-amber-400">Galerie des Membres</span>
            </h2>

            <p className="text-sm leading-relaxed text-zinc-300 sm:text-base">
              Vous dessinez, peignez ou créez en digital ? Partagez vos
              créations avec la communauté ! Chaque proposition est vérifiée par
              notre équipe avant publication, puis ouverte aux mentions{" "}
              <strong>J&apos;aime</strong> et aux <strong>commentaires</strong>{" "}
              des autres membres.
            </p>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-xs text-zinc-400">
              <li>✓ Envoi simple et rapide</li>
              <li>✓ Notification dès validation</li>
              <li>✓ Points de prestige offerts</li>
            </ul>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
            <Link
              href="/galerie#galerie-membres"
              className="rounded-lg bg-amber-500 px-5 py-2.5 text-center text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
            >
              Découvrir la Galerie des Membres
            </Link>
            <Link
              href="/galerie/proposer"
              className="rounded-lg border border-zinc-700 px-5 py-2.5 text-center text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
            >
              + Proposer mon œuvre
            </Link>
          </div>
        </div>
      </article>
      {/* Mini encart Nouveautés */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-4 text-sm">
        <p className="text-zinc-300">
          <span className="mr-2 rounded bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-400">
            v1.3
          </span>
          Confirmation par email, mot de passe oublié et galerie optimisée en
          WebP !
        </p>
        <Link
          href="/nouveautes"
          className="text-xs font-semibold text-amber-400 hover:underline"
        >
          Voir toutes les mises à jour →
        </Link>
      </div>
    </div>
  );
}
