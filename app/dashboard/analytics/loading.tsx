import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analytics">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-32" />
        <Skeleton className="mt-2 h-4 w-56" />
      </div>
      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/70 bg-card p-6 shadow-sm">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-16" />
          </div>
        ))}
      </div>
      {/* Chart placeholder */}
      <div className="rounded-xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-1 h-3 w-48" />
        <Skeleton className="mt-4 h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
