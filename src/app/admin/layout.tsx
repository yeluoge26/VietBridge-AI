"use client";

// ============================================================================
// VietBridge AI V2 — Admin Layout (Dark Theme)
// Sidebar (200px) + main content area with Next.js routing
// ============================================================================

import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";

const PAGE_ROUTES: Record<string, string> = {
  dash: "/admin",
  kb: "/admin/knowledge",
  prompt: "/admin/prompts",
  course: "/admin/courses",
  router: "/admin/router",
  logs: "/admin/logs",
  risk: "/admin/risk",
  users: "/admin/users",
  bill: "/admin/billing",
  sys: "/admin/system",
};

const ROUTE_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_ROUTES).map(([k, v]) => [v, k])
);

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activePage = ROUTE_TO_PAGE[pathname] || "dash";

  function handlePageChange(page: string) {
    const route = PAGE_ROUTES[page];
    if (route) router.push(route);
  }

  return (
    <div
      className="flex h-screen bg-[#09090B]"
      style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', 'Noto Sans SC', sans-serif" }}
    >
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      <main className="flex-1 overflow-y-auto px-6 py-5">
        {children}
      </main>
    </div>
  );
}
