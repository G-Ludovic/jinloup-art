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
