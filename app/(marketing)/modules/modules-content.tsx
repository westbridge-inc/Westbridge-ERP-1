"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Users,
  Package,
  UserCog,
  Truck,
  FolderKanban,
  LayoutGrid,
  ChevronDown,
  BrainCircuit,
  Check,
  type LucideIcon,
} from "lucide-react";
import { MODULE_BUNDLES, PLANS, isBundleIncludedInPlan, getModule } from "@/lib/modules";
import type { PlanId } from "@/lib/modules";
import { ROUTES } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const BUNDLE_ICONS: Record<string, LucideIcon> = {
  finance: Calculator,
  crm: Users,
  inventory: Package,
  hr: UserCog,
  manufacturing: Truck,
  projects: FolderKanban,
  biztools: LayoutGrid,
};

function planLabelsForBundle(bundleId: string): string[] {
  const labels: string[] = [];
  const planOrder: PlanId[] = ["solo", "starter", "business", "enterprise"];
  const planNames: Record<PlanId, string> = {
    solo: "Solo",
    starter: "Starter",
    business: "Business",
    enterprise: "Enterprise",
  };

  for (const planId of planOrder) {
    if (isBundleIncludedInPlan(bundleId, planId)) {
      labels.push(planNames[planId]);
    }
  }
  return labels;
}

export default function ModulesContent() {
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);

  return (
    <div className="relative isolate overflow-hidden">
      <div className="dot-pattern pointer-events-none absolute inset-x-0 top-0 h-[500px] -z-10" aria-hidden />
      <div className="mx-auto max-w-5xl px-6 py-20">
        {/* Header */}
        <div className="text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Modules</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
            <span className="text-gradient">7 bundles. 38 modules.</span>{" "}
            <span className="text-gradient-primary">One platform.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-muted-foreground">
            Every bundle includes AI-powered insights. Pick the bundles you need, or get them all with Enterprise.
          </p>
        </div>

        {/* Plan legend */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground"
            >
              <span className="font-medium text-foreground">{plan.name}</span>
              <span>
                —{" "}
                {plan.includedBundleIds.length === 7
                  ? "All bundles"
                  : `${plan.includedBundleIds.length} bundle${plan.includedBundleIds.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          ))}
        </div>

        {/* Bundle cards */}
        <div className="mt-12 space-y-4">
          {MODULE_BUNDLES.map((bundle) => {
            const Icon = BUNDLE_ICONS[bundle.id] ?? LayoutGrid;
            const isExpanded = expandedBundle === bundle.id;
            const includedIn = planLabelsForBundle(bundle.id);
            const modules = bundle.moduleIds;

            return (
              <div key={bundle.id} className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                {/* Bundle header (clickable) */}
                <button
                  onClick={() => setExpandedBundle(isExpanded ? null : bundle.id)}
                  className="flex w-full items-center gap-5 p-6 text-left transition-colors hover:bg-muted/30"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-accent/15 text-foreground">
                    <Icon className="h-6 w-6" strokeWidth={1.75} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-foreground">{bundle.name}</h2>
                      {includedIn.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {includedIn.map((label) => (
                            <Badge key={label} variant="outline" className="text-[10px] px-1.5 py-0">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{bundle.description}</p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-sm text-muted-foreground sm:block">{modules.length} modules</span>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t border-border/60 px-6 pb-6 pt-5">
                    <p className="text-sm leading-relaxed text-muted-foreground/70">{bundle.description}</p>

                    {/* Included modules */}
                    <div className="mt-6">
                      <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                        Included modules
                      </p>
                      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {modules.map((moduleId) => {
                          const mod = getModule(moduleId);
                          return (
                            <div key={moduleId} className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2">
                              <Check className="h-3.5 w-3.5 flex-shrink-0 text-foreground/30" />
                              <span className="text-sm text-foreground/80">{mod?.name ?? moduleId}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI features */}
                    {bundle.aiFeatures.length > 0 && (
                      <div className="mt-6">
                        <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                          <BrainCircuit className="h-3.5 w-3.5" />
                          AI features
                        </p>
                        <ul className="mt-3 space-y-2">
                          {bundle.aiFeatures.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground/70">
                              <BrainCircuit className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-foreground/20" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Plan availability */}
                    <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4">
                      <span className="text-xs text-muted-foreground">Included in:</span>
                      {includedIn.map((label) => (
                        <Badge key={label} variant="outline" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                      {includedIn.length === 0 && (
                        <span className="text-xs text-muted-foreground">Available as add-on</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 rounded-2xl border bg-card px-8 py-12 text-center shadow-sm">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Need everything? <span className="text-gradient-primary">Go Enterprise.</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enterprise includes all 38 modules, unlimited AI, and a dedicated account manager.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href={ROUTES.pricing}>Compare Plans</Link>
            </Button>
            <Button asChild className="shadow-lg">
              <Link href={ROUTES.signup}>Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
