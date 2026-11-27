"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ActionState = {
  error: string | null;
  success?: boolean;
};

const ALLOWED_CATEGORIES = [
  "Discussion",
  "Critique d'œuvre",
  "Technique",
  "Inspiration",
];

export async function createTopic(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Vous devez être connecté pour créer un sujet." };
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR") {
    return {
      error: "Seuls les administrateurs et modérateurs peuvent créer un sujet.",
    };
  }

  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (title.length < 3 || title.length > 120) {
    return { error: "Le titre doit contenir entre 3 et 120 caractères." };
  }
  if (!ALLOWED_CATEGORIES.includes(category)) {
    return { error: "Catégorie invalide." };
  }
  if (content.length < 10) {
    return { error: "Le message doit contenir au moins 10 caractères." };
  }

  let topicId: string;

  try {
    const topic = await prisma.$transaction(async (tx) => {
      const created = await tx.topic.create({
        data: {
          title,
          category,
          content,
          authorId: session.user.id,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { postsCount: { increment: 1 } },
      });

      return created;
    });

    topicId = topic.id;
  } catch (err) {
    console.error("Erreur création sujet:", err);
    return { error: "Une erreur est survenue lors de la publication." };
  }

  revalidatePath("/forum");
  revalidatePath("/admin");
  redirect(`/forum/${topicId}`);
}

export async function createComment(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Vous devez être connecté pour répondre." };
  }

  const topicId = String(formData.get("topicId") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!topicId) {
    return { error: "Sujet introuvable." };
  }
  if (content.length < 2) {
    return { error: "Votre réponse est trop courte." };
  }

  try {
    const topicExists = await prisma.topic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topicExists) {
      return { error: "Ce sujet n'existe plus." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.comment.create({
        data: {
          content,
          topicId,
          authorId: session.user.id,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { postsCount: { increment: 1 } },
      });
    });
  } catch (err) {
    console.error("Erreur création commentaire:", err);
    return { error: "Impossible d'envoyer votre réponse." };
  }

  revalidatePath(`/forum/${topicId}`);
  revalidatePath("/forum");
  return { error: null, success: true };
}

export async function deleteTopic(topicId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Non autorisé.");
  }

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { authorId: true },
  });

  if (!topic) {
    throw new Error("Sujet introuvable.");
  }

  const isAllowed =
    topic.authorId === session.user.id ||
    session.user.role === "ADMIN" ||
    session.user.role === "MODERATOR";

  if (!isAllowed) {
    throw new Error("Vous n'avez pas les droits pour supprimer ce sujet.");
  }

  await prisma.topic.delete({
    where: { id: topicId },
  });

  revalidatePath("/forum");
  redirect("/forum");
}

export async function deleteComment(commentId: string, topicId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Non autorisé.");
  }

  const comment = await prisma.comment.findUnique({
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
    throw new Error("Vous n'avez pas les droits pour supprimer ce message.");
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/forum/${topicId}`);
  revalidatePath("/forum");
}

export async function updateComment(
  commentId: string,
  topicId: string,
  content: string,
): Promise<{ error: string | null }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Vous devez être connecté." };
  }

  const trimmed = content.trim();
  if (trimmed.length < 2) {
    return { error: "Votre réponse est trop courte." };
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true },
  });

  if (!comment) {
    return { error: "Commentaire introuvable." };
  }

  if (comment.authorId !== session.user.id) {
    return { error: "Vous ne pouvez modifier que vos propres réponses." };
  }

  await prisma.comment.update({
    where: { id: commentId },
    data: { content: trimmed },
  });

  revalidatePath(`/forum/${topicId}`);
  return { error: null };
}
