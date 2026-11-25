"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { createTopic, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export default function NewTopicForm() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(
    createTopic,
    initialState,
  );

  if (sessionLoading) {
    return null;
  }

  if (!session) {
    return (
      <Link
        href="/connexion"
        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
      >
        Connectez-vous pour poster
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
      >
        {isOpen ? "Fermer" : "+ Nouveau sujet"}
      </button>

      {isOpen && (
        <form
          action={formAction}
          className="mt-6 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6"
        >
          <h2 className="text-lg font-semibold text-zinc-100">
            Ouvrir une nouvelle discussion
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-zinc-300">
                Titre du sujet
              </label>
              <input
                name="title"
                type="text"
                required
                minLength={3}
                maxLength={120}
                placeholder="Ex : Avis sur les ombres de mon dernier portrait"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300">
                Catégorie
              </label>
              <select
                name="category"
                defaultValue="Discussion"
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
              >
                <option value="Discussion">Discussion</option>
                <option value="Critique d'œuvre">Critique d&apos;œuvre</option>
                <option value="Technique">Technique</option>
                <option value="Inspiration">Inspiration</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Message
            </label>
            <textarea
              name="content"
              required
              minLength={10}
              rows={4}
              placeholder="Partagez votre question, technique ou avis..."
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {state.error && (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {isPending ? "Publication..." : "Publier le sujet"}
          </button>
        </form>
      )}
    </div>
  );
}
