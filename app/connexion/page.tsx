"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/app/components/ToastProvider";

export default function ConnexionPage() {
  const router = useRouter();
  const toast = useToast();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleResendEmail() {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/profil",
      });
      if (error) {
        toast.error("Impossible de renvoyer l'email pour le moment.");
      } else {
        toast.success("Nouveau lien de confirmation envoyé !");
      }
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNeedsVerification(false);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/profil",
        });
        if (error) {
          setError(error.message ?? "Impossible de créer le compte.");
          return;
        }
        setVerificationSent(true);
        toast.info("Email de confirmation envoyé ! Vérifiez votre boîte mail.");
        return;
      }

      const { error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        if (error.status === 403 || error.code === "EMAIL_NOT_VERIFIED") {
          setNeedsVerification(true);
          setError(
            "Votre adresse email n'est pas encore confirmée. Cliquez sur le lien reçu par mail.",
          );
          return;
        }
        setError(error.message ?? "Email ou mot de passe incorrect.");
        return;
      }

      toast.success("Connexion réussie ! Bon retour parmi nous.");
      router.push("/profil");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (verificationSent) {
    return (
      <section className="mx-auto max-w-md rounded-xl border border-amber-500/30 bg-zinc-900/50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 text-2xl">
          📧
        </div>
        <h1 className="mt-4 text-2xl font-bold text-zinc-100">
          Vérifiez votre boîte mail
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-300">
          Un lien de confirmation vient d&apos;être envoyé à{" "}
          <strong className="text-amber-400">{email}</strong>. Cliquez dessus
          pour activer votre compte (pensez à vérifier vos spams).
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resending}
            className="rounded-lg border border-zinc-700 py-2 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {resending ? "Envoi..." : "Renvoyer l'email de confirmation"}
          </button>

          <button
            type="button"
            onClick={() => {
              setVerificationSent(false);
              setIsSignUp(false);
              setError(null);
            }}
            className="text-xs text-amber-400 hover:underline"
          >
            Retour à la connexion
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <div className="flex gap-2 rounded-lg bg-zinc-950 p-1">
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setError(null);
            setNeedsVerification(false);
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
            setNeedsVerification(false);
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
        {isSignUp ? "Rejoindre Jinloup.Art" : "Bon retour parmi nous"}
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
          <div className="space-y-2 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-300">
            <p>{error}</p>
            {needsVerification && (
              <button
                type="button"
                onClick={handleResendEmail}
                disabled={resending}
                className="text-xs font-semibold text-amber-400 hover:underline disabled:opacity-50"
              >
                {resending ? "Envoi..." : "→ Renvoyer le lien de confirmation"}
              </button>
            )}
          </div>
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
