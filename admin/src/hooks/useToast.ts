import { useOutletContext } from "react-router-dom";

interface AdminContext {
  toast: (msg: string) => void;
}

export function useToast() {
  const { toast } = useOutletContext<AdminContext>();
  return toast;
}
