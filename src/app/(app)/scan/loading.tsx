import { ScanSkeleton } from "@/components/shared/Skeleton";

export default function ScanLoading() {
  return (
    <div className="flex flex-1 flex-col bg-[#F8F7F5]">
      <div className="px-4 pt-4 pb-2">
        <div className="h-5 w-20 animate-pulse rounded bg-[#EDEDED]" />
        <div className="mt-1 h-3 w-40 animate-pulse rounded bg-[#EDEDED]" />
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        <ScanSkeleton />
      </div>
    </div>
  );
}
