import Link from "next/link";

export default function HomePage() {
  return (
    <section className="py-12">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        L&apos;art et la communauté,{" "}
        <span className="text-amber-400">réunis</span>.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-zinc-400">
        Explorez notre collection d&apos;œuvres sélectionnées, discutez avec
        d&apos;autres passionnés et évoluez au sein de la communauté.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/galerie"
          className="rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-amber-400"
        >
          Visiter la galerie
        </Link>
        <Link
          href="/forum"
          className="rounded-lg border border-zinc-700 px-5 py-2.5 font-semibold hover:bg-zinc-900"
        >
          Accéder au forum
        </Link>
      </div>
    </section>
  );
}
