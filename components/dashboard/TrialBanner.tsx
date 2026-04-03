"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSubscription } from "./SubscriptionGate";

/**
 * Shows a non-intrusive banner during the trial period.
 * - Hidden when paid or trial has 7+ days left
 * - Yellow warning when 7 or fewer days remain
 * - Red urgent when 3 or fewer days remain
 */
export function TrialBanner() {
  const { status, trialDaysLeft, isPaid } = useSubscription();

  // Don't show if paid, expired (paywall handles that), or plenty of trial left
  if (isPaid || status === "expired" || status === "active" || trialDaysLeft > 7) {
    return null;
  }

  const isUrgent = trialDaysLeft <= 3;
  const daysText = trialDaysLeft === 1 ? "1 day" : `${trialDaysLeft} days`;

  return (
    <div
      className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${
        isUrgent
          ? "bg-destructive/10 border-b border-destructive/20 text-destructive"
          : "bg-warning/10 border-b border-warning/20 text-warning-foreground"
      }`}
    >
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0" />
        <span>
          <strong>{daysText}</strong> left in your free trial.
          {isUrgent && " Add a payment method to keep your data."}
        </span>
      </div>
      <Button asChild size="sm" variant={isUrgent ? "destructive" : "default"} className="shrink-0">
        <Link href="/dashboard/settings?tab=billing">Upgrade Now</Link>
      </Button>
    </div>
  );
}
