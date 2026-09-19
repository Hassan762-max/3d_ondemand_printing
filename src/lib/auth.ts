import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db";
import { permissionsFor } from "@/lib/rbac";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const ROLE_REVALIDATE_MS = 5 * 60 * 1000;

/**
 * When AUTH_URL is https://…ngrok…, Auth.js uses __Secure- cookies, but the
 * Node server still sees http://localhost from the tunnel → session is set in
 * the browser then invisible to auth() on the next request (login “hangs”
 * / loops back to sign-in). Prefer localhost AUTH_URL for local+ngrok and
 * trust the forwarded Host header instead.
 */
const useSecureCookies =
  process.env.AUTH_URL?.startsWith("https://") === true &&
  !process.env.AUTH_URL.includes("ngrok") &&
  !process.env.AUTH_URL.includes("localhost");

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: Role;
      permissions: string[];
    };
  }

  interface User {
    role: Role;
  }

  interface JWT {
    id?: string;
    role?: Role;
    verifiedAt?: number;
    error?: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  useSecureCookies,
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user?.passwordHash) return null;
        if (user.active === false) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.verifiedAt = Date.now();
        delete token.error;
        return token;
      }

      const id = typeof token.id === "string" ? token.id : token.sub;
      const last =
        typeof token.verifiedAt === "number" ? token.verifiedAt : 0;
      const stale = Date.now() - last > ROLE_REVALIDATE_MS;

      if (id && stale) {
        const dbUser = await prisma.user.findUnique({
          where: { id },
          select: { role: true, active: true },
        });
        if (!dbUser || dbUser.active === false) {
          return { ...token, error: "inactive" };
        }
        token.role = dbUser.role;
        token.verifiedAt = Date.now();
        delete token.error;
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "inactive") {
        session.user = undefined as unknown as typeof session.user;
        return session;
      }
      const role = (token.role as Role | undefined) ?? "CUSTOMER";
      const id = typeof token.id === "string" ? token.id : (token.sub ?? "");
      if (session.user) {
        session.user.id = id;
        session.user.role = role;
        session.user.permissions = permissionsFor(role);
      }
      return session;
    },
  },
});
