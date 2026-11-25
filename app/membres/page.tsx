import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";

async function MembersList() {
  const members = await prisma.user.findMany({
    orderBy: [{ postsCount: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      role: true,
      postsCount: true,
      createdAt: true,
    },
  });

  if (members.length === 0) {
    return (
      <p className="mt-8 rounded-xl border border-zinc-800 p-6 text-zinc-400">
        Aucun membre inscrit pour le moment.
      </p>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.map((member) => {
        const prestige = getPrestigeRank(member.postsCount, member.createdAt);
        const roleBadge = getRoleBadge(member.role);
        const initial = member.name.charAt(0).toUpperCase();

        return (
          <div
            key={member.id}
            className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-500/40 bg-amber-500/15 text-base font-bold text-amber-400">
                  {initial}
                </div>

                <div>
                  <h2 className="font-semibold text-zinc-100">{member.name}</h2>
                  <p className="text-xs text-zinc-400">
                    Inscrit le{" "}
                    {new Date(member.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {roleBadge && (
                  <span
                    className={`rounded border px-2 py-0.5 text-xs font-semibold ${roleBadge.color}`}
                  >
                    {roleBadge.label}
                  </span>
                )}
                <span
                  className={`rounded border px-2 py-0.5 text-xs ${prestige.badgeColor}`}
                >
                  {prestige.label}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-zinc-800/80 pt-3 text-xs text-zinc-400">
              Messages sur le forum :{" "}
              <strong className="text-zinc-200">{member.postsCount}</strong>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MembresPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Membres</h1>
      <p className="mt-2 text-zinc-400">
        Découvrez les membres de la communauté, leur ancienneté et leurs grades.
      </p>

      <Suspense
        fallback={
          <p className="mt-8 text-zinc-400">Chargement des membres...</p>
        }
      >
        <MembersList />
      </Suspense>
    </section>
  );
}
