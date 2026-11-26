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
