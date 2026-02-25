"use client";

import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState({ message: "", visible: false });

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 1500);
  }, []);

  return { toast, showToast };
}
