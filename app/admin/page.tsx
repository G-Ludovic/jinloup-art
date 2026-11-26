import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";
import AddArtworkForm from "./AddArtworkForm";
import RoleSelect from "./RoleSelect";
import DeleteArtworkButton from "./DeleteArtworkButton";

async function AdminDashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/connexion");
  }

  const isStaff =
    session.user.role === "ADMIN" || session.user.role === "MODERATOR";

  if (!isStaff) {
    redirect("/");
  }

  const isAdmin = session.user.role === "ADMIN";

  const [artworks, users, topicsCount, commentsCount] = await Promise.all([
    prisma.artwork.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        postsCount: true,
        createdAt: true,
      },
    }),
    prisma.topic.count(),
    prisma.comment.count(),
  ]);

  return (
    <div className="mt-8 space-y-10">
      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">Œuvres exposées</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {artworks.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">Membres inscrits</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">
            {users.length}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">Sujets forum</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">{topicsCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">Réponses forum</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">
            {commentsCount}
          </p>
        </div>
      </div>

      {/* Gestion Galerie (Admin uniquement) */}
      {isAdmin && (
        <div className="space-y-6">
          <AddArtworkForm />

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-zinc-100">
              Œuvres de la galerie ({artworks.length})
            </h2>

            <div className="mt-4 divide-y divide-zinc-800">
              {artworks.map((art) => (
                <div
                  key={art.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded bg-zinc-950">
                      <Image
                        src={art.imageUrl}
                        alt={art.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/galerie/${art.slug}`}
                        className="block truncate font-medium text-zinc-100 hover:text-amber-400"
                      >
                        {art.title}
                      </Link>
                      <p className="truncate text-xs text-zinc-400">
                        {art.artistName} {art.year ? `• ${art.year}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <DeleteArtworkButton artworkId={art.id} title={art.title} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gestion des Membres & Grades */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-zinc-100">
          Membres &amp; Grades ({users.length})
        </h2>

        {/* Vue Cartes sur Mobile (< 768px) */}
        <div className="mt-4 space-y-3 md:hidden">
          {users.map((u) => {
            const prestige = getPrestigeRank(u.postsCount, u.createdAt);
            const roleBadge = getRoleBadge(u.role);

            return (
              <div
                key={u.id}
                className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-100">
                      {u.name}
                    </p>
                    <p className="truncate text-xs text-zinc-400">{u.email}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded border px-2 py-0.5 text-xs ${prestige.badgeColor}`}
                  >
                    {prestige.label}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800/80 pt-3 text-xs">
                  <span className="text-zinc-400">
                    Messages :{" "}
                    <strong className="text-zinc-200">{u.postsCount}</strong>
                  </span>

                  {isAdmin ? (
                    <RoleSelect
                      userId={u.id}
                      currentRole={u.role}
                      isSelf={u.id === session.user.id}
                    />
                  ) : (
                    <span className="text-zinc-300">
                      {roleBadge?.label ?? "Membre"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Vue Tableau sur Tablette & Desktop (>= 768px) */}
        <div className="mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs text-zinc-400">
              <tr>
                <th className="py-2 pr-4">Pseudo</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Prestige</th>
                <th className="py-2 pr-4">Messages</th>
                <th className="py-2">Rôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {users.map((u) => {
                const prestige = getPrestigeRank(u.postsCount, u.createdAt);
                const roleBadge = getRoleBadge(u.role);

                return (
                  <tr key={u.id}>
                    <td className="py-3 pr-4 font-medium text-zinc-100">
                      {u.name}
                    </td>
                    <td className="py-3 pr-4 text-zinc-400">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded border px-2 py-0.5 text-xs ${prestige.badgeColor}`}
                      >
                        {prestige.label}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-zinc-300">{u.postsCount}</td>
                    <td className="py-3">
                      {isAdmin ? (
                        <RoleSelect
                          userId={u.id}
                          currentRole={u.role}
                          isSelf={u.id === session.user.id}
                        />
                      ) : (
                        <span className="text-xs text-zinc-300">
                          {roleBadge?.label ?? "Membre"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
      <p className="mt-2 text-zinc-400">
        Gérez la galerie, les membres et leurs grades.
      </p>

      <Suspense
        fallback={
          <p className="mt-8 text-zinc-400">Chargement du tableau de bord...</p>
        }
      >
        <AdminDashboard />
      </Suspense>
    </section>
  );
}
