import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prismaDB from "./lib/prisma";
import { User, UserRole } from "@prisma/client";
import authConfig from "./auth.config";
import { getCurrentUserByEmail } from "./lib/data/current-user";
import { determineRole } from "./lib/utils";

declare module "next-auth" {
  interface Session {
    user: {
      role: UserRole;
      isOAuth: boolean;
    } & DefaultSession["user"];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prismaDB),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    //this event is only triggered when we use an OAuth provider
    async linkAccount({ user }) {
      await prismaDB.user.update({
        where: {
          id: user.id,
        },
        data: {
          emailVerified: new Date(),
        },
      });
    },
  },

  callbacks: {
    async session({ session, user }) {
      // Prefer hydrating from DB to avoid relying on AdapterUser shape
      const email = session.user?.email ?? user?.email ?? null;
      if (email) {
        const dbUser = await prismaDB.user.findUnique({ where: { email } });
        if (dbUser && session.user) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role as UserRole;
          session.user.image = dbUser.image ?? session.user.image;
        }
      }
      return session;
    },
    async signIn({ user }) {
      const userEmail = user.email;
      const currentUser = userEmail
        ? await getCurrentUserByEmail(userEmail)
        : null;

      if (currentUser?.isBlocked) {
        return false;
      }

      // Ensure role is set/updated on sign in
      if (userEmail) {
        const userRole = determineRole(userEmail);
        await prismaDB.user.update({
          where: { id: user.id },
          data: { role: userRole },
        });
      }

      return true;
    },
  },
  ...authConfig,
});
