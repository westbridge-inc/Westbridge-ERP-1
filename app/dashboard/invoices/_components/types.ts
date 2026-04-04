import type { CurrencyCode } from "@/lib/constants";

export interface InvoiceRow {
  id: string;
  customer: string;
  amount: number;
  currency: CurrencyCode;
  status: string;
  date: string;
  dueDate: string;
}

export interface InvoicesListClientProps {
  invoices: InvoiceRow[];
  currentPage: number;
  hasMore: boolean;
  title?: string;
  subtitle?: string;
  dateLabel?: string;
  dueDateLabel?: string;
  searchPlaceholder?: string;
  type?: string;
}
