"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/app/components/ToastProvider";
import { approveMemberArtwork, rejectMemberArtwork } from "./actions";

type PendingArtwork = {
  id: string;
  title: string;
  slug: string;
  artistName: string;
  imageUrl: string;
  medium: string | null;
  year: number | null;
  description: string;
};

export default function PendingArtworkCard({
  artwork,
}: {
  artwork: PendingArtwork;
}) {
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  function handleApprove() {
    startTransition(async () => {
      await approveMemberArtwork(artwork.id);
      toast.success(
        `« ${artwork.title} » publiée dans la Galerie des Membres !`,
      );
    });
  }

  function handleReject() {
    if (!window.confirm(`Refuser l'œuvre « ${artwork.title} » ?`)) return;
    startTransition(async () => {
      await rejectMemberArtwork(artwork.id, reason);
      toast.info(`« ${artwork.title} » refusée.`);
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-amber-500/30 bg-zinc-950/70 p-4 sm:flex-row">
      <Link
        href={`/galerie/${artwork.slug}`}
        className="relative h-48 w-full shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 sm:w-52"
      >
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          unoptimized={artwork.imageUrl.startsWith("data:")}
          sizes="(max-width: 640px) 100vw, 208px"
          className="object-contain"
        />
      </Link>

      <div className="flex flex-1 flex-col justify-between space-y-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-100">
              {artwork.title}
            </h3>
            <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300">
              En attente
            </span>
          </div>

          <p className="mt-1 text-xs text-amber-400">
            Proposé par <strong>{artwork.artistName}</strong>
            {artwork.medium ? ` • ${artwork.medium}` : ""}
            {artwork.year ? ` (${artwork.year})` : ""}
          </p>

          <p className="mt-2 text-sm text-zinc-300">{artwork.description}</p>
        </div>

        <div className="space-y-3 border-t border-zinc-800 pt-3">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motif du refus (optionnel si vous refusez)..."
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleApprove}
              disabled={isPending}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {isPending ? "..." : "✓ Accepter et publier"}
            </button>

            <button
              type="button"
              onClick={handleReject}
              disabled={isPending}
              className="rounded-lg border border-rose-500/50 bg-rose-500/10 px-4 py-1.5 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/20 disabled:opacity-50"
            >
              ✕ Refuser
            </button>

            <Link
              href={`/galerie/${artwork.slug}`}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-900"
            >
              Voir en grand
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
