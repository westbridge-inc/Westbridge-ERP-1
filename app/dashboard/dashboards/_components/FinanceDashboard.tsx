"use client";

import { useMemo } from "react";
import nextDynamic from "next/dynamic";
import { DollarSign, Receipt, TrendingDown, Wallet } from "lucide-react";
import { useErpList } from "@/lib/queries/useErpList";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/locale/currency";
import { KpiCard } from "./KpiCard";

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
const LazyLegend = nextDynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

interface RawInvoice {
  name?: string;
  grand_total?: number;
  outstanding_amount?: number;
  posting_date?: string;
  due_date?: string;
  status?: string;
  customer?: string;
  customer_name?: string;
  docstatus?: number;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function lastNMonthKeys(n: number): { key: string; label: string }[] {
  const now = new Date();
  const out: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({ key, label: MONTH_NAMES[d.getMonth()] });
  }
  return out;
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isMtd(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function isPriorMonth(dateStr: string | undefined): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const prior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return d.getFullYear() === prior.getFullYear() && d.getMonth() === prior.getMonth();
}

function pctDelta(current: number, prior: number): number | undefined {
  if (prior === 0) return undefined;
  return ((current - prior) / prior) * 100;
}

function isPaid(inv: RawInvoice): boolean {
  return inv.status === "Paid" || inv.docstatus === 1;
}

function daysOverdue(due: string | undefined): number {
  if (!due) return 0;
  const d = new Date(due);
  if (Number.isNaN(d.getTime())) return 0;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

const SI_FIELDS = [
  "name",
  "posting_date",
  "due_date",
  "grand_total",
  "outstanding_amount",
  "status",
  "customer",
  "customer_name",
  "docstatus",
];

const PI_FIELDS = ["name", "posting_date", "grand_total", "status", "docstatus"];

export function FinanceDashboard() {
  const sales = useErpList("Sales Invoice", { fields: SI_FIELDS, limit: 500, orderBy: "posting_date desc" });
  const purchases = useErpList("Purchase Invoice", { fields: PI_FIELDS, limit: 500, orderBy: "posting_date desc" });

  const salesData = useMemo(() => (sales.data as RawInvoice[]) ?? [], [sales.data]);
  const purchaseData = useMemo(() => (purchases.data as RawInvoice[]) ?? [], [purchases.data]);

  const loading = sales.isLoading || purchases.isLoading;
  const errored = sales.isError && purchases.isError;

  // ── KPIs ────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const mtdRevenue = salesData
      .filter((inv) => isPaid(inv) && isMtd(inv.posting_date))
      .reduce((s, inv) => s + (inv.grand_total ?? 0), 0);
    const priorRevenue = salesData
      .filter((inv) => isPaid(inv) && isPriorMonth(inv.posting_date))
      .reduce((s, inv) => s + (inv.grand_total ?? 0), 0);

    const mtdExpenses = purchaseData
      .filter((inv) => isPaid(inv) && isMtd(inv.posting_date))
      .reduce((s, inv) => s + (inv.grand_total ?? 0), 0);
    const priorExpenses = purchaseData
      .filter((inv) => isPaid(inv) && isPriorMonth(inv.posting_date))
      .reduce((s, inv) => s + (inv.grand_total ?? 0), 0);

    const outstanding = salesData
      .filter((inv) => inv.status === "Overdue" || inv.status === "Unpaid")
      .reduce((s, inv) => s + (inv.outstanding_amount ?? inv.grand_total ?? 0), 0);

    const netProfit = mtdRevenue - mtdExpenses;
    const priorNet = priorRevenue - priorExpenses;

    return {
      mtdRevenue,
      revenueDelta: pctDelta(mtdRevenue, priorRevenue),
      outstanding,
      mtdExpenses,
      expenseDelta: pctDelta(mtdExpenses, priorExpenses),
      netProfit,
      profitDelta: pctDelta(netProfit, priorNet),
    };
  }, [salesData, purchaseData]);

  // ── Revenue vs Expenses (last 6 months) ─────────────────────────────
  const trendData = useMemo(() => {
    const months = lastNMonthKeys(6);
    const byMonthRev: Record<string, number> = {};
    const byMonthExp: Record<string, number> = {};
    months.forEach(({ key }) => {
      byMonthRev[key] = 0;
      byMonthExp[key] = 0;
    });
    salesData.forEach((inv) => {
      if (!inv.posting_date || !isPaid(inv)) return;
      const k = getMonthKey(inv.posting_date);
      if (k in byMonthRev) byMonthRev[k] += inv.grand_total ?? 0;
    });
    purchaseData.forEach((inv) => {
      if (!inv.posting_date || !isPaid(inv)) return;
      const k = getMonthKey(inv.posting_date);
      if (k in byMonthExp) byMonthExp[k] += inv.grand_total ?? 0;
    });
    return months.map(({ key, label }) => ({
      month: label,
      revenue: byMonthRev[key],
      expenses: byMonthExp[key],
    }));
  }, [salesData, purchaseData]);

  // ── AR Aging ────────────────────────────────────────────────────────
  const arAgingData = useMemo(() => {
    const buckets = { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
    salesData.forEach((inv) => {
      if (inv.status !== "Overdue" && inv.status !== "Unpaid") return;
      const amount = inv.outstanding_amount ?? inv.grand_total ?? 0;
      const days = daysOverdue(inv.due_date);
      if (days < 0 || days <= 30) buckets["0-30"] += amount;
      else if (days <= 60) buckets["31-60"] += amount;
      else if (days <= 90) buckets["61-90"] += amount;
      else buckets["90+"] += amount;
    });
    return Object.entries(buckets).map(([bucket, value]) => ({ bucket, value }));
  }, [salesData]);

  // ── Top 5 customers ────────────────────────────────────────────────
  const topCustomers = useMemo(() => {
    const byCustomer: Record<string, number> = {};
    salesData.forEach((inv) => {
      if (!isPaid(inv)) return;
      const name = inv.customer_name ?? inv.customer ?? "Unknown";
      byCustomer[name] = (byCustomer[name] ?? 0) + (inv.grand_total ?? 0);
    });
    return Object.entries(byCustomer)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [salesData]);

  // ── Recent transactions (last 10) ──────────────────────────────────
  const recentTransactions = useMemo(() => {
    return [...salesData]
      .filter((inv) => inv.posting_date)
      .sort((a, b) => (b.posting_date ?? "").localeCompare(a.posting_date ?? ""))
      .slice(0, 10);
  }, [salesData]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Finance Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time financial KPIs across revenue, expenses, and AR.</p>
      </div>

      {errored && (
        <Card>
          <CardContent className="p-4 text-sm text-muted-foreground">
            Could not reach the ERP backend. Showing zero values until the connection is restored.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue (MTD)"
          value={kpis.mtdRevenue}
          delta={kpis.revenueDelta}
          icon={DollarSign}
          format="currency"
        />
        <KpiCard label="Outstanding AR" value={kpis.outstanding} icon={Receipt} format="currency" />
        <KpiCard
          label="Expenses (MTD)"
          value={kpis.mtdExpenses}
          delta={kpis.expenseDelta}
          icon={TrendingDown}
          format="currency"
        />
        <KpiCard
          label="Net Profit (MTD)"
          value={kpis.netProfit}
          delta={kpis.profitDelta}
          icon={Wallet}
          format="currency"
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Revenue vs Expenses</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Last 6 months</p>
          {trendData.every((d) => d.revenue === 0 && d.expenses === 0) ? (
            <p className="mt-8 text-sm text-muted-foreground">No data yet. Create your first invoice to see trends.</p>
          ) : (
            <div className="mt-4 h-64 min-h-[256px] w-full">
              <LazyResponsiveContainer width="100%" height={256}>
                <LazyLineChart data={trendData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
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
                    width={64}
                  />
                  <LazyTooltip
                    formatter={(value, name) => [
                      formatCurrency(Number(value ?? 0), "USD"),
                      name === "revenue" ? "Revenue" : "Expenses",
                    ]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "0.375rem",
                      color: "var(--foreground)",
                    }}
                    labelStyle={{ color: "var(--muted-foreground)" }}
                  />
                  <LazyLegend wrapperStyle={{ fontSize: 12 }} />
                  <LazyLine
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <LazyLine
                    type="monotone"
                    dataKey="expenses"
                    name="Expenses"
                    stroke="var(--destructive)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LazyLineChart>
              </LazyResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">AR Aging</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Outstanding receivables by age</p>
            {arAgingData.every((d) => d.value === 0) ? (
              <p className="mt-8 text-sm text-muted-foreground">No outstanding receivables.</p>
            ) : (
              <div className="mt-4 h-56 min-h-[224px] w-full">
                <LazyResponsiveContainer width="100%" height={224}>
                  <LazyBarChart data={arAgingData} margin={{ top: 5, right: 12, left: 0, bottom: 0 }}>
                    <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <LazyXAxis
                      dataKey="bucket"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <LazyYAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      width={64}
                    />
                    <LazyTooltip
                      formatter={(value) => [formatCurrency(Number(value ?? 0), "USD"), "Outstanding"]}
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

        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Top 5 Customers</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Ranked by revenue</p>
            {topCustomers.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No customer revenue yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {topCustomers.map((c, i) => {
                  const max = topCustomers[0]?.total || 1;
                  const pct = (c.total / max) * 100;
                  return (
                    <li key={c.name}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="truncate text-foreground">
                          <span className="text-muted-foreground/70">{i + 1}.</span> {c.name}
                        </span>
                        <span className="font-medium tabular-nums text-foreground">
                          {formatCurrency(c.total, "USD")}
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl font-semibold text-foreground font-display">Recent Transactions</p>
              <p className="mt-0.5 text-sm text-muted-foreground">Latest 10 sales invoices</p>
            </div>
          </div>
          {recentTransactions.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No transactions yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Invoice</th>
                    <th className="py-2 pr-3 font-medium">Customer</th>
                    <th className="py-2 pr-3 font-medium">Date</th>
                    <th className="py-2 pr-3 font-medium">Status</th>
                    <th className="py-2 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((inv) => (
                    <tr key={inv.name} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 pr-3 font-medium text-foreground">{inv.name}</td>
                      <td className="py-2.5 pr-3 text-muted-foreground truncate max-w-[180px]">
                        {inv.customer_name ?? inv.customer ?? "—"}
                      </td>
                      <td className="py-2.5 pr-3 text-muted-foreground">{inv.posting_date ?? "—"}</td>
                      <td className="py-2.5 pr-3">
                        <Badge
                          variant={
                            inv.status === "Paid" ? "success" : inv.status === "Overdue" ? "destructive" : "secondary"
                          }
                        >
                          {inv.status ?? "—"}
                        </Badge>
                      </td>
                      <td className="py-2.5 text-right font-medium tabular-nums text-foreground">
                        {formatCurrency(inv.grand_total ?? 0, "USD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-3 h-8 w-32" />
              <Skeleton className="mt-3 h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-1 h-3 w-24" />
          <Skeleton className="mt-4 h-64 w-full" />
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-48 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-48 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Re-export the skeleton so other dashboards can use the same loading shell.
export { DashboardSkeleton };
