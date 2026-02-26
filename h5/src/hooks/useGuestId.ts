import { useState } from "react";

export function useGuestId(): string {
  const [id] = useState(() => {
    let gid = localStorage.getItem("vb_guest_id");
    if (!gid) {
      gid = crypto.randomUUID();
      localStorage.setItem("vb_guest_id", gid);
    }
    return gid;
  });
  return id;
}
