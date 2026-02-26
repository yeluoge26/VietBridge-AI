import { apiGet } from "./client";

export interface UsageData {
  used: number;
  limit: number;
  allowed: boolean;
  plan: string;
}

export function fetchUsage(): Promise<UsageData> {
  return apiGet<UsageData>("/api/usage");
}
