"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastType = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_STYLES: Record<ToastType, { box: string; icon: string }> = {
  success: {
    box: "border-emerald-500/50 bg-zinc-900/95 text-emerald-300",
    icon: "✓",
  },
  error: {
    box: "border-rose-500/50 bg-zinc-900/95 text-rose-300",
    icon: "!",
  },
  info: {
    box: "border-amber-500/50 bg-zinc-900/95 text-amber-300",
    icon: "i",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType) => {
      const id = ++nextId.current;
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, 3500);
    },
    [removeToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message) => addToast(message, "success"),
      error: (message) => addToast(message, "error"),
      info: (message) => addToast(message, "info"),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Conteneur flottant responsive (bas droite sur desktop, pleine largeur sur mobile) */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 left-4 z-50 flex flex-col gap-2 sm:left-auto sm:w-80"
      >
        {toasts.map((toast) => {
          const style = TOAST_STYLES[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-md ${style.box}`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                  {style.icon}
                </span>
                <p className="font-medium text-zinc-100">{toast.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Fermer la notification"
                className="shrink-0 text-xs text-zinc-400 hover:text-zinc-100"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error(
      "useToast doit être utilisé à l'intérieur de ToastProvider.",
    );
  }
  return ctx;
}
