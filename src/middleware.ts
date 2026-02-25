// ============================================================================
// VietBridge AI V2 — Route Protection Middleware
// Protects /app/* (auth required) and /admin/* (admin role required)
// Compatible with Next.js 16 — uses explicit function export
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ── Protect /app/* and /admin/* — require authentication ───────────────
  if ((pathname.startsWith("/app") || pathname.startsWith("/admin")) && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // ── Admin routes require role="admin" ──────────────────────────────────
  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/app", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
