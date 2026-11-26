import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import ScrollToHash from "./ScrollToHash";

type ArtworkCardItem = {
  id: string;
  title: string;
  slug: string;
  artistName: string;
  imageUrl: string;
  year: number | null;
  _count: { likes: number; artworkComments: number };
};

function ArtworkGridSection({ artworks }: { artworks: ArtworkCardItem[] }) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {artworks.map((artwork) => (
        <Link
          key={artwork.id}
          href={`/galerie/${artwork.slug}`}
          className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 transition hover:border-amber-500/50"
        >
          <div className="relative aspect-4/3 w-full overflow-hidden bg-zinc-900">
            <Image
              src={artwork.imageUrl}
              alt={artwork.title}
              fill
              unoptimized={artwork.imageUrl.startsWith("data:")}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top transition duration-300 group-hover:scale-105"
            />
          </div>

          <div className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-zinc-100 group-hover:text-amber-400">
                {artwork.title}
              </h3>
              <p className="mt-1 truncate text-sm text-zinc-400">
                Par {artwork.artistName}
                {artwork.year ? ` • ${artwork.year}` : ""}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 text-sm text-zinc-400">
              <span>❤️ {artwork._count.likes}</span>
              <span>💬 {artwork._count.artworkComments}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

async function GalleriesContent() {
  await connection();
  const [jinloupArtworks, memberArtworks] = await Promise.all([
    prisma.artwork.findMany({
      where: { isMemberArtwork: false, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { likes: true, artworkComments: true } },
      },
    }),
    prisma.artwork.findMany({
      where: { isMemberArtwork: true, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { likes: true, artworkComments: true } },
      },
    }),
  ]);

  return (
    <div className="mt-8 space-y-16">
      {/* Section 1 : Les œuvres de Jinloup */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
            Les œuvres de <span className="text-amber-400">Jinloup</span>
          </h2>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-300">
            {jinloupArtworks.length}
          </span>
        </div>

        {jinloupArtworks.length === 0 ? (
          <p className="mt-6 rounded-lg border border-zinc-800 p-6 text-zinc-400">
            Aucune œuvre exposée pour le moment.
          </p>
        ) : (
          <ArtworkGridSection artworks={jinloupArtworks} />
        )}
      </div>

      {/* Section 2 : La Galerie des Membres */}
      <div
        id="galerie-membres"
        className="scroll-mt-12 border-t border-zinc-800 pt-12"
      >
        <ScrollToHash />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
                La Galerie des Membres
              </h2>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-300">
                {memberArtworks.length}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">
              Les créations partagées par la communauté et validées par
              l&apos;équipe.
            </p>
          </div>

          <Link
            href="/galerie/proposer"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            + Proposer mon œuvre
          </Link>
        </div>

        {memberArtworks.length === 0 ? (
          <p className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 text-sm text-zinc-400">
            Aucune œuvre de membre publiée pour le moment. Soyez le premier à
            proposer la vôtre !
          </p>
        ) : (
          <ArtworkGridSection artworks={memberArtworks} />
        )}
      </div>
    </div>
  );
}

export default function GaleriePage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Galerie d&apos;Art</h1>
      <p className="mt-2 text-zinc-400">
        Découvrez les œuvres originales de Jinloup ainsi que les créations de
        nos membres.
      </p>

      {/* Raccourci rapide vers la Galerie des Membres */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3 text-sm">
        <p className="text-zinc-300">
          Envie de voir directement les créations de la communauté ou de
          partager les vôtres ?
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="#galerie-membres"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-400"
          >
            ↓ Aller à la Galerie des Membres
          </a>
          <Link
            href="/galerie/proposer"
            className="inline-flex items-center rounded-lg border border-zinc-700 bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-amber-500 hover:text-amber-400"
          >
            + Proposer mon œuvre
          </Link>
        </div>
      </div>

      <Suspense
        fallback={
          <p className="mt-8 text-zinc-400">Chargement des galeries...</p>
        }
      >
        <GalleriesContent />
      </Suspense>
    </section>
  );
}
