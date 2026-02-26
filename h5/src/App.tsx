import { Outlet, useLocation, useNavigate } from "react-router-dom";
import BottomNav from "./components/layout/BottomNav";

const routeToTab: Record<string, string> = {
  "/": "home",
  "/learn": "learn",
  "/guide": "guide",
  "/me": "profile",
};

const tabToRoute: Record<string, string> = {
  home: "/",
  learn: "/learn",
  guide: "/guide",
  profile: "/me",
};

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = routeToTab[location.pathname] || "home";

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-[420px] flex-col bg-white shadow-[0_0_40px_rgba(0,0,0,0.06)]">
      <main className="flex flex-1 flex-col overflow-y-auto pb-16">
        <Outlet />
      </main>
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => navigate(tabToRoute[tab] || "/")}
      />
    </div>
  );
}
