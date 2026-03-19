import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/modules";
import type { PlanId } from "@/lib/modules";
import { Button } from "@/components/ui/Button";

export interface SignupStep2Props {
  planId: PlanId;
  setPlanId: (id: PlanId) => void;
  onBack: () => void;
  onNext: () => void;
}

export function SignupStep2({ planId, setPlanId, onBack, onNext }: SignupStep2Props) {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground font-display">Choose your plan</h1>
      <p className="mt-2 text-sm text-muted-foreground/60">
        Flat monthly pricing. No per-user fees. Scale with overage billing.
      </p>
      <div className="mt-6 space-y-3">
        {PLANS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPlanId(p.id)}
            className={cn(
              "w-full min-h-[44px] rounded-xl border-2 p-4 text-left transition",
              planId === p.id ? "border-primary bg-muted" : "border-border hover:opacity-90",
            )}
          >
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">{p.name}</span>
              <span className="text-foreground">${p.pricePerMonth.toLocaleString()}/mo</span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground/60">
              {p.limits.users === -1 ? "Unlimited users" : `Up to ${p.limits.users} users`} ·{" "}
              {p.limits.storageGB === -1 ? "Unlimited storage" : `${p.limits.storageGB} GB`}
            </p>
          </button>
        ))}
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
