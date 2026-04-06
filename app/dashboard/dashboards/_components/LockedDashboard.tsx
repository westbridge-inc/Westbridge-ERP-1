"use client";

import Link from "next/link";
import { ArrowRight, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { getBundle, MODULES, PLANS, type PlanId } from "@/lib/modules";

export interface LockedDashboardProps {
  /** Bundle ID required to unlock the dashboard (e.g. "manufacturing"). */
  bundleId: string;
  /** Display name of the dashboard, used in the header copy. */
  dashboardName: string;
  /** The user's current plan ID, or null when unknown. */
  currentPlanId: PlanId | null;
}

/** Returns the cheapest plan that includes a given bundle, or null if none. */
function findCheapestPlanWithBundle(bundleId: string) {
  return (
    PLANS.filter((p) => p.includedBundleIds.includes(bundleId)).sort((a, b) => a.pricePerMonth - b.pricePerMonth)[0] ??
    null
  );
}

export function LockedDashboard({ bundleId, dashboardName, currentPlanId }: LockedDashboardProps) {
  const bundle = getBundle(bundleId);
  const minPlan = findCheapestPlanWithBundle(bundleId);
  const bundleModules = MODULES.filter((m) => m.bundleId === bundleId);
  const currentPlan = currentPlanId ? PLANS.find((p) => p.id === currentPlanId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">{dashboardName}</h1>
        <p className="text-sm text-muted-foreground">Real-time analytics for your business.</p>
      </div>

      <Card>
        <CardContent className="p-8 md:p-12">
          <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
            </div>

            <h2 className="mt-6 text-xl md:text-2xl font-semibold text-foreground font-display">
              This dashboard requires {bundle?.name ?? bundleId}
            </h2>
            <p className="mt-3 max-w-md text-sm text-muted-foreground leading-relaxed">
              {bundle?.description ??
                "Upgrade your plan to unlock this dashboard and the full module bundle that powers it."}
            </p>

            {currentPlan && (
              <p className="mt-2 text-xs text-muted-foreground">
                Your current plan: <span className="font-medium text-foreground">{currentPlan.name}</span>
              </p>
            )}

            {bundleModules.length > 0 && (
              <div className="mt-8 w-full rounded-lg border border-border bg-muted/30 p-6 text-left">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  What&apos;s included in {bundle?.name ?? "this bundle"}
                </p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {bundleModules.map((m) => (
                    <li key={m.id} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                      <span>{m.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {minPlan && (
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button asChild size="lg" className="h-11">
                  <Link href="/dashboard/settings?tab=billing">
                    Upgrade to {minPlan.name}
                    <ArrowRight className="ml-1 size-4" aria-hidden="true" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground">
                  Starts at <span className="font-semibold text-foreground">${minPlan.pricePerMonth}/month</span>
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
