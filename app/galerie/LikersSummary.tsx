"use client";

import { useState } from "react";
import UserAvatar from "@/app/components/UserAvatar";

export type LikerInfo = {
  id: string;
  name: string;
  image: string | null;
  roleBadge: { label: string; color: string } | null;
  prestige: { label: string; badgeColor: string };
};

export default function LikersSummary({ likers }: { likers: LikerInfo[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (likers.length === 0) {
    return (
      <p className="mt-3 text-xs text-zinc-500">
        Soyez le premier à aimer cette œuvre.
      </p>
    );
  }

  function renderSummaryText() {
    if (likers.length === 1) {
      return (
        <>
          Aimé par <strong className="text-zinc-200">{likers[0].name}</strong>
        </>
      );
    }
    if (likers.length === 2) {
      return (
        <>
          Aimé par <strong className="text-zinc-200">{likers[0].name}</strong>{" "}
          et <strong className="text-zinc-200">{likers[1].name}</strong>
        </>
      );
    }
    const othersCount = likers.length - 2;
    return (
      <>
        Aimé par <strong className="text-zinc-200">{likers[0].name}</strong>,{" "}
        <strong className="text-zinc-200">{likers[1].name}</strong> et{" "}
        <strong className="text-zinc-200">
          {othersCount} autre{othersCount > 1 ? "s" : ""} membre
          {othersCount > 1 ? "s" : ""}
        </strong>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="mt-3 block text-left text-xs text-zinc-400 transition hover:text-zinc-200 hover:underline"
      >
        {renderSummaryText()}
      </button>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-base font-semibold text-zinc-100">
                Mentions J&apos;aime ({likers.length})
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-2 py-1 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              >
                ✕
              </button>
            </div>

            <ul className="mt-4 max-h-80 space-y-3 overflow-y-auto pr-1">
              {likers.map((liker) => (
                <li
                  key={liker.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800/70 bg-zinc-900/40 px-3 py-2.5"
                >
                  <UserAvatar name={liker.name} image={liker.image} size="sm" />
                  <span className="text-sm font-medium text-zinc-100">
                    {liker.name}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {liker.roleBadge && (
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[11px] font-semibold ${liker.roleBadge.color}`}
                      >
                        {liker.roleBadge.label}
                      </span>
                    )}
                    <span
                      className={`rounded border px-1.5 py-0.5 text-[11px] ${liker.prestige.badgeColor}`}
                    >
                      {liker.prestige.label}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
