import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className="flex flex-col-reverse items-center justify-between gap-10 py-12 md:flex-row">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          L&apos;art et la communauté,{" "}
          <span className="text-amber-400">réunis</span>.
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          Explorez notre collection d&apos;œuvres sélectionnées, discutez avec
          d&apos;autres passionnés et évoluez au sein de la communauté.
        </p>
        <div className="mt-8 flex gap-4">
          <Link
            href="/galerie"
            className="rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Visiter la galerie
          </Link>
          <Link
            href="/forum"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 font-semibold transition hover:bg-zinc-900"
          >
            Accéder au forum
          </Link>
        </div>
      </div>

      <div className="relative shrink-0">
        <Image
          src="/logo-loup-mystique.webp"
          alt="Emblème Jinloup.Art"
          width={220}
          height={220}
          priority
          className="rounded-full object-cover shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500/30"
        />
      </div>
    </section>
  );
}
