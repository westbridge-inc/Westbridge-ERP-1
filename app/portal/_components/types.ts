export interface PortalInfo {
  customerName: string;
  customerEmail: string;
  accountId: string;
  companyName: string;
}

export interface Invoice {
  name: string;
  posting_date?: string;
  due_date?: string;
  grand_total?: number;
  outstanding_amount?: number;
  currency?: string;
  status?: string;
}

export interface Quotation {
  name: string;
  transaction_date?: string;
  valid_till?: string;
  grand_total?: number;
  currency?: string;
  status?: string;
  docstatus?: number;
}

export interface Order {
  name: string;
  transaction_date?: string;
  delivery_date?: string;
  grand_total?: number;
  currency?: string;
  status?: string;
  per_delivered?: number;
  per_billed?: number;
}

export function formatCurrency(amount: number | undefined, currency?: string): string {
  if (amount == null) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | undefined): string {
  if (!date) return "--";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export function statusVariant(
  status: string | undefined,
): "default" | "success" | "warning" | "destructive" | "outline" | "secondary" {
  const s = (status ?? "").toLowerCase();
  if (["paid", "completed", "delivered", "submitted", "accepted"].includes(s)) return "success";
  if (["overdue", "cancelled", "expired", "lost"].includes(s)) return "destructive";
  if (["unpaid", "partly paid", "partially delivered", "to deliver and bill"].includes(s)) return "warning";
  if (["draft", "open"].includes(s)) return "outline";
  return "secondary";
}
