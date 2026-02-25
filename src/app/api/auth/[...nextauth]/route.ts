// ============================================================================
// VietBridge AI V2 — NextAuth Route Handler (App Router)
// ============================================================================

import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
