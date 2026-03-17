"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToasts } from "@/components/ui/Toasts";
import { MODULES, CATEGORIES, getPlan, isModuleIncludedInPlan, type PlanId } from "@/lib/modules";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

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

  return (
    <>
      <div className="space-y-6">
        {CATEGORIES.map((cat) => {
          const items = MODULES.filter((m) => m.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</p>
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
          {activeAddOnIds.size > 0 && (
            <>
              {" "}
              {activeAddOnIds.size} add-on{activeAddOnIds.size !== 1 ? "s" : ""} active.
            </>
          )}
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
