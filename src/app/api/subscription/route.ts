// ============================================================================
// VietBridge AI V2 — Subscription API
// Returns current subscription details for authenticated user
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      currentPeriodEnd: true,
      createdAt: true,
    },
  });

  if (!subscription) {
    return NextResponse.json({
      plan: "FREE",
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
    });
  }

  return NextResponse.json(subscription);
}
