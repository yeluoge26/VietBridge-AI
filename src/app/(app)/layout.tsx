"use client";

// ============================================================================
// VietBridge AI V2 — App Layout (Mobile-First)
// Max-width 420px centered, with BottomNav at bottom
// ============================================================================

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import BottomNav from "@/components/app/BottomNav";

const tabRoutes: Record<string, string> = {
  home: "/",
  scan: "/scan",
  learn: "/learn",
  profile: "/me",
};

const routeToTab: Record<string, string> = {
  "/": "home",
  "/scan": "scan",
  "/learn": "learn",
  "/me": "profile",
};

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Derive active tab from pathname
  const activeTab = routeToTab[pathname] || "home";

  const [, setTab] = useState(activeTab);

  function handleTabChange(tab: string) {
    setTab(tab);
    const route = tabRoutes[tab];
    if (route) {
      router.push(route);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[420px] flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.06)]">
      {/* Main content area */}
      <main className="flex flex-1 flex-col overflow-y-auto pb-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
