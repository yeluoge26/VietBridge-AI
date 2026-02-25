// ============================================================================
// VietBridge AI V2 — Stripe Client (Lazy Proxy)
// Uses Proxy pattern to avoid build-time crash when STRIPE_SECRET_KEY
// is not available (e.g., during `next build` in CI).
// ============================================================================

import Stripe from "stripe";

let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return _stripe;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (getStripe() as any)[prop];
  },
});
