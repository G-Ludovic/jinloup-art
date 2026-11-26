"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminActionState = {
  error: string | null;
  successMessage?: string | null;
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlève les accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Action réservée aux administrateurs.");
  }

  return session;
}

export async function createArtwork(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireAdmin();
  } catch {
    return { error: "Action réservée aux administrateurs." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const artistName = String(formData.get("artistName") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const medium = String(formData.get("medium") ?? "").trim() || null;
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw ? Number.parseInt(yearRaw, 10) : null;

  if (title.length < 2) {
    return { error: "Le titre doit contenir au moins 2 caractères." };
  }
  if (artistName.length < 2) {
    return { error: "Le nom de l'artiste est requis." };
  }
  if (
    !imageUrl.startsWith("/") &&
    !imageUrl.startsWith("https://") &&
    !imageUrl.startsWith("http://")
  ) {
    return {
      error:
        "L'image doit commencer par '/' (ex: /images/dessin.jpg) ou 'https://'.",
    };
  }
  if (description.length < 5) {
    return { error: "La description doit contenir au moins 5 caractères." };
  }
  if (yearRaw && Number.isNaN(year)) {
    return { error: "L'année doit être un nombre valide." };
  }

  let slug = slugify(title) || "oeuvre";
  const existing = await prisma.artwork.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await prisma.artwork.create({
      data: {
        title,
        slug,
        artistName,
        imageUrl,
        description,
        medium,
        year,
      },
    });
  } catch (err) {
    console.error("Erreur ajout œuvre:", err);
    return { error: "Impossible d'ajouter cette œuvre." };
  }

  revalidatePath("/galerie");
  revalidatePath("/admin");
  return { error: null, successMessage: `L'œuvre "${title}" a été publiée !` };
}

export async function deleteArtwork(artworkId: string) {
  await requireAdmin();

  await prisma.artwork.delete({
    where: { id: artworkId },
  });

  revalidatePath("/galerie");
  revalidatePath("/admin");
}

const VALID_ROLES = ["MEMBER", "MODERATOR", "ADMIN"];

export async function updateUserRole(userId: string, newRole: string) {
  const session = await requireAdmin();

  if (!VALID_ROLES.includes(newRole)) {
    throw new Error("Rôle invalide.");
  }

  // Empêche l'admin connecté de se retirer lui-même ses droits Admin par accident
  if (userId === session.user.id && newRole !== "ADMIN") {
    throw new Error("Vous ne pouvez pas retirer votre propre rôle Admin.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  });

  revalidatePath("/admin");
}

async function requireStaff() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")
  ) {
    throw new Error("Action réservée à l'équipe de modération.");
  }

  return session;
}

const ALLOWED_TOPIC_CATEGORIES = [
  "Discussion",
  "Critique d'œuvre",
  "Technique",
  "Inspiration",
];

export async function updateTopic(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  try {
    await requireStaff();
  } catch {
    return { error: "Action réservée aux administrateurs et modérateurs." };
  }

  const topicId = String(formData.get("topicId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!topicId) {
    return { error: "Sujet introuvable." };
  }
  if (title.length < 3 || title.length > 120) {
    return { error: "Le titre doit contenir entre 3 et 120 caractères." };
  }
  if (!ALLOWED_TOPIC_CATEGORIES.includes(category)) {
    return { error: "Catégorie invalide." };
  }
  if (content.length < 10) {
    return { error: "Le message doit contenir au moins 10 caractères." };
  }

  try {
    await prisma.topic.update({
      where: { id: topicId },
      data: { title, category, content },
    });
  } catch (err) {
    console.error("Erreur modification sujet:", err);
    return { error: "Impossible de modifier ce sujet." };
  }

  revalidatePath("/forum");
  revalidatePath(`/forum/${topicId}`);
  revalidatePath("/admin");
  return { error: null, successMessage: "Sujet mis à jour !" };
}

export async function deleteTopicAdmin(topicId: string) {
  await requireStaff();

  await prisma.topic.delete({
    where: { id: topicId },
  });

  revalidatePath("/forum");
  revalidatePath("/admin");
}

async function verifyModerationPermission(targetUserId: string) {
  const session = await requireStaff();

  if (targetUserId === session.user.id) {
    throw new Error(
      "Vous ne pouvez pas effectuer cette action sur votre propre compte.",
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, banned: true },
  });

  if (!targetUser) {
    throw new Error("Membre introuvable.");
  }

  if (targetUser.role === "ADMIN") {
    throw new Error("Impossible de bannir ou supprimer un administrateur.");
  }

  if (session.user.role === "MODERATOR" && targetUser.role !== "MEMBER") {
    throw new Error("Un modérateur ne peut agir que sur les simples membres.");
  }

  return targetUser;
}

export async function toggleBanUser(targetUserId: string) {
  const targetUser = await verifyModerationPermission(targetUserId);
  const nextBanned = !targetUser.banned;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: targetUserId },
      data: { banned: nextBanned },
    });

    // Si on bannit : on déconnecte immédiatement toutes ses sessions actives
    if (nextBanned) {
      await tx.session.deleteMany({
        where: { userId: targetUserId },
      });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/membres");
}

export async function deleteUserAccount(targetUserId: string) {
  await verifyModerationPermission(targetUserId);

  // onDelete: Cascade nettoie automatiquement sessions, sujets, commentaires et likes
  await prisma.user.delete({
    where: { id: targetUserId },
  });

  revalidatePath("/admin");
  revalidatePath("/membres");
  revalidatePath("/forum");
  revalidatePath("/galerie");
}

export async function approveMemberArtwork(artworkId: string) {
  await requireAdmin();

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    select: { id: true, title: true, slug: true, status: true, authorId: true },
  });

  if (!artwork || artwork.status !== "PENDING") {
    throw new Error("Œuvre introuvable ou déjà traitée.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.artwork.update({
      where: { id: artworkId },
      data: {
        status: "APPROVED",
        rejectionReason: null,
      },
    });

    if (artwork.authorId) {
      await tx.user.update({
        where: { id: artwork.authorId },
        data: { postsCount: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId: artwork.authorId,
          message: `🎉 Bonne nouvelle ! Votre œuvre « ${artwork.title} » a été acceptée dans la Galerie des Membres !`,
          link: `/galerie/${artwork.slug}`,
        },
      });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/galerie");
  revalidatePath(`/galerie/${artwork.slug}`);
  revalidatePath("/membres");
  revalidatePath("/profil");
}

export async function rejectMemberArtwork(artworkId: string, reason?: string) {
  await requireAdmin();

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    select: { id: true, title: true, status: true, authorId: true },
  });

  if (!artwork || artwork.status !== "PENDING") {
    throw new Error("Œuvre introuvable ou déjà traitée.");
  }

  const cleanReason = (reason ?? "").trim() || null;

  await prisma.$transaction(async (tx) => {
    await tx.artwork.update({
      where: { id: artworkId },
      data: {
        status: "REJECTED",
        rejectionReason: cleanReason,
      },
    });

    if (artwork.authorId) {
      await tx.notification.create({
        data: {
          userId: artwork.authorId,
          message: cleanReason
            ? `❌ Votre proposition « ${artwork.title} » n'a pas été retenue : ${cleanReason}`
            : `❌ Votre proposition « ${artwork.title} » n'a pas été retenue.`,
          link: "/profil",
        },
      });
    }
  });

  revalidatePath("/admin");
  revalidatePath("/profil");
}
