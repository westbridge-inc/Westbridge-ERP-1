"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PLANS, getPlan, type PlanId } from "@/lib/modules";
import { api, type BillingData } from "@/lib/api/client";
import { useToasts } from "@/components/ui/Toasts";

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
  const { addToast } = useToasts();
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [billingLoading, setBillingLoading] = useState(true);
  const [manageOpen, setManageOpen] = useState(false);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.billing
      .getHistory()
      .then((data) => {
        if (!cancelled) setBilling(data);
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

  const handleChangePlan = useCallback(
    async (planId: string) => {
      setChangingPlan(planId);
      try {
        await api.billing.changePlan(planId);
        addToast(`Plan changed to ${planId}`, "success");
        setBilling((prev) => (prev ? { ...prev, plan: planId } : prev));
        setManageOpen(false);
      } catch (err) {
        addToast(err instanceof Error ? err.message : "Failed to change plan", "error");
      } finally {
        setChangingPlan(null);
      }
    },
    [addToast],
  );

  const handleCancel = useCallback(async () => {
    setCancelling(true);
    try {
      await api.billing.cancel();
      addToast("Subscription cancelled", "success");
      setBilling((prev) => (prev ? { ...prev, plan: null } : prev));
      setCancelOpen(false);
      setManageOpen(false);
    } catch (err) {
      addToast(err instanceof Error ? err.message : "Failed to cancel subscription", "error");
    } finally {
      setCancelling(false);
    }
  }, [addToast]);

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
                <p className="mt-1 text-xl leading-snug font-semibold text-foreground">
                  {billingPlan?.name ??
                    (billing?.plan ? billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1) : "\u2014")}
                </p>
                {billingPlan && (
                  <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                    ${billingPlan.pricePerMonth.toLocaleString()}/mo
                    {nextBilling ? ` \u00b7 Next billing date ${nextBilling}` : ""}
                  </p>
                )}
                {!billingPlan && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    <a href="mailto:support@westbridgetoday.com" className="text-primary hover:underline">
                      Contact support to manage billing
                    </a>
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="default"
                className="rounded-md border border-input bg-background hover:bg-accent"
                onClick={() => setManageOpen(true)}
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
                  <TableHead className="px-4 py-3 text-[11px] leading-tight tracking-widest uppercase font-medium text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] leading-tight tracking-widest uppercase font-medium text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="px-4 py-3 text-[11px] leading-tight tracking-widest uppercase font-medium text-muted-foreground">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billing.items.map((row) => (
                  <TableRow key={row.id} className="border-t border-border">
                    <TableCell className="px-4 py-3 text-sm">{row.date}</TableCell>
                    <TableCell className="px-4 py-3 text-sm tabular-nums">{row.amount}</TableCell>
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

      {/* Manage Subscription Modal */}
      <Modal open={manageOpen} onClose={() => setManageOpen(false)} title="Manage Subscription">
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Current plan: <span className="font-medium text-foreground">{billingPlan?.name ?? "None"}</span>
            </p>
          </div>
          <div className="space-y-3">
            {PLANS.map((plan) => {
              const isCurrent = billingPlanId === plan.id;
              return (
                <div
                  key={plan.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${
                    isCurrent ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground">{plan.name}</p>
                      {plan.badge && <Badge status="Active">{plan.badge}</Badge>}
                      {isCurrent && <Badge status="Active">Current</Badge>}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                      ${plan.pricePerMonth.toLocaleString()}/mo
                    </p>
                  </div>
                  {!isCurrent && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={changingPlan !== null}
                      onClick={() => handleChangePlan(plan.name)}
                    >
                      {changingPlan === plan.name ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                      {billingPlanId &&
                      PLANS.findIndex((p) => p.id === plan.id) < PLANS.findIndex((p) => p.id === billingPlanId)
                        ? "Downgrade"
                        : "Upgrade"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {billingPlan && (
            <div className="border-t border-border pt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                Cancel subscription
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        title="Cancel subscription?"
        description="Your subscription will remain active until the end of the current billing period. After that, you will lose access to paid features."
        confirmLabel={cancelling ? "Cancelling..." : "Cancel subscription"}
        variant="destructive"
      />
    </div>
  );
}
