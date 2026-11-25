"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = {
  href: string;
  label: string;
};

export default function NavLinks({ links }: { links: NavItem[] }) {
  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const isActive =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors ${
              isActive ? "text-amber-400" : "text-zinc-400 hover:text-zinc-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
