import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";
import LikeButton from "../LikeButton";
import LikersSummary, { type LikerInfo } from "../LikersSummary";

async function ArtworkDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [artwork, session] = await Promise.all([
    prisma.artwork.findUnique({
      where: { slug },
      include: {
        likes: {
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true,
                postsCount: true,
                createdAt: true,
              },
            },
          },
        },
      },
    }),
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!artwork) {
    notFound();
  }

  const initialLiked = session
    ? artwork.likes.some((like) => like.user.id === session.user.id)
    : false;

  const likers: LikerInfo[] = artwork.likes.map((like) => ({
    id: like.user.id,
    name: like.user.name,
    image: like.user.image,
    roleBadge: getRoleBadge(like.user.role),
    prestige: getPrestigeRank(like.user.postsCount, like.user.createdAt),
  }));

  return (
    <article className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
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

        <div className="mt-8">
          <LikeButton
            artworkId={artwork.id}
            slug={artwork.slug}
            initialCount={artwork.likes.length}
            initialLiked={initialLiked}
            isAuthenticated={Boolean(session)}
          />
          <LikersSummary likers={likers} />
        </div>
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
