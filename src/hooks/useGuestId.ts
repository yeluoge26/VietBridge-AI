"use client";

// ============================================================================
// VietBridge AI V2 — Guest ID Client Hook
// Generates and persists a UUID for anonymous users in localStorage
// ============================================================================

import { useState, useEffect } from "react";

const STORAGE_KEY = "vb_guest_id";

/**
 * Returns the guest UUID from localStorage.
 * Generates one on first visit. Returns null during SSR.
 */
export function useGuestId(): string | null {
  const [guestId, setGuestId] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setGuestId(id);
  }, []);

  return guestId;
}

/**
 * Helper to read guest ID synchronously (for fetch calls).
 * Returns null during SSR.
 */
export function getClientGuestId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}
