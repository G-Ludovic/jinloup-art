import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";
import NewTopicForm from "./NewTopicForm";
import UserAvatar from "@/app/components/UserAvatar";

async function TopicsList() {
  const topics = await prisma.topic.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          name: true,
          image: true,
          role: true,
          postsCount: true,
          createdAt: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  if (topics.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-zinc-800 p-6 text-zinc-400">
        Aucun sujet pour le moment. Soyez le premier à lancer une discussion !
      </p>
    );
  }

  return (
    <div className="mt-8 space-y-4">
      {topics.map((topic) => {
        const prestige = getPrestigeRank(
          topic.author.postsCount,
          topic.author.createdAt,
        );
        const roleBadge = getRoleBadge(topic.author.role);

        return (
          <Link
            key={topic.id}
            href={`/forum/${topic.id}`}
            className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 transition hover:border-amber-500/50"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-0.5 text-xs text-amber-400">
                {topic.category}
              </span>
              <span className="text-xs text-zinc-400">
                {topic._count.comments} réponse
                {topic._count.comments > 1 ? "s" : ""} •{" "}
                {new Date(topic.createdAt).toLocaleDateString("fr-FR")}
              </span>
            </div>

            <h2 className="mt-3 text-lg font-semibold text-zinc-100">
              {topic.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              <UserAvatar
                name={topic.author.name}
                image={topic.author.image}
                size="sm"
              />
              <span>
                Par{" "}
                <strong className="text-zinc-200">{topic.author.name}</strong>
              </span>
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
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function ForumPage() {
  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Forum Communautaire
          </h1>
          <p className="mt-2 text-zinc-400">
            Échangez autour des œuvres, techniques et critiques artistiques.
          </p>
        </div>

        <NewTopicForm />
      </div>

      <Suspense
        fallback={
          <p className="mt-8 text-zinc-400">Chargement des discussions...</p>
        }
      >
        <TopicsList />
      </Suspense>
    </section>
  );
}
