"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
export const dynamic = "force-dynamic";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";
import { AIChatPanel } from "@/components/ai/AIChatPanel";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

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

interface RawPayment {
  name?: string;
  paid_amount?: number;
  posting_date?: string;
  party?: string;
  party_name?: string;
  payment_type?: string;
  mode_of_payment?: string;
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

function getLast6Months(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

function daysBetween(from: string, to: Date): number {
  const a = new Date(from);
  return Math.floor((to.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

/* ------------------------------------------------------------------ */
/*  Custom tooltip for Recharts                                        */
/* ------------------------------------------------------------------ */

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-foreground">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground">
            {entry.name}: {formatCurrency(entry.value, "USD")}
          </span>
        </div>
      ))}
    </div>
  );
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

export default function AccountingPage() {
  const [state, setState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<RawInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<RawInvoice[]>([]);
  const [payments, setPayments] = useState<RawPayment[]>([]);

  /* ---------- Fetch data ---------- */

  const loadData = useCallback(async () => {
    setState("loading");
    setErrorMessage(null);
    try {
      const [si, pi, pe] = await Promise.all([
        fetchDoctype("Sales Invoice", 200),
        fetchDoctype("Purchase Invoice", 200),
        fetchDoctype("Payment Entry", 50),
      ]);
      const siList = si as RawInvoice[];
      const piList = pi as RawInvoice[];
      const peList = pe as RawPayment[];

      if (siList.length === 0 && piList.length === 0 && peList.length === 0) {
        setState("empty");
        return;
      }

      setSalesInvoices(siList);
      setPurchaseInvoices(piList);
      setPayments(peList);
      setState("success");
    } catch {
      setState("error");
      setErrorMessage("Failed to load accounting data. Please try again.");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Computed metrics ---------- */

  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;

  const paidSalesYTD = useMemo(
    () =>
      salesInvoices.filter(
        (inv) =>
          inv.status === "Paid" &&
          (inv.posting_date ?? "") >= yearStart
      ),
    [salesInvoices, yearStart]
  );

  const paidPurchasesYTD = useMemo(
    () =>
      purchaseInvoices.filter(
        (inv) =>
          inv.status === "Paid" &&
          (inv.posting_date ?? "") >= yearStart
      ),
    [purchaseInvoices, yearStart]
  );

  const revenueYTD = useMemo(
    () => paidSalesYTD.reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0),
    [paidSalesYTD]
  );

  const expensesYTD = useMemo(
    () => paidPurchasesYTD.reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0),
    [paidPurchasesYTD]
  );

  const netProfit = revenueYTD - expensesYTD;

  /* ---------- Revenue vs Expenses chart data (last 6 months) ---------- */

  const barData = useMemo(() => {
    const months = getLast6Months();
    const revByMonth: Record<string, number> = {};
    const expByMonth: Record<string, number> = {};
    months.forEach((m) => {
      revByMonth[m] = 0;
      expByMonth[m] = 0;
    });

    salesInvoices.forEach((inv) => {
      if (inv.posting_date && (inv.status === "Paid" || inv.docstatus === 1)) {
        const key = getMonthKey(inv.posting_date);
        if (revByMonth[key] !== undefined) {
          revByMonth[key] += inv.grand_total ?? 0;
        }
      }
    });

    purchaseInvoices.forEach((inv) => {
      if (inv.posting_date && (inv.status === "Paid" || inv.docstatus === 1)) {
        const key = getMonthKey(inv.posting_date);
        if (expByMonth[key] !== undefined) {
          expByMonth[key] += inv.grand_total ?? 0;
        }
      }
    });

    return months.map((m) => ({
      month: getMonthLabel(m),
      revenue: revByMonth[m],
      expenses: expByMonth[m],
    }));
  }, [salesInvoices, purchaseInvoices]);

  const maxBarValue = useMemo(() => {
    let max = 0;
    barData.forEach((d) => {
      if (d.revenue > max) max = d.revenue;
      if (d.expenses > max) max = d.expenses;
    });
    return max > 0 ? max * 1.15 : 100;
  }, [barData]);

  /* ---------- Accounts Receivable Aging ---------- */

  const agingData = useMemo(() => {
    const unpaid = salesInvoices.filter(
      (inv) => inv.status === "Unpaid" || inv.status === "Overdue"
    );

    const buckets = [
      { label: "Current (0-30)", amount: 0 },
      { label: "31-60 days", amount: 0 },
      { label: "61-90 days", amount: 0 },
      { label: "91-120 days", amount: 0 },
      { label: "120+ days", amount: 0 },
    ];

    const today = new Date();
    unpaid.forEach((inv) => {
      const outstanding = inv.outstanding_amount ?? inv.grand_total ?? 0;
      const dueDate = inv.due_date ?? inv.posting_date;
      if (!dueDate) return;
      const overdue = daysBetween(dueDate, today);
      if (overdue <= 30) buckets[0].amount += outstanding;
      else if (overdue <= 60) buckets[1].amount += outstanding;
      else if (overdue <= 90) buckets[2].amount += outstanding;
      else if (overdue <= 120) buckets[3].amount += outstanding;
      else buckets[4].amount += outstanding;
    });

    const total = buckets.reduce((s, b) => s + b.amount, 0);
    return { buckets, total };
  }, [salesInvoices]);

  /* ---------- Chart date subtitle ---------- */

  const chartSubtitle = useMemo(() => {
    const months = getLast6Months();
    if (months.length < 2) return "";
    return `Monthly (${getMonthLabel(months[0])} \u2013 ${getMonthLabel(months[months.length - 1])})`;
  }, []);

  /* ---------- Header ---------- */

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Accounting</h1>
        <p className="text-sm text-muted-foreground">General ledger and financial overview</p>
      </div>
      <Link href="/dashboard/accounting?type=journal">
        <Button variant="primary">+ New Journal Entry</Button>
      </Link>
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
              icon={<Calculator className="h-6 w-6" />}
              title={MODULE_EMPTY_STATES.accounting.title}
              description={MODULE_EMPTY_STATES.accounting.description}
              actionLabel={MODULE_EMPTY_STATES.accounting.actionLabel}
              actionHref={MODULE_EMPTY_STATES.accounting.actionLink}
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-44 w-full rounded-lg" />
          </CardContent>
        </Card>
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
              <Calculator className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Something went wrong</p>
            <p className="mt-1 text-sm text-muted-foreground">{errorMessage ?? "Failed to load accounting data."}</p>
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard
          label="Revenue YTD"
          value={formatCurrency(revenueYTD, "USD")}
          subtext={`${paidSalesYTD.length} paid invoices`}
          subtextVariant="muted"
        />
        <MetricCard
          label="Expenses YTD"
          value={formatCurrency(expensesYTD, "USD")}
          subtext={`${paidPurchasesYTD.length} paid bills`}
          subtextVariant="muted"
        />
        <MetricCard
          label="Net Profit"
          value={formatCurrency(netProfit, "USD")}
          subtext={
            revenueYTD > 0
              ? `${((netProfit / revenueYTD) * 100).toFixed(1)}% margin`
              : undefined
          }
          subtextVariant={netProfit >= 0 ? "success" : "error"}
        />
      </div>

      {/* Revenue vs Expenses chart */}
      <Card>
        <CardContent className="p-6">
          <p className="text-base font-semibold text-foreground font-display">
            Revenue vs Expenses
          </p>
          <p className="text-sm text-muted-foreground/60">
            {chartSubtitle}
          </p>
          <div className="mt-4 h-64 min-h-[256px] w-full">
            <ResponsiveContainer width="100%" height={256}>
              <BarChart
                data={barData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <YAxis
                  hide
                  domain={[0, maxBarValue]}
                />
                <Tooltip
                  content={<ChartTooltip />}
                  cursor={{ fill: "var(--muted)" }}
                />
                <Legend
                  wrapperStyle={{ color: "var(--muted-foreground)", fontSize: 12 }}
                />
                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="var(--primary)"
                  radius={[2, 2, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="var(--border)"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Receivable Aging */}
      <Card>
        <CardContent className="p-6">
          <p className="text-base font-semibold text-foreground font-display">
            Accounts Receivable Aging
          </p>
          {agingData.total === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              No outstanding receivables.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {agingData.buckets.map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className="w-28 text-sm text-muted-foreground">
                    {row.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${agingData.total > 0 ? (row.amount / agingData.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="w-28 text-right text-sm font-medium text-foreground">
                    {formatCurrency(row.amount, "USD")}
                  </span>
                  <span className="w-12 text-right text-xs text-muted-foreground">
                    {agingData.total > 0 ? `${((row.amount / agingData.total) * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 border-t border-border pt-2">
                <span className="w-28 text-sm font-medium text-foreground">Total</span>
                <div className="h-2 flex-1" />
                <span className="w-28 text-right text-sm font-semibold text-foreground">
                  {formatCurrency(agingData.total, "USD")}
                </span>
                <span className="w-12 text-right text-xs text-muted-foreground">100%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-base font-semibold text-foreground font-display">
              Recent Payments
            </p>
            <div className="mt-4 space-y-2">
              {payments.slice(0, 10).map((pe) => (
                <div
                  key={pe.name}
                  className="flex items-center justify-between rounded-lg border border-border/50 px-4 py-2.5"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {pe.party_name ?? pe.party ?? "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {pe.posting_date ?? ""} {pe.payment_type ? `\u00b7 ${pe.payment_type}` : ""} {pe.mode_of_payment ? `\u00b7 ${pe.mode_of_payment}` : ""}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(pe.paid_amount ?? 0, "USD")}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AIChatPanel module="finance" />
    </div>
  );
}
