"use client";

import { useTransition } from "react";
import { deleteArtwork } from "./actions";

export default function DeleteArtworkButton({
  artworkId,
  title,
}: {
  artworkId: string;
  title: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Supprimer l'œuvre "${title}" ?`)) return;
    startTransition(async () => {
      await deleteArtwork(artworkId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
    >
      {isPending ? "..." : "Supprimer"}
    </button>
  );
}
