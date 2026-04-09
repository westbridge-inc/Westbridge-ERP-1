"use client";

import { useState } from "react";
import { PLANS } from "@/lib/modules";
import type { PlanId } from "@/lib/modules";
import { formatCurrency } from "@/lib/locale/currency";
import { Button } from "@/components/ui/Button";
import { Check, ChevronLeft, Loader2, AlertCircle } from "lucide-react";

export interface SignupStep3Props {
  planId: PlanId;
  setPlanId: (id: PlanId) => void;
  companySize: string;
  /** All data collected from steps 1-2, passed through for the signup API call */
  signupData: {
    name: string;
    email: string;
    password: string;
    company: string;
  };
  csrfToken: string | null;
  onBack: () => void;
  onNext: () => void;
}

function getRecommendedPlanId(companySize: string): PlanId {
  if (
    companySize.includes("51") ||
    companySize.includes("201") ||
    companySize.includes("501") ||
    companySize.includes("1000")
  ) {
    return "business";
  }
  return "starter";
}

export function SignupStep3({
  planId,
  setPlanId,
  companySize,
  signupData,
  csrfToken,
  onBack,
  onNext,
}: SignupStep3Props) {
  const recommendedId = getRecommendedPlanId(companySize);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStartTrial() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
        },
        body: JSON.stringify({
          name: signupData.name,
          email: signupData.email,
          password: signupData.password,
          companyName: signupData.company || signupData.name,
          plan: planId.charAt(0).toUpperCase() + planId.slice(1),
          modulesSelected: [],
          // Age + ToS gate (Big-4 audit B3). User reached step 3 only after
          // checking the combined age/ToS box on Step 1, so we can safely
          // assert true here. The backend signupBodySchema enforces this as
          // a literal-true field — sending false or omitting it is rejected.
          ageConfirmed: true,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === "object" ? data.error?.message : data?.error;
        setError(msg || "Something went wrong. Please try again.");
        return;
      }
      // Auto-login: set session if returned
      const sessionToken = data?.data?.sessionToken;
      if (sessionToken) {
        await fetch("/api/auth/session", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: sessionToken }),
        }).catch(() => {});
      }
      onNext();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-semibold text-center">Choose your plan</h1>
      <p className="text-sm text-muted-foreground text-center mt-2">
        All plans include a 14-day free trial. No credit card required.
      </p>
      <p className="text-sm text-muted-foreground text-center">You can change your plan anytime.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {PLANS.map((plan) => {
          const isEnterprise = plan.id === "enterprise";
          const isSelected = planId === plan.id;
          const isRecommended = plan.id === recommendedId;

          return (
            <div
              key={plan.id}
              role={isEnterprise ? undefined : "button"}
              tabIndex={isEnterprise ? undefined : 0}
              className={`relative ${
                isSelected && !isEnterprise
                  ? "border-2 border-foreground rounded-xl p-5 cursor-pointer bg-foreground/[0.02]"
                  : "border border-border rounded-xl p-5 cursor-pointer hover:border-foreground/30 transition-colors"
              } ${isEnterprise ? "cursor-default" : ""}`}
              onClick={() => {
                if (!isEnterprise) setPlanId(plan.id);
              }}
              onKeyDown={(e) => {
                if (!isEnterprise && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  setPlanId(plan.id);
                }
              }}
            >
              {isRecommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-[11px] font-medium px-3 py-0.5 rounded-full">
                  Recommended
                </span>
              )}

              {isSelected && !isEnterprise && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="w-3 h-3 text-background" />
                </div>
              )}

              <p className="text-base font-semibold">{plan.name}</p>

              {isEnterprise ? (
                <>
                  <p className="text-3xl font-display font-bold tabular-nums mt-2">Custom</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    <a
                      href="mailto:sales@westbridgetoday.com"
                      className="underline hover:text-foreground transition-colors"
                    >
                      Contact Sales
                    </a>
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-2">
                    <span className="text-3xl font-display font-bold tabular-nums">
                      {formatCurrency(plan.pricePerMonth)}
                    </span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">after free trial</p>
                </>
              )}

              <div className="border-t border-border my-4" />

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-foreground mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        All prices are in USD. You won&apos;t be charged during your 14-day free trial. Cancel anytime.
      </p>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 mt-4">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" type="button" onClick={onBack} disabled={submitting}>
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>
        <Button variant="default" type="button" className="h-11 px-8" onClick={handleStartTrial} disabled={submitting}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up your workspace...
            </span>
          ) : (
            "Start Free Trial"
          )}
        </Button>
      </div>
    </div>
  );
}
