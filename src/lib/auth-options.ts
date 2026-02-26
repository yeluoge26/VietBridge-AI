// ============================================================================
// VietBridge AI V2 — NextAuth Configuration
// Providers: Credentials (email + password), Google OAuth
// Strategy: JWT with custom claims (id, role)
// ============================================================================

import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { prisma } from "./prisma";

// ---------------------------------------------------------------------------
// Type Augmentation — extend NextAuth types to include id and role
// ---------------------------------------------------------------------------

declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: {
      id: string;
      role: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
  }
}

// ---------------------------------------------------------------------------
// NextAuth Options
// ---------------------------------------------------------------------------

export const authOptions: NextAuthOptions = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // ── Credentials (email + password) ────────────────────────────────────
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("请输入邮箱和密码");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("邮箱或密码错误");
        }

        const isValid = await compare(credentials.password, user.hashedPassword);

        if (!isValid) {
          throw new Error("邮箱或密码错误");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),

    // ── Google OAuth ──────────────────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
    verifyRequest: "/login?verified=check",
  },

  // ---------------------------------------------------------------------------
  // Callbacks
  // ---------------------------------------------------------------------------

  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "user";
      }
      return token;
    },

    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },

  // ---------------------------------------------------------------------------
  // Events — auto-create FREE subscription on user creation
  // ---------------------------------------------------------------------------

  events: {
    async createUser({ user }) {
      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
        },
      });
    },
  },
};
