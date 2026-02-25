"use client";

// ============================================================================
// VietBridge AI V2 — Usage Context Provider
// Fetches usage stats from /api/usage and provides to consumers
// ============================================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ────────────────────────────────────────────────────────────────

interface UsageContextValue {
  used: number;
  limit: number;
  loading: boolean;
  refresh: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────

const UsageContext = createContext<UsageContextValue | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────────────

export function UsageProvider({ children }: { children: ReactNode }) {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/usage");
      if (res.ok) {
        const data = await res.json();
        setUsed(data.used ?? 0);
        setLimit(data.limit ?? 0);
      }
    } catch {
      // Silently fail — usage is not critical
      console.warn("Failed to fetch usage data");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const value: UsageContextValue = {
    used,
    limit,
    loading,
    refresh: fetchUsage,
  };

  return (
    <UsageContext.Provider value={value}>{children}</UsageContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────

export function useUsage() {
  const context = useContext(UsageContext);
  if (!context) {
    throw new Error("useUsage must be used within a UsageProvider");
  }
  return context;
}
