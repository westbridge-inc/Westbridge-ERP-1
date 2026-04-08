import { describe, it, expect } from "vitest";
import { deriveSubscriptionState } from "./subscription";
import { TRIAL } from "./config/site";

describe("deriveSubscriptionState", () => {
  // Regression: when the billing API fails or returns null, the previous
  // implementation initialized trialDaysLeft = 0, which caused fresh
  // signups to see "0 days left in your free trial" in an urgent red
  // banner. We now default to TRIAL.days when no data is available.
  describe("null inputs", () => {
    it("defaults to full trial length when all inputs are null", () => {
      const state = deriveSubscriptionState(null, null, null, null);
      expect(state.trialDaysLeft).toBe(TRIAL.days);
      expect(state.status).toBe("trial");
      expect(state.isTrialExpired).toBe(false);
      expect(state.isPaid).toBe(false);
      expect(state.needsPayment).toBe(false);
    });

    it("defaults to full trial when only trialEndsAtIso is missing", () => {
      const state = deriveSubscriptionState(null, null, null);
      expect(state.trialDaysLeft).toBe(TRIAL.days);
    });
  });

  describe("fresh trial from trialEndsAt", () => {
    it("computes 14 days left for a brand-new 14-day trial", () => {
      const trialEnd = new Date(Date.now() + TRIAL.days * 86400000).toISOString();
      const state = deriveSubscriptionState("2026-04-08T00:00:00Z", null, null, trialEnd);
      expect(state.trialDaysLeft).toBe(TRIAL.days);
      expect(state.status).toBe("trial");
      expect(state.isTrialExpired).toBe(false);
    });

    it("computes 3 days left correctly", () => {
      const trialEnd = new Date(Date.now() + 3 * 86400000).toISOString();
      const state = deriveSubscriptionState("2026-04-08T00:00:00Z", null, null, trialEnd);
      expect(state.trialDaysLeft).toBe(3);
    });

    it("computes 1 day left correctly", () => {
      const trialEnd = new Date(Date.now() + 1 * 86400000).toISOString();
      const state = deriveSubscriptionState("2026-04-08T00:00:00Z", null, null, trialEnd);
      expect(state.trialDaysLeft).toBe(1);
    });
  });

  describe("expired trial", () => {
    it("marks trial as expired and needsPayment when trialEndsAt is in the past", () => {
      const trialEnd = new Date(Date.now() - 86400000).toISOString();
      const state = deriveSubscriptionState("2026-03-25T00:00:00Z", null, null, trialEnd);
      expect(state.isTrialExpired).toBe(true);
      expect(state.trialDaysLeft).toBe(0);
      expect(state.status).toBe("expired");
      expect(state.needsPayment).toBe(true);
    });
  });

  describe("paid subscription", () => {
    it("is paid when subscriptionStatus is active", () => {
      const state = deriveSubscriptionState("2026-04-08T00:00:00Z", "active", "Enterprise", null);
      expect(state.isPaid).toBe(true);
      expect(state.status).toBe("active");
      expect(state.needsPayment).toBe(false);
    });

    it("is paid when subscriptionStatus is trialing", () => {
      const state = deriveSubscriptionState("2026-04-08T00:00:00Z", "trialing", "Starter", null);
      expect(state.isPaid).toBe(true);
      expect(state.status).toBe("active");
    });
  });

  describe("past_due and cancelled", () => {
    it("marks past_due when subscription is past_due", () => {
      const state = deriveSubscriptionState("2026-03-01T00:00:00Z", "past_due", "Starter", null);
      expect(state.status).toBe("past_due");
      expect(state.isPaid).toBe(false);
    });

    it("marks cancelled when subscription is cancelled (US spelling)", () => {
      const state = deriveSubscriptionState("2026-03-01T00:00:00Z", "canceled", "Starter", null);
      expect(state.status).toBe("cancelled");
    });

    it("marks cancelled when subscription is cancelled (UK spelling)", () => {
      const state = deriveSubscriptionState("2026-03-01T00:00:00Z", "cancelled", "Starter", null);
      expect(state.status).toBe("cancelled");
    });
  });

  describe("fallback from accountCreatedAt", () => {
    it("computes trial end as createdAt + 14 days when trialEndsAtIso is missing", () => {
      const createdAt = new Date(Date.now() - 5 * 86400000).toISOString();
      const state = deriveSubscriptionState(createdAt, null, null, null);
      // Should have ~9 days left (14 - 5)
      expect(state.trialDaysLeft).toBeGreaterThanOrEqual(8);
      expect(state.trialDaysLeft).toBeLessThanOrEqual(10);
    });
  });
});
