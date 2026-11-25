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
