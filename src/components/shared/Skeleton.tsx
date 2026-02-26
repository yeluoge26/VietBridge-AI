"use client";

// ============================================================================
// VietBridge AI V2 — Skeleton Loading Components
// Reusable shimmer placeholders for content loading states
// ============================================================================

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[#EDEDED]",
        className
      )}
    />
  );
}

/** Chat message skeleton — mimics TranslationCard layout */
export function ChatCardSkeleton() {
  return (
    <div className="px-4 py-1.5">
      <div className="rounded-2xl border border-[#EDEDED] bg-white p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        {/* Original text */}
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        {/* Translation box */}
        <div className="rounded-lg bg-[#F2F1EF] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-10 bg-[#E2E1DF]" />
            <div className="flex gap-1">
              <Skeleton className="h-7 w-7 rounded-full bg-[#E2E1DF]" />
              <Skeleton className="h-7 w-7 rounded-full bg-[#E2E1DF]" />
            </div>
          </div>
          <Skeleton className="h-5 w-full bg-[#E2E1DF]" />
          <Skeleton className="h-5 w-2/3 bg-[#E2E1DF]" />
        </div>
        {/* Natural section */}
        <div className="rounded-lg bg-[#2E7D32]/5 p-3 space-y-2">
          <Skeleton className="h-3 w-16 bg-[#2E7D32]/10" />
          <Skeleton className="h-5 w-full bg-[#2E7D32]/10" />
        </div>
      </div>
    </div>
  );
}

/** User bubble skeleton */
export function UserBubbleSkeleton() {
  return (
    <div className="flex justify-end px-4 py-1.5">
      <div className="max-w-[80%]">
        <Skeleton className="h-10 w-40 rounded-[14px] rounded-br-[4px] bg-[#DDD]" />
      </div>
    </div>
  );
}

/** Scene chips skeleton */
export function SceneChipsSkeleton() {
  return (
    <div className="flex gap-2 overflow-hidden px-4 py-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-7 w-16 shrink-0 rounded-full" />
      ))}
    </div>
  );
}

/** Daily card skeleton */
export function DailyCardSkeleton() {
  return (
    <div className="mx-4 rounded-2xl border border-[#EDEDED] bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="rounded-lg bg-[#F2F1EF] p-3">
        <Skeleton className="h-3 w-full bg-[#E2E1DF]" />
      </div>
    </div>
  );
}

/** Quick actions grid skeleton */
export function QuickActionsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 px-4">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-12 rounded-[14px]" />
      ))}
    </div>
  );
}

/** Profile page skeleton */
export function ProfileSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-2">
      {/* User card */}
      <div className="rounded-2xl border border-[#EDEDED] bg-white p-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </div>
      {/* Usage */}
      <div className="rounded-2xl border border-[#EDEDED] bg-white p-4 space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      {/* Plans */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-2xl border border-[#EDEDED] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-6 w-12" />
          </div>
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Scan page skeleton */
export function ScanSkeleton() {
  return (
    <div className="space-y-4 px-4 pt-2">
      {/* Doc type selector */}
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
      {/* Upload area */}
      <Skeleton className="h-40 rounded-2xl" />
      {/* Camera button */}
      <Skeleton className="h-12 rounded-xl" />
    </div>
  );
}

/** Learn page skeleton */
export function LearnSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      {/* Tab bar */}
      <div className="px-4">
        <Skeleton className="h-10 rounded-xl" />
      </div>
      {/* Daily card */}
      <DailyCardSkeleton />
      {/* Phrase rows */}
      <div className="space-y-3 px-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-[#EDEDED] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
