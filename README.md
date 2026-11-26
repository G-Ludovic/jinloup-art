# 🎨 Jinloup.Art — Galerie d'Art & Forum Communautaire

Plateforme web full-stack construite avec **Next.js 16** permettant d'exposer des œuvres d'art, d'échanger sur un forum communautaire et de récompenser l'engagement des membres via un système de grades hybride.

🌐 **Site en ligne :** [https://jinloup-art.vercel.app](https://jinloup-art.vercel.app)  
📖 **Documentation technique complète :** [`DOCUMENTATION.md`](./DOCUMENTATION.md)

---

## ✨ Fonctionnalités principales

### 🖼️ Galerie d'Art & Mentions J'aime

- Exposition d'œuvres avec affichage optimisé (`next/image`) et pages de détail dynamiques (`/galerie/[slug]`).
- Système de **J'aime ❤️** en temps réel (_Optimistic UI_ via `useOptimistic`) avec contrainte d'unicité en base de données.
- Résumé des mentions J'aime façon réseau social avec **modale interactive** listant les membres, leurs avatars et leurs grades.

### 💬 Forum Communautaire

- Création de sujets classés par catégories (_Discussion_, _Critique d'œuvre_, _Technique_, _Inspiration_).
- Réponses via les **Server Actions** Next.js avec incrémentation automatique de la participation.
- Affichage de l'avatar et de la citation personnelle de chaque membre sous ses messages.
- Modération des sujets et commentaires réservée à l'auteur, aux **Modérateurs** et aux **Administrateurs**.

### 👤 Espace Membre, Avatars & Système de Grades Hybride

- Authentification sécurisée par email/mot de passe (**Better Auth** + sessions PostgreSQL).
- **Espace `/profil` complet :** upload d'avatar recadré automatiquement à **48×48 px** (WebP), citation personnelle (3 lignes max), statistiques d'activité et barre de progression vers le rang suivant.
- **Annuaire `/membres` :** liste publique de la communauté avec avatar, date d'inscription, citation et grades.
- **Rôles de permissions :** `MEMBER`, `MODERATOR`, `ADMIN`.
- **Rangs de prestige dynamiques :** calculés automatiquement selon l'ancienneté et le nombre de publications (_Novice → Apprenti → Amateur Éclairé → Connaisseur → Maître d'Art_).

### 🛡️ Espace d'Administration (`/admin`)

- Tableau de bord protégé côté serveur avec statistiques globales.
- Publication et suppression d'œuvres avec génération automatique du `slug`.
- Gestion des membres et attribution des rôles (`MEMBER` / `MODERATOR` / `ADMIN`).

### 📱 Responsive, Légal & RGPD

- Interface **100 % responsive** (mobile, tablette, desktop) avec menu burger dédié et cartes adaptatives sur mobile.
- Pied de page permanent (_sticky footer_) incluant les pages **Mentions légales** (`/mentions-legales`) et **Politique de confidentialité** (`/politique-confidentialite`).

---

## 🛠️ Stack Technique

- **Framework :** Next.js 16 (App Router, Turbopack, React 19, Server Actions)
- **Langage :** TypeScript
- **Styling :** Tailwind CSS
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
