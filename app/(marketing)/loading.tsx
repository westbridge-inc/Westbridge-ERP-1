export default function MarketingLoading() {
  return (
    <div aria-busy="true" aria-label="Loading page" className="mx-auto max-w-6xl px-6 py-16">
      {/* Hero skeleton */}
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-3/4 max-w-lg animate-pulse rounded-lg bg-muted" />
        <div className="mt-4 h-5 w-2/3 max-w-md animate-pulse rounded bg-muted" />
        <div className="mt-2 h-5 w-1/2 max-w-sm animate-pulse rounded bg-muted" />
        <div className="mt-8 h-11 w-40 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* Feature cards skeleton */}
      <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/70 bg-card p-6">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
            <div className="mt-4 h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
            <div className="mt-1 h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
