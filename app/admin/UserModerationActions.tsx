"use client";

import { useTransition } from "react";
import { deleteUserAccount, toggleBanUser } from "./actions";

export default function UserModerationActions({
  userId,
  userName,
  isBanned,
}: {
  userId: string;
  userName: string;
  isBanned: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleToggleBan() {
    const message = isBanned
      ? `Débannir le membre "${userName}" ?`
      : `Bannir "${userName}" ? Il sera déconnecté et ne pourra plus se connecter.`;

    if (!window.confirm(message)) return;

    startTransition(async () => {
      await toggleBanUser(userId);
    });
  }

  function handleDelete() {
    const message = `Supprimer définitivement le compte "${userName}" ?\nSes messages, commentaires et likes seront aussi supprimés.`;
    if (!window.confirm(message)) return;

    startTransition(async () => {
      await deleteUserAccount(userId);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleToggleBan}
        disabled={isPending}
        className={`text-xs font-medium transition disabled:opacity-50 ${
          isBanned
            ? "text-emerald-400 hover:text-emerald-300"
            : "text-amber-400 hover:text-amber-300"
        }`}
      >
        {isPending ? "..." : isBanned ? "Débannir" : "Bannir"}
      </button>

      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs font-medium text-rose-400 transition hover:text-rose-300 disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}
