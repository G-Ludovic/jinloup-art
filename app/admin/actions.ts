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
