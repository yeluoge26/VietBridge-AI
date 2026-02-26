import { DailyCardSkeleton, QuickActionsSkeleton, SceneChipsSkeleton } from "@/components/shared/Skeleton";

export default function HomeLoading() {
  return (
    <div className="flex h-full flex-1 flex-col bg-[#F8F7F5]">
      {/* TopBar placeholder */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="h-5 w-20 animate-pulse rounded bg-[#EDEDED]" />
        <div className="h-5 w-5 animate-pulse rounded bg-[#EDEDED]" />
      </div>

      {/* Context bar placeholder */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="h-4 w-32 animate-pulse rounded bg-[#EDEDED]" />
        <div className="h-7 w-7 animate-pulse rounded-full bg-[#EDEDED]" />
      </div>

      <SceneChipsSkeleton />

      <div className="flex-1 overflow-y-auto pb-4">
        <div className="flex flex-col gap-4 pt-6">
          <DailyCardSkeleton />
          <QuickActionsSkeleton />
        </div>
      </div>
    </div>
  );
}
