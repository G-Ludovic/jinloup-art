# 🎨 Jinloup.Art — Galerie d'Art & Forum Communautaire

Plateforme web full-stack construite avec **Next.js 16** permettant d'exposer des œuvres d'art, d'échanger autour des créations et sur un forum communautaire, et de récompenser l'engagement des membres via un système de grades hybride.

🌐 **Site en ligne :** [https://jinloup-art.vercel.app](https://jinloup-art.vercel.app)  
📖 **Documentation technique complète :** [`DOCUMENTATION.md`](./DOCUMENTATION.md)

---

## ✨ Fonctionnalités principales

### 🖼️ Galerie d'Art, Likes & Commentaires

- Exposition d'œuvres avec affichage optimisé (`next/image`), cadrage intelligent sur la grille (`object-top`) et conservation des **proportions naturelles** sur les pages de détail (`/galerie/[slug]`, sans rognage des formats portrait).
- Système de **J'aime ❤️** instantané (_Optimistic UI_ via `useOptimistic`) avec contrainte d'unicité en base de données et **modale interactive** listant les membres, leurs avatars et leurs grades.
- **Commentaires sous chaque œuvre :** les membres connectés peuvent commenter les dessins (avec incrémentation automatique du prestige et modération par l'auteur, les Modérateurs ou les Admins).

### 💬 Forum Communautaire

- Sujets structurés par catégories (_Discussion_, _Critique d'œuvre_, _Technique_, _Inspiration_), dont la création est réservée aux **Admins** et **Modérateurs** pour garder un forum clair et sans spam.
- Réponses ouvertes à tous les membres via les **Server Actions** Next.js avec incrémentation du prestige.
- Affichage de l'avatar et de la citation personnelle de chaque membre sous ses messages.

### 👤 Espace Membre, Avatars & Système de Grades Hybride

- Authentification sécurisée par email/mot de passe (**Better Auth** + sessions PostgreSQL) avec **notifications Toast** (inscription, connexion, déconnexion).
- **Espace `/profil` complet :** upload d'avatar recadré automatiquement à **48×48 px** (WebP), citation personnelle (3 lignes max), statistiques d'activité et barre de progression vers le rang suivant.
- **Annuaire `/membres` :** liste publique de la communauté avec avatar, date d'inscription, citation et grades (excluant les comptes bannis).
- **Rôles de permissions :** `MEMBER`, `MODERATOR`, `ADMIN`.
- **Rangs de prestige dynamiques :** calculés automatiquement selon l'ancienneté et le nombre de publications (_Novice → Apprenti → Amateur Éclairé → Connaisseur → Maître d'Art_).

### 🛡️ Espace d'Administration & Modération (`/admin`)

- Tableau de bord protégé côté serveur avec statistiques globales.
- Publication et suppression d'œuvres avec génération automatique du `slug`.
- Création, **édition et suppression des sujets du forum** directement depuis le panel admin (`ADMIN` & `MODERATOR`).
- **Gestion des membres & hiérarchie de modération :** changement des rôles (`ADMIN` uniquement), **bannissement instantané** (révocation immédiate des sessions + blocage à la connexion) et **suppression de compte** avec respect strict des permissions (`MODERATOR` sur `MEMBER`, `ADMIN` sur `MEMBER` et `MODERATOR`).

### 📱 Responsive, Légal & RGPD

- Interface **100 % responsive** (mobile, tablette, desktop) avec menu burger dédié et cartes adaptatives sur mobile.
- Pied de page permanent (_sticky footer_) incluant les pages **Mentions légales** (`/mentions-legales`) et **Politique de confidentialité** (`/politique-confidentialite`).

---

## 🛠️ Stack Technique

- **Framework :** Next.js 16 (App Router, Turbopack, React 19, Server Actions)
- **Langage :** TypeScript
- **Styling :** Tailwind CSS v4
- **Base de données :** PostgreSQL (Neon)
- **ORM :** Prisma 7 (`@prisma/adapter-pg`)
- **Authentification :** Better Auth (`@better-auth/prisma-adapter`)
- **Hébergement :** Vercel

---

## 🚀 Lancer le projet en local

### 1. Cloner le dépôt et installer les dépendances

```bash
git clone https://github.com/G-Ludovic/jinloup-art.git
cd jinloup-art
npm install
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# PostgreSQL (Neon)
DATABASE_URL="postgresql://user:password@host-pooler.neon.tech/db?sslmode=verify-full"
DIRECT_URL="postgresql://user:password@host.neon.tech/db?sslmode=verify-full"

# Better Auth (générer le secret avec : openssl rand -base64 32)
BETTER_AUTH_SECRET="votre_cle_secrete_aleatoire"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Préparer la base de données

```bash
npx prisma migrate dev
npx prisma generate
```

### 4. Démarrer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

> **Astuce :** Pour passer votre premier compte en administrateur en local, lancez `npx prisma studio`, ouvrez la table `User` et passez le champ `role` à `ADMIN`.

---

## 🧠 Démarche d'apprentissage & Méthodologie

Issu d'une formation JavaScript/React/SQL à la **Wild Code School**, j'ai conçu **Jinloup.Art** pour me spécialiser sur **Next.js 16**, **PostgreSQL** et **Prisma**.

J'ai travaillé en approche **pair-programming** avec **Gemini** en tant que tuteur et assistant technique :

- **Mon rôle :** conception fonctionnelle, gestion de l'environnement, base Neon, Git, intégration de mes œuvres, tests et débogage jusqu'au déploiement en production sur Vercel.
- **Rôle de l'assistant :** découpage en jalons itératifs, explications détaillées des mécanismes Next.js 16 (_Server/Client Components_, _Server Actions_, _Cache Components_, _Optimistic UI_) et co-rédaction de la documentation de révision.

---

## 👤 Auteur

Projet conçu et développé par **Jinloup** dans le cadre de sa spécialisation sur **Next.js**.
