import { describe, it, expect } from "vitest";
import { calculateVat, extractVat, validateGraTin } from "../calculations";
import { VAT_RATE, CARICOM_ORIGIN_COUNTRIES, SUPPORTED_CURRENCIES, DEFAULT_CURRENCY } from "../constants";

describe("Caribbean Constants", () => {
  it("has correct default currency", () => {
    expect(DEFAULT_CURRENCY).toBe("GYD");
  });

  it("supports all Caribbean currencies", () => {
    expect(SUPPORTED_CURRENCIES).toContain("GYD");
    expect(SUPPORTED_CURRENCIES).toContain("TTD");
    expect(SUPPORTED_CURRENCIES).toContain("BBD");
    expect(SUPPORTED_CURRENCIES).toContain("JMD");
    expect(SUPPORTED_CURRENCIES).toContain("XCD");
    expect(SUPPORTED_CURRENCIES).toContain("USD");
  });

  it("has correct VAT rate", () => {
    expect(VAT_RATE).toBe(0.14);
  });

  it("lists all CARICOM member states", () => {
    expect(CARICOM_ORIGIN_COUNTRIES).toContain("GY"); // Guyana
    expect(CARICOM_ORIGIN_COUNTRIES).toContain("TT"); // T&T
    expect(CARICOM_ORIGIN_COUNTRIES).toContain("JM"); // Jamaica
    expect(CARICOM_ORIGIN_COUNTRIES).toHaveLength(14);
  });
});

describe("VAT Calculations (Frontend)", () => {
  it("calculates 14% VAT", () => {
    const result = calculateVat(100_000);
    expect(result.vatAmount).toBe(14_000);
    expect(result.grossAmount).toBe(114_000);
    expect(result.currency).toBe("GYD");
  });

  it("extracts VAT from gross", () => {
    const result = extractVat(114_000);
    expect(result.netAmount).toBeCloseTo(100_000, 0);
    expect(result.vatAmount).toBeCloseTo(14_000, 0);
  });

  it("handles zero amount", () => {
    expect(calculateVat(0).vatAmount).toBe(0);
  });

  it("supports TTD currency", () => {
    const result = calculateVat(1000, "TTD");
    expect(result.currency).toBe("TTD");
  });
});

describe("GRA TIN Validation", () => {
  it("validates a 10-digit TIN", () => {
    const result = validateGraTin("1234567890");
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe("1234567890");
  });

  it("strips hyphens and spaces", () => {
    const result = validateGraTin("123-456-7890");
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe("1234567890");
  });

  it("rejects non-10-digit TINs", () => {
    expect(validateGraTin("123").valid).toBe(false);
    expect(validateGraTin("12345678901").valid).toBe(false);
  });
});
