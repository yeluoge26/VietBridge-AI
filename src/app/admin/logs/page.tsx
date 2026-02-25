"use client";
import { useCallback, useState } from "react";
import LogsPage from "@/components/admin/LogsPage";

export default function LLMLogsPage() {
  const [msg, setMsg] = useState("");
  const toast = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2000); }, []);
  return (
    <>
      <LogsPage toast={toast} />
      {msg && <div className="fixed top-4 right-4 z-50 bg-[#18181C] text-[#EAEAEF] px-4 py-2 rounded-lg border border-[#2A2A35] text-sm">{msg}</div>}
    </>
  );
}
