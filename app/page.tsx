import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <section className="flex flex-col-reverse items-center justify-between gap-8 py-6 text-center md:flex-row md:gap-10 md:py-12 md:text-left">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
          L&apos;art et la communauté,{" "}
          <span className="text-amber-400">réunis</span>.
        </h1>
        <p className="mt-4 text-base text-zinc-400 sm:text-lg">
          Explorez notre collection d&apos;œuvres sélectionnées, discutez avec
          d&apos;autres passionnés et évoluez au sein de la communauté.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-4 md:justify-start">
          <Link
            href="/galerie"
            className="w-full rounded-lg bg-amber-500 px-5 py-2.5 font-semibold text-zinc-950 transition hover:bg-amber-400 sm:w-auto"
          >
            Visiter la galerie
          </Link>
          <Link
            href="/forum"
            className="w-full rounded-lg border border-zinc-700 px-5 py-2.5 font-semibold transition hover:bg-zinc-900 sm:w-auto"
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
          className="h-36 w-36 rounded-full object-cover shadow-2xl shadow-indigo-500/20 ring-1 ring-indigo-500/30 sm:h-48 sm:w-48 md:h-56 md:w-56"
        />
      </div>
    </section>
  );
}
