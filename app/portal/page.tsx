import { Suspense } from "react";
import { PortalClient } from "./_components/PortalClient";

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
            <p className="text-sm text-muted-foreground">Loading your portal...</p>
          </div>
        </div>
      }
    >
      <PortalClient />
    </Suspense>
  );
}
