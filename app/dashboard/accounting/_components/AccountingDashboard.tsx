"use client";

import { useState, useEffect, useMemo } from "react";
import nextDynamic from "next/dynamic";
import { Calculator } from "lucide-react";

const LazyBarChart = nextDynamic(() => import("recharts").then((m) => m.BarChart), { ssr: false });
const LazyBar = nextDynamic(() => import("recharts").then((m) => m.Bar), { ssr: false });
const LazyXAxis = nextDynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const LazyYAxis = nextDynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const LazyResponsiveContainer = nextDynamic(() => import("recharts").then((m) => m.ResponsiveContainer), {
  ssr: false,
});
const LazyTooltip = nextDynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const LazyLegend = nextDynamic(() => import("recharts").then((m) => m.Legend), { ssr: false });
const LazyCartesianGrid = nextDynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });
const AIChatPanel = nextDynamic(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })), {
  ssr: false,
});

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";
import { fetchDoctype } from "@/lib/api/fetchDoctype";
import type { RawInvoice, RawPayment, PageState } from "./types";
import { computeBarData, computeMaxBarValue, computeAgingData, computeChartSubtitle } from "./utils";

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
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground tabular-nums">
            {entry.name}: {formatCurrency(entry.value, "USD")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AccountingDashboard() {
  const [state, setState] = useState<PageState>("loading");
  const [, setErrorMessage] = useState<string | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<RawInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<RawInvoice[]>([]);
  const [payments, setPayments] = useState<RawPayment[]>([]);
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState("loading");
      setErrorMessage(null);
      try {
        const [si, pi, pe] = await Promise.all([
          fetchDoctype("Sales Invoice", 200, [
            "name",
            "posting_date",
            "due_date",
            "grand_total",
            "outstanding_amount",
            "status",
            "customer_name",
            "docstatus",
            "modified",
            "creation",
          ]),
          fetchDoctype("Purchase Invoice", 200, ["name", "posting_date", "grand_total", "status", "docstatus"]),
          fetchDoctype("Payment Entry", 50, [
            "name",
            "posting_date",
            "paid_amount",
            "party",
            "party_name",
            "payment_type",
            "mode_of_payment",
          ]),
        ]);
        if (cancelled) return;
        const siList = si as RawInvoice[],
          piList = pi as RawInvoice[],
          peList = pe as RawPayment[];
        if (siList.length === 0 && piList.length === 0 && peList.length === 0) {
          setState("empty");
          return;
        }
        setSalesInvoices(siList);
        setPurchaseInvoices(piList);
        setPayments(peList);
        setState("success");
      } catch {
        if (!cancelled) {
          setState("error");
          setErrorMessage("Failed to load accounting data. Please try again.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const loadData = () => setFetchKey((k) => k + 1);
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const paidSalesYTD = useMemo(
    () => salesInvoices.filter((inv) => inv.status === "Paid" && (inv.posting_date ?? "") >= yearStart),
    [salesInvoices, yearStart],
  );
  const paidPurchasesYTD = useMemo(
    () =>
      purchaseInvoices.filter(
        (inv) => (inv.status === "Paid" || inv.status === "Unpaid") && (inv.posting_date ?? "") >= yearStart,
      ),
    [purchaseInvoices, yearStart],
  );
  const revenueYTD = useMemo(() => paidSalesYTD.reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0), [paidSalesYTD]);
  const expensesYTD = useMemo(
    () => paidPurchasesYTD.reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0),
    [paidPurchasesYTD],
  );
  const netProfit = revenueYTD - expensesYTD;
  const barData = useMemo(() => computeBarData(salesInvoices, purchaseInvoices), [salesInvoices, purchaseInvoices]);
  const maxBarValue = useMemo(() => computeMaxBarValue(barData), [barData]);
  const agingData = useMemo(() => computeAgingData(salesInvoices), [salesInvoices]);
  const chartSubtitle = useMemo(() => computeChartSubtitle(), []);

  if (state === "empty")
    return (
      <div className="space-y-6">
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

  if (state === "loading")
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
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

  if (state === "error")
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <Calculator className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load accounting data</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up or temporarily unavailable. This is normal during setup.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadData}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );

  return (
    <div className="space-y-6">
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
          subtext={revenueYTD > 0 ? `${((netProfit / revenueYTD) * 100).toFixed(1)}% margin` : undefined}
          subtextVariant={netProfit >= 0 ? "success" : "error"}
        />
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-base font-semibold text-foreground font-display">Revenue vs Expenses</p>
          <p className="text-sm text-muted-foreground/60">{chartSubtitle}</p>
          <div className="mt-4 h-64 min-h-[256px] w-full">
            <LazyResponsiveContainer width="100%" height={256}>
              <LazyBarChart data={barData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <LazyCartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <LazyXAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                />
                <LazyYAxis hide domain={[0, maxBarValue]} />
                <LazyTooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)" }} />
                <LazyLegend wrapperStyle={{ color: "var(--muted-foreground)", fontSize: 12 }} />
                <LazyBar dataKey="revenue" name="Revenue" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                <LazyBar dataKey="expenses" name="Expenses" fill="var(--border)" radius={[2, 2, 0, 0]} />
              </LazyBarChart>
            </LazyResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-base font-semibold text-foreground font-display">Accounts Receivable Aging</p>
          {agingData.total === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No outstanding receivables.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {agingData.buckets.map((row) => (
                <div key={row.label} className="flex items-center gap-4">
                  <span className="w-28 text-sm text-muted-foreground">{row.label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${agingData.total > 0 ? (row.amount / agingData.total) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="w-28 text-right text-sm font-medium text-foreground tabular-nums">
                    {formatCurrency(row.amount, "USD")}
                  </span>
                  <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                    {agingData.total > 0 ? `${((row.amount / agingData.total) * 100).toFixed(0)}%` : "0%"}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 border-t border-border pt-2">
                <span className="w-28 text-sm font-medium text-foreground">Total</span>
                <div className="h-2 flex-1" />
                <span className="w-28 text-right text-sm font-semibold text-foreground tabular-nums">
                  {formatCurrency(agingData.total, "USD")}
                </span>
                <span className="w-12 text-right text-xs text-muted-foreground">100%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {payments.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-base font-semibold text-foreground font-display">Recent Payments</p>
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
                      {pe.posting_date ?? ""} {pe.payment_type ? `\u00b7 ${pe.payment_type}` : ""}{" "}
                      {pe.mode_of_payment ? `\u00b7 ${pe.mode_of_payment}` : ""}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums">
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
