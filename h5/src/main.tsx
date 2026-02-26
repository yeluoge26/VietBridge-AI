import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import LearnPage from "./pages/LearnPage";
import GuidePage from "./pages/GuidePage";
import MePage from "./pages/MePage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="me" element={<MePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
