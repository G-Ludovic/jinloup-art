"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function ConnexionPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (error) {
          setError(error.message ?? "Impossible de créer le compte.");
          return;
        }
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) {
          setError(error.message ?? "Email ou mot de passe incorrect.");
          return;
        }
      }

      router.push("/profil");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex gap-2 rounded-lg bg-zinc-950 p-1">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            !isSignUp
              ? "bg-amber-500 text-zinc-950"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          Connexion
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setError(null);
          }}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
            isSignUp
              ? "bg-amber-500 text-zinc-950"
              : "text-zinc-400 hover:text-zinc-100"
          }`}
        >
          Créer un compte
        </button>
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">
        {isSignUp ? "Rejoindre Atelier.Art" : "Bon retour parmi nous"}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {isSignUp && (
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              Pseudo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="LoupArtiste"
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500 focus:outline-none"
            />
          </div>
        )}

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

        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Mot de passe
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8 caractères minimum"
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
          {loading
            ? "Chargement..."
            : isSignUp
              ? "Créer mon compte"
              : "Se connecter"}
        </button>
      </form>
    </section>
  );
}
