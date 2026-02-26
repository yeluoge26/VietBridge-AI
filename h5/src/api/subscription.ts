import { apiGet } from "./client";

export interface SubscriptionData {
  plan: string;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
}

export function fetchSubscription(): Promise<SubscriptionData> {
  return apiGet<SubscriptionData>("/api/subscription");
}
