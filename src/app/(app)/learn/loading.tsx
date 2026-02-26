import { LearnSkeleton } from "@/components/shared/Skeleton";

export default function LearnLoading() {
  return (
    <div className="flex flex-1 flex-col bg-[#F8F7F5]">
      <div className="px-4 pt-4 pb-2">
        <div className="h-5 w-24 animate-pulse rounded bg-[#EDEDED]" />
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        <LearnSkeleton />
      </div>
    </div>
  );
}
