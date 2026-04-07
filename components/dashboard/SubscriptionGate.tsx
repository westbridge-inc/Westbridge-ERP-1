"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/lib/api/client";
import { deriveSubscriptionState, type SubscriptionState } from "@/lib/subscription";

const DEFAULT_STATE: SubscriptionState = {
  status: "trial",
  planId: null,
  trialEndsAt: null,
  trialDaysLeft: 14,
  isTrialExpired: false,
  isPaid: false,
  needsPayment: false,
};

const SubscriptionContext = createContext<SubscriptionState>(DEFAULT_STATE);

export function useSubscription() {
  return useContext(SubscriptionContext);
}

/**
 * Fetches billing + subscription data on mount, derives the subscription state,
 * and provides it via context. If the trial is expired and no active subscription
 * exists, renders the paywall instead of children.
 */
export function SubscriptionGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SubscriptionState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const [billing, subscription] = await Promise.allSettled([
          api.billing.getHistory(),
          api.billing.getSubscription(),
        ]);

        const accountCreatedAt = billing.status === "fulfilled" ? billing.value.accountCreatedAt : null;
        const trialEndsAt = billing.status === "fulfilled" ? billing.value.trialEndsAt : null;
        const subStatus = subscription.status === "fulfilled" ? subscription.value.status : null;
        const planId = subscription.status === "fulfilled" ? subscription.value.planId : null;

        if (!cancelled) {
          setState(deriveSubscriptionState(accountCreatedAt, subStatus, planId, trialEndsAt));
        }
      } catch {
        // If APIs fail, assume trial (don't block user)
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  // Don't block while loading — show dashboard immediately
  if (!loaded) {
    return <SubscriptionContext.Provider value={DEFAULT_STATE}>{children}</SubscriptionContext.Provider>;
  }

  // If trial expired and no payment, show paywall
  if (state.needsPayment) {
    return (
      <SubscriptionContext.Provider value={state}>
        <TrialExpiredPaywall />
      </SubscriptionContext.Provider>
    );
  }

  return <SubscriptionContext.Provider value={state}>{children}</SubscriptionContext.Provider>;
}

/* ─── Paywall (shown when trial expired, no active subscription) ──────────── */

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TRIAL } from "@/lib/config/site";

function TrialExpiredPaywall() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-6 text-2xl font-display font-semibold text-foreground">Your free trial has ended</h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Your {TRIAL.days}-day free trial has expired. To continue using Westbridge, please choose a plan and add a
          payment method.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg" className="w-full h-11">
            <Link href="/dashboard/settings?tab=billing">Choose a Plan</Link>
          </Button>
          <p className="text-xs text-muted-foreground">Your data is safe. It will be retained for 30 days.</p>
        </div>
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            Need help?{" "}
            <a href="mailto:support@westbridgetoday.com" className="text-foreground underline hover:no-underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
