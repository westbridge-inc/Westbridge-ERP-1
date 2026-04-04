import { useState, useEffect } from "react";
import type { ImportFieldMapping } from "@/components/dashboard/ImportModal";

export const FILTERS = ["All", "Draft", "Unpaid", "Paid", "Overdue"] as const;

export const INVOICE_IMPORT_FIELDS: ImportFieldMapping[] = [
  { field: "customer", label: "Customer", required: true },
  { field: "posting_date", label: "Posting Date" },
  { field: "due_date", label: "Due Date" },
  { field: "grand_total", label: "Grand Total" },
  { field: "currency", label: "Currency" },
];

export const COLUMN_VISIBILITY_KEY = "westbridge_col_visibility";

export function loadColumnVisibility(doctype: string): Set<string> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, string[]>;
    const cols = parsed[doctype];
    if (!Array.isArray(cols)) return null;
    return new Set(cols);
  } catch {
    return null;
  }
}

export function saveColumnVisibility(doctype: string, visibleIds: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(COLUMN_VISIBILITY_KEY);
    const parsed: Record<string, string[]> = raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
    parsed[doctype] = Array.from(visibleIds);
    localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(parsed));
  } catch {
    // Storage unavailable
  }
}

export function useDebounce(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
