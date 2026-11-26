import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

async function ArtworkGrid() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { likes: true },
      },
    },
  });

  if (artworks.length === 0) {
    return (
      <p className="mt-8 rounded-lg border border-zinc-800 p-6 text-zinc-400">
        Aucune œuvre exposée pour le moment.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top transition duration-300 group-hover:scale-105"
            />
          </div>

          <div className="p-4">
            <h2 className="text-lg font-semibold text-zinc-100 group-hover:text-amber-400">
              {artwork.title}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Par {artwork.artistName}
              {artwork.year ? ` • ${artwork.year}` : ""}
            </p>
          </div>

          <span className="flex items-center gap-1 text-sm text-zinc-400">
            ❤️ {artwork._count.likes}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default function GaleriePage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Galerie d&apos;Art</h1>
      <p className="mt-2 text-zinc-400">
        Découvrez les œuvres exposées par nos artistes et membres.
      </p>

      <Suspense
        fallback={
          <p className="mt-8 text-zinc-400">Chargement des œuvres...</p>
        }
      >
        <ArtworkGrid />
      </Suspense>
    </section>
  );
}
