"use client";

import { useTransition } from "react";
import { useToast } from "@/app/components/ToastProvider";
import { deleteArtworkComment } from "../actions";

export default function DeleteArtworkCommentButton({
  commentId,
  slug,
}: {
  commentId: string;
  slug: string;
}) {
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleDelete() {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    startTransition(async () => {
      await deleteArtworkComment(commentId, slug);
      toast.info("Commentaire supprimé.");
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-xs font-medium text-rose-400 transition hover:text-rose-300 disabled:opacity-50"
    >
      {isPending ? "..." : "Supprimer"}
    </button>
  );
}
