"use client";

import { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { Activity, CheckCircle2, Clock, Factory } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Card, CardContent } from "@/components/ui/Card";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./FinanceDashboard";

const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyPieChart = nextDynamic(() => import("recharts").then((m) => m.PieChart), { ssr: false });
const LazyPie = nextDynamic(() => import("recharts").then((m) => m.Pie), { ssr: false });
const LazyCell = nextDynamic(() => import("recharts").then((m) => m.Cell), { ssr: false });
const LazyLineChart = nextDynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const LazyLine = nextDynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const LazyLegend = nextDynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface RawWorkOrder {
  name?: string;
  production_item?: string;
  qty?: number;
  produced_qty?: number;
  status?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_end_date?: string;
  bottleneck?: string;
  workstation?: string;
}

interface RawProductionPlan {
  name?: string;
  status?: string;
  posting_date?: string;
  total_planned_qty?: number;
}

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function lastNMonthKeys(n: number): { key: string; label: string }[] {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: MONTHS[d.getMonth()] });
  }
  return out;
}

function getMonthKey(dateStr: string | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isMtd(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const t = new Date();
  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth();
}

export function ManufacturingDashboard() {
  const woQuery = useErpList("Work Order", {
    fields: [
      "name",
      "production_item",
      "qty",
      "produced_qty",
      "status",
      "planned_start_date",
      "planned_end_date",
      "actual_end_date",
      "workstation",
    ],
    limit: 500,
  });
  const planQuery = useErpList("Production Plan", {
    fields: ["name", "status", "posting_date", "total_planned_qty"],
    limit: 100,
  });

  const workOrders = useMemo(() => (woQuery.data as RawWorkOrder[]) ?? [], [woQuery.data]);
  const plans = useMemo(() => (planQuery.data as RawProductionPlan[]) ?? [], [planQuery.data]);

  const loading = woQuery.isLoading || planQuery.isLoading;
  const errored = woQuery.isError && planQuery.isError;

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const active = workOrders.filter((wo) => wo.status === "In Process" || wo.status === "Not Started").length;
    const completed = workOrders.filter((wo) => wo.status === "Completed");
    const onTime = completed.filter((wo) => {
      if (!wo.planned_end_date || !wo.actual_end_date) return false;
      return wo.actual_end_date <= wo.planned_end_date;
    }).length;
    const onTimePct = completed.length > 0 ? (onTime / completed.length) * 100 : 0;
    const productionMtd = workOrders
      .filter((wo) => wo.status === "Completed" && isMtd(wo.actual_end_date))
      .reduce((s, wo) => s + (wo.produced_qty ?? 0), 0);
    const totalQty = workOrders.reduce((s, wo) => s + (wo.qty ?? 0), 0);
    const totalProduced = workOrders.reduce((s, wo) => s + (wo.produced_qty ?? 0), 0);
    const qualityPassRate = totalQty > 0 ? (totalProduced / totalQty) * 100 : 0;
    return { active, onTimePct, productionMtd, qualityPassRate };
  }, [workOrders]);

  // ── Work orders by status ─────────────────────────────────────────
  const statusData = useMemo(() => {
    const byStatus: Record<string, number> = {};
    workOrders.forEach((wo) => {
      const s = wo.status || "Draft";
      byStatus[s] = (byStatus[s] ?? 0) + 1;
    });
    return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  }, [workOrders]);

  // ── Production trend (last 6 months) ──────────────────────────────
  const productionTrend = useMemo(() => {
    const months = lastNMonthKeys(6);
    const byMonth: Record<string, number> = {};
    months.forEach(({ key }) => {
      byMonth[key] = 0;
    });
    workOrders.forEach((wo) => {
      if (wo.status !== "Completed" || !wo.actual_end_date) return;
      const k = getMonthKey(wo.actual_end_date);
      if (k in byMonth) byMonth[k] += wo.produced_qty ?? 0;
    });
    return months.map(({ key, label }) => ({ month: label, output: byMonth[key] }));
  }, [workOrders]);

  // ── Top bottlenecks ───────────────────────────────────────────────
  const bottlenecks = useMemo(() => {
    const stuck = workOrders.filter((wo) => {
      if (wo.status !== "In Process") return false;
      if (!wo.planned_end_date) return false;
      return new Date(wo.planned_end_date) < new Date();
    });
    const byWorkstation: Record<string, number> = {};
    stuck.forEach((wo) => {
      const ws = wo.workstation || "Unassigned";
      byWorkstation[ws] = (byWorkstation[ws] ?? 0) + 1;
    });
    return Object.entries(byWorkstation)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [workOrders]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Production Floor</h1>
        <p className="text-sm text-muted-foreground">Live work order status, output, and bottlenecks.</p>
      </div>

      {errored && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Could not reach the ERP backend. Showing zero values until the connection is restored.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Work Orders" value={kpis.active} icon={Activity} format="number" />
        <KpiCard label="On-Time Delivery" value={kpis.onTimePct} icon={Clock} format="percent" />
        <KpiCard label="Output (MTD)" value={kpis.productionMtd} icon={Factory} format="number" />
        <KpiCard label="Quality Pass Rate" value={kpis.qualityPassRate} icon={CheckCircle2} format="percent" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Work Orders by Status</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Live distribution</p>
            {statusData.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No work orders yet.</p>
            ) : (
              <div className="mt-4 h-64 min-h-[256px] w-full">
                <LazyResponsiveContainer width="100%" height={256}>
                  <LazyPieChart>
                    <LazyPie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {statusData.map((_, i) => (
                        <LazyCell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </LazyPie>
                    <LazyTooltip
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.375rem",
                      }}
                    />
                    <LazyLegend wrapperStyle={{ fontSize: 12 }} />
                  </LazyPieChart>
                </LazyResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Production Output</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Last 6 months</p>
            {productionTrend.every((d) => d.output === 0) ? (
              <p className="mt-8 text-sm text-muted-foreground">No completed production yet.</p>
            ) : (
              <div className="mt-4 h-64 min-h-[256px] w-full">
                <LazyResponsiveContainer width="100%" height={256}>
                  <LazyLineChart data={productionTrend} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <LazyXAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <LazyYAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      width={48}
                    />
                    <LazyTooltip
                      formatter={(value) => [String(value ?? 0), "Units"]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.375rem",
                      }}
                    />
                    <LazyLine type="monotone" dataKey="output" stroke="var(--primary)" strokeWidth={2.5} dot />
                  </LazyLineChart>
                </LazyResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Top Bottlenecks</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Workstations with overdue work orders</p>
          {bottlenecks.length === 0 ? (
            <p className="mt-8 text-sm text-success">No active bottlenecks. Floor is on schedule.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {bottlenecks.map((b) => (
                <li
                  key={b.name}
                  className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background p-3"
                >
                  <div className="flex items-center gap-3">
                    <Factory className="size-4 text-warning" aria-hidden="true" />
                    <span className="text-sm font-medium text-foreground">{b.name}</span>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground tabular-nums">
                    {b.count} overdue work order{b.count === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {plans.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {plans.filter((p) => p.status === "Completed").length} of {plans.length} production plans completed.
        </p>
      )}
    </div>
  );
}
