"use client";

import { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { Award, BarChart3, Briefcase, Target, TrendingUp } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/locale/currency";
import { KpiCard } from "./KpiCard";
import { DashboardSkeleton } from "./FinanceDashboard";

const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyLineChart = nextDynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const LazyLine = nextDynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const LazyBarChart = nextDynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const LazyBar = nextDynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface RawLead {
  name?: string;
  lead_name?: string;
  company_name?: string;
  status?: string;
  source?: string;
  email_id?: string;
  creation?: string;
}

interface RawOpportunity {
  name?: string;
  customer_name?: string;
  party_name?: string;
  opportunity_amount?: number;
  status?: string;
  sales_stage?: string;
  opportunity_owner?: string;
  contact_person?: string;
  transaction_date?: string;
  creation?: string;
}

interface RawSalesOrder {
  name?: string;
  customer?: string;
  customer_name?: string;
  grand_total?: number;
  status?: string;
  transaction_date?: string;
  docstatus?: number;
}

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

const STAGE_ORDER = ["Prospecting", "Qualification", "Needs Analysis", "Quotation", "Negotiation", "Closed Won"];

export function SalesDashboard() {
  const leadsQuery = useErpList("Lead", {
    fields: ["name", "lead_name", "company_name", "status", "source", "email_id", "creation"],
    limit: 200,
    orderBy: "creation desc",
  });
  const oppQuery = useErpList("Opportunity", {
    fields: [
      "name",
      "customer_name",
      "party_name",
      "opportunity_amount",
      "status",
      "sales_stage",
      "opportunity_owner",
      "contact_person",
      "transaction_date",
      "creation",
    ],
    limit: 500,
  });
  const orderQuery = useErpList("Sales Order", {
    fields: ["name", "customer", "customer_name", "grand_total", "status", "transaction_date", "docstatus"],
    limit: 500,
  });

  const leads = useMemo(() => (leadsQuery.data as RawLead[]) ?? [], [leadsQuery.data]);
  const opportunities = useMemo(() => (oppQuery.data as RawOpportunity[]) ?? [], [oppQuery.data]);
  const orders = useMemo(() => (orderQuery.data as RawSalesOrder[]) ?? [], [orderQuery.data]);

  const loading = leadsQuery.isLoading || oppQuery.isLoading || orderQuery.isLoading;
  const errored = leadsQuery.isError && oppQuery.isError && orderQuery.isError;

  // ── KPIs ──────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const open = opportunities.filter((o) => o.status === "Open");
    const pipelineValue = open.reduce((s, o) => s + (o.opportunity_amount ?? 0), 0);
    const won = opportunities.filter((o) => o.status === "Converted").length;
    const lost = opportunities.filter((o) => o.status === "Lost").length;
    const totalDecided = won + lost;
    const winRate = totalDecided > 0 ? (won / totalDecided) * 100 : 0;
    const avgDealSize =
      won > 0
        ? opportunities.filter((o) => o.status === "Converted").reduce((s, o) => s + (o.opportunity_amount ?? 0), 0) /
          won
        : 0;
    return {
      pipelineValue,
      openCount: open.length,
      winRate,
      avgDealSize,
    };
  }, [opportunities]);

  // ── Pipeline by stage ─────────────────────────────────────────────
  const pipelineData = useMemo(() => {
    const byStage: Record<string, number> = {};
    STAGE_ORDER.forEach((s) => {
      byStage[s] = 0;
    });
    opportunities.forEach((o) => {
      if (o.status !== "Open") return;
      const stage = o.sales_stage || "Prospecting";
      byStage[stage] = (byStage[stage] ?? 0) + (o.opportunity_amount ?? 0);
    });
    return Object.entries(byStage).map(([stage, value]) => ({ stage, value }));
  }, [opportunities]);

  // ── Deals closed per month (last 6 months) ───────────────────────
  const dealsTrend = useMemo(() => {
    const months = lastNMonthKeys(6);
    const byMonth: Record<string, number> = {};
    months.forEach(({ key }) => {
      byMonth[key] = 0;
    });
    orders.forEach((o) => {
      if (o.docstatus !== 1) return;
      const k = getMonthKey(o.transaction_date);
      if (k in byMonth) byMonth[k] += 1;
    });
    return months.map(({ key, label }) => ({ month: label, deals: byMonth[key] }));
  }, [orders]);

  // ── Top sales reps ────────────────────────────────────────────────
  const topReps = useMemo(() => {
    const byRep: Record<string, number> = {};
    opportunities.forEach((o) => {
      const rep = o.opportunity_owner || "Unassigned";
      byRep[rep] = (byRep[rep] ?? 0) + (o.opportunity_amount ?? 0);
    });
    return Object.entries(byRep)
      .map(([rep, total]) => ({ rep, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [opportunities]);

  // ── Recent leads ──────────────────────────────────────────────────
  const recentLeads = useMemo(() => {
    return [...leads].sort((a, b) => (b.creation ?? "").localeCompare(a.creation ?? "")).slice(0, 10);
  }, [leads]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Sales Pipeline</h1>
        <p className="text-sm text-muted-foreground">Pipeline value, deal flow, and rep performance.</p>
      </div>

      {errored && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Could not reach the ERP backend. Showing zero values until the connection is restored.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Pipeline Value" value={kpis.pipelineValue} icon={TrendingUp} format="currency" />
        <KpiCard label="Open Opportunities" value={kpis.openCount} icon={Briefcase} format="number" />
        <KpiCard label="Win Rate" value={kpis.winRate} icon={Target} format="percent" />
        <KpiCard label="Avg Deal Size" value={kpis.avgDealSize} icon={Award} format="currency" />
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Pipeline by Stage</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Open opportunity value</p>
          {pipelineData.every((d) => d.value === 0) ? (
            <p className="mt-8 text-sm text-muted-foreground">No open opportunities. Add a lead to get started.</p>
          ) : (
            <div className="mt-4 h-64 min-h-[256px] w-full">
              <LazyResponsiveContainer width="100%" height={256}>
                <LazyBarChart data={pipelineData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
                  <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <LazyXAxis
                    dataKey="stage"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    interval={0}
                  />
                  <LazyYAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    width={64}
                  />
                  <LazyTooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0), "USD"), "Pipeline"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <LazyBar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </LazyBarChart>
              </LazyResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Deals Closed</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Last 6 months</p>
            {dealsTrend.every((d) => d.deals === 0) ? (
              <p className="mt-8 text-sm text-muted-foreground">No closed deals in the last 6 months.</p>
            ) : (
              <div className="mt-4 h-56 min-h-[224px] w-full">
                <LazyResponsiveContainer width="100%" height={224}>
                  <LazyLineChart data={dealsTrend} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
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
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      width={32}
                    />
                    <LazyTooltip
                      formatter={(value) => [String(value ?? 0), "Deals"]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.375rem",
                      }}
                    />
                    <LazyLine type="monotone" dataKey="deals" stroke="var(--primary)" strokeWidth={2.5} dot />
                  </LazyLineChart>
                </LazyResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Top 5 Sales Reps</p>
            <p className="mt-0.5 text-sm text-muted-foreground">By pipeline owned</p>
            {topReps.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No assigned reps yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {topReps.map((r, i) => {
                  const max = topReps[0]?.total || 1;
                  const pct = (r.total / max) * 100;
                  return (
                    <li key={r.rep}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate text-foreground">
                          <span className="text-muted-foreground/70">{i + 1}.</span> {r.rep}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatCurrency(r.total, "USD")}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Recent Leads</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Latest 10 leads</p>
          {recentLeads.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No leads yet. Capture your first lead.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Lead</th>
                    <th className="py-2 pr-3 font-medium">Company</th>
                    <th className="py-2 pr-3 font-medium">Source</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead) => (
                    <tr key={lead.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-foreground">{lead.lead_name ?? lead.name ?? "—"}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground truncate max-w-[200px]">
                        {lead.company_name ?? "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{lead.source ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <Badge
                          variant={
                            lead.status === "Converted"
                              ? "success"
                              : lead.status === "Do Not Contact"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {lead.status ?? "—"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <BarChart3 className="size-3.5" aria-hidden="true" />
        Live data refreshes every 2 minutes.
      </div>
    </div>
  );
}
