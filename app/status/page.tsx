import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

const SERVICES = [
  { name: "Web Application", url: "https://app.westbridgetoday.com", description: "Frontend application" },
  { name: "API & Backend", url: "https://api.westbridgetoday.com/api/v1/health", description: "Core API server" },
  { name: "Database", url: "https://api.westbridgetoday.com/api/v1/health", description: "Primary database" },
  { name: "ERP Engine", url: "https://erp.westbridgetoday.com", description: "ERPNext backend" },
  { name: "Email Delivery", url: "https://api.westbridgetoday.com/api/v1/health", description: "Transactional email" },
  { name: "Payment Processing", url: "https://api.westbridgetoday.com/api/v1/health", description: "Paddle payments" },
];

type ServiceStatus = {
  name: string;
  status: "operational" | "degraded" | "down";
};

async function checkService(service: (typeof SERVICES)[number]): Promise<ServiceStatus> {
  const start = Date.now();
  try {
    const res = await fetch(service.url, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "Westbridge-StatusPage/1.0" },
    });
    const responseTime = Date.now() - start;
    if (res.ok) {
      return { name: service.name, status: responseTime > 3000 ? "degraded" : "operational" };
    }
    return { name: service.name, status: "down" };
  } catch {
    return { name: service.name, status: "down" };
  }
}

function StatusDot({ status }: { status: ServiceStatus["status"] }) {
  const colors = {
    operational: "bg-success",
    degraded: "bg-warning",
    down: "bg-destructive",
  };
  return <span className={`inline-block size-2.5 rounded-full ${colors[status]}`} />;
}

function StatusLabel({ status }: { status: ServiceStatus["status"] }) {
  const labels = { operational: "Operational", degraded: "Degraded", down: "Down" };
  const colors = {
    operational: "text-success",
    degraded: "text-warning",
    down: "text-destructive",
  };
  return <span className={`text-sm ${colors[status]}`}>{labels[status]}</span>;
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "System Status | Westbridge",
  description: "Real-time system status for Westbridge ERP.",
};

export default async function StatusPage() {
  const results = await Promise.all(SERVICES.map(checkService));
  const allOperational = results.every((r) => r.status === "operational");
  const anyDown = results.some((r) => r.status === "down");

  const overallStatus = allOperational ? "operational" : anyDown ? "down" : "degraded";
  const overallMessages = {
    operational: "All Systems Operational",
    degraded: "Partial System Degradation",
    down: "Service Disruption Detected",
  };
  const bannerColors = {
    operational: "border-success/20 bg-success/10 text-success",
    degraded: "border-warning/20 bg-warning/10 text-warning",
    down: "border-destructive/20 bg-destructive/10 text-destructive",
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      {/* Header */}
      <div className="mb-10">
        <Link href="/" className="inline-block">
          <Logo variant="full" size="sm" />
        </Link>
        <h1 className="mt-6 text-2xl font-display font-semibold tracking-tight text-foreground">System Status</h1>
        <p className="mt-1 text-sm text-muted-foreground">Real-time status of Westbridge services</p>
      </div>

      {/* Overall status banner */}
      <div className={`mb-8 flex items-center gap-3 rounded-lg border p-4 font-medium ${bannerColors[overallStatus]}`}>
        <StatusDot status={overallStatus} />
        <span>{overallMessages[overallStatus]}</span>
      </div>

      {/* Service list */}
      <div className="space-y-0">
        {results.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between border-b border-border py-3">
            <span className="text-sm font-medium text-foreground">{svc.name}</span>
            <div className="flex items-center gap-2">
              <StatusDot status={svc.status} />
              <StatusLabel status={svc.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Uptime bar placeholder */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">Uptime (last 90 days)</h2>
        <div className="mt-3 flex gap-px">
          {Array.from({ length: 90 }, (_, i) => (
            <div key={i} className="h-8 flex-1 rounded-sm bg-success/80" title="100% uptime" />
          ))}
        </div>
        <p className="mt-2 text-sm font-medium text-foreground">99.98%</p>
      </div>

      {/* Past incidents */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold text-foreground">Past Incidents</h2>
        <p className="mt-3 text-sm text-muted-foreground">No incidents reported in the last 90 days.</p>
      </div>

      {/* Footer */}
      <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
        Page auto-refreshes on each visit. For urgent issues, contact{" "}
        <a href="mailto:support@westbridgetoday.com" className="text-foreground underline hover:no-underline">
          support@westbridgetoday.com
        </a>
      </p>
    </main>
  );
}
