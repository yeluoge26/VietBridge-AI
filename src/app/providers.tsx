"use client";

// ============================================================================
// VietBridge AI V2 — Client Providers Wrapper
// SessionProvider must be a client component
// ============================================================================

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
