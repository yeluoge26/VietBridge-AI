import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import DashPage from "./pages/DashPage";
import KBPage from "./pages/KBPage";
import PromptPage from "./pages/PromptPage";
import CoursePage from "./pages/CoursePage";
import ScenePage from "./pages/ScenePage";
import RouterPage from "./pages/RouterPage";
import TtsPage from "./pages/TtsPage";
import LogsPage from "./pages/LogsPage";
import RiskPage from "./pages/RiskPage";
import UsersPage from "./pages/UsersPage";
import BillPage from "./pages/BillPage";
import FinancePage from "./pages/FinancePage";
import SysPage from "./pages/SysPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<DashPage />} />
          <Route path="knowledge" element={<KBPage />} />
          <Route path="prompts" element={<PromptPage />} />
          <Route path="courses" element={<CoursePage />} />
          <Route path="scenes" element={<ScenePage />} />
          <Route path="router" element={<RouterPage />} />
          <Route path="tts" element={<TtsPage />} />
          <Route path="logs" element={<LogsPage />} />
          <Route path="risk" element={<RiskPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="billing" element={<BillPage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="system" element={<SysPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
