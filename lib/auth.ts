import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "./prisma";

export const auth = betterAuth({
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "jinloup-art.vercel.app",
      "jinloup-*-ludovic-gs-projects.vercel.app",
    ],
  },
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
        input: false,
      },
      postsCount: {
        type: "number",
        required: true,
        defaultValue: 0,
        input: false,
      },
      bio: {
        type: "string",
        required: false,
        input: false,
      },
      banned: {
        type: "boolean",
        required: true,
        defaultValue: false,
        input: false,
      },
    },
  },
  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: { banned: true },
          });

          if (user?.banned) {
            throw new APIError("FORBIDDEN", {
              message: "Votre compte a été suspendu par la modération.",
            });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});
