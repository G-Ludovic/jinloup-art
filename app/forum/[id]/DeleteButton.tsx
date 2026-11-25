"use client";

import { useTransition } from "react";

export default function DeleteButton({
  onDelete,
  confirmMessage,
  label = "Supprimer",
}: {
  onDelete: () => Promise<void>;
  confirmMessage: string;
  label?: string;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      await onDelete();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="text-xs font-medium text-rose-400 transition hover:text-rose-300 disabled:opacity-50"
    >
      {isPending ? "Suppression..." : label}
    </button>
  );
}
