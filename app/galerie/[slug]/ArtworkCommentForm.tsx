"use client";

import { useActionState, useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/app/components/ToastProvider";
import { createArtworkComment, type ArtworkCommentState } from "../actions";

const initialState: ArtworkCommentState = { error: null };

export default function ArtworkCommentForm({
  artworkId,
  slug,
}: {
  artworkId: string;
  slug: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const lastSuccessRef = useRef<number | undefined>(undefined);
  const { refetch } = authClient.useSession();
  const toast = useToast();
  const [state, formAction, isPending] = useActionState(
    createArtworkComment,
    initialState,
  );

  useEffect(() => {
    if (state.successAt && state.successAt !== lastSuccessRef.current) {
      lastSuccessRef.current = state.successAt;
      formRef.current?.reset();
      refetch();
      toast.success("Commentaire publié !");
    }
  }, [state.successAt, refetch, toast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5"
    >
      <input type="hidden" name="artworkId" value={artworkId} />
      <input type="hidden" name="slug" value={slug} />

      <label className="block text-sm font-medium text-zinc-200">
        Laisser un commentaire sur cette œuvre
      </label>

      <textarea
        name="content"
        required
        minLength={2}
        maxLength={1000}
        rows={3}
        placeholder="Partagez votre ressenti ou votre avis..."
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
        {isPending ? "Envoi..." : "Publier le commentaire"}
      </button>
    </form>
  );
}
