/**
 * Caribbean business logic — barrel export.
 *
 * Import from here for a clean API:
 *   import { calculateVat, Money } from "@/lib/caribbean";
 */

export {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  VAT_RATE,
  WITHHOLDING_TAX_RATE,
  CARICOM_ORIGIN_COUNTRIES,
  GRA_TIN_REGEX,
  GRA_RETENTION_YEARS,
  type CaribbeanCurrency,
  type CaricomCountry,
} from "./constants";

export { Money, CURRENCY_INFO } from "./money";

export { calculateVat, extractVat, validateGraTin, type VatResult } from "./calculations";
