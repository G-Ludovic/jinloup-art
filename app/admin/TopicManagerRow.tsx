"use client";

import { useActionState, useState, useTransition } from "react";
import Link from "next/link";
import {
  deleteTopicAdmin,
  updateTopic,
  type AdminActionState,
} from "./actions";

type TopicItem = {
  id: string;
  title: string;
  category: string;
  content: string;
  authorName: string;
  commentsCount: number;
};

const initialState: AdminActionState = { error: null, successMessage: null };

export default function TopicManagerRow({ topic }: { topic: TopicItem }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [state, formAction, isPending] = useActionState(
    updateTopic,
    initialState,
  );

  function handleDelete() {
    if (
      !window.confirm(`Supprimer le sujet "${topic.title}" et ses réponses ?`)
    ) {
      return;
    }
    startDeleteTransition(async () => {
      await deleteTopicAdmin(topic.id);
    });
  }

  return (
    <div className="py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-zinc-700 bg-zinc-950 px-2 py-0.5 text-[11px] text-amber-400">
              {topic.category}
            </span>
            <Link
              href={`/forum/${topic.id}`}
              className="truncate font-medium text-zinc-100 hover:text-amber-400"
            >
              {topic.title}
            </Link>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Par {topic.authorName} • {topic.commentsCount} réponse
            {topic.commentsCount > 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className="text-xs font-medium text-amber-400 hover:text-amber-300"
          >
            {isEditing ? "Fermer" : "Modifier"}
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-xs font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
          >
            {isDeleting ? "..." : "Supprimer"}
          </button>
        </div>
      </div>

      {isEditing && (
        <form
          action={formAction}
          className="mt-4 space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4"
        >
          <input type="hidden" name="topicId" value={topic.id} />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-300">
                Titre
              </label>
              <input
                name="title"
                type="text"
                required
                minLength={3}
                maxLength={120}
                defaultValue={topic.title}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300">
                Catégorie
              </label>
              <select
                name="category"
                defaultValue={topic.category}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="Discussion">Discussion</option>
                <option value="Critique d'œuvre">Critique d&apos;œuvre</option>
                <option value="Technique">Technique</option>
                <option value="Inspiration">Inspiration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300">
              Message
            </label>
            <textarea
              name="content"
              required
              minLength={10}
              rows={4}
              defaultValue={topic.content}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {state.error && (
            <p className="rounded border border-rose-500/40 bg-rose-500/10 p-2 text-xs text-rose-300">
              {state.error}
            </p>
          )}
          {state.successMessage && (
            <p className="rounded border border-emerald-500/40 bg-emerald-500/10 p-2 text-xs text-emerald-300">
              {state.successMessage}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-amber-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
            >
              {isPending ? "Sauvegarde..." : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
