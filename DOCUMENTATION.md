# Guide Technique & Architecture — Jinloup.Art (Next.js 16)

Ce document résume l'architecture, les concepts clés, les commandes et les bonnes pratiques appliquées dans ce projet **Next.js 16**, afin de servir de support de révision et de base réutilisable pour de futurs projets full-stack.

---

## 1. Stack Technique

| Brique                   | Outil utilisé                                   | Rôle                                                |
| :----------------------- | :---------------------------------------------- | :-------------------------------------------------- |
| **Framework Full-Stack** | **Next.js 16** (App Router + Turbopack)         | Routage, rendu serveur/client, API, Server Actions  |
| **Langage**              | **TypeScript**                                  | Typage strict bout-en-bout (BDD → Serveur → Client) |
| **Style**                | **Tailwind CSS**                                | Design rapide par classes utilitaires               |
| **Base de données**      | **PostgreSQL** (hébergé sur **Neon**)           | Base relationnelle                                  |
| **ORM**                  | **Prisma 7** (`@prisma/adapter-pg`)             | Modélisation du schéma, migrations, requêtes typées |
| **Authentification**     | **Better Auth** (`@better-auth/prisma-adapter`) | Inscription, connexion, sessions sécurisées en BDD  |

---

## 2. Arborescence du projet

```text
jinloup-art/
├── app/
│   ├── api/auth/[...all]/route.ts   # Endpoints Better Auth automatiques
│   ├── components/
│   │   ├── Navbar.tsx               # Header (Server Component)
│   │   ├── NavLinks.tsx             # Liens actifs avec usePathname (Client Component)
│   │   └── UserMenu.tsx             # Menu utilisateur & badges (Client Component)
│   ├── admin/
│   │   ├── page.tsx                 # Dashboard Admin protégé (Server Component)
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
│   │       ├── page.tsx             # Détail d'un sujet + réponses (Route dynamique)
│   │       ├── ReplyForm.tsx        # Formulaire de réponse
│   │       └── DeleteButton.tsx     # Suppression sujet/commentaire
│   ├── galerie/
│   │   ├── page.tsx                 # Liste des œuvres (Server Component)
│   │   └── [slug]/page.tsx          # Détail d'une œuvre (Route dynamique)
│   ├── profil/page.tsx              # Profil protégé (Server Component)
│   ├── layout.tsx                   # Squelette global + metadata SEO
│   └── page.tsx                     # Page d'accueil (/)
├── lib/
│   ├── prisma.ts                    # Instance unique (singleton) de PrismaClient
│   ├── auth.ts                      # Configuration serveur Better Auth
│   ├── auth-client.ts               # Client React Better Auth (typé)
│   ├── ranks.ts                     # Calcul des rangs de prestige & badges de rôle
│   └── generated/prisma/            # Client Prisma généré automatiquement
├── prisma/
│   ├── schema.prisma                # Modèles BDD (Artwork, User, Session, Topic, Comment...)
│   └── migrations/                  # Historique SQL des migrations
├── public/images/                   # Images locales servies depuis /images/...
├── .env                             # Variables secrètes (JAMAIS commité sur Git)
├── next.config.ts                   # Configuration Next.js (ex: images.remotePatterns)
└── prisma7.config.ts                # Configuration CLI Prisma (pointe sur DIRECT_URL)
```

---

## 3. Concepts clés de Next.js 16 (App Router)

### A. Le routage par dossiers

- Un dossier dans `app/` ne devient une URL accessible que s'il contient **`page.tsx`**.
- **`layout.tsx`** enveloppe toutes les pages de son dossier et sous-dossiers sans se recharger lors de la navigation.
- **`[slug]` ou `[id]`** : route dynamique. Depuis Next.js 15/16, `params` est une **Promise** :
  ```tsx
  export default async function Page({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }) {
    const { slug } = await params;
  }
  ```
- **`[...all]`** : route _catch-all_ (utilisée dans `app/api/auth/[...all]/route.ts`).
- **`notFound()`** (de `next/navigation`) : déclenche immédiatement une vraie page 404 si une donnée n'existe pas en BDD.

### B. Server Components vs Client Components

- **Par défaut, tout composant dans `app/` est un Server Component** :
  - S'exécute uniquement côté serveur (les `console.log` s'affichent dans le terminal, pas dans le navigateur).
  - Peut appeler `prisma` et lire les cookies/sessions directement, sans exposer de secrets au client.
  - Ne peut **pas** utiliser `useState`, `useEffect`, `onClick` ou les hooks de navigation.
- **Client Component (`"use client";` en ligne 1)** :
  - Indispensable dès qu'il y a de l'interactivité (`useState`, `onClick`, `useActionState`, `usePathname`, `authClient.useSession()`).
  - **Bonne pratique :** garder `"use client";` sur les plus petits composants possibles (ex : `NavLinks.tsx` plutôt que toute la `Navbar.tsx`).

### C. Règles strictes de Next.js 16 (Cache Components & Build)

1. **Toujours entourer les données dynamiques d'un `<Suspense>` :**
   - En Next.js 16 (avec `cacheComponents` activé), tout composant qui lit des données dynamiques à la volée (`prisma.*`, `headers()`, `auth.api.getSession()`, `usePathname()`) doit être isolé dans un `<Suspense fallback={...}>`.
   - _Erreur typique si oublié :_ `blocking-prerender-client-hook` ou `uncached data accessed outside <Suspense>`.

2. **Ne jamais importer de données depuis un fichier `"use client"` dans un Server Component :**
   - Tout export d'un fichier `"use client"` devient une référence client côté serveur.
   - _Erreur typique au `npm run build` :_ `TypeError: i.navLinks.map is not a function`.
   - _Solution :_ définir les données statiques (ex : `navLinks`) dans le Server Component (ou un fichier neutre sans `"use client"`) et les passer en `props` au Client Component.

### D. Images optimisées (`<Image />`)

- Toujours utiliser `<Image />` de `next/image` (compression automatique, WebP/AVIF, lazy-loading).
- **Images locales :** placées dans `public/images/dessin.jpg` → accessibles via `src="/images/dessin.jpg"`.
- **Images externes :** les domaines doivent être autorisés dans `next.config.ts` sous `images.remotePatterns`, et l'URL doit pointer directement vers le fichier image (`https://images.unsplash.com/...`), pas vers une page HTML.

---

## 4. PostgreSQL (Neon) & Prisma 7

### A. Les deux URLs Neon dans `.env`

Avec Neon et Prisma 7, on sépare deux connexions :

- **`DATABASE_URL`** _(avec `-pooler`)_ : utilisée par l'application (`lib/prisma.ts`) pour gérer efficacement de nombreuses connexions simultanées.
- **`DIRECT_URL`** _(sans `-pooler`)_ : utilisée par `prisma7.config.ts` pour exécuter les migrations de schéma (`prisma migrate dev`).
- Utiliser **`sslmode=verify-full`** dans les URLs pour éviter le warning SSL du pilote `pg`.

### B. Le Singleton `lib/prisma.ts`

En développement, le Hot Reload réexécute les modules très souvent. Stocker l'instance `PrismaClient` dans `globalThis` évite de saturer PostgreSQL de connexions ouvertes.

> **Astuce :** Après avoir modifié `prisma/schema.prisma` et relancé `prisma generate`, il faut **redémarrer `npm run dev` (`Ctrl+C`)** pour que `globalThis` charge la nouvelle version du client Prisma (sinon `prisma.nouvelleTable` sera `undefined`).

### C. Commandes Prisma essentielles

```bash
# Créer et appliquer une migration après modification de schema.prisma
npx prisma migrate dev --name nom_de_la_migration

# Régénérer le client TypeScript (lib/generated/prisma)
npx prisma generate

# Ouvrir l'interface graphique pour voir/modifier la BDD
npx prisma studio
```

### D. Transactions atomiques (`prisma.$transaction`)

Utilisé lors de la création d'un sujet ou d'un commentaire sur le forum : si la création échoue, `postsCount` n'est pas incrémenté (tout passe ou rien ne passe).

---

## 5. Authentification & Système de Grades (Better Auth)

### A. Configuration Serveur (`lib/auth.ts`)

- Connecté à PostgreSQL via `prismaAdapter(prisma, { provider: "postgresql" })`.
- Champs personnalisés déclarés dans `user.additionalFields` (`role` et `postsCount`) avec **`input: false`** : empêche un utilisateur malveillant de s'auto-attribuer `role: "ADMIN"` via la requête HTTP d'inscription.
- Plugin **`nextCookies()`** placé **en dernier** pour gérer automatiquement les cookies dans les Server Actions et Route Handlers Next.js.

### B. Configuration Client (`lib/auth-client.ts`)

- Utilise `inferAdditionalFields<typeof auth>()` pour que TypeScript connaisse `session.user.role` et `session.user.postsCount` côté React.

### C. Double niveau de vérification (Règle de sécurité absolue)

- **Pour l'affichage UI (Client) :** `authClient.useSession()` sert uniquement à afficher/cacher des boutons (`Navbar`, formulaire de nouveau sujet). **Ce n'est jamais une sécurité suffisante.**
- **Pour la sécurité réelle (Serveur) :** toute page protégée (`/profil`, `/admin`) et toute Server Action (`createTopic`, `deleteTopic`, `createArtwork`, `updateUserRole`) doit obligatoirement rappeler :
  ```ts
  const session = await auth.api.getSession({ headers: await headers() });
  ```
  et vérifier `session.user.role` ou `session.user.id === resource.authorId`.

### D. Système de Grades Hybride (`lib/ranks.ts`)

- **Permissions (`user.role` en BDD) :** `"MEMBER" | "MODERATOR" | "ADMIN"` — contrôle les droits d'accès.
- **Prestige (calculé dynamiquement) :** combiné entre `user.postsCount` et l'ancienneté (`user.createdAt`) :
  - `points = postsCount * 10 + joursDancienneté`
  - Paliers : _Novice_ (0) → _Apprenti_ (30) → _Amateur Éclairé_ (100) → _Connaisseur_ (300) → _Maître d'Art_ (700).

---

## 6. Server Actions & Formulaires (`"use server"`)

Les Server Actions remplacent les routes API classiques pour les mutations (créer, modifier, supprimer) :

1. **Côté Serveur (`actions.ts`) :**
   - `"use server";` tout en haut du fichier.
   - Vérifier `session` et droits d'accès.
   - Valider les données reçues depuis `FormData`.
   - Exécuter la requête Prisma.
   - Appeler **`revalidatePath("/chemin")`** pour rafraîchir le cache des pages concernées.
   - Appeler **`redirect("/nouvelle-url")`** **en dehors** de tout bloc `try/catch` (car Next.js lève une erreur interne pour effectuer la redirection).
2. **Côté Client (`Form.tsx`) :**
   - Utiliser **`useActionState`** (de `"react"`) pour récupérer `[state, formAction, isPending]`, afficher les erreurs serveur et désactiver le bouton pendant l'envoi.
   - Utiliser **`useTransition`** pour les actions déclenchées par un bouton ou un `<select>` (`DeleteButton`, `RoleSelect`).

---

## 7. Checklist pour démarrer un nouveau projet avec cette stack

```bash
# 1. Créer le projet Next.js (TypeScript + Tailwind + App Router)
npx create-next-app@latest mon-projet

# 2. Installer Prisma 7 + pilote PostgreSQL
npm install -D prisma@7 @types/pg
npm install @prisma/client@7 @prisma/adapter-pg@7 pg dotenv
npx prisma init --datasource-provider postgresql --output ../lib/generated/prisma

# 3. Configurer .env (DATABASE_URL poolée, DIRECT_URL directe, sslmode=verify-full)
#    et adapter prisma.config.ts pour pointer sur env("DIRECT_URL")

# 4. Installer Better Auth
npm install better-auth @better-auth/prisma-adapter
# Générer BETTER_AUTH_SECRET avec : openssl rand -base64 32

# 5. Générer le schéma Auth + migrer
npx auth@latest generate
npx prisma migrate dev --name init
npx prisma generate
```

### Vérification avant mise en production

Toujours valider le projet complet avec :

```bash
npm run build
npm run start
```

Si `npm run build` passe avec **0 erreur TypeScript** et **0 erreur de prerendering**, l'application est prête à être déployée (ex : sur Vercel avec les mêmes variables `.env` et `BETTER_AUTH_URL` mis à jour avec le nom de domaine final).
