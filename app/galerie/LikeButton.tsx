"use client";

import { useOptimistic, useTransition } from "react";
import Link from "next/link";
import { toggleArtworkLike } from "./actions";

export default function LikeButton({
  artworkId,
  slug,
  initialCount,
  initialLiked,
  isAuthenticated,
}: {
  artworkId: string;
  slug: string;
  initialCount: number;
  initialLiked: boolean;
  isAuthenticated: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, toggleOptimistic] = useOptimistic(
    { count: initialCount, liked: initialLiked },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    }),
  );

  if (!isAuthenticated) {
    return (
      <Link
        href="/connexion"
        title="Connectez-vous pour aimer cette œuvre"
        className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 transition hover:border-rose-500/50 hover:text-rose-300"
      >
        <span>🤍</span>
        <span>{initialCount}</span>
        <span className="text-xs text-zinc-500">(Connexion requise)</span>
      </Link>
    );
  }

  function handleClick() {
    startTransition(async () => {
      toggleOptimistic(undefined);
      await toggleArtworkLike(artworkId, slug);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
        optimisticState.liked
          ? "border-rose-500/60 bg-rose-500/15 text-rose-300"
          : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-rose-500/50 hover:text-rose-300"
      }`}
    >
      <span className="text-base">{optimisticState.liked ? "❤️" : "🤍"}</span>
      <span>{optimisticState.count}</span>
      <span>J&apos;aime</span>
    </button>
  );
}
