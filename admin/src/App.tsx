import { useState, useCallback } from "react";
import AdminLayout from "./layouts/AdminLayout";

export default function App() {
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <>
      <AdminLayout toast={showToast} />
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-[#27272F] border border-[#3B82F6]/30 text-[12px] text-[#EAEAEF] shadow-xl animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
}
