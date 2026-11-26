import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPrestigeProgress, getRoleBadge } from "@/lib/ranks";
import UserAvatar from "@/app/components/UserAvatar";
import EditProfileForm from "./EditProfileForm";

async function ProfilContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      role: true,
      postsCount: true,
      createdAt: true,
      _count: {
        select: {
          topics: true,
          comments: true,
          likes: true,
        },
      },
    },
  });

  if (!user) {
    redirect("/connexion");
  }

  const progress = getPrestigeProgress(user.postsCount, user.createdAt);
  const roleBadge = getRoleBadge(user.role);

  return (
    <>
      {/* Fiche identité */}
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar name={user.name} image={user.image} size="lg" />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold text-zinc-100">{user.name}</h2>
              {roleBadge && (
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-semibold ${roleBadge.color}`}
                >
                  {roleBadge.label}
                </span>
              )}
              <span
                className={`rounded-md border px-2.5 py-0.5 text-xs font-medium ${progress.current.badgeColor}`}
              >
                {progress.current.label}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              {user.email} • Membre depuis le{" "}
              {new Date(user.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        {user.bio && (
          <blockquote className="mt-5 border-l-2 border-amber-500/60 pl-4 text-sm italic whitespace-pre-line text-zinc-300">
            {user.bio}
          </blockquote>
        )}

        {/* Barre de progression du prestige */}
        <div className="mt-6 rounded-lg border border-zinc-800/80 bg-zinc-950/60 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">
              Prestige :{" "}
              <strong className="text-zinc-200">{progress.points} pts</strong>
            </span>
            <span className="text-zinc-400">
              {progress.nextTier
                ? `Prochain rang : ${progress.nextTier.label} (${progress.nextTier.minPoints} pts)`
                : "Rang maximal atteint !"}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-amber-500 transition-all"
              style={{ width: `${progress.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Statistiques sur le site */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">Messages totaux</p>
          <p className="mt-1 text-2xl font-bold text-amber-400">
            {user.postsCount}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">Sujets créés</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">
            {user._count.topics}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">Réponses</p>
          <p className="mt-1 text-2xl font-bold text-zinc-100">
            {user._count.comments}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-400">J&apos;aime donnés</p>
          <p className="mt-1 text-2xl font-bold text-rose-400">
            {user._count.likes}
          </p>
        </div>
      </div>

      {/* Formulaire d'édition */}
      <EditProfileForm
        name={user.name}
        initialImage={user.image}
        initialBio={user.bio}
      />
    </>
  );
}

export default function ProfilPage() {
  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
      <Suspense
        fallback={<p className="mt-6 text-zinc-400">Chargement du profil...</p>}
      >
        <ProfilContent />
      </Suspense>
    </section>
  );
}
