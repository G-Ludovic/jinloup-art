"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ProfileActionState = {
  error: string | null;
  success: string | null;
};

const ALLOWED_DATA_IMAGE_PREFIX = /^data:image\/(webp|png|jpeg);base64,/;

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return { error: "Vous devez être connecté.", success: null };
  }

  const rawBio = String(formData.get("bio") ?? "").trim();
  const normalizedBio = rawBio.split("\n").slice(0, 3).join("\n").trim();

  if (normalizedBio.length > 160) {
    return {
      error: "La citation ne doit pas dépasser 160 caractères.",
      success: null,
    };
  }

  const rawImage = String(formData.get("image") ?? "").trim();
  let validImage: string | null = null;

  if (rawImage.length > 0) {
    const isSafeDataUri =
      ALLOWED_DATA_IMAGE_PREFIX.test(rawImage) && rawImage.length <= 25_000;
    const isSafeHttpsUrl =
      rawImage.startsWith("https://") && rawImage.length <= 500;

    if (!isSafeDataUri && !isSafeHttpsUrl) {
      return {
        error: "Format d'avatar invalide ou image trop lourde.",
        success: null,
      };
    }

    validImage = rawImage;
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bio: normalizedBio || null,
        image: validImage,
      },
    });
  } catch (err) {
    console.error("Erreur mise à jour profil:", err);
    return {
      error: "Impossible d'enregistrer les modifications.",
      success: null,
    };
  }

  revalidatePath("/profil");
  revalidatePath("/membres");
  revalidatePath("/forum");
  revalidatePath("/galerie");

  return { error: null, success: "Profil mis à jour avec succès !" };
}
