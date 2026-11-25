"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";

export default function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <div className="h-9 w-24 animate-pulse rounded-lg bg-zinc-800" />;
  }

  if (!session) {
    return (
      <Link
        href="/connexion"
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
      >
        Connexion
      </Link>
    );
  }

  const { user } = session;
  const prestige = getPrestigeRank(user.postsCount, user.createdAt);
  const roleBadge = getRoleBadge(user.role);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3">
      {(user.role === "ADMIN" || user.role === "MODERATOR") && (
        <Link
          href="/admin"
          className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
        >
          Admin
        </Link>
      )}

      <Link
        href="/profil"
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm hover:border-zinc-700"
      >
        <span className="font-medium text-zinc-100">{user.name}</span>
        {roleBadge && (
          <span
            className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${roleBadge.color}`}
          >
            {roleBadge.label}
          </span>
        )}
        <span
          className={`rounded border px-1.5 py-0.5 text-[11px] ${prestige.badgeColor}`}
        >
          {prestige.label}
        </span>
      </Link>

      <button
        type="button"
        onClick={handleSignOut}
        className="text-xs text-zinc-400 hover:text-zinc-100"
      >
        Déconnexion
      </button>
    </div>
  );
}
