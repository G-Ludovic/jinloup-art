import { Suspense } from "react";
import Link from "next/link";
import NavLinks, { navLinks } from "./NavLinks";

function NavLinksFallback() {
  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-medium text-zinc-400"
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export default function Navbar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Jinloup<span className="text-amber-400">.Art</span>
        </Link>

        <div className="flex items-center gap-6">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>

          <Link
            href="/connexion"
            className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-400"
          >
            Connexion
          </Link>
        </div>
      </nav>
    </header>
  );
}
