export interface RawInvoice {
  name?: string;
  grand_total?: number;
  outstanding_amount?: number;
  posting_date?: string;
  status?: string;
  customer?: string;
  customer_name?: string;
  docstatus?: number;
  items?: Array<{ item_group?: string; amount?: number }>;
}

export interface GenericRow {
  id: string;
  [key: string]: unknown;
}

export type PageState = "loading" | "error" | "empty" | "success";

export type PeriodKey = "this_month" | "last_month" | "this_quarter" | "this_year";

export const PERIOD_OPTIONS: { value: PeriodKey; label: string }[] = [
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
  { value: "this_quarter", label: "This Quarter" },
  { value: "this_year", label: "This Year" },
];
