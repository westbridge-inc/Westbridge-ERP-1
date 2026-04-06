"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useSubscription } from "@/components/dashboard/SubscriptionGate";
import { getBundle, PLANS, type PlanId } from "@/lib/modules";
import { cn } from "@/lib/utils";
import { DASHBOARD_CATALOG, type DashboardEntry } from "./_components/DashboardCatalog";

const VALID_PLAN_IDS: ReadonlySet<PlanId> = new Set(["solo", "starter", "business", "enterprise"]);

/** Coerce a raw plan id string from the subscription API into a typed PlanId. */
function toPlanId(raw: string | null): PlanId | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase();
  return VALID_PLAN_IDS.has(normalized as PlanId) ? (normalized as PlanId) : null;
}

/** Returns the cheapest plan that includes a given bundle, or null if none. */
function findCheapestPlanWithBundle(bundleId: string) {
  return (
    PLANS.filter((p) => p.includedBundleIds.includes(bundleId)).sort((a, b) => a.pricePerMonth - b.pricePerMonth)[0] ??
    null
  );
}

function isAccessible(entry: DashboardEntry, planId: PlanId | null): boolean {
  if (!planId) return false;
  return PLANS.find((p) => p.id === planId)?.includedBundleIds.includes(entry.bundle) ?? false;
}

export default function DashboardsHubPage() {
  const { planId: rawPlanId } = useSubscription();
  const planId = toPlanId(rawPlanId);
  const currentPlan = planId ? PLANS.find((p) => p.id === planId) : null;

  const accessibleCount = DASHBOARD_CATALOG.filter((d) => isAccessible(d, planId)).length;
  const lockedCount = DASHBOARD_CATALOG.length - accessibleCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Dashboards</h1>
          <p className="text-sm text-muted-foreground">Real-time business insights powered by your live ERP data.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-success" /> {accessibleCount} available
          </span>
          {lockedCount > 0 && (
            <span className="flex items-center gap-1.5">
              <Lock className="size-3" /> {lockedCount} locked
            </span>
          )}
          {currentPlan && (
            <span>
              On <span className="font-medium text-foreground">{currentPlan.name}</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_CATALOG.map((entry) => {
          const accessible = isAccessible(entry, planId);
          const bundle = getBundle(entry.bundle);
          const minPlan = findCheapestPlanWithBundle(entry.bundle);
          const Icon = entry.icon;

          const cardInner = (
            <Card
              className={cn(
                "group relative h-full overflow-hidden transition-all",
                accessible ? "hover:border-foreground/30 hover:shadow-md cursor-pointer" : "border-dashed bg-muted/30",
              )}
            >
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-lg",
                      accessible ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                  {!accessible && (
                    <Badge variant="outline" className="gap-1">
                      <Lock className="size-3" /> Locked
                    </Badge>
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className={cn(
                      "text-base font-semibold font-display",
                      accessible ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {entry.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{entry.description}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-4">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {bundle?.name ?? entry.bundle}
                  </span>
                  {accessible ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-1.5 transition-all">
                      Open dashboard
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Included in <span className="font-medium text-foreground">{minPlan?.name ?? "Enterprise"}</span>{" "}
                      or higher
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );

          return (
            <Link
              key={entry.slug}
              href={`/dashboard/dashboards/${entry.slug}`}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:rounded-lg"
              aria-label={accessible ? `Open ${entry.name}` : `${entry.name} (locked)`}
            >
              {cardInner}
            </Link>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Need more dashboards?</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Upgrade your plan to unlock additional bundles and the dashboards that come with them.
            </p>
          </div>
          <Link
            href="/dashboard/settings?tab=billing"
            className="inline-flex items-center gap-1 self-start text-xs font-medium text-primary hover:underline sm:self-auto"
          >
            View plans
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
