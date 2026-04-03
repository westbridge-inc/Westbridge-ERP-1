import { Skeleton } from "@/components/ui/Skeleton";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading payroll">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-28" />
          <Skeleton className="mt-2 h-4 w-52" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      {/* Search bar */}
      <Skeleton className="h-9 w-64 rounded-md" />
      {/* Table */}
      <SkeletonTable rows={8} columns={4} />
    </div>
  );
}
