import { TRIAL } from "@/lib/config/site";

export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired";

export interface SubscriptionState {
  status: SubscriptionStatus;
  planId: string | null;
  trialEndsAt: Date | null;
  trialDaysLeft: number;
  isTrialExpired: boolean;
  isPaid: boolean;
  needsPayment: boolean;
}

/**
 * Derive subscription state from billing data.
 * `accountCreatedAt` comes from the billing history API.
 * `subscriptionStatus` and `planId` come from the subscription API.
 */
export function deriveSubscriptionState(
  accountCreatedAt: string | null,
  subscriptionStatus: string | null,
  planId: string | null,
  trialEndsAtIso: string | null = null,
): SubscriptionState {
  const now = new Date();

  // Calculate trial end date — prefer the backend's stored trialEndsAt
  // (set at signup as createdAt + 14 days). Fall back to computing it
  // from accountCreatedAt for older accounts that don't have the field.
  let trialEndsAt: Date | null = null;
  // Default to full trial length when we have no data yet — otherwise a
  // transient API failure would flash "0 days left in your free trial" to
  // users who just signed up.
  let trialDaysLeft: number = TRIAL.days;
  let isTrialExpired = false;

  if (trialEndsAtIso) {
    trialEndsAt = new Date(trialEndsAtIso);
  } else if (accountCreatedAt) {
    trialEndsAt = new Date(accountCreatedAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL.days);
  }

  if (trialEndsAt) {
    const msLeft = trialEndsAt.getTime() - now.getTime();
    trialDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    isTrialExpired = msLeft <= 0;
  }

  // Determine if user has an active paid subscription
  const paidStatuses = ["active", "trialing"];
  const isPaid = !!subscriptionStatus && paidStatuses.includes(subscriptionStatus);

  // Determine effective status
  let status: SubscriptionStatus;
  if (isPaid) {
    status = "active";
  } else if (subscriptionStatus === "past_due") {
    status = "past_due";
  } else if (subscriptionStatus === "cancelled" || subscriptionStatus === "canceled") {
    status = "cancelled";
  } else if (isTrialExpired) {
    status = "expired";
  } else {
    status = "trial";
  }

  // User needs to pay if: trial expired and no active subscription
  const needsPayment = !isPaid && isTrialExpired;

  return {
    status,
    planId,
    trialEndsAt,
    trialDaysLeft,
    isTrialExpired,
    isPaid,
    needsPayment,
  };
}
