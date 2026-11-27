"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type NotificationItem = {
  id: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationBell() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user.id;
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as {
        notifications: NotificationItem[];
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // Silencieux en cas de perte réseau temporaire
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const initialLoad = setTimeout(loadNotifications, 0);
    const onFocus = () => {
      loadNotifications();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      clearTimeout(initialLoad);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadNotifications, userId]);

  async function handleMarkAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  async function handleDeleteRead() {
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deleteRead: true }),
    });
    setNotifications((prev) => prev.filter((n) => !n.read));
  }

  async function handleDeleteOne(notif: NotificationItem) {
    await fetch("/api/notifications", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: notif.id }),
    });
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    if (!notif.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  }

  async function handleClickNotification(notif: NotificationItem) {
    if (!notif.read) {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notif.id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  }

  const hasReadNotifications = notifications.some((n) => n.read);

  if (isPending || !session) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          const next = !isOpen;
          setIsOpen(next);
          if (next) loadNotifications();
        }}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[90vw] rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
            <span className="text-xs font-semibold text-zinc-200">
              Notifications ({unreadCount})
            </span>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Tout lire
                </button>
              )}
              {hasReadNotifications && (
                <button
                  type="button"
                  onClick={handleDeleteRead}
                  className="text-[11px] text-rose-400 hover:underline"
                >
                  Effacer les lues
                </button>
              )}
            </div>
          </div>

          {notifications.length === 0 ? (
            <p className="py-6 text-center text-xs text-zinc-500">
              Aucune notification pour le moment.
            </p>
          ) : (
            <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`flex items-start justify-between gap-2 rounded-lg p-2.5 text-xs transition ${
                    notif.read
                      ? "text-zinc-400 hover:bg-zinc-900"
                      : "border border-amber-500/20 bg-amber-500/10 text-zinc-100 hover:bg-amber-500/15"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleClickNotification(notif)}
                    className="flex-1 text-left"
                  >
                    <p className="leading-snug">{notif.message}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      {new Date(notif.createdAt).toLocaleString("fr-FR")}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteOne(notif)}
                    aria-label="Supprimer cette notification"
                    title="Supprimer"
                    className="shrink-0 rounded px-1.5 py-0.5 text-[11px] text-zinc-500 transition hover:bg-zinc-800 hover:text-rose-400"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
