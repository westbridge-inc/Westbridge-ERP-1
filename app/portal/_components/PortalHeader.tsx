import type { PortalInfo } from "./types";

interface PortalHeaderProps {
  portalInfo: PortalInfo;
}

export function PortalHeader({ portalInfo }: PortalHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl leading-tight tracking-tight font-display font-semibold text-foreground text-balance">
        Welcome, {portalInfo.customerName}
      </h1>
      <p className="mt-1 text-sm leading-normal text-muted-foreground">
        View your documents from {portalInfo.companyName || "your vendor"}
      </p>
    </div>
  );
}
