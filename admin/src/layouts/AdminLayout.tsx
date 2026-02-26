import { useLocation, useNavigate, Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

const PAGE_ROUTES: Record<string, string> = {
  dash: "/",
  kb: "/knowledge",
  prompt: "/prompts",
  course: "/courses",
  scene: "/scenes",
  router: "/router",
  tts: "/tts",
  logs: "/logs",
  risk: "/risk",
  users: "/users",
  bill: "/billing",
  finance: "/finance",
  sys: "/system",
};

const ROUTE_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_ROUTES).map(([k, v]) => [v, k])
);

interface AdminLayoutProps {
  toast: (msg: string) => void;
}

export default function AdminLayout({ toast }: AdminLayoutProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const activePage = ROUTE_TO_PAGE[pathname] || "dash";

  function handlePageChange(page: string) {
    const route = PAGE_ROUTES[page];
    if (route) navigate(route);
  }

  return (
    <div
      className="flex h-screen bg-[#09090B]"
      style={{ fontFamily: "var(--font-dm-sans), 'DM Sans', 'Noto Sans SC', sans-serif" }}
    >
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      <main className="flex-1 overflow-y-auto px-6 py-5">
        <Outlet context={{ toast }} />
      </main>
    </div>
  );
}
