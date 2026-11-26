"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import UserAvatar from "@/app/components/UserAvatar";
import { updateProfile, type ProfileActionState } from "./actions";

const initialState: ProfileActionState = { error: null, success: null };

export default function EditProfileForm({
  name,
  initialImage,
  initialBio,
}: {
  name: string;
  initialImage: string | null;
  initialBio: string | null;
}) {
  const router = useRouter();
  const { refetch } = authClient.useSession();
  const [imageValue, setImageValue] = useState(initialImage ?? "");
  const [bioValue, setBioValue] = useState(initialBio ?? "");
  const [resizeError, setResizeError] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      refetch();
      router.refresh();
    }
  }, [state.success, refetch, router]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResizeError(null);

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setResizeError("Choisissez une image PNG, JPG ou WebP.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const size = 48; // 48x48 pixels maximum
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          setResizeError("Impossible de traiter cette image.");
          return;
        }

        // Recadrage carré centré sans déformation
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

        const dataUrl = canvas.toDataURL("image/webp", 0.9);
        setImageValue(dataUrl);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setResizeError("Fichier image illisible.");
    };

    img.src = objectUrl;
  }

  return (
    <form
      action={formAction}
      className="mt-8 space-y-5 rounded-xl border border-zinc-800 bg-zinc-900/50 p-6"
    >
      <h2 className="text-lg font-semibold text-zinc-100">
        Personnaliser mon profil
      </h2>

      <input type="hidden" name="image" value={imageValue} />

      {/* Avatar 48x48 */}
      <div className="flex flex-wrap items-center gap-4">
        <UserAvatar name={name} image={imageValue || null} size="lg" />

        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-amber-500">
              Choisir un avatar (48×48 px)
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {imageValue && (
              <button
                type="button"
                onClick={() => setImageValue("")}
                className="text-xs text-rose-400 hover:text-rose-300"
              >
                Retirer
              </button>
            )}
          </div>
          <p className="text-xs text-zinc-500">
            PNG, JPG ou WebP — redimensionné automatiquement à 48×48 px.
          </p>
        </div>
      </div>

      {resizeError && <p className="text-xs text-rose-400">{resizeError}</p>}

      {/* Citation / Bio */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-zinc-300">
            Petite citation (3 lignes max)
          </label>
          <span className="text-xs text-zinc-500">{bioValue.length} / 160</span>
        </div>
        <textarea
          name="bio"
          rows={3}
          maxLength={160}
          value={bioValue}
          onChange={(e) => setBioValue(e.target.value)}
          placeholder="Ex : « L'art lave notre âme de la poussière du quotidien. »"
          className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
        />
      </div>

      {state.error && (
        <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
      >
        {isPending ? "Enregistrement..." : "Enregistrer mon profil"}
      </button>
    </form>
  );
}
