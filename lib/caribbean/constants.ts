/**
 * Caribbean domain constants — mirrored from the backend.
 *
 * IMPORTANT: These values MUST match the backend repo exactly.
 * If they drift, the system is broken.  Any change here requires
 * a corresponding change in westbridge-backend/src/lib/caribbean/constants.ts.
 *
 * Source: Guyana Revenue Authority (GRA), National Insurance Scheme (NIS),
 * CARICOM Revised Treaty of Chaguaramas.
 */

// ─── Currency ────────────────────────────────────────────────────────────────

export const DEFAULT_CURRENCY = "GYD" as const;

export const SUPPORTED_CURRENCIES = [
  "GYD", // Guyanese Dollar  (default)
  "USD", // US Dollar
  "TTD", // Trinidad & Tobago Dollar
  "BBD", // Barbados Dollar
  "JMD", // Jamaican Dollar
  "XCD", // East Caribbean Dollar
] as const;

export type CaribbeanCurrency = (typeof SUPPORTED_CURRENCIES)[number];

// ─── VAT / Tax ───────────────────────────────────────────────────────────────

/** Guyana standard VAT rate (14%) */
export const VAT_RATE = 0.14;

/** Withholding tax on payments to non-residents */
export const WITHHOLDING_TAX_RATE = 0.2;

/** GRA TIN format: exactly 10 digits */
export const GRA_TIN_REGEX = /^\d{10}$/;

// ─── CARICOM ─────────────────────────────────────────────────────────────────

/** ISO 3166-1 alpha-2 codes for CARICOM member states */
export const CARICOM_ORIGIN_COUNTRIES = [
  "GY",
  "TT",
  "BB",
  "JM",
  "BS",
  "BZ",
  "SR",
  "AG",
  "DM",
  "GD",
  "KN",
  "LC",
  "VC",
  "HT",
] as const;

export type CaricomCountry = (typeof CARICOM_ORIGIN_COUNTRIES)[number];

// ─── Data Retention / Compliance ─────────────────────────────────────────────

/** GRA requires 7-year retention of financial records */
export const GRA_RETENTION_YEARS = 7;
