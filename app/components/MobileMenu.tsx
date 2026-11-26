"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getPrestigeRank, getRoleBadge } from "@/lib/ranks";
import type { NavItem } from "./NavLinks";
import UserAvatar from "./UserAvatar";
import { useToast } from "./ToastProvider";

export default function MobileMenu({ links }: { links: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { data: session, isPending } = authClient.useSession();

  async function handleSignOut() {
    await authClient.signOut();
    setIsOpen(false);
    toast.info("Vous êtes maintenant déconnecté.");
    router.push("/");
    router.refresh();
  }

  const user = session?.user;
  const prestige = user
    ? getPrestigeRank(user.postsCount, user.createdAt)
    : null;
  const roleBadge = user ? getRoleBadge(user.role) : null;

  return (
    <div className="lg:hidden">
      {/* Bouton Burger */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-100 transition hover:border-zinc-700"
      >
        {isOpen ? (
          <span className="text-lg leading-none">✕</span>
        ) : (
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        )}
      </button>

      {/* Panneau déroulant Mobile / Tablette */}
      {isOpen && (
        <div className="absolute inset-x-0 top-73px z-50 border-b border-zinc-800 bg-zinc-950/95 px-4 py-5 shadow-2xl backdrop-blur-md">
          <nav className="flex flex-col gap-1">
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-base font-medium transition ${
                    isActive
                      ? "bg-amber-500/10 text-amber-400"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 border-t border-zinc-800 pt-4">
            {isPending ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-800" />
            ) : user && prestige ? (
              <div className="space-y-3">
                <Link
                  href="/profil"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3"
                >
                  <UserAvatar name={user.name} image={user.image} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-zinc-100">
                      {user.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {roleBadge && (
                        <span
                          className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${roleBadge.color}`}
                        >
                          {roleBadge.label}
                        </span>
                      )}
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[10px] ${prestige.badgeColor}`}
                      >
                        {prestige.label}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="flex gap-2">
                  {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 rounded-lg border border-rose-500/40 bg-rose-500/10 py-2 text-center text-sm font-semibold text-rose-300"
                    >
                      Administration
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex-1 rounded-lg border border-zinc-700 py-2 text-center text-sm text-zinc-300 hover:bg-zinc-900"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/connexion"
                onClick={() => setIsOpen(false)}
                className="block w-full rounded-lg bg-amber-500 py-2.5 text-center text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
              >
                Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
