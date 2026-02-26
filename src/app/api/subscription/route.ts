// ============================================================================
// VietBridge AI V2 — Subscription API
// Returns current subscription details for authenticated user or guest
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { getGuestId } from "@/lib/guest-id";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Try authenticated user first
  const user = await getAuthUser(req);
  if (user?.id) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: {
        plan: true,
        currentPeriodEnd: true,
        createdAt: true,
      },
    });

    if (!subscription) {
      return NextResponse.json({
        plan: "FREE",
        currentPeriodEnd: null,
      });
    }

    return NextResponse.json(subscription);
  }

  // Try guest
  const guestId = getGuestId(req);
  if (guestId) {
    return NextResponse.json({
      plan: "GUEST",
      currentPeriodEnd: null,
    });
  }

  return NextResponse.json({ error: "未登录" }, { status: 401 });
}
