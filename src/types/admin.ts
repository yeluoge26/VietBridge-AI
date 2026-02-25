// ============================================================================
// VietBridge AI V2 - Admin Dashboard Types
// Types for the admin panel, analytics, and management interfaces
// ============================================================================

// ---------------------------------------------------------------------------
// KPI & Analytics
// ---------------------------------------------------------------------------

/** Key Performance Indicators for the admin dashboard */
export interface KPI {
  label: string;
  value: number | string;
  change?: number;
  changeLabel?: string;
  trend?: "up" | "down" | "flat";
  icon?: string;
}

/** Daily analytics data point */
export interface DailyData {
  date: string;
  requests: number;
  users: number;
  tokens: number;
  revenue: number;
  errors: number;
}

/** Model usage statistics */
export interface ModelData {
  model: string;
  requests: number;
  tokens: number;
  avgLatency: number;
  errorRate: number;
  cost: number;
}

/** Task distribution for pie/bar charts */
export interface TaskDistribution {
  task: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

/** Scene usage statistics */
export interface SceneDistribution {
  scene: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

// ---------------------------------------------------------------------------
// Logging & Monitoring
// ---------------------------------------------------------------------------

/** System log entry */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  source: string;
  message: string;
  metadata?: Record<string, unknown>;
  userId?: string;
  requestId?: string;
}

/** API request log */
export interface ApiRequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  latency: number;
  model?: string;
  tokens?: number;
  userId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Risk & Safety
// ---------------------------------------------------------------------------

/** Risk detection rule configuration */
export interface RiskRule {
  id: string;
  name: string;
  description: string;
  pattern: string;
  severity: "low" | "medium" | "high" | "critical";
  enabled: boolean;
  scene?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Prompt Management
// ---------------------------------------------------------------------------

/** Prompt template version */
export interface PromptVersion {
  id: string;
  task: string;
  version: number;
  content: string;
  author: string;
  isActive: boolean;
  performance?: {
    avgRating: number;
    totalUses: number;
    errorRate: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Billing & Plans
// ---------------------------------------------------------------------------

/** Subscription plan definition */
export interface Plan {
  id: string;
  name: string;
  nameZh: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  limits: {
    dailyRequests: number;
    monthlyTokens: number;
    maxHistoryDays: number;
    models: string[];
  };
  stripePriceId?: string;
  isPopular?: boolean;
  isActive: boolean;
}

// ---------------------------------------------------------------------------
// API Key Management
// ---------------------------------------------------------------------------

/** API key data for admin management */
export interface ApiKeyData {
  id: string;
  provider: string;
  name: string;
  keyPrefix: string;
  status: "active" | "inactive" | "expired" | "rate_limited";
  usage: {
    requests: number;
    tokens: number;
    cost: number;
  };
  limits: {
    maxRequests?: number;
    maxTokens?: number;
    maxCost?: number;
  };
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// User Management
// ---------------------------------------------------------------------------

/** User data for admin panel */
export interface UserData {
  id: string;
  email: string;
  name?: string;
  role: AdminRole;
  plan: string;
  status: "active" | "suspended" | "deleted";
  usage: {
    totalRequests: number;
    totalTokens: number;
    lastActive: string;
  };
  subscription?: {
    planId: string;
    status: "active" | "past_due" | "canceled" | "trialing";
    currentPeriodEnd: string;
    stripeCustomerId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/** Admin role levels */
export type AdminRole = "super_admin" | "admin" | "moderator" | "user";

/** Role permission definitions */
export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "超级管理员",
  admin: "管理员",
  moderator: "内容审核员",
  user: "普通用户",
};

// ---------------------------------------------------------------------------
// Conversion Funnel
// ---------------------------------------------------------------------------

/** Funnel stage for conversion analytics */
export interface FunnelStage {
  id: string;
  label: string;
  count: number;
  percentage: number;
  dropoff?: number;
  color?: string;
}

// ---------------------------------------------------------------------------
// Admin Dashboard Aggregate
// ---------------------------------------------------------------------------

/** Complete admin dashboard data payload */
export interface AdminDashboardData {
  kpis: KPI[];
  dailyData: DailyData[];
  modelUsage: ModelData[];
  taskDistribution: TaskDistribution[];
  sceneDistribution: SceneDistribution[];
  recentLogs: LogEntry[];
  funnel: FunnelStage[];
  period: {
    start: string;
    end: string;
    granularity: "hour" | "day" | "week" | "month";
  };
}
