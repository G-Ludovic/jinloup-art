# 🎨 Jinloup.Art — Galerie d'Art & Forum Communautaire

Plateforme web full-stack construite avec **Next.js 16** permettant d'exposer des œuvres d'art, d'échanger sur un forum communautaire et de récompenser l'engagement des membres via un système de grades hybride.

> 📖 Une documentation technique détaillée de l'architecture et des choix d'implémentation est disponible dans [`DOCUMENTATION.md`](./DOCUMENTATION.md).

---

## ✨ Fonctionnalités principales

### 🖼️ Galerie d'Art

- Exposition d'œuvres avec affichage optimisé (`next/image`).
- Pages de détail dynamiques (`/galerie/[slug]`) avec informations artistiques (titre, artiste, technique, année, description).

### 💬 Forum Communautaire

- Création de sujets classés par catégories (_Discussion_, _Critique d'œuvre_, _Technique_, _Inspiration_).
- Système de réponses en temps réel via les **Server Actions** Next.js.
- Modération des sujets et commentaires réservée à l'auteur, aux **Modérateurs** et aux **Administrateurs**.

### 🏅 Comptes Membres & Système de Grades Hybride

- Authentification sécurisée par email/mot de passe (**Better Auth** + sessions PostgreSQL).
- **Rôles de permissions :** `MEMBER`, `MODERATOR`, `ADMIN`.
- **Rangs de prestige dynamiques :** calculés automatiquement selon l'ancienneté du membre et son nombre de publications sur le forum (_Novice → Apprenti → Amateur Éclairé → Connaisseur → Maître d'Art_).

### 🛡️ Espace d'Administration (`/admin`)

- Tableau de bord protégé côté serveur avec statistiques globales.
- Publication et suppression d'œuvres avec génération automatique du `slug`.
- Gestion des membres et attribution des rôles (`MEMBER` / `MODERATOR` / `ADMIN`).

---

## 🛠️ Stack Technique

- **Framework :** Next.js 16 (App Router, Turbopack, React 19, Server Actions)
- **Langage :** TypeScript
- **Styling :** Tailwind CSS
- **Base de données :** PostgreSQL (Neon)
- **ORM :** Prisma 7 (`@prisma/adapter-pg`)
- **Authentification :** Better Auth (`@better-auth/prisma-adapter`)

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

## 📸 Aperçu

_(Ajoutez ici 2 ou 3 captures d'écran de votre galerie, du forum et de l'espace admin !)_

---

## 👤 Auteur

Projet conçu et développé par **Ludovic Galicher** dans le cadre de sa spécialisation sur **Next.js**.
