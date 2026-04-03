export const dynamic = "force-dynamic";

import Link from "next/link";
import dynamic_ from "next/dynamic";
import { DollarSign, Users, Receipt, ShoppingCart, Plus } from "lucide-react";
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
  { label: "New Invoice", href: "/dashboard/invoices/new", icon: Plus },
  { label: "Add Expense", href: "/dashboard/expenses/new", icon: Plus },
  { label: "Create Quote", href: "/dashboard/quotations/new", icon: Plus },
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
        <h1 className="text-2xl leading-tight tracking-tight font-display font-semibold text-foreground text-balance">
          {getGreeting()}
        </h1>
        <p className="mt-1 text-sm leading-normal text-muted-foreground">
          Here&apos;s what&apos;s happening with your business today.
        </p>
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
          <h1 className="text-2xl leading-tight tracking-tight font-display font-semibold text-foreground text-balance">
            {getGreeting()}
          </h1>
          <p className="mt-1 text-sm leading-normal text-muted-foreground">
            Here&apos;s what&apos;s happening with your business today.
          </p>
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

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle>Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest actions across your modules</p>
          </CardHeader>
          <CardContent className="p-0">
            {data.activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                <p className="text-sm font-medium text-foreground">No recent activity</p>
                <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                  Activity will appear here as you use Westbridge.
                </p>
              </div>
            ) : (
              <div>
                {data.activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 border-b border-border px-6 py-3 last:border-0">
                    <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", activityDotColor(a.type))} />
                    <span className="flex-1 truncate text-sm text-foreground">{a.text}</span>
                    <span className="whitespace-nowrap text-xs text-muted-foreground ml-auto">{a.time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl leading-snug font-semibold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map((action) => (
                <Button key={action.href} variant="outline" size="sm" asChild>
                  <Link href={action.href}>
                    <Plus className="w-4 h-4 mr-1.5" />
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
