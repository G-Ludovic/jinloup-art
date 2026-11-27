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
import ArtworkCommentForm from "./ArtworkCommentForm";
import ArtworkCommentItem from "./ArtworkCommentItem";

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
        artworkComments: {
          orderBy: { createdAt: "desc" },
          include: {
            author: {
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

  const isStaff =
    session?.user.role === "ADMIN" || session?.user.role === "MODERATOR";

  const isAuthor = Boolean(session && artwork.authorId === session.user.id);

  if (artwork.status !== "APPROVED" && !isStaff && !isAuthor) {
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
    <>
      <article className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="flex items-center justify-center">
          <Image
            src={artwork.imageUrl}
            alt={artwork.title}
            width={1200}
            height={1200}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="h-auto max-h-[75vh] w-auto max-w-full rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg"
            unoptimized={artwork.imageUrl.startsWith("data:")}
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

      {/* Section Commentaires sous l'œuvre */}
      <div className="mt-12 space-y-6 border-t border-zinc-800 pt-10">
        <h2 className="text-xl font-semibold text-zinc-100">
          Commentaires ({artwork.artworkComments.length})
        </h2>

        {session ? (
          <ArtworkCommentForm artworkId={artwork.id} slug={artwork.slug} />
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400">
            <Link
              href="/connexion"
              className="font-semibold text-amber-400 hover:underline"
            >
              Connectez-vous
            </Link>{" "}
            pour laisser un commentaire sur cette œuvre.
          </div>
        )}

        {artwork.artworkComments.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Aucun commentaire pour le moment. Soyez le premier à donner votre
            avis !
          </p>
        ) : (
          <div className="space-y-4">
            {artwork.artworkComments.map((comment) => (
              <ArtworkCommentItem
                key={comment.id}
                slug={artwork.slug}
                comment={{
                  id: comment.id,
                  content: comment.content,
                  createdAtLabel: new Date(comment.createdAt).toLocaleString(
                    "fr-FR",
                    { timeZone: "Europe/Paris" },
                  ),
                  authorName: comment.author.name,
                  authorImage: comment.author.image,
                  roleBadge: getRoleBadge(comment.author.role),
                  prestige: getPrestigeRank(
                    comment.author.postsCount,
                    comment.author.createdAt,
                  ),
                  canEdit: Boolean(
                    session && session.user.id === comment.author.id,
                  ),
                  canDelete: Boolean(
                    session &&
                    (session.user.id === comment.author.id || isStaff),
                  ),
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
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
