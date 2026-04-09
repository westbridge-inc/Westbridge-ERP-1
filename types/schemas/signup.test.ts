import { describe, it, expect } from "vitest";
import { signupBodySchema, signupSuccessSchema } from "./signup";

describe("signup schemas", () => {
  it("signupBodySchema parses a valid payload (with age confirmation)", () => {
    expect(
      signupBodySchema.parse({
        email: "a@b.com",
        companyName: "Co",
        plan: "starter",
        ageConfirmed: true,
      }),
    ).toMatchObject({ email: "a@b.com", companyName: "Co", plan: "starter", ageConfirmed: true });
    expect(
      signupBodySchema.parse({
        email: "a@b.com",
        companyName: "Co",
        plan: "starter",
        ageConfirmed: true,
        modulesSelected: ["m1"],
      }).modulesSelected,
    ).toEqual(["m1"]);
  });

  it("signupBodySchema rejects an invalid email", () => {
    expect(() =>
      signupBodySchema.parse({ email: "invalid", companyName: "C", plan: "p", ageConfirmed: true }),
    ).toThrow();
  });

  // ─── B3: age gate ─────────────────────────────────────────────────────
  // Terms of Service section 1 requires age 18+. This schema enforces a
  // hard self-attestation gate at signup; without it COPPA (US <13) and
  // GDPR-K (EU <16) compliance cannot be claimed.
  it("rejects signup when ageConfirmed is missing", () => {
    expect(() => signupBodySchema.parse({ email: "a@b.com", companyName: "Co", plan: "starter" })).toThrow();
  });

  it("rejects signup when ageConfirmed is false", () => {
    expect(() =>
      signupBodySchema.parse({
        email: "a@b.com",
        companyName: "Co",
        plan: "starter",
        ageConfirmed: false,
      }),
    ).toThrow();
  });

  it("rejects signup when ageConfirmed is a non-boolean truthy value", () => {
    expect(() =>
      signupBodySchema.parse({
        email: "a@b.com",
        companyName: "Co",
        plan: "starter",
        ageConfirmed: "yes" as unknown as boolean,
      }),
    ).toThrow();
  });

  it("signupSuccessSchema", () => {
    const valid = { accountId: "acc1", paymentUrl: "https://x.com", status: "pending" as const };
    expect(signupSuccessSchema.parse(valid)).toEqual(valid);
  });
});
