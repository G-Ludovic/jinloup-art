import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import NavLinks, { type NavItem } from "./NavLinks";
import UserMenu from "./UserMenu";
import MobileMenu from "./MobileMenu";

const navLinks: NavItem[] = [
  { href: "/", label: "Accueil" },
  { href: "/galerie", label: "Galerie" },
  { href: "/forum", label: "Forum" },
  { href: "/membres", label: "Membres" },
];

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
    <header className="relative border-b border-zinc-800 bg-zinc-950 text-zinc-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-xl font-bold tracking-tight"
        >
          <Image
            src="/logo-loup-mystique.webp"
            alt="Logo Jinloup.Art"
            width={38}
            height={38}
            priority
            className="h-9 w-9 rounded-full object-cover ring-1 ring-indigo-500/40"
          />
          <span>
            Jinloup<span className="text-amber-400">.Art</span>
          </span>
        </Link>

        {/* Version Desktop (>= 1024px) */}
        <div className="hidden items-center gap-6 lg:flex">
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks links={navLinks} />
          </Suspense>

          <UserMenu />
        </div>

        {/* Version Mobile & Tablette (< 1024px) */}
        <Suspense fallback={null}>
          <MobileMenu links={navLinks} />
        </Suspense>
      </nav>
    </header>
  );
}
