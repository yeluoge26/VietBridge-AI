"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "功能", href: "#features" },
  { label: "对比", href: "#comparison" },
  { label: "价格", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#EDEDED] bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="text-lg font-bold text-[#111]">
          VietBridge AI
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[#666] transition-colors hover:text-[#111]"
            >
              {link.label}
            </a>
          ))}
          <Button size="sm" asChild>
            <Link href="/app">立即使用</Link>
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-[#111] hover:bg-[#F5F5F5]">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-white p-6">
            <SheetTitle className="sr-only">导航菜单</SheetTitle>
            <div className="mb-8 flex items-center justify-between">
              <span className="text-lg font-bold text-[#111]">
                VietBridge AI
              </span>
              <SheetClose asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] hover:bg-[#F5F5F5]">
                  <X className="h-4 w-4" />
                </button>
              </SheetClose>
            </div>
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="text-base text-[#666] transition-colors hover:text-[#111]"
                >
                  {link.label}
                </a>
              ))}
              <Button className="mt-4 w-full" asChild>
                <Link href="/app">立即使用</Link>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
