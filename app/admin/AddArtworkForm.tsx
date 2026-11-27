"use client";

import { useActionState, useEffect, useRef } from "react";
import { createArtwork, type AdminActionState } from "./actions";

const initialState: AdminActionState = { error: null, successMessage: null };

export default function AddArtworkForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createArtwork,
    initialState,
  );

  useEffect(() => {
    if (state.successMessage) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <h2 className="text-lg font-semibold text-zinc-100">
        Ajouter une œuvre à la galerie
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="artwork-title"
            className="block text-sm font-medium text-zinc-300"
          >
            Titre
          </label>
          <input
            id="artwork-title"
            name="title"
            type="text"
            required
            placeholder="Ex : Loup sous la lune"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="artwork-artist"
            className="block text-sm font-medium text-zinc-300"
          >
            Artiste
          </label>
          <input
            id="artwork-artist"
            name="artistName"
            type="text"
            required
            defaultValue="Jinloup"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="artwork-image-url"
            className="block text-sm font-medium text-zinc-300"
          >
            Chemin ou URL de l&apos;image
          </label>
          <input
            id="artwork-image-url"
            name="imageUrl"
            type="text"
            required
            placeholder="/images/mon-dessin.jpg"
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Fichier dans <code>public/images/</code> ou URL{" "}
            <code>https://...</code>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="artwork-medium"
              className="block text-sm font-medium text-zinc-300"
            >
              Technique
            </label>
            <input
              id="artwork-medium"
              name="medium"
              type="text"
              placeholder="Crayon, Digital..."
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label
              htmlFor="artwork-year"
              className="block text-sm font-medium text-zinc-300"
            >
              Année
            </label>
            <input
              id="artwork-year"
              name="year"
              type="number"
              placeholder="2026"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label
          htmlFor="artwork-description"
          className="block text-sm font-medium text-zinc-300"
        >
          Description
        </label>
        <textarea
          id="artwork-description"
          name="description"
          required
          rows={3}
          placeholder="Histoire ou contexte de l'œuvre..."
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
          {state.error}
        </p>
      )}
      {state.successMessage && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {state.successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
      >
        {isPending ? "Publication..." : "Publier dans la galerie"}
      </button>
    </form>
  );
}
