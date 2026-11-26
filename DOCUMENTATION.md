# Guide Technique & Architecture — Jinloup.Art (Next.js 16)

Ce document résume l'architecture complète, les concepts clés, les commandes et les retours d'expérience appliqués dans ce projet **Next.js 16**, afin de servir de support de révision et de base réutilisable pour de futurs projets full-stack.

---

## 1. Stack Technique

| Brique                   | Outil utilisé                                    | Rôle                                                |
| :----------------------- | :----------------------------------------------- | :-------------------------------------------------- |
| **Framework Full-Stack** | **Next.js 16** (App Router + Turbopack)          | Routage, rendu serveur/client, API, Server Actions  |
| **Langage**              | **TypeScript**                                   | Typage strict bout-en-bout (BDD → Serveur → Client) |
| **Style**                | **Tailwind CSS**                                 | Design responsive par classes utilitaires           |
| **Base de données**      | **PostgreSQL** (hébergé sur **Neon**, Francfort) | Base relationnelle                                  |
| **ORM**                  | **Prisma 7** (`@prisma/adapter-pg`)              | Modélisation du schéma, migrations, requêtes typées |
| **Authentification**     | **Better Auth** (`@better-auth/prisma-adapter`)  | Inscription, connexion, sessions sécurisées en BDD  |
| **Déploiement**          | **Vercel**                                       | CI/CD automatique depuis GitHub                     |

---

## 2. Arborescence du projet

```text
jinloup-art/
├── app/
│   ├── api/auth/[...all]/route.ts   # Endpoints Better Auth automatiques
│   ├── components/
│   │   ├── Navbar.tsx               # Header responsive (Server Component)
│   │   ├── NavLinks.tsx             # Liens actifs avec usePathname (Client Component)
│   │   ├── MobileMenu.tsx           # Menu burger mobile/tablette (Client Component)
│   │   ├── UserMenu.tsx             # Menu utilisateur desktop (Client Component)
│   │   ├── UserAvatar.tsx           # Avatar circulaire 28/36/48 px ou initiale
│   │   └── Footer.tsx               # Pied de page en 2 étages (Server Component)
│   ├── admin/
│   │   ├── page.tsx                 # Dashboard Admin protégé + vue cartes mobile
│   │   ├── actions.ts               # Server Actions Admin (œuvres & rôles)
│   │   ├── AddArtworkForm.tsx       # Formulaire d'ajout d'œuvre
│   │   ├── DeleteArtworkButton.tsx  # Bouton de suppression confirmé
│   │   └── RoleSelect.tsx           # Sélecteur de rôle membre
│   ├── connexion/page.tsx           # Inscription & Connexion (Client Component)
│   ├── forum/
│   │   ├── page.tsx                 # Liste des sujets (Server Component)
│   │   ├── actions.ts               # Server Actions Forum (sujets, réponses, modération)
│   │   ├── NewTopicForm.tsx         # Formulaire nouveau sujet
│   │   └── [id]/
│   │       ├── page.tsx             # Détail d'un sujet + réponses + signatures
│   │       ├── ReplyForm.tsx        # Formulaire de réponse
│   │       └── DeleteButton.tsx     # Suppression sujet/commentaire
│   ├── galerie/
│   │   ├── page.tsx                 # Liste des œuvres + compteur likes
│   │   ├── actions.ts               # Server Action toggleArtworkLike
│   │   ├── LikeButton.tsx           # Bouton J'aime optimiste (useOptimistic)
│   │   ├── LikersSummary.tsx        # Résumé + modale liste des likes
│   │   └── [slug]/page.tsx          # Détail d'une œuvre (Route dynamique)
│   ├── membres/page.tsx             # Annuaire public des membres & grades
│   ├── profil/
│   │   ├── page.tsx                 # Profil protégé, stats & progression prestige
│   │   ├── actions.ts               # Server Action updateProfile (avatar + bio)
│   │   └── EditProfileForm.tsx      # Upload avatar recadré 48x48 px + citation
│   ├── mentions-legales/page.tsx    # Mentions légales (LCEN)
│   ├── politique-confidentialite/page.tsx # Politique RGPD
│   ├── layout.tsx                   # Squelette sticky-footer + metadata & favicon
│   └── page.tsx                     # Page d'accueil responsive (/)
├── lib/
│   ├── prisma.ts                    # Instance unique (singleton) de PrismaClient
│   ├── auth.ts                      # Configuration serveur Better Auth
│   ├── auth-client.ts               # Client React Better Auth (typé)
│   ├── ranks.ts                     # Rangs de prestige, barre de progression & badges
│   └── generated/prisma/            # Client Prisma généré automatiquement
├── prisma/
│   ├── schema.prisma                # Modèles BDD (Artwork, ArtworkLike, User, Topic, Comment...)
│   └── migrations/                  # Historique SQL des migrations
├── public/
│   ├── logo-loup-mystique.webp      # Logo principal & favicon
│   └── images/                      # Œuvres locales servies depuis /images/...
├── .env                             # Variables secrètes (JAMAIS commité sur Git)
├── next.config.ts                   # Configuration Next.js (images.remotePatterns)
└── prisma7.config.ts                # Configuration CLI Prisma (pointe sur DIRECT_URL)
```

---

## 3. Concepts clés de Next.js 16 (App Router)

### A. Le routage par dossiers & fichiers spéciaux

- Un dossier dans `app/` ne devient une URL accessible que s'il contient **`page.tsx`**.
- **`layout.tsx`** enveloppe toutes les pages sans se recharger.
- **`[slug]` ou `[id]`** : route dynamique. `params` est une **Promise** à attendre avec `await params`.
- **`[...all]`** : route _catch-all_ (utilisée par Better Auth).
- **`notFound()`** : déclenche une vraie page 404 si une ressource est introuvable.
- **Favicon :** Next.js donne la priorité à `app/favicon.ico` ou `app/icon.{png,jpg,svg,ico}`. Pour utiliser un `.webp` placé dans `public/`, il faut supprimer `app/favicon.ico` et déclarer `metadata.icons` dans `app/layout.tsx`.

### B. Server Components vs Client Components

- **Server Component (par défaut) :** exécuté uniquement côté serveur, lit Prisma et les sessions sans exposer de secrets au navigateur, ne peut pas utiliser de hooks React.
- **Client Component (`"use client";`) :** réservé aux zones interactives (`useState`, `useActionState`, `useOptimistic`, `useTransition`, `usePathname`, `authClient.useSession()`).
- **Bonne pratique :** isoler `"use client";` sur les plus petits composants possibles (`NavLinks.tsx`, `MobileMenu.tsx`, `LikeButton.tsx`).

### C. Règles strictes de Next.js 16 (`Cache Components`)

1. **Toujours entourer les données dynamiques d'un `<Suspense>` :**
   - Tout composant qui lit des données à la volée (`prisma.*`, `headers()`, `auth.api.getSession()`, `usePathname()`) doit être placé dans un `<Suspense fallback={...}>` (erreur sinon : `blocking-prerender-client-hook` ou `uncached data accessed outside <Suspense>`).
   - Dans les composants statiques globaux (`Footer.tsx`), éviter `new Date()` hors `<Suspense>` pour ne pas bloquer le pré-rendu des pages statiques et `/_not-found`.
2. **Ne jamais importer de données depuis un fichier `"use client"` dans un Server Component :**
   - Tout export d'un fichier `"use client"` devient une référence client côté serveur (erreur au `npm run build` : `TypeError: ...map is not a function`).
   - _Solution :_ déclarer `navLinks` dans le Server Component (`Navbar.tsx`) et le passer via `props` (`<NavLinks links={navLinks} />`, `<MobileMenu links={navLinks} />`).

---

## 4. PostgreSQL (Neon) & Prisma 7

### A. Les deux URLs Neon dans `.env`

- **`DATABASE_URL`** _(avec `-pooler`)_ : utilisée par l'application (`lib/prisma.ts`) pour gérer les connexions simultanées.
- **`DIRECT_URL`** _(sans `-pooler`)_ : utilisée par `prisma7.config.ts` pour exécuter les migrations (`prisma migrate dev`).
- Toujours utiliser **`sslmode=verify-full`** dans les deux URLs pour éviter le warning SSL du pilote `pg`.

### B. Le Singleton `lib/prisma.ts`

Stocke `PrismaClient` dans `globalThis` en développement pour éviter de saturer Neon lors du Hot Reload.

> **Réflexe indispensable :** après toute modification de `prisma/schema.prisma`, exécuter `npx prisma migrate dev`, `npx prisma generate`, puis **redémarrer `npm run dev` (`Ctrl+C`)** pour vider l'ancien client en cache dans `globalThis` (sinon `prisma.nouvelleTable` ou un nouveau champ fera planter les requêtes).

### C. Relations & Contraintes avancées

- **Transactions (`prisma.$transaction`) :** création d'un sujet/commentaire + incrémentation de `postsCount` de manière atomique.
- **Unicité des Likes (`ArtworkLike`) :** `@@unique([artworkId, userId])` empêche les doublons au niveau SQL et génère la clé composée `artworkId_userId` dans Prisma.

---

## 5. Authentification, Profil & Système de Grades (Better Auth)

### A. Sécurité Serveur & Champs personnalisés

- `lib/auth.ts` déclare `role`, `postsCount` et `bio` dans `user.additionalFields` avec **`input: false`** (empêche l'auto-élévation de privilèges à l'inscription).
- `nextCookies()` est placé en dernier dans `plugins`.
- `lib/auth-client.ts` utilise `inferAdditionalFields<typeof auth>()` pour typer `session.user` côté React, et `refetch()` permet de rafraîchir la session client après modification du profil.
- **Sécurité des données publiques :** sur `/membres` et dans la modale des likes (`LikersSummary`), on ne sélectionne **jamais** le champ `email` dans Prisma.

### B. Avatars 48×48 px sans stockage externe (compatible Vercel)

- Dans `EditProfileForm.tsx`, le navigateur recadre l'image en carré et la redimensionne à **48×48 px en WebP** via `<canvas>` (~2 Ko).
- La Server Action `updateProfile` valide strictement le préfixe (`data:image/(webp|png|jpeg);base64,` ou `https://`) et la taille max (`25 000` caractères) avant d'enregistrer dans `user.image`, protégeant contre les injections SVG/XSS.

### C. Grades Hybrides (`lib/ranks.ts`)

- **Permissions (`user.role`) :** `"MEMBER" | "MODERATOR" | "ADMIN"`.
- **Prestige :** `points = postsCount * 10 + joursDancienneté` (_Novice_ 0 → _Apprenti_ 30 → _Amateur Éclairé_ 100 → _Connaisseur_ 300 → _Maître d'Art_ 700), avec calcul du pourcentage de progression (`getPrestigeProgress`).

---

## 6. Server Actions, Optimistic UI & Responsive

### A. Formulaires & Actions

- **`useActionState`** : gestion des formulaires avec validation et erreur serveur (`NewTopicForm`, `ReplyForm`, `AddArtworkForm`, `EditProfileForm`).
- **`useTransition`** : feedback de chargement sur boutons/sélecteurs (`DeleteButton`, `RoleSelect`).
- **`useOptimistic`** (`LikeButton.tsx`) : met à jour le ❤️ et le compteur instantanément à l'écran (0 ms) avant la réponse serveur de `toggleArtworkLike`.
- Toujours appeler `redirect()` **hors** des blocs `try/catch`.

### B. Mise en page Responsive

- **Sticky Footer (`app/layout.tsx`) :** `body` en `flex min-h-dvh flex-col` et `main` en `flex-1` pour coller le footer en bas même sur les pages courtes.
- **Navigation adaptative :** menu horizontal sur `lg:flex` (≥ 1024 px) et `MobileMenu.tsx` (menu burger + tiroir tactile) en dessous de `lg:`.
- **Tableaux Admin adaptatifs :** cartes empilées sur mobile (`md:hidden`) et tableau complet sur tablette/desktop (`hidden md:block`).

---

## 7. Déploiement Vercel & Checklist de Production

### A. Préparation du projet

1. Dans `package.json`, définir `"build": "prisma generate && next build"` pour que Vercel régénère le client Prisma à chaque déploiement.
2. Vérifier en local avec `npm run build` et `npm run start`.

### B. Variables d'environnement sur Vercel

- Copier `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET` et `BETTER_AUTH_URL` **sans guillemets `"`**.
- **`BETTER_AUTH_URL`** doit correspondre exactement au domaine de production en `https://` et **sans `/` final** (ex : `https://jinloup-art.vercel.app`), sinon Better Auth renvoie **`Invalid origin`** à la connexion.
- _Astuce multi-environnements :_ l'option `baseURL: { allowedHosts: [...] }` dans `lib/auth.ts` permet aussi d'accepter automatiquement `localhost:3000` et les URLs de Preview Vercel.
- Sur Vercel, ne pas cliquer sur l'intégration optionnelle _Prisma Postgres_ si vous utilisez déjà Neon dans vos variables d'environnement.
- _Note stockage :_ en serverless (Vercel), le disque serveur est en lecture seule. Les images dans `public/images/` (commitées sur Git) fonctionnent parfaitement, mais l'upload de nouvelles œuvres depuis `/admin` en production nécessite soit des URLs externes, soit un service cloud (Cloudinary, UploadThing, Vercel Blob).
