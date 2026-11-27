import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

export default function ReinitialiserMotDePassePage() {
  return (
    <section className="mx-auto max-w-md rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-zinc-100">
        Nouveau mot de passe
      </h1>

      <Suspense
        fallback={<p className="text-sm text-zinc-400">Chargement...</p>}
      >
        <ResetPasswordForm />
      </Suspense>
    </section>
  );
}
