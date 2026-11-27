"use client";

import { useState, useTransition } from "react";
import UserAvatar from "@/app/components/UserAvatar";
import { useToast } from "@/app/components/ToastProvider";
import { deleteArtworkComment, updateArtworkComment } from "../actions";

export type ArtworkCommentData = {
  id: string;
  content: string;
  createdAtLabel: string;
  authorName: string;
  authorImage: string | null;
  roleBadge: { label: string; color: string } | null;
  prestige: { label: string; badgeColor: string };
  canEdit: boolean;
  canDelete: boolean;
};

export default function ArtworkCommentItem({
  comment,
  slug,
}: {
  comment: ArtworkCommentData;
  slug: string;
}) {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateArtworkComment(comment.id, slug, draft);
      if (result.error) {
        setError(result.error);
        return;
      }
      setIsEditing(false);
      toast.success("Commentaire modifié !");
    });
  }

  function handleDelete() {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    startTransition(async () => {
      await deleteArtworkComment(comment.id, slug);
      toast.info("Commentaire supprimé.");
    });
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            name={comment.authorName}
            image={comment.authorImage}
            size="md"
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <strong className="text-zinc-200">{comment.authorName}</strong>
            {comment.roleBadge && (
              <span
                className={`rounded border px-1.5 py-0.5 font-semibold ${comment.roleBadge.color}`}
              >
                {comment.roleBadge.label}
              </span>
            )}
            <span
              className={`rounded border px-1.5 py-0.5 ${comment.prestige.badgeColor}`}
            >
              {comment.prestige.label}
            </span>
            <span>• {comment.createdAtLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {comment.canEdit && (
            <button
              type="button"
              onClick={() => {
                setDraft(comment.content);
                setError(null);
                setIsEditing((prev) => !prev);
              }}
              className="text-xs font-medium text-amber-400 transition hover:text-amber-300"
            >
              {isEditing ? "Annuler" : "Modifier"}
            </button>
          )}
          {comment.canDelete && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="text-xs font-medium text-rose-400 transition hover:text-rose-300 disabled:opacity-50"
            >
              {isPending ? "..." : "Supprimer"}
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSave} className="mt-3 space-y-2.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            required
            minLength={2}
            maxLength={1000}
            rows={3}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      ) : (
        <p className="mt-3 wrap-break-word whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">
          {comment.content}
        </p>
      )}
    </div>
  );
}
