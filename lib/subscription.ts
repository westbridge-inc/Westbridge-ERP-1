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
): SubscriptionState {
  const now = new Date();

  // Calculate trial end date
  let trialEndsAt: Date | null = null;
  let trialDaysLeft = 0;
  let isTrialExpired = false;

  if (accountCreatedAt) {
    trialEndsAt = new Date(accountCreatedAt);
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL.days);
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
