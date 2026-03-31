const SERVICES = [
  {
    name: "API Backend",
    url: "https://api.westbridgetoday.com/api/v1/health",
    description: "Core API server",
  },
  {
    name: "Frontend",
    url: "https://app.westbridgetoday.com",
    description: "Web application",
  },
  {
    name: "ERPNext",
    url: "https://erp.westbridgetoday.com",
    description: "ERP system",
  },
];

type ServiceStatus = {
  name: string;
  description: string;
  status: "operational" | "degraded" | "down";
  responseTime: number | null;
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
      return {
        name: service.name,
        description: service.description,
        status: responseTime > 3000 ? "degraded" : "operational",
        responseTime,
      };
    }
    return {
      name: service.name,
      description: service.description,
      status: "down",
      responseTime,
    };
  } catch {
    return {
      name: service.name,
      description: service.description,
      status: "down",
      responseTime: null,
    };
  }
}

function StatusDot({ status }: { status: ServiceStatus["status"] }) {
  const colors = {
    operational: "bg-emerald-500 shadow-emerald-500/50",
    degraded: "bg-yellow-500 shadow-yellow-500/50",
    down: "bg-red-500 shadow-red-500/50",
  };
  return <span className={`inline-block h-3 w-3 rounded-full shadow-[0_0_8px] ${colors[status]}`} />;
}

function StatusLabel({ status }: { status: ServiceStatus["status"] }) {
  const labels = {
    operational: "Operational",
    degraded: "Degraded",
    down: "Down",
  };
  const colors = {
    operational: "text-emerald-400",
    degraded: "text-yellow-400",
    down: "text-red-400",
  };
  return <span className={`text-sm font-medium ${colors[status]}`}>{labels[status]}</span>;
}

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function StatusPage() {
  const results = await Promise.all(SERVICES.map(checkService));
  const allOperational = results.every((r) => r.status === "operational");
  const anyDown = results.some((r) => r.status === "down");
  const checkedAt = new Date().toISOString();

  const overallStatus = allOperational ? "operational" : anyDown ? "down" : "degraded";
  const overallMessages = {
    operational: "All Systems Operational",
    degraded: "Partial System Degradation",
    down: "Service Disruption Detected",
  };
  const overallColors = {
    operational: "border-emerald-500/30 bg-emerald-500/5",
    degraded: "border-yellow-500/30 bg-yellow-500/5",
    down: "border-red-500/30 bg-red-500/5",
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight text-white">Westbridge Status</h1>
        <p className="mt-1 text-sm text-zinc-500">Real-time system status</p>
      </div>

      {/* Overall status banner */}
      <div className={`mb-8 flex items-center gap-3 rounded-lg border px-5 py-4 ${overallColors[overallStatus]}`}>
        <StatusDot status={overallStatus} />
        <span className="text-base font-medium text-white">{overallMessages[overallStatus]}</span>
      </div>

      {/* Service list */}
      <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/50">
        {results.map((svc) => (
          <div key={svc.name} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <StatusDot status={svc.status} />
              <div>
                <p className="text-sm font-medium text-white">{svc.name}</p>
                <p className="text-xs text-zinc-500">{svc.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {svc.responseTime !== null && (
                <span className="text-xs tabular-nums text-zinc-500">{svc.responseTime}ms</span>
              )}
              <StatusLabel status={svc.status} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center justify-between text-xs text-zinc-600">
        <span>Last checked: {new Date(checkedAt).toLocaleString("en-US", { timeZone: "UTC" })} UTC</span>
        <span>Refreshes on each page load</span>
      </div>
    </main>
  );
}
