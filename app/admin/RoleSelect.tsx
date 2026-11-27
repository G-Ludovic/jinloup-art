"use client";

import { useTransition } from "react";
import { updateUserRole } from "./actions";

export default function RoleSelect({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value;
    startTransition(async () => {
      await updateUserRole(userId, newRole);
    });
  }

  return (
    <select
      value={currentRole}
      onChange={handleChange}
      disabled={isPending || isSelf}
      title={
        isSelf
          ? "Vous ne pouvez pas modifier votre propre rôle"
          : "Changer le rôle"
      }
      aria-label={isSelf ? "Votre rôle (non modifiable)" : "Rôle du membre"}
      className="rounded-md border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs text-zinc-100 focus:border-amber-500 focus:outline-none disabled:opacity-50"
    >
      <option value="MEMBER">Membre</option>
      <option value="MODERATOR">Modérateur</option>
      <option value="ADMIN">Admin</option>
    </select>
  );
}
