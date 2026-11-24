import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function ArtworkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const artwork = await prisma.artwork.findUnique({
    where: { slug },
  });

  if (!artwork) {
    notFound();
  }

  return (
    <article className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
          {artwork.title}
        </h1>
        <p className="mt-2 text-lg text-amber-400">
          {artwork.artistName}
          {artwork.year ? ` (${artwork.year})` : ""}
        </p>

        {artwork.medium && (
          <span className="mt-4 inline-block w-fit rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
            {artwork.medium}
          </span>
        )}

        <p className="mt-6 leading-relaxed text-zinc-300">
          {artwork.description}
        </p>
      </div>
    </article>
  );
}

export default function ArtworkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <section>
      <Link
        href="/galerie"
        className="text-sm text-zinc-400 transition hover:text-amber-400"
      >
        ← Retour à la galerie
      </Link>

      <Suspense
        fallback={
          <p className="mt-8 text-zinc-400">Chargement de l&apos;œuvre...</p>
        }
      >
        <ArtworkDetail params={params} />
      </Suspense>
    </section>
  );
}
