"use client";

import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlan, type PlanId } from "@/lib/modules";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface BillingData {
  items: { id: string; date: string; amount: string; status: string }[];
  plan: string | null;
  accountCreatedAt: string | null;
}

function nextBillingDate(createdAt: string | null): string {
  if (!createdAt) return "";
  const created = new Date(createdAt);
  const dayOfMonth = created.getDate();
  const now = new Date();
  let next = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
  if (next <= now) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, dayOfMonth);
  }
  return next.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function BillingTab() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/api/billing/history`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { data?: BillingData }) => {
        if (!cancelled) setBilling(d?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setBilling({ items: [], plan: null, accountCreatedAt: null });
      })
      .finally(() => {
        if (!cancelled) setBillingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const billingPlanId = (billing?.plan as string | null)?.toLowerCase() as PlanId | null;
  const billingPlan = billingPlanId ? getPlan(billingPlanId) : null;
  const nextBilling = nextBillingDate(billing?.accountCreatedAt ?? null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Billing</CardTitle>
          <CardDescription>Current plan and subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {billingLoading ? (
            <>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              <div className="h-8 w-40 animate-pulse rounded bg-muted" />
              <div className="h-4 w-64 animate-pulse rounded bg-muted" />
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current plan</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {billingPlan?.name ??
                    (billing?.plan ? billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1) : "\u2014")}
                </p>
                {billingPlan && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    ${billingPlan.pricePerMonth.toLocaleString()}/mo
                    {nextBilling ? ` \u00b7 Next billing date ${nextBilling}` : ""}
                  </p>
                )}
                {!billingPlan && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a href="mailto:support@westbridge.gy" className="text-primary hover:underline">
                      Contact support to manage billing
                    </a>
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="default"
                className="rounded-md border border-input bg-background hover:bg-accent"
              >
                Manage subscription
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <CardContent>
          {billingLoading ? (
            <div className="h-32 animate-pulse rounded bg-muted" />
          ) : billing?.items && billing.items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] font-semibold uppercase text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.items.map((row) => (
                  <TableRow key={row.id} className="border-t border-border">
                    <TableCell className="px-4 py-3 text-sm">{row.date}</TableCell>
                    <TableCell className="px-4 py-3 text-sm">{row.amount}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge status={row.status}>{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={<AlertCircle className="h-8 w-8 text-muted-foreground" />}
              title="No billing history yet"
              description="Your invoices will appear here once your first billing cycle completes."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
