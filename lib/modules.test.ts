import { describe, it, expect } from "vitest";
import type { PlanId } from "./modules";
import {
  MODULES,
  MODULE_IDS,
  PLANS,
  CATEGORIES,
  getPlan,
  getModule,
  isModuleIncludedInPlan,
  getAddOnPrice,
  MODULE_ROWS,
} from "./modules";

describe("modules", () => {
  it("MODULES and MODULE_IDS length match", () => {
    expect(MODULES.length).toBe(MODULE_IDS.length);
  });
  it("PLANS has solo starter business enterprise", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["solo", "starter", "business", "enterprise"]);
  });
  it("getPlan returns plan by id", () => {
    expect(getPlan("starter")?.name).toBe("Starter");
    expect(getPlan("enterprise")?.limits.users).toBe(-1);
  });
  it("getPlan is case-insensitive", () => {
    expect(getPlan("Enterprise")?.name).toBe("Enterprise");
    expect(getPlan("ENTERPRISE")?.name).toBe("Enterprise");
  });
  it("getPlan returns null for unknown id", () => {
    expect(getPlan("unknown" as PlanId)).toBeNull();
    expect(getPlan(null)).toBeNull();
    expect(getPlan(undefined)).toBeNull();
  });
  it("getModule returns module or undefined", () => {
    expect(getModule("general-ledger")?.name).toBe("General Ledger");
    expect(getModule("nonexistent")).toBeUndefined();
  });
  it("isModuleIncludedInPlan", () => {
    // general-ledger is in the finance bundle → included in starter
    expect(isModuleIncludedInPlan("general-ledger", "starter")).toBe(true);
    // stock-management is in the inventory bundle → NOT included in starter (only finance + crm)
    expect(isModuleIncludedInPlan("stock-management", "starter")).toBe(false);
  });
  it("getAddOnPrice enterprise returns null", () => {
    // enterprise includes all bundles so add-on price is null
    expect(getAddOnPrice("stock-management", "enterprise")).toBeNull();
  });
  it("getAddOnPrice included module returns null", () => {
    expect(getAddOnPrice("general-ledger", "starter")).toBeNull();
  });
  it("getAddOnPrice add-on returns number", () => {
    // stock-management is an add-on for starter → should return a positive price
    expect(getAddOnPrice("stock-management", "starter")).toBeGreaterThan(0);
  });
  it("CATEGORIES and MODULE_ROWS", () => {
    expect(CATEGORIES).toContain("Finance & Accounting");
    expect(MODULE_ROWS.length).toBe(MODULES.length);
  });
});
