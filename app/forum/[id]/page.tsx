import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";
import { deleteComment, deleteTopic } from "../actions";
import ReplyForm from "./ReplyForm";
import DeleteButton from "./DeleteButton";

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

        <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100">
          {topic.title}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
          <span>
            Par <strong className="text-zinc-200">{topic.author.name}</strong>
          </span>
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
          <span>• {new Date(topic.createdAt).toLocaleString("fr-FR")}</span>
        </div>

        <p className="mt-6 whitespace-pre-wrap leading-relaxed text-zinc-200">
          {topic.content}
        </p>
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
          topic.comments.map((comment) => {
            const prestige = getPrestigeRank(
              comment.author.postsCount,
              comment.author.createdAt,
            );
            const roleBadge = getRoleBadge(comment.author.role);
            const canDeleteComment =
              Boolean(session) &&
              (session?.user.id === comment.author.id || isStaff);

            return (
              <div
                key={comment.id}
                className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <strong className="text-zinc-200">
                      {comment.author.name}
                    </strong>
                    {roleBadge && (
                      <span
                        className={`rounded border px-1.5 py-0.5 font-semibold ${roleBadge.color}`}
                      >
                        {roleBadge.label}
                      </span>
                    )}
                    <span
                      className={`rounded border px-1.5 py-0.5 ${prestige.badgeColor}`}
                    >
                      {prestige.label}
                    </span>
                    <span>
                      • {new Date(comment.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </div>

                  {canDeleteComment && (
                    <DeleteButton
                      confirmMessage="Supprimer ce commentaire ?"
                      onDelete={deleteComment.bind(null, comment.id, topic.id)}
                    />
                  )}
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
                  {comment.content}
                </p>
              </div>
            );
          })
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
