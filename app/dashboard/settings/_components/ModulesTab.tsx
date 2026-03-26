"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToasts } from "@/components/ui/Toasts";
import { MODULES, MODULE_BUNDLES, CATEGORIES, getPlan, isModuleIncludedInPlan, type PlanId } from "@/lib/modules";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const HIDDEN_SECTIONS_KEY = "westbridge_hidden_sections";

/** Map category names to bundle IDs for sidebar filtering */
const CATEGORY_TO_BUNDLE: Record<string, string> = {
  "Finance & Accounting": "finance",
  "Sales & CRM": "crm",
  "Inventory & Supply Chain": "inventory",
  "HR & Payroll": "hr",
  Manufacturing: "manufacturing",
  "Project Management": "projects",
  "Business Tools": "biztools",
};

function loadHiddenSections(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HIDDEN_SECTIONS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveHiddenSections(hidden: string[]) {
  try {
    localStorage.setItem(HIDDEN_SECTIONS_KEY, JSON.stringify(hidden));
    // Notify the sidebar in the same tab
    window.dispatchEvent(new Event("westbridge_modules_changed"));
  } catch {
    /* storage full */
  }
}

export function ModulesTab() {
  const { addToast } = useToasts();

  // Fetch billing to determine current plan
  const [planId, setPlanId] = useState<PlanId>("starter");

  useEffect(() => {
    fetch(`${API_BASE}/api/billing/history`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { data?: { plan?: string } }) => {
        const p = d?.data?.plan?.toLowerCase() as PlanId | undefined;
        if (p) setPlanId(p);
      })
      .catch(() => {});
  }, []);

  const currentPlan = getPlan(planId);
  const [moduleActivateConfirm, setModuleActivateConfirm] = useState<{
    name: string;
    id: string;
    price: number;
  } | null>(null);
  const [activeAddOnIds, setActiveAddOnIds] = useState<Set<string>>(new Set());
  const [hiddenSections, setHiddenSections] = useState<string[]>(() => loadHiddenSections());

  const isModuleActive = useCallback(
    (moduleId: string) =>
      currentPlan.includedBundleIds.some((bid) => MODULES.find((m) => m.id === moduleId)?.bundleId === bid) ||
      activeAddOnIds.has(moduleId),
    [currentPlan.includedBundleIds, activeAddOnIds],
  );

  const handleActivateModule = useCallback(() => {
    if (moduleActivateConfirm) {
      setActiveAddOnIds((s) => new Set(s).add(moduleActivateConfirm.id));
      addToast(`${moduleActivateConfirm.name} activated`, "success");
      setModuleActivateConfirm(null);
    }
  }, [moduleActivateConfirm, addToast]);

  const toggleCategoryVisibility = useCallback(
    (category: string) => {
      const bundleId = CATEGORY_TO_BUNDLE[category];
      if (!bundleId) return;
      const next = hiddenSections.includes(bundleId)
        ? hiddenSections.filter((id) => id !== bundleId)
        : [...hiddenSections, bundleId];
      setHiddenSections(next);
      saveHiddenSections(next);
      const bundle = MODULE_BUNDLES.find((b) => b.id === bundleId);
      const label = bundle?.name ?? category;
      addToast(next.includes(bundleId) ? `${label} hidden from sidebar` : `${label} visible in sidebar`, "success");
    },
    [hiddenSections, addToast],
  );

  return (
    <>
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Hide modules you don&apos;t use to keep your sidebar clean. Hidden modules can be shown again at any time.
            This only affects your view — other team members won&apos;t be affected.
          </p>
        </div>
        {CATEGORIES.map((cat) => {
          const items = MODULES.filter((m) => m.category === cat);
          if (items.length === 0) return null;
          const bundleId = CATEGORY_TO_BUNDLE[cat];
          const isHidden = bundleId ? hiddenSections.includes(bundleId) : false;
          const hasAnyActive = items.some((m) => isModuleActive(m.id));
          return (
            <div key={cat} className={isHidden ? "opacity-50" : ""}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</p>
                {bundleId && hasAnyActive && (
                  <button
                    type="button"
                    onClick={() => toggleCategoryVisibility(cat)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                    title={isHidden ? "Show in sidebar" : "Hide from sidebar"}
                  >
                    {isHidden ? (
                      <>
                        <EyeOff className="size-3.5" />
                        <span>Hidden</span>
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5" />
                        <span>Visible</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {items.map((m) => {
                  const included = isModuleIncludedInPlan(m.id, planId);
                  const isActive = isModuleActive(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between gap-4 rounded-lg border border-border py-3 px-4 ${isActive ? "bg-background" : "bg-muted opacity-80"}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground"}`}
                        />
                        <span className="text-base font-medium text-foreground">{m.name}</span>
                        {!included && <span className="text-sm text-muted-foreground">Add-on</span>}
                      </div>
                      {included ? (
                        <span className="text-sm text-muted-foreground">Included</span>
                      ) : isActive ? (
                        <span className="text-sm text-success">Active</span>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={() => setModuleActivateConfirm({ name: m.name, id: m.id, price: 0 })}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-sm text-muted-foreground pt-2">
          Your plan includes {currentPlan.includedBundleIds.length} module bundle
          {currentPlan.includedBundleIds.length !== 1 ? "s" : ""}.
          {hiddenSections.length > 0 && <> {hiddenSections.length} hidden from sidebar.</>}
        </p>
      </div>

      <ConfirmDialog
        open={!!moduleActivateConfirm}
        onClose={() => setModuleActivateConfirm(null)}
        onConfirm={handleActivateModule}
        title="Activate module?"
        description={
          moduleActivateConfirm
            ? `Activate ${moduleActivateConfirm.name}? This will add $${moduleActivateConfirm.price}/mo to your billing.`
            : ""
        }
        confirmLabel="Activate"
        cancelLabel="Cancel"
      />
    </>
  );
}
