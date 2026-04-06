/**
 * Dashboard catalog — defines all real-time dashboards available in Westbridge.
 *
 * Each dashboard is tied to a module bundle ID from `lib/modules.ts`. Plan
 * gating is enforced by checking whether the user's plan includes the bundle.
 */

import { Briefcase, DollarSign, Factory, Package, TrendingUp, Users, type LucideIcon } from "lucide-react";

export interface DashboardEntry {
  /** URL slug used in `/dashboard/dashboards/[slug]`. */
  slug: string;
  /** Display name shown on the hub card and the dashboard header. */
  name: string;
  /** Module bundle ID from `lib/modules.ts` (e.g. "finance", "crm"). */
  bundle: string;
  /** Icon shown on the hub card and the dashboard header. */
  icon: LucideIcon;
  /** One-line description shown on the hub card. */
  description: string;
}

export const DASHBOARD_CATALOG: readonly DashboardEntry[] = [
  {
    slug: "finance",
    name: "Finance Overview",
    bundle: "finance",
    icon: DollarSign,
    description: "Revenue, expenses, AR aging, and profit margin in one CFO-style view.",
  },
  {
    slug: "sales",
    name: "Sales Pipeline",
    bundle: "crm",
    icon: TrendingUp,
    description: "Pipeline value, deal flow, win rate, and top reps at a glance.",
  },
  {
    slug: "inventory",
    name: "Inventory Health",
    bundle: "inventory",
    icon: Package,
    description: "Stock value, low-stock alerts, warehouse breakdown, and movements.",
  },
  {
    slug: "hr",
    name: "HR Overview",
    bundle: "hr",
    icon: Users,
    description: "Headcount, attendance, leave balance, and department mix.",
  },
  {
    slug: "manufacturing",
    name: "Production Floor",
    bundle: "manufacturing",
    icon: Factory,
    description: "Active work orders, output, on-time delivery, and quality.",
  },
  {
    slug: "projects",
    name: "Project Tracker",
    bundle: "projects",
    icon: Briefcase,
    description: "Active projects, overdue tasks, hours logged, and budget burn.",
  },
] as const;

export function getDashboardBySlug(slug: string): DashboardEntry | undefined {
  return DASHBOARD_CATALOG.find((d) => d.slug === slug);
}
