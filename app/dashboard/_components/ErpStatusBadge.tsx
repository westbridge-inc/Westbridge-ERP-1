"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

type ErpStatus = "connected" | "syncing" | "error";

export function ErpStatusBadge() {
  const [erpStatus, setErpStatus] = useState<ErpStatus>("syncing");

  useEffect(() => {
    function checkErp() {
      // Use relative URL — Next.js proxy forwards to backend
      fetch("/api/health/ready", { cache: "no-store", credentials: "include" })
        .then((r) => setErpStatus(r.ok ? "connected" : "error"))
        .catch(() => setErpStatus("error"));
    }
    checkErp();
    const interval = setInterval(checkErp, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (erpStatus === "connected") {
    return (
      <span className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success">
        ERP Connected
      </span>
    );
  }

  if (erpStatus === "syncing") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Connecting&hellip;
      </span>
    );
  }

  return (
    <span className="rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
      ERP Offline
    </span>
  );
}
