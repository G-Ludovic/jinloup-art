import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "MEMBER",
        input: false, // Sécurité : empêche quelqu'un d'envoyer role: "ADMIN" à l'inscription !
      },
      postsCount: {
        type: "number",
        required: true,
        defaultValue: 0,
        input: false,
      },
    },
  },
  plugins: [
    nextCookies(), // Toujours en dernier dans la liste des plugins pour Next.js
  ],
});
