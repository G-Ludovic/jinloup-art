"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleArtworkLike(artworkId: string, slug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Vous devez être connecté pour aimer une œuvre.");
  }

  const existingLike = await prisma.artworkLike.findUnique({
    where: {
      artworkId_userId: {
        artworkId,
        userId: session.user.id,
      },
    },
    select: { id: true },
  });

  if (existingLike) {
    await prisma.artworkLike.delete({
      where: { id: existingLike.id },
    });
  } else {
    await prisma.artworkLike.create({
      data: {
        artworkId,
        userId: session.user.id,
      },
    });
  }
  revalidatePath("/galerie");
  revalidatePath(`/galerie/${slug}`);
}

export type ArtworkCommentState = {
  error: string | null;
  successAt?: number;
};

export async function createArtworkComment(
  _prevState: ArtworkCommentState,
  formData: FormData,
): Promise<ArtworkCommentState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Vous devez être connecté pour commenter." };
  }

  const artworkId = String(formData.get("artworkId") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!artworkId || !slug) {
    return { error: "Œuvre introuvable." };
  }
  if (content.length < 2 || content.length > 1000) {
    return {
      error: "Le commentaire doit contenir entre 2 et 1000 caractères.",
    };
  }

  try {
    const artworkExists = await prisma.artwork.findUnique({
      where: { id: artworkId },
      select: { id: true },
    });

    if (!artworkExists) {
      return { error: "Cette œuvre n'existe plus." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.artworkComment.create({
        data: {
          content,
          artworkId,
          authorId: session.user.id,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { postsCount: { increment: 1 } },
      });
    });
  } catch (err) {
    console.error("Erreur commentaire œuvre:", err);
    return { error: "Impossible de publier votre commentaire." };
  }

  revalidatePath(`/galerie/${slug}`);
  revalidatePath("/galerie");
  revalidatePath("/membres");
  revalidatePath("/profil");
  return { error: null, successAt: Date.now() };
}

export async function deleteArtworkComment(commentId: string, slug: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Non autorisé.");
  }

  const comment = await prisma.artworkComment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) {
    throw new Error("Commentaire introuvable.");
  }

  const isAllowed =
    comment.authorId === session.user.id ||
    session.user.role === "ADMIN" ||
    session.user.role === "MODERATOR";

  if (!isAllowed) {
    throw new Error(
      "Vous n'avez pas les droits pour supprimer ce commentaire.",
    );
  }

  await prisma.artworkComment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/galerie/${slug}`);
  revalidatePath("/galerie");
}

export type SubmitArtworkState = {
  error: string | null;
  successMessage?: string | null;
};

function slugifyTitle(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const ALLOWED_IMAGE_URI = /^data:image\/(webp|png|jpeg);base64,/;

export async function submitMemberArtwork(
  _prevState: SubmitArtworkState,
  formData: FormData,
): Promise<SubmitArtworkState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Vous devez être connecté pour proposer une œuvre." };
  }

  const title = String(formData.get("title") ?? "").trim();
  const medium = String(formData.get("medium") ?? "").trim() || null;
  const yearRaw = String(formData.get("year") ?? "").trim();
  const year = yearRaw ? Number.parseInt(yearRaw, 10) : null;
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  if (title.length < 2 || title.length > 100) {
    return { error: "Le titre doit contenir entre 2 et 100 caractères." };
  }
  if (description.length < 5 || description.length > 1000) {
    return {
      error: "La description doit contenir entre 5 et 1000 caractères.",
    };
  }
  if (yearRaw && Number.isNaN(year)) {
    return { error: "L'année doit être un nombre valide." };
  }

  const isSafeDataUri =
    ALLOWED_IMAGE_URI.test(imageUrl) && imageUrl.length <= 650_000;
  const isSafeHttpsUrl =
    imageUrl.startsWith("https://") && imageUrl.length <= 500;

  if (!isSafeDataUri && !isSafeHttpsUrl) {
    return {
      error: "Veuillez sélectionner une image valide (PNG, JPG ou WebP).",
    };
  }

  let slug = slugifyTitle(title) || "oeuvre-membre";
  const existing = await prisma.artwork.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.artwork.create({
        data: {
          title,
          slug,
          artistName: session.user.name,
          imageUrl,
          description,
          medium,
          year,
          isMemberArtwork: true,
          status: "PENDING",
          authorId: session.user.id,
        },
      });

      // Notifie tous les Admins et Modérateurs
      const staffUsers = await tx.user.findMany({
        where: {
          role: { in: ["ADMIN", "MODERATOR"] },
          banned: false,
        },
        select: { id: true },
      });

      if (staffUsers.length > 0) {
        await tx.notification.createMany({
          data: staffUsers.map((staff) => ({
            userId: staff.id,
            message: `🎨 ${session.user.name} propose une œuvre : « ${title} »`,
            link: "/admin",
          })),
        });
      }
    });
  } catch (err) {
    console.error("Erreur soumission œuvre:", err);
    return { error: "Impossible d'envoyer votre proposition pour le moment." };
  }

  revalidatePath("/admin");
  revalidatePath("/profil");
  return {
    error: null,
    successMessage:
      "Votre œuvre a bien été envoyée ! Elle sera visible dans la Galerie des Membres après validation.",
  };
}

export async function updateArtworkComment(
  commentId: string,
  slug: string,
  content: string,
): Promise<{ error: string | null }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Vous devez être connecté." };
  }

  const trimmed = content.trim();
  if (trimmed.length < 2 || trimmed.length > 1000) {
    return {
      error: "Le commentaire doit contenir entre 2 et 1000 caractères.",
    };
  }

  const comment = await prisma.artworkComment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) {
    return { error: "Commentaire introuvable." };
  }

  if (comment.authorId !== session.user.id) {
    return { error: "Vous ne pouvez modifier que vos propres commentaires." };
  }

  await prisma.artworkComment.update({
    where: { id: commentId },
    data: { content: trimmed },
  });

  revalidatePath(`/galerie/${slug}`);
  return { error: null };
}
