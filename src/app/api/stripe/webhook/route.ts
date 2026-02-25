// ============================================================================
// VietBridge AI V2 — Stripe Webhook Handler
// Handles subscription lifecycle events
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[Stripe Webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = stripeSubscription.items.data[0]?.price?.id;

          // Determine plan from price ID
          let plan: "FREE" | "PRO" | "ENTERPRISE" | "API" = "PRO";
          if (priceId === process.env.STRIPE_ENT_PRICE_ID) {
            plan = "ENTERPRISE";
          }

          await prisma.subscription.update({
            where: { userId },
            data: {
              plan,
              stripeSubscriptionId: subscriptionId,
              stripePriceId: priceId || null,
              currentPeriodEnd: new Date(((stripeSubscription as unknown as Record<string, number>).current_period_end) * 1000),
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              plan: "FREE",
              stripeSubscriptionId: null,
              stripePriceId: null,
              currentPeriodEnd: null,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = (invoice as unknown as { subscription: string | null }).subscription;

        if (subscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          const sub = await prisma.subscription.findFirst({
            where: { stripeSubscriptionId: subscriptionId },
          });

          if (sub) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: {
                currentPeriodEnd: new Date(((stripeSubscription as unknown as Record<string, number>).current_period_end) * 1000),
              },
            });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Stripe Webhook] Processing error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
