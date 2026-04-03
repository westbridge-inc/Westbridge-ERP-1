import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading CRM pipeline">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-60" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      {/* Pipeline columns */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="h-4 w-24 rounded-md" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-20 w-full rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
