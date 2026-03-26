export const dynamic = "force-dynamic";

import Link from "next/link";
import dynamic_ from "next/dynamic";
import { FileText, FileBarChart, DollarSign, Users, Receipt, ShoppingCart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/locale/currency";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { serverFetchDashboard } from "@/lib/api/server";
import { ErpStatusBadge } from "./_components/ErpStatusBadge";
import { DashboardWelcome } from "./_components/DashboardWelcome";
import { DashboardError } from "./_components/DashboardError";

const RevenueChart = dynamic_(() => import("./_components/RevenueChart").then((m) => ({ default: m.RevenueChart })), {
  loading: () => <div className="mt-8 h-80 animate-pulse rounded-xl bg-muted" />,
});

const AIChatPanel = dynamic_(() => import("@/components/ai/AIChatPanel").then((m) => ({ default: m.AIChatPanel })));

/* ------------------------------------------------------------------ */
/*  Helpers (pure functions — safe for Server Components)              */
/* ------------------------------------------------------------------ */

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function trendArrow(value: number): string {
  if (value > 0) return `\u2191 +${value}%`;
  if (value < 0) return `\u2193 ${value}%`;
  return "No change";
}

type ActivityType = "success" | "error" | "info" | "default";

function activityDotColor(type: ActivityType): string {
  switch (type) {
    case "success":
      return "bg-success";
    case "error":
      return "bg-destructive";
    case "info":
      return "bg-primary";
    default:
      return "bg-muted-foreground";
  }
}

const QUICK_ACTIONS = [
  { label: "New Invoice", href: "/dashboard/invoices", icon: FileText },
  { label: "Add Expense", href: "/dashboard/expenses", icon: DollarSign },
  { label: "Create Quote", href: "/dashboard/quotations", icon: FileBarChart },
];

/* ------------------------------------------------------------------ */
/*  Page (async Server Component)                                      */
/* ------------------------------------------------------------------ */

export default async function DashboardPage() {
  let data;
  let error: string | null = null;

  try {
    data = await serverFetchDashboard();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load dashboard data.";
  }

  /* --- error state --- */
  if (error || !data) {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{getGreeting()}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening at your account</p>
        <DashboardError message={error ?? "Failed to load dashboard data."} />
      </div>
    );
  }

  /* --- success state --- */
  return (
    <div>
      <DashboardWelcome />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{getGreeting()}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here&apos;s what&apos;s happening at your account</p>
        </div>
        <ErpStatusBadge />
      </div>

      {data.isOffline && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-sm text-warning">
          <span className="shrink-0">{"\u26A0"}</span>
          <span>
            <strong>Service temporarily unavailable</strong> &mdash; we&apos;re having trouble reaching your data.
            Please try again shortly.
          </span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total Revenue"
          value={formatCurrency(data.revenueMTD, "USD")}
          icon={DollarSign}
          trend={data.revenueChange}
          subtext={trendArrow(data.revenueChange)}
          subtextVariant={data.revenueChange >= 0 ? "success" : "error"}
        />
        <MetricCard
          label="Active Users"
          value={data.employeeCount}
          icon={Users}
          trend={data.employeeDelta}
          subtext={data.employeeDelta !== 0 ? trendArrow(data.employeeDelta) : "No change"}
          subtextVariant={data.employeeDelta >= 0 ? "success" : "error"}
        />
        <MetricCard
          label="Invoices"
          value={`${data.outstandingCount} open`}
          icon={Receipt}
          subtext={data.outstandingCount > 0 ? "Requires follow-up" : "All clear"}
          subtextVariant={data.outstandingCount > 0 ? "error" : "success"}
        />
        <MetricCard label="Pending Orders" value={data.openDealsCount} icon={ShoppingCart} subtext="In pipeline" />
      </div>

      <ErrorBoundary boundary="revenue-chart">
        <RevenueChart data={data.revenueData} />
      </ErrorBoundary>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.activity.length === 0 ? (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No recent activity to display.</p>
            ) : (
              <ul className="divide-y divide-border">
                {data.activity.map((a, i) => (
                  <li key={i} className="flex items-center gap-3 px-6 py-3">
                    <span className={cn("h-2 w-2 shrink-0 rounded-full", activityDotColor(a.type))} />
                    <span className="flex-1 text-sm text-foreground">{a.text}</span>
                    <span className="text-xs text-muted-foreground">{a.time}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button
                  key={action.href}
                  variant="outline"
                  className="h-9 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="mr-2 h-4 w-4 shrink-0" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <ErrorBoundary boundary="ai-chat">
        <AIChatPanel module="general" />
      </ErrorBoundary>
    </div>
  );
}
