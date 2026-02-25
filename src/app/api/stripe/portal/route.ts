// ============================================================================
// VietBridge AI V2 — Stripe Customer Portal
// Redirects user to Stripe billing portal for subscription management
// ============================================================================

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json({ error: "未找到订阅信息" }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/me`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[Stripe Portal Error]", error);
    return NextResponse.json({ error: "创建管理门户失败" }, { status: 500 });
  }
}
