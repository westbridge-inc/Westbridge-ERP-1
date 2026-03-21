import { MODULES as MODULE_LIST, CATEGORIES, isModuleIncludedInPlan } from "@/lib/modules";
import type { PlanId } from "@/lib/modules";
import { Button } from "@/components/ui/Button";

export interface SignupStep3Props {
  planId: PlanId;
  planName: string;
  planPrice: number;
  addOnIds: Set<string>;
  toggleAddOn: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SignupStep3({
  planId,
  planName,
  planPrice,
  addOnIds,
  toggleAddOn,
  onBack,
  onNext,
}: SignupStep3Props) {
  const addOnCount = addOnIds.size;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground font-display">Pick modules</h1>
      <p className="mt-2 text-sm text-muted-foreground/60">Included in {planName}. Add more below if needed.</p>
      <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 md:max-h-80">
        {CATEGORIES.map((cat) => {
          const catModules = MODULE_LIST.filter((m) => m.category === cat);
          if (catModules.length === 0) return null;
          return (
            <div key={cat} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {cat}
              </p>
              <div className="space-y-2">
                {catModules.map((m) => {
                  const included = isModuleIncludedInPlan(m.id, planId);
                  const isAddOn = addOnIds.has(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => !included && toggleAddOn(m.id)}
                      disabled={included}
                      className={`flex min-h-[44px] w-full justify-between items-center rounded-lg border p-3 text-left text-sm transition ${
                        included
                          ? "cursor-default border-border bg-muted opacity-90"
                          : isAddOn
                            ? "border-primary bg-muted"
                            : "border-border hover:opacity-90"
                      }`}
                    >
                      <span className="font-medium text-foreground">{m.name}</span>
                      {included ? (
                        <span className="text-xs text-muted-foreground/60">Included</span>
                      ) : (
                        <span className="text-muted-foreground">Add-on</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 rounded-lg border border-border bg-muted p-4">
        <p className="text-sm font-medium text-foreground">
          {planName} — ${planPrice.toLocaleString()}/mo
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground/60">
          Flat monthly pricing · {addOnCount} add-on{addOnCount !== 1 ? "s" : ""} selected
        </p>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" size="default" type="button" onClick={onBack}>
          Back
        </Button>
        <Button variant="default" size="lg" type="button" className="h-11 flex-1" onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
