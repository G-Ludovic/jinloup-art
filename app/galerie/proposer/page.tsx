"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/app/components/ToastProvider";
import { submitMemberArtwork, type SubmitArtworkState } from "../actions";

const initialState: SubmitArtworkState = { error: null, successMessage: null };

export default function ProposerOeuvrePage() {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [imageData, setImageData] = useState("");
  const [imageError, setImageError] = useState<string | null>(null);

  async function handleSubmit(
    previousState: SubmitArtworkState,
    formData: FormData,
  ) {
    const nextState = await submitMemberArtwork(previousState, formData);
    if (nextState.successMessage) setImageData("");
    return nextState;
  }

  const [state, formAction, isPending] = useActionState(
    handleSubmit,
    initialState,
  );

  useEffect(() => {
    if (state.successMessage) {
      formRef.current?.reset();
      toast.success("Œuvre envoyée pour validation !");
    }
  }, [state.successMessage, toast]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setImageError("Formats acceptés : PNG, JPG ou WebP.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      try {
        const maxSide = 900;
        let width = img.width;
        let height = img.height;

        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setImageError("Impossible de préparer cette image.");
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/webp", 0.82);
        setImageData(compressed);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setImageError("Fichier image illisible.");
    };

    img.src = objectUrl;
  }

  if (sessionLoading) {
    return <p className="text-zinc-400">Chargement...</p>;
  }

  if (!session) {
    return (
      <section className="mx-auto max-w-lg rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <h1 className="text-2xl font-bold text-zinc-100">Proposer une œuvre</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Connectez-vous pour exposer vos créations dans la Galerie des Membres.
        </p>
        <Link
          href="/connexion"
          className="mt-5 inline-block rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Se connecter
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl">
      <Link
        href="/galerie"
        className="text-sm text-zinc-400 transition hover:text-amber-400"
      >
        ← Retour à la galerie
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-100">
        Proposer une œuvre
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Votre création sera vérifiée par l&apos;équipe avant d&apos;apparaître
        dans la Galerie des Membres.
      </p>

      <form
        ref={formRef}
        action={formAction}
        className="mt-6 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
      >
        <input type="hidden" name="imageUrl" value={imageData} />

        <div>
          <p className="block text-sm font-medium text-zinc-300">
            Fichier de votre œuvre
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-amber-500">
              Choisir une image
              <input
                id="artwork-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <span className="text-xs text-zinc-500">
              PNG, JPG ou WebP (optimisé automatiquement)
            </span>
          </div>

          {imageError && (
            <p className="mt-2 text-xs text-rose-400">{imageError}</p>
          )}

          {imageData && (
            <div className="mt-4">
              <Image
                src={imageData}
                alt="Aperçu de l'œuvre"
                width={300}
                height={200}
                className="max-h-64 rounded-lg border border-zinc-700 object-contain"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label
              htmlFor="artwork-title"
              className="block text-sm font-medium text-zinc-300"
            >
              Titre de l&apos;œuvre
            </label>
            <input
              id="artwork-title"
              name="title"
              type="text"
              required
              minLength={2}
              maxLength={100}
              placeholder="Ex : Renard sous la neige"
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
              defaultValue={2026}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="artwork-medium"
            className="block text-sm font-medium text-zinc-300"
          >
            Technique (optionnel)
          </label>
          <input
            id="artwork-medium"
            name="medium"
            type="text"
            placeholder="Ex : Crayon, Aquarelle, Digital..."
            className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
          />
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
            minLength={5}
            maxLength={1000}
            rows={4}
            placeholder="Parlez-nous de votre inspiration ou des outils utilisés..."
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
          disabled={isPending || !imageData}
          className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
        >
          {isPending ? "Envoi en cours..." : "Envoyer pour validation"}
        </button>
      </form>
    </section>
  );
}
