# Guide Technique & Architecture — Jinloup.Art (Next.js 16)

Ce document résume l'architecture complète, les concepts clés, les commandes et les retours d'expérience appliqués dans ce projet **Next.js 16**, afin de servir de support de révision et de base réutilisable pour de futurs projets full-stack.

---

## 1. Stack Technique

| Brique                   | Outil utilisé                                    | Rôle                                                       |
| :----------------------- | :----------------------------------------------- | :--------------------------------------------------------- |
| **Framework Full-Stack** | **Next.js 16** (App Router + Turbopack)          | Routage, rendu serveur/client, API, Server Actions         |
| **Langage**              | **TypeScript**                                   | Typage strict bout-en-bout (BDD → Serveur → Client)        |
| **Style**                | **Tailwind CSS v4**                              | Design responsive par classes utilitaires                  |
| **Base de données**      | **PostgreSQL** (hébergé sur **Neon**, Francfort) | Base relationnelle                                         |
| **ORM**                  | **Prisma 7** (`@prisma/adapter-pg`)              | Modélisation du schéma, migrations, requêtes typées        |
| **Authentification**     | **Better Auth** (`@better-auth/prisma-adapter`)  | Inscription, connexion, vérif email, reset password, hooks |
| **Emails**               | **Nodemailer**                                   | Envoi d'emails transactionnels SMTP                        |
| **Images**               | **`next/image` + `sharp`**                       | Optimisation et conversion batch en `.webp`                |
| **Déploiement**          | **Vercel**                                       | CI/CD automatique depuis GitHub                            |

---

## 2. Arborescence du projet

```text
jinloup-art/
├── app/
│   ├── api/
│   │   ├── auth/[...all]/route.ts   # Endpoints Better Auth automatiques
│   │   └── notifications/route.ts   # API Notifications (GET / PATCH / DELETE)
│   ├── components/
│   │   ├── Navbar.tsx               # Header responsive (Server Component)
│   │   ├── NavLinks.tsx             # Liens actifs avec usePathname (Client Component)
│   │   ├── MobileMenu.tsx           # Menu burger mobile/tablette (Client Component)
│   │   ├── UserMenu.tsx             # Menu utilisateur desktop + cloche (Client Component)
│   │   ├── NotificationBell.tsx     # Cloche de notifications optimisée (focus + clic)
│   │   ├── UserAvatar.tsx           # Avatar circulaire 28/36/48 px ou initiale
│   │   ├── ToastProvider.tsx        # Context & hook useToast() sans dépendance
│   │   └── Footer.tsx               # Pied de page 2 colonnes + barre légale
│   ├── admin/
│   │   ├── page.tsx                 # Dashboard Admin/Modérateur + vue cartes mobile
│   │   ├── actions.ts               # Server Actions Admin (œuvres, validation, rôles, sujets, ban)
│   │   ├── PendingArtworkCard.tsx   # Validation (Accepter / Refuser avec motif)
│   │   ├── AddArtworkForm.tsx       # Formulaire d'ajout d'œuvre
│   │   ├── DeleteArtworkButton.tsx  # Bouton de suppression d'œuvre confirmé
│   │   ├── RoleSelect.tsx           # Sélecteur de rôle membre (ADMIN uniquement)
│   │   ├── TopicManagerRow.tsx      # Édition & suppression des sujets du forum
│   │   └── UserModerationActions.tsx # Boutons Bannir / Débannir / Supprimer membre
│   ├── connexion/page.tsx           # Inscription, Connexion & écran vérif email
│   ├── mot-de-passe-oublie/page.tsx # Demande de réinitialisation mot de passe
│   ├── reinitialiser-mot-de-passe/
│   │   ├── page.tsx                 # Wrapper <Suspense> pour lecture du token URL
│   │   └── ResetPasswordForm.tsx    # Formulaire nouveau mot de passe (useSearchParams)
│   ├── forum/
│   │   ├── page.tsx                 # Liste des sujets + lien règlement
│   │   ├── actions.ts               # Server Actions Forum (sujets staff, réponses, édition, modération)
│   │   ├── NewTopicForm.tsx         # Bouton/formulaire réservé au staff
│   │   └── [id]/
│   │       ├── page.tsx             # Détail d'un sujet + réponses + signatures
│   │       ├── ForumCommentItem.tsx # Réponse forum (édition auteur inline + suppression)
│   │       ├── ReplyForm.tsx        # Formulaire de réponse
│   │       └── DeleteButton.tsx     # Suppression sujet principal
│   ├── galerie/
│   │   ├── page.tsx                 # Double galerie + raccourci #galerie-membres + compteurs
│   │   ├── ScrollToHash.tsx         # Scroll automatique vers ancre après streaming <Suspense>
│   │   ├── actions.ts               # Server Actions (soumission membre, likes, commentaires + édition)
│   │   ├── LikeButton.tsx           # Bouton J'aime optimiste (useOptimistic)
│   │   ├── LikersSummary.tsx        # Résumé + modale liste des likes
│   │   ├── proposer/page.tsx        # Formulaire membre + compression WebP côté client
│   │   └── [slug]/
│   │       ├── page.tsx             # Détail œuvre (format adaptatif) + commentaires
│   │       ├── ArtworkCommentItem.tsx # Commentaire œuvre (édition auteur inline + suppression)
│   │       └── ArtworkCommentForm.tsx # Formulaire commentaire sous œuvre
│   ├── membres/page.tsx             # Annuaire public des membres actifs & grades
│   ├── profil/
│   │   ├── page.tsx                 # Profil protégé, stats, prestige & suivi œuvres
│   │   ├── actions.ts               # Server Action updateProfile (avatar + bio)
│   │   └── EditProfileForm.tsx      # Upload avatar recadré 48x48 px + citation
│   ├── nouveautes/page.tsx          # Journal du développeur / Changelog statique
│   ├── faq/page.tsx                 # FAQ statique en accordéon HTML natif (<details>)
│   ├── reglement/page.tsx           # Règles de conduite du forum et de la galerie
│   ├── mentions-legales/page.tsx    # Mentions légales (LCEN)
│   ├── politique-confidentialite/page.tsx # Politique RGPD
│   ├── layout.tsx                   # Sticky-footer, scroll-smooth, ToastProvider, metadata & favicon
│   └── page.tsx                     # Page d'accueil + article #galerie-membres + teaser nouveautés
├── lib/
│   ├── prisma.ts                    # Instance unique (singleton) de PrismaClient
│   ├── auth.ts                      # Configuration serveur Better Auth + emails + hook ban
│   ├── auth-client.ts               # Client React Better Auth (typé)
│   ├── mail.ts                      # Transporteur Nodemailer & templates HTML/texte
│   ├── ranks.ts                     # Rangs de prestige, barre de progression & badges
│   └── generated/prisma/            # Client Prisma généré automatiquement
├── prisma/
│   ├── schema.prisma                # Modèles BDD (Artwork, ArtworkLike, ArtworkComment, Notification, User, Topic, Comment...)
│   └── migrations/                  # Historique SQL des migrations
├── scripts/
│   └── convert-to-webp.mjs          # Script batch sharp + MAJ Neon imageUrl
├── public/
│   ├── logo-loup-mystique.webp      # Logo principal & favicon
│   └── images/                      # Œuvres locales en .webp servies depuis /images/...
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
- **`notFound()`** : déclenche une vraie page 404 si une ressource est introuvable (ou pour masquer les œuvres `PENDING`/`REJECTED` aux visiteurs non autorisés).
- **Favicon :** Next.js donne la priorité à `app/favicon.ico` ou `app/icon.{png,jpg,svg,ico}`. Pour utiliser un `.webp` placé dans `public/`, supprimer `app/favicon.ico` et déclarer `metadata.icons` dans `app/layout.tsx`.

### B. Server Components vs Client Components

- **Server Component (par défaut) :** exécuté uniquement côté serveur, lit Prisma et les sessions sans exposer de secrets au navigateur.
- **Client Component (`"use client";`) :** réservé aux zones interactives (`useState`, `useActionState`, `useOptimistic`, `useTransition`, `usePathname`, `useSearchParams`, `authClient.useSession()`).
- **Pages informatives 100 % statiques :** `/nouveautes`, `/faq` (accordéon natif `<details>/<summary>` sans JS) et `/reglement` n'interrogent aucune BDD → chargement instantané et **0 heure Neon consommée**.
- **Attention aux fuseaux horaires (Hydration Mismatch) :** formater les dates côté serveur avec `{ timeZone: "Europe/Paris" }` avant de les passer en `createdAtLabel` à un Client Component (`ArtworkCommentItem`, `ForumCommentItem`) évite tout écart entre le serveur Vercel (UTC) et le navigateur français.

### C. Règles strictes de Next.js 16 (`Cache Components`) & Streaming

1. **Toujours entourer les données dynamiques d'un `<Suspense>` :**
   - Tout composant lisant `prisma.*`, `headers()`, `auth.api.getSession()`, `usePathname()` ou `useSearchParams()` doit être placé dans `<Suspense fallback={...}>` (sinon `blocking-prerender-client-hook`).
   - Appeler `await connection()` (de `next/server`) avant les requêtes BDD dans un Server Component public sous `<Suspense>` (`GalleriesContent`) pour éviter `new Date() while prerendering`.
   - Dans les composants statiques globaux (`Footer.tsx`, `nouveautes/page.tsx`), éviter `new Date()`.
2. **Ancres HTML (`#id`) avec `<Suspense>` :**
   - Un composant `ScrollToHash.tsx` placé à l'intérieur du `<Suspense>` lit `window.location.hash` dans `useEffect` dès la fin du streaming. Sur la même page, `<a href="#galerie-membres">` + `className="scroll-smooth"` sur `<html>` suffit.
3. **Ne jamais importer de données depuis un fichier `"use client"` dans un Server Component :**
   - Déclarer `navLinks` dans `Navbar.tsx` et les passer via `props`.
4. **Exécution asynchrone après réponse (`after()` de `next/server`) :**
   - Utilisé dans `lib/auth.ts` pour `sendVerificationEmail` et `sendResetPassword` afin que la fonction serverless Vercel termine l'envoi SMTP Nodemailer.

### D. Images (`<Image />`) & Script de conversion `.webp`

- **Grille `/galerie` :** `aspect-4/3` + `fill` + `object-cover object-top` (cadre les portraits vers le haut).
- **Page détail `/galerie/[slug]` :** `width={1200} height={1200}` avec `className="h-auto max-h-[75vh] w-auto max-w-full"` (respecte les proportions naturelles sans rognage).
- **Data URIs :** `unoptimized={artwork.imageUrl.startsWith("data:")}` sur `<Image />`.
- **Conversion batch (`scripts/convert-to-webp.mjs`) :** utilise `sharp` (avec `.rotate()` pour l'orientation EXIF) et `pg` pour convertir les `.png/.jpg/.jpeg` de `public/images/` en `.webp`, mettre à jour `Artwork.imageUrl` dans Neon en SQL paramétré, et supprimer les anciens originaux.

---

## 4. PostgreSQL (Neon) & Prisma 7

### A. Les deux URLs Neon & Gestion du Free Plan

- **`DATABASE_URL`** _(avec `-pooler`)_ : utilisée par `lib/prisma.ts` et le script WebP.
- **`DIRECT_URL`** _(sans `-pooler`)_ : utilisée par `prisma7.config.ts` pour les migrations (`prisma migrate dev`).
- Toujours utiliser **`sslmode=verify-full`**.
- **Économiser les 100 h/mois du Free Plan Neon :** Neon se met en veille après 5 min d'inactivité. Éviter les `setInterval` courts en arrière-plan (dans `NotificationBell.tsx`, rafraîchir uniquement au montage, au `focus` de la fenêtre et au clic sur la cloche).

### B. Le Singleton `lib/prisma.ts` & Cache Turbopack

> **Réflexe indispensable :** après toute modification de `prisma/schema.prisma`, exécuter `npx prisma migrate dev`, `npx prisma generate`, puis **redémarrer `npm run dev` (`Ctrl+C`)** — et si Turbopack garde l'ancien client en cache, lancer `rm -rf .next && npm run dev` (et `TypeScript: Restart TS Server` dans VS Code).

### C. Relations, Transactions & Nommage

- **Transactions (`prisma.$transaction`) :** création/approbation + incrémentation atomique de `postsCount` + `Notification` ; bannissement + révocation des sessions actives.
- **Unicité des Likes (`ArtworkLike`) :** `@@unique([artworkId, userId])` génère la clé composée `artworkId_userId`.
- **Nommage :** `Artwork.artworkComments` (`ArtworkComment[]`) évite toute confusion avec `Topic.comments`.

---

## 5. Authentification, Emails, Modération & Grades (Better Auth)

### A. Sécurité Serveur, Champs personnalisés & Bannissement

- `lib/auth.ts` déclare `role`, `postsCount`, `bio` et `banned` dans `user.additionalFields` avec **`input: false`**.
- `nextCookies()` est placé en dernier dans `plugins`.
- **Blocage des comptes bannis :** `databaseHooks.session.create.before` vérifie `user.banned` et lève `new APIError("FORBIDDEN", { message: "..." })`.
- `lib/auth-client.ts` utilise `inferAdditionalFields<typeof auth>()`, et `refetch()` rafraîchit la session client.
- **Données publiques :** sur `/membres` et `LikersSummary`, ne jamais sélectionner `email` ; `/membres` filtre `where: { banned: false }`.

### B. Vérification d'email & Mot de passe oublié (Better Auth + Nodemailer)

- **`emailAndPassword` :** `requireEmailVerification: true` bloque le login (`403 EMAIL_NOT_VERIFIED`) tant que l'email n'est pas confirmé ; `sendResetPassword` envoie le lien de réinitialisation.
- **`emailVerification` :** `sendOnSignUp: true` + `autoSignInAfterVerification: true`.
- **Client (`authClient`) :** `sendVerificationEmail`, `requestPasswordReset`, `resetPassword`.
- **Nodemailer (`lib/mail.ts`) :** `secure: port === 465` gère SSL (`465`) et STARTTLS (`587`). Avec Gmail, un **Mot de passe d'application** à 16 lettres (2FA activée) est obligatoire et `SMTP_FROM` doit correspondre à `SMTP_USER`.

### C. Hiérarchie des permissions & Édition

- **Création/édition/suppression des sujets du forum :** `ADMIN` et `MODERATOR` (`requireStaff()`).
- **Édition des commentaires (galerie & forum) :** **seul l'auteur** (`authorId === session.user.id`) peut modifier son texte (`updateArtworkComment`, `updateComment`) ; l'auteur, `MODERATOR` et `ADMIN` peuvent supprimer.
- **Validation des œuvres membres, gestion des œuvres & rôles :** `ADMIN` (`requireAdmin()`).
- **Bannissement & suppression de compte (`verifyModerationPermission`) :** interdit sur soi-même et sur `ADMIN` ; `MODERATOR` modère uniquement `MEMBER` ; `ADMIN` modère `MEMBER` et `MODERATOR`.

### D. Compression d'images côté client & Grades

- **Avatars (`/profil`) :** recadrage carré `48×48 px` WebP via `<canvas>` (~2 Ko), validé côté serveur (`≤ 25 000` car.).
- **Œuvres membres (`/galerie/proposer`) :** redimensionnement proportionnel max `900 px` en WebP (`0.82`) via `<canvas>`, validé côté serveur (`≤ 650 000` car.).
- **Notifications (`/api/notifications`) :** `GET` / `PATCH` / `DELETE` sécurisés par session et filtrés par `userId`.
- **Grades (`lib/ranks.ts`) :** `points = postsCount * 10 + joursDancienneté` (_Novice_ 0 → _Apprenti_ 30 → _Amateur Éclairé_ 100 → _Connaisseur_ 300 → _Maître d'Art_ 700), avec `getPrestigeProgress`.

---

## 6. Server Actions, Optimistic UI, Toasts & Responsive

- **`useActionState`** : formulaires avec validation serveur ; horodatage `successAt` + `useRef` dans `useEffect` pour déclencher toast/reset une seule fois.
- **`useTransition`** : boutons async et édition inline (`ArtworkCommentItem`, `ForumCommentItem`, `DeleteButton`, `RoleSelect`, `UserModerationActions`, `PendingArtworkCard`). Évite `setState` dans `useEffect` (conforme ESLint React 19).
- **`useOptimistic`** (`LikeButton.tsx`) : mise à jour instantanée du ❤️ (`0 ms`).
- **`ToastProvider` (`useToast()`)** : notifications flottantes 3,5 s (`aria-live="polite"`).
- **Sticky Footer & Responsive :** `flex min-h-dvh flex-col` + `flex-1`, `scroll-smooth`, menu burger `< lg:`, cartes mobiles sur `/admin`, `wrap-break-word` (Tailwind v4).

---

## 7. Déploiement Vercel & Checklist de Production

1. Dans `package.json`, définir `"build": "prisma generate && next build"`.
2. Valider localement avec `npm run build` et `npm run start`.
3. Sur Vercel (_Environment Variables_), renseigner **sans guillemets `"`** :
   - `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (`https://jinloup-art.vercel.app`, sans `/` final — sinon erreur `Invalid origin`).
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
4. `baseURL: { allowedHosts: [...] }` dans `lib/auth.ts` accepte aussi `localhost:3000` et les Previews Vercel.
5. Vérifier dans Prisma Studio que les comptes créés avant `requireEmailVerification` ont `emailVerified = true`.
6. Ne pas activer l'intégration optionnelle _Prisma Postgres_ si Neon est déjà configuré.
