"use client";

import { useActionState, useEffect, useRef } from "react";
import { createComment, type ActionState } from "../actions";

const initialState: ActionState = { error: null };

export default function ReplyForm({ topicId }: { topicId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createComment,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="mt-8 space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5"
    >
      <input type="hidden" name="topicId" value={topicId} />

      <label className="block text-sm font-medium text-zinc-200">
        Ajouter une réponse
      </label>

      <textarea
        name="content"
        required
        minLength={2}
        rows={3}
        placeholder="Écrivez votre commentaire..."
        className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
      />

      {state.error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
      >
        {isPending ? "Envoi..." : "Publier la réponse"}
      </button>
    </form>
  );
}
