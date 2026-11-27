"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/app/components/ToastProvider";

export default function MotDePasseOubliePage() {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reinitialiser-mot-de-passe",
      });

      if (error) {
        setError("Impossible d'envoyer la demande pour le moment.");
        return;
      }

      setSent(true);
      toast.info("Si ce compte existe, un email vient d'être envoyé.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <Link
        href="/connexion"
        className="text-xs text-zinc-400 transition hover:text-amber-400"
      >
        ← Retour à la connexion
      </Link>

      <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-100">
        Mot de passe oublié
      </h1>

      {sent ? (
        <div className="mt-4 space-y-4 text-sm text-zinc-300">
          <p>
            Si un compte est associé à{" "}
            <strong className="text-amber-400">{email}</strong>, un lien de
            réinitialisation vient de vous être envoyé (pensez à vérifier vos
            spams).
          </p>
          <Link
            href="/connexion"
            className="inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-400"
          >
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <p className="text-sm text-zinc-400">
            Entrez votre adresse email pour recevoir un lien de
            réinitialisation.
          </p>

          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="artiste@exemple.fr"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
      )}
    </section>
  );
}
