import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jinloup-Art — Galerie & Forum",
  description: "Galerie d'art en ligne et forum communautaire",
  icons: {
    icon: "/logo-loup-mystique.webp",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <body className="flex min-h-dvh flex-col bg-zinc-950 text-zinc-100 antialiased">
        <Navbar />

        {/* flex-1 dit à <main> de prendre tout l'espace libre et de pousser <Footer /> en bas */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  );
}
