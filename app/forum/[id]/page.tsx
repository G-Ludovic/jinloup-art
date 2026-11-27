import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";
import UserAvatar from "@/app/components/UserAvatar";
import { deleteTopic } from "../actions";
import ReplyForm from "./ReplyForm";
import DeleteButton from "./DeleteButton";
import ForumCommentItem from "./ForumCommentItem";

async function TopicDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [topic, session] = await Promise.all([
    prisma.topic.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            role: true,
            postsCount: true,
            createdAt: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                bio: true,
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

  if (!topic) {
    notFound();
  }

  const isStaff =
    session?.user.role === "ADMIN" || session?.user.role === "MODERATOR";

  const canDeleteTopic =
    Boolean(session) && (session?.user.id === topic.author.id || isStaff);

  const authorPrestige = getPrestigeRank(
    topic.author.postsCount,
    topic.author.createdAt,
  );
  const authorRoleBadge = getRoleBadge(topic.author.role);

  return (
    <div className="mt-6 space-y-8">
      {/* Sujet principal */}
      <article className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-0.5 text-xs text-amber-400">
            {topic.category}
          </span>

          {canDeleteTopic && (
            <DeleteButton
              label="Supprimer le sujet"
              confirmMessage="Voulez-vous vraiment supprimer ce sujet et toutes ses réponses ?"
              onDelete={deleteTopic.bind(null, topic.id)}
            />
          )}
        </div>

        <h1 className="mt-4 wrap-break-word text-2xl font-bold tracking-tight text-zinc-100">
          {topic.title}
        </h1>

        <div className="mt-4 flex items-center gap-3">
          <UserAvatar
            name={topic.author.name}
            image={topic.author.image}
            size="lg"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <strong className="text-sm text-zinc-200">
              {topic.author.name}
            </strong>
            {authorRoleBadge && (
              <span
                className={`rounded border px-1.5 py-0.5 font-semibold ${authorRoleBadge.color}`}
              >
                {authorRoleBadge.label}
              </span>
            )}
            <span
              className={`rounded border px-1.5 py-0.5 ${authorPrestige.badgeColor}`}
            >
              {authorPrestige.label}
            </span>
            <span>
              •{" "}
              {new Date(topic.createdAt).toLocaleString("fr-FR", {
                timeZone: "Europe/Paris",
              })}
            </span>
          </div>
        </div>

        <p className="mt-6 wrap-break-word whitespace-pre-wrap leading-relaxed text-zinc-200">
          {topic.content}
        </p>

        {topic.author.bio && (
          <p className="mt-6 border-t border-zinc-800/80 pt-3 text-xs italic whitespace-pre-line text-zinc-500">
            {topic.author.bio}
          </p>
        )}
      </article>

      {/* Liste des réponses */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100">
          Réponses ({topic.comments.length})
        </h2>

        {topic.comments.length === 0 ? (
          <p className="text-sm text-zinc-400">
            Aucune réponse pour l&apos;instant. Lancez la discussion !
          </p>
        ) : (
          topic.comments.map((comment) => (
            <ForumCommentItem
              key={comment.id}
              topicId={topic.id}
              comment={{
                id: comment.id,
                content: comment.content,
                createdAtLabel: new Date(comment.createdAt).toLocaleString(
                  "fr-FR",
                  { timeZone: "Europe/Paris" },
                ),
                authorName: comment.author.name,
                authorImage: comment.author.image,
                authorBio: comment.author.bio,
                roleBadge: getRoleBadge(comment.author.role),
                prestige: getPrestigeRank(
                  comment.author.postsCount,
                  comment.author.createdAt,
                ),
                canEdit: Boolean(
                  session && session.user.id === comment.author.id,
                ),
                canDelete: Boolean(
                  session && (session.user.id === comment.author.id || isStaff),
                ),
              }}
            />
          ))
        )}
      </div>

      {/* Formulaire de réponse */}
      {session ? (
        <ReplyForm topicId={topic.id} />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 text-sm text-zinc-400">
          <Link
            href="/connexion"
            className="font-semibold text-amber-400 hover:underline"
          >
            Connectez-vous
          </Link>{" "}
          pour participer à cette discussion.
        </div>
      )}
    </div>
  );
}

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <section className="mx-auto max-w-3xl">
      <Link
        href="/forum"
        className="text-sm text-zinc-400 transition hover:text-amber-400"
      >
        ← Retour au forum
      </Link>

      <Suspense
        fallback={<p className="mt-8 text-zinc-400">Chargement du sujet...</p>}
      >
        <TopicDetail params={params} />
      </Suspense>
    </section>
  );
}
