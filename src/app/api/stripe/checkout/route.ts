// ============================================================================
// VietBridge AI V2 — Stripe Checkout Session
// Creates a checkout session for plan upgrades
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-mobile";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user?.id) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const priceId = typeof body.priceId === "string" ? body.priceId : "";
    if (!priceId || !/^price_[a-zA-Z0-9]{8,}$/.test(priceId)) {
      return NextResponse.json({ error: "无效的价格ID" }, { status: 400 });
    }

    // Get or create Stripe customer (upsert to prevent TOCTOU race)
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          plan: "FREE",
          stripeCustomerId: customerId,
        },
        update: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/me?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/me?canceled=true`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[Stripe Checkout Error]", error);
    return NextResponse.json({ error: "创建支付会话失败" }, { status: 500 });
  }
}
