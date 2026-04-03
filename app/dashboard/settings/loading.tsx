import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading settings">
      {/* Page header */}
      <div>
        <Skeleton className="h-8 w-28" />
        <Skeleton className="mt-2 h-4 w-48" />
      </div>
      {/* Tab bar */}
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>
      {/* Settings form skeleton */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-6 h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}
