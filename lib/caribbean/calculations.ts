/**
 * Caribbean calculation functions — pure, zero-dependency, framework-agnostic.
 *
 * These are the frontend mirrors of the backend calculation engines.
 * Used for:
 * - Real-time invoice previews (VAT calculation as user types)
 * - Form validation (client-side sanity checks)
 *
 * The backend always recalculates server-side — these are UX optimizations.
 */

import { VAT_RATE, GRA_TIN_REGEX, type CaribbeanCurrency } from "./constants";

// ─── VAT ─────────────────────────────────────────────────────────────────────

export interface VatResult {
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  vatRate: number;
  currency: CaribbeanCurrency;
}

/** Calculate 14% VAT on a net amount. */
export function calculateVat(
  netAmount: number,
  currency: CaribbeanCurrency = "GYD",
  rate: number = VAT_RATE,
): VatResult {
  const vatAmount = round2(netAmount * rate);
  return {
    netAmount,
    vatAmount,
    grossAmount: round2(netAmount + vatAmount),
    vatRate: rate,
    currency,
  };
}

/** Extract VAT from a gross (VAT-inclusive) amount. */
export function extractVat(
  grossAmount: number,
  currency: CaribbeanCurrency = "GYD",
  rate: number = VAT_RATE,
): VatResult {
  const netAmount = round2(grossAmount / (1 + rate));
  const vatAmount = round2(grossAmount - netAmount);
  return { netAmount, vatAmount, grossAmount, vatRate: rate, currency };
}

// ─── GRA TIN Validation ──────────────────────────────────────────────────────

/**
 * Validate a Guyana Revenue Authority Tax Identification Number (TIN).
 * Strips hyphens and spaces, then checks for exactly 10 digits.
 */
export function validateGraTin(tin: string): { valid: boolean; normalized: string } {
  const normalized = tin.replace(/[-\s]/g, "");
  return { valid: GRA_TIN_REGEX.test(normalized), normalized };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
