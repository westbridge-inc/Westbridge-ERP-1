"use client";

import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PLANS, type PlanId } from "@/lib/modules";
import { useSubscription } from "@/components/dashboard/SubscriptionGate";
import { getDashboardBySlug } from "../_components/DashboardCatalog";
import { FinanceDashboard } from "../_components/FinanceDashboard";
import { SalesDashboard } from "../_components/SalesDashboard";
import { InventoryDashboard } from "../_components/InventoryDashboard";
import { HRDashboard } from "../_components/HRDashboard";
import { ManufacturingDashboard } from "../_components/ManufacturingDashboard";
import { ProjectsDashboard } from "../_components/ProjectsDashboard";
import { LockedDashboard } from "../_components/LockedDashboard";

const VALID_PLAN_IDS: ReadonlySet<PlanId> = new Set(["solo", "starter", "business", "enterprise"]);

function toPlanId(raw: string | null): PlanId | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase();
  return VALID_PLAN_IDS.has(normalized as PlanId) ? (normalized as PlanId) : null;
}

function isAccessible(bundleId: string, planId: PlanId | null): boolean {
  if (!planId) return false;
  return PLANS.find((p) => p.id === planId)?.includedBundleIds.includes(bundleId) ?? false;
}

function renderDashboard(slug: string) {
  switch (slug) {
    case "finance":
      return <FinanceDashboard />;
    case "sales":
      return <SalesDashboard />;
    case "inventory":
      return <InventoryDashboard />;
    case "hr":
      return <HRDashboard />;
    case "manufacturing":
      return <ManufacturingDashboard />;
    case "projects":
      return <ProjectsDashboard />;
    default:
      return null;
  }
}

export default function DashboardSlugPage() {
  const params = useParams<{ slug: string }>();
  const { planId: rawPlanId } = useSubscription();
  const planId = toPlanId(rawPlanId);

  const slug = params?.slug ?? "";
  const entry = getDashboardBySlug(slug);

  if (!entry) {
    notFound();
  }

  const accessible = isAccessible(entry.bundle, planId);

  return (
    <div className="space-y-4">
      <div>
        <Link
          href="/dashboard/dashboards"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          All dashboards
        </Link>
      </div>

      {accessible ? (
        renderDashboard(slug)
      ) : (
        <LockedDashboard bundleId={entry.bundle} dashboardName={entry.name} currentPlanId={planId} />
      )}
    </div>
  );
}
