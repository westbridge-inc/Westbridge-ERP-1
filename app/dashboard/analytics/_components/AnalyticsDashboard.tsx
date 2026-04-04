"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { MODULE_EMPTY_STATES, EMPTY_STATE_SUPPORT_LINE } from "@/lib/dashboard/empty-state-config";
import { formatCurrency } from "@/lib/locale/currency";
import { fetchDoctype } from "@/lib/api/fetchDoctype";
import type { RawInvoice, PageState, PeriodKey } from "./types";
import { buildRevenueTrend, buildTopCustomers, buildRevenueByCategory, getPeriodRange } from "./utils";
import { PeriodSelector } from "./PeriodSelector";
import { RevenueChart } from "./RevenueChart";
import { CustomerChart } from "./CustomerChart";
import { ExpenseChart } from "./ExpenseChart";
import { ProfitLossCard } from "./ProfitLossCard";

export function AnalyticsDashboard() {
  const [state, setState] = useState<PageState>("loading");
  const [, setErrorMessage] = useState<string | null>(null);
  const [salesInvoices, setSalesInvoices] = useState<RawInvoice[]>([]);
  const [purchaseInvoices, setPurchaseInvoices] = useState<RawInvoice[]>([]);
  const [period, setPeriod] = useState<PeriodKey>("this_year");
  const [fetchKey, setFetchKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setState("loading");
      setErrorMessage(null);
      try {
        const [si, pi] = await Promise.all([
          fetchDoctype("Sales Invoice", 500, [
            "name",
            "posting_date",
            "grand_total",
            "outstanding_amount",
            "status",
            "customer",
            "customer_name",
            "docstatus",
          ]),
          fetchDoctype("Purchase Invoice", 200, ["name", "posting_date", "grand_total", "status", "docstatus"]),
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

    return () => {
      cancelled = true;
    };
  }, [fetchKey]);

  const loadData = () => setFetchKey((k) => k + 1);

  const revenueTrend = useMemo(() => buildRevenueTrend(salesInvoices), [salesInvoices]);
  const topCustomers = useMemo(() => buildTopCustomers(salesInvoices), [salesInvoices]);
  const revenueByCategory = useMemo(() => buildRevenueByCategory(salesInvoices), [salesInvoices]);

  const periodRange = useMemo(() => getPeriodRange(period), [period]);

  const filteredSales = useMemo(
    () =>
      salesInvoices.filter(
        (inv) =>
          (inv.status === "Paid" || inv.docstatus === 1) &&
          (inv.posting_date ?? "") >= periodRange.start &&
          (inv.posting_date ?? "") <= periodRange.end,
      ),
    [salesInvoices, periodRange],
  );

  const filteredPurchases = useMemo(
    () =>
      purchaseInvoices.filter(
        (inv) =>
          (inv.status === "Paid" || inv.docstatus === 1) &&
          (inv.posting_date ?? "") >= periodRange.start &&
          (inv.posting_date ?? "") <= periodRange.end,
      ),
    [purchaseInvoices, periodRange],
  );

  const totalRevenue = useMemo(
    () => filteredSales.reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0),
    [filteredSales],
  );

  const totalExpenses = useMemo(
    () => filteredPurchases.reduce((sum, inv) => sum + (inv.grand_total ?? 0), 0),
    [filteredPurchases],
  );

  const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

  const overdueCount = useMemo(
    () => salesInvoices.filter((inv) => inv.status === "Overdue" || inv.status === "Unpaid").length,
    [salesInvoices],
  );

  const outstandingTotal = useMemo(
    () =>
      salesInvoices
        .filter((inv) => inv.status === "Overdue" || inv.status === "Unpaid")
        .reduce((sum, inv) => sum + (inv.outstanding_amount ?? inv.grand_total ?? 0), 0),
    [salesInvoices],
  );

  const header = (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Analytics</h1>
        <p className="text-sm text-muted-foreground">Business insights and reports.</p>
      </div>
      <PeriodSelector period={period} onPeriodChange={setPeriod} />
    </div>
  );

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

  if (state === "error") {
    return (
      <div className="space-y-6">
        {header}
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl text-muted-foreground/50">
              <BarChart3 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-foreground">Could not load analytics data</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Your ERP backend may be starting up or temporarily unavailable. This is normal during setup.
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadData}>
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Revenue"
          value={formatCurrency(totalRevenue, "USD")}
          subtext={`${filteredSales.length} paid invoices`}
          subtextVariant="muted"
        />
        <MetricCard
          label="Expenses"
          value={formatCurrency(totalExpenses, "USD")}
          subtext={`${filteredPurchases.length} paid bills`}
          subtextVariant="muted"
        />
        <MetricCard
          label="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          subtext={totalRevenue > 0 ? `${formatCurrency(totalRevenue - totalExpenses, "USD")} net` : undefined}
          subtextVariant={profitMargin >= 0 ? "success" : "error"}
        />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(outstandingTotal, "USD")}
          subtext={overdueCount > 0 ? `${overdueCount} invoices overdue` : "No overdue invoices"}
          subtextVariant={overdueCount > 0 ? "error" : "success"}
        />
      </div>

      <RevenueChart data={revenueTrend} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CustomerChart data={topCustomers} />
        <ExpenseChart data={revenueByCategory} />
      </div>

      <ProfitLossCard
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        profitMargin={profitMargin}
        period={period}
      />
    </div>
  );
}
