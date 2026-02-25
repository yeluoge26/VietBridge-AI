// ============================================================================
// VietBridge AI V2 — Prisma Client Singleton
// Prevents multiple PrismaClient instances in development (hot-reload safe)
// ============================================================================

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
