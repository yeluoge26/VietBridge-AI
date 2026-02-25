// ============================================================================
// VietBridge AI V2 — Root Layout
// Fonts: DM Sans, Noto Sans SC, JetBrains Mono
// Wraps all pages with SessionProvider for next-auth
// ============================================================================

import type { Metadata } from "next";
import { DM_Sans, Noto_Sans_SC, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VietBridge AI",
  description: "AI中越沟通助手",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${dmSans.variable} ${notoSansSC.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ fontFamily: "'DM Sans', 'Noto Sans SC', sans-serif" }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
