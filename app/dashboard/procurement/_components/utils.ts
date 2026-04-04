import { formatDateLong } from "@/lib/locale/date";
import type { PurchaseOrder, SupplierRow } from "./types";

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

export function mapErpPurchaseOrder(d: Record<string, unknown>): PurchaseOrder {
  return {
    id: String(d.name ?? ""),
    supplier: String(d.supplier_name ?? d.supplier ?? "\u2014"),
    amount: Number(d.grand_total ?? d.net_total ?? 0),
    orderDate: String(d.transaction_date ?? d.posting_date ?? ""),
    expected: String(d.schedule_date ?? d.due_date ?? ""),
    status: String(d.status ?? "Draft").trim(),
  };
}

export function mapErpSupplier(d: Record<string, unknown>): SupplierRow {
  return {
    id: String(d.name ?? ""),
    name: String(d.supplier_name ?? d.name ?? ""),
    supplierType: String(d.supplier_type ?? "\u2014"),
    country: String(d.country ?? "\u2014"),
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export function fmtDate(d: string): string {
  if (!d) return "\u2014";
  try {
    return formatDateLong(d);
  } catch {
    return d;
  }
}
