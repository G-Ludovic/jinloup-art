import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";

async function ProfilContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/connexion");
  }

  const { user } = session;
  const prestige = getPrestigeRank(user.postsCount, user.createdAt);
  const roleBadge = getRoleBadge(user.role);

  return (
    <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-2xl font-bold text-zinc-100">{user.name}</h2>
        {roleBadge && (
          <span
            className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${roleBadge.color}`}
          >
            {roleBadge.label}
          </span>
        )}
        <span
          className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${prestige.badgeColor}`}
        >
          {prestige.label}
        </span>
      </div>

      <p className="text-sm text-zinc-400">Email : {user.email}</p>
      <p className="text-sm text-zinc-400">
        Membre depuis le :{" "}
        {new Date(user.createdAt).toLocaleDateString("fr-FR")}
      </p>
      <p className="text-sm text-zinc-400">
        Messages publiés sur le forum :{" "}
        <span className="font-semibold text-zinc-100">{user.postsCount}</span>
      </p>
    </div>
  );
}

export default function ProfilPage() {
  return (
    <section className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
      <Suspense
        fallback={<p className="mt-6 text-zinc-400">Chargement du profil...</p>}
      >
        <ProfilContent />
      </Suspense>
    </section>
  );
}
