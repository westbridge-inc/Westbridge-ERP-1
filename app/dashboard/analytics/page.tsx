"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RawInvoice {
  name?: string;
  grand_total?: number;
  outstanding_amount?: number;
  posting_date?: string;
  status?: string;
  customer?: string;
  customer_name?: string;
  docstatus?: number;
  items?: Array<{ item_group?: string; amount?: number }>;
}

type PageState = "loading" | "error" | "empty" | "success";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [, m] = key.split("-");
  return MONTH_NAMES[parseInt(m, 10) - 1] ?? key;
}

function getLast12Months(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

/* ------------------------------------------------------------------ */
/*  Fetch helper                                                       */
/* ------------------------------------------------------------------ */

async function fetchDoctype(doctype: string, limit: number): Promise<unknown[]> {
  const qs = new URLSearchParams({ doctype, limit: String(limit) });
  const res = await fetch(`${API_BASE}/api/erp/list?${qs.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.json();
  return (body?.data as unknown[]) ?? [];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function AnalyticsPage() {
  const [state, setState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<RawInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<RawInvoice[]>([]);

  const [fetchKey, setFetchKey] = useState(0);

  /* ---------- Fetch data ---------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState("loading");
      setErrorMessage(null);
      try {
        const [si, pi] = await Promise.all([
          fetchDoctype("Sales Invoice", 500),
          fetchDoctype("Purchase Invoice", 200),
        ]);
        if (cancelled) return;
        const siList = si as RawInvoice[];
        const piList = pi as RawInvoice[];

        if (siList.length === 0 && piList.length === 0) {
          setState("empty");
          return;
        }

        setSalesInvoices(siList);
        setPurchaseInvoices(piList);
        setState("success");
      } catch {
        if (!cancelled) {
          setState("error");
          setErrorMessage("Failed to load analytics data. Please try again.");
        }
      }
    })();

    return () => { cancelled = true; };
  }, [fetchKey]);

  const loadData = () => setFetchKey((k) => k + 1);

  /* ---------- Revenue Trend (12 months) ---------- */

  const revenueTrend = useMemo(() => {
    const months = getLast12Months();
    const byMonth: Record<string, number> = {};
    months.forEach((m) => { byMonth[m] = 0; });

    salesInvoices.forEach((inv) => {
      if (inv.posting_date && (inv.status === "Paid" || inv.docstatus === 1)) {
        const key = getMonthKey(inv.posting_date);
        if (byMonth[key] !== undefined) {
          byMonth[key] += inv.grand_total ?? 0;
        }
      }
    });

    return months.map((m) => ({
      month: getMonthLabel(m),
      value: byMonth[m],
    }));
  }, [salesInvoices]);

  const maxRevTrend = useMemo(() => {
    let max = 0;
    revenueTrend.forEach((d) => { if (d.value > max) max = d.value; });
    return max > 0 ? max * 1.15 : 100;
  }, [revenueTrend]);

  /* ---------- Top 5 Customers ---------- */

  const topCustomers = useMemo(() => {
    const byCustomer: Record<string, { name: string; total: number }> = {};

    salesInvoices.forEach((inv) => {
      if (inv.status === "Paid" || inv.docstatus === 1) {
        const custName = inv.customer_name ?? inv.customer ?? "Unknown";
        if (!byCustomer[custName]) {
          byCustomer[custName] = { name: custName, total: 0 };
        }
        byCustomer[custName].total += inv.grand_total ?? 0;
      }
    });

    return Object.values(byCustomer)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [salesInvoices]);

  /* ---------- Revenue by Category (customer-based grouping) ---------- */

  const revenueByCategory = useMemo(() => {
    // Try item_group from line items; fall back to customer-based grouping
    const byGroup: Record<string, number> = {};
    let hasItemGroups = false;

    salesInvoices.forEach((inv) => {
      if (inv.status === "Paid" || inv.docstatus === 1) {
        if (inv.items && Array.isArray(inv.items) && inv.items.length > 0) {
          inv.items.forEach((item) => {
            if (item.item_group) {
              hasItemGroups = true;
              const group = item.item_group;
              byGroup[group] = (byGroup[group] ?? 0) + (item.amount ?? 0);
            }
          });
        }
      }
    });

    // If no item_group data, group by customer
    if (!hasItemGroups) {
      salesInvoices.forEach((inv) => {
        if (inv.status === "Paid" || inv.docstatus === 1) {
          const group = inv.customer_name ?? inv.customer ?? "Other";
          byGroup[group] = (byGroup[group] ?? 0) + (inv.grand_total ?? 0);
        }
      });
    }

    return Object.entries(byGroup)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [salesInvoices]);

  /* ---------- Summary Metrics ---------- */

  const totalRevenue = useMemo(
    () =>
      salesInvoices
        .filter((inv) => inv.status === "Paid" || inv.docstatus === 1)
        .reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0),
    [salesInvoices]
  );

  const totalExpenses = useMemo(
    () =>
      purchaseInvoices
        .filter((inv) => inv.status === "Paid" || inv.docstatus === 1)
        .reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0),
    [purchaseInvoices]
  );

  const profitMargin = totalRevenue > 0
    ? ((totalRevenue - totalExpenses) / totalRevenue) * 100
    : 0;

  const overdueCount = useMemo(
    () => salesInvoices.filter((inv) => inv.status === "Overdue" || inv.status === "Unpaid").length,
    [salesInvoices]
  );

  const outstandingTotal = useMemo(
    () =>
      salesInvoices
        .filter((inv) => inv.status === "Overdue" || inv.status === "Unpaid")
        .reduce((sum, inv) => sum + (inv.outstanding_amount ?? inv.grand_total ?? 0), 0),
    [salesInvoices]
  );

  /* ---------- Header ---------- */

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Analytics</h1>
        <p className="text-sm text-muted-foreground">Reports and business intelligence</p>
      </div>
      <Button variant="primary" className="pointer-events-none opacity-60">+ Create New</Button>
    </div>
  );

  /* ---------- Empty state ---------- */
  if (state === "empty") {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="p-0">
            <EmptyState
              icon={<BarChart3 className="h-6 w-6" />}
              title={MODULE_EMPTY_STATES.analytics.title}
              description={MODULE_EMPTY_STATES.analytics.description}
              actionLabel={MODULE_EMPTY_STATES.analytics.actionLabel}
              actionHref={MODULE_EMPTY_STATES.analytics.actionLink}
              supportLine={EMPTY_STATE_SUPPORT_LINE}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- Loading state ---------- */
  if (state === "loading") {
    return (
      <div className="space-y-6">
        {header}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full rounded-lg" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-48 w-full rounded-lg" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  /* ---------- Error state ---------- */
  if (state === "error") {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Something went wrong</p>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage ?? "Failed to load analytics data."}</p>
            <Button variant="primary" size="sm" className="mt-4" onClick={loadData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- Success state ---------- */
  return (
    <div className="space-y-6">
      {header}

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatCurrency(totalRevenue, "USD")}
          subtext={`${salesInvoices.filter((i) => i.status === "Paid" || i.docstatus === 1).length} paid invoices`}
          subtextVariant="muted"
        />
        <MetricCard
          label="Expenses"
          value={formatCurrency(totalExpenses, "USD")}
          subtext={`${purchaseInvoices.filter((i) => i.status === "Paid" || i.docstatus === 1).length} paid bills`}
          subtextVariant="muted"
        />
        <MetricCard
          label="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          subtext={
            totalRevenue > 0
              ? `${formatCurrency(totalRevenue - totalExpenses, "USD")} net`
              : undefined
          }
          subtextVariant={profitMargin >= 0 ? "success" : "error"}
        />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(outstandingTotal, "USD")}
          subtext={overdueCount > 0 ? `${overdueCount} invoices overdue` : "No overdue invoices"}
          subtextVariant={overdueCount > 0 ? "error" : "success"}
        />
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardContent className="p-6">
          <p className="text-xl font-semibold text-foreground font-display">Revenue Trend</p>
          <p className="mt-0.5 text-sm text-muted-foreground">Last 12 months</p>
          <div className="mt-4 h-64 min-h-[256px] w-full">
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={revenueTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis hide domain={[0, maxRevTrend]} />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value ?? 0), "USD"), "Revenue"]}
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "0.25rem",
                    color: "var(--foreground)",
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#fillRevAnalytics)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Bottom row: Top Customers + Revenue by Category */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Top Customers by Revenue</p>
            {topCustomers.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No customer data available.</p>
            ) : (
              <ul className="mt-4 space-y-3 text-base">
                {topCustomers.map((c, i) => (
                  <li key={c.name} className="flex items-center justify-between">
                    <span className="text-muted-foreground/60">{i + 1}.</span>
                    <span className="flex-1 pl-2 text-foreground">{c.name}</span>
                    <span className="font-medium text-foreground">
                      {formatCurrency(c.total, "USD")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-xl font-semibold text-foreground font-display">Revenue by Category</p>
            {revenueByCategory.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">No category data available.</p>
            ) : (
              <div className="mt-4 h-48 min-h-[192px] w-full">
                <ResponsiveContainer width="100%" height={192}>
                  <BarChart
                    data={revenueByCategory}
                    layout="vertical"
                    margin={{ top: 0, right: 0, left: 80, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={80}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value ?? 0), "USD"), "Revenue"]}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.25rem",
                        color: "var(--foreground)",
                      }}
                    />
                    <Bar dataKey="value" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
