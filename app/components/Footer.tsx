import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Étage du haut : Marque + Colonne Navigation */}
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-xs space-y-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-base font-bold text-zinc-100"
            >
              <Image
                src="/logo-loup-mystique.webp"
                alt="Logo Jinloup.Art"
                width={28}
                height={28}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-indigo-500/40"
              />
              <span>
                Jinloup<span className="text-amber-400">.Art</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500">
              Galerie d&apos;art en ligne et espace d&apos;échange communautaire
              autour du dessin et de la création.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Navigation
            </h3>
            <nav className="flex flex-col gap-2 text-sm">
              <Link
                href="/galerie"
                className="w-fit transition hover:text-amber-400"
              >
                Galerie
              </Link>
              <Link
                href="/forum"
                className="w-fit transition hover:text-amber-400"
              >
                Forum
              </Link>
              <Link
                href="/membres"
                className="w-fit transition hover:text-amber-400"
              >
                Membres
              </Link>
            </nav>
          </div>
        </div>

        {/* Étage du bas : Copyright + Liens légaux sur une ligne */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-zinc-800/80 pt-6 text-xs sm:flex-row">
          <p>
            © 2026 <strong className="text-zinc-200">Jinloup.Art</strong> — Tous
            droits réservés.
          </p>

          <div className="flex items-center gap-6">
            <Link
              href="/mentions-legales"
              className="transition hover:text-amber-400"
            >
              Mentions légales
            </Link>
            <Link
              href="/politique-confidentialite"
              className="transition hover:text-amber-400"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
