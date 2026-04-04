import type { Opportunity, Customer, Lead } from "./types";

/* ------------------------------------------------------------------ */
/*  Badge variant maps                                                 */
/* ------------------------------------------------------------------ */

export const OPP_BADGE: Record<string, "outline" | "default" | "success" | "destructive" | "warning"> = {
  Open: "outline",
  Quotation: "default",
  Converted: "success",
  Lost: "destructive",
  Replied: "warning",
};

export const LEAD_BADGE: Record<string, "outline" | "default" | "success" | "destructive" | "warning"> = {
  Lead: "outline",
  Open: "default",
  Replied: "warning",
  Converted: "success",
  "Do Not Contact": "destructive",
};

/* ------------------------------------------------------------------ */
/*  Mappers                                                            */
/* ------------------------------------------------------------------ */

export function mapOpportunity(r: Record<string, unknown>): Opportunity {
  return {
    id: String(r.name ?? ""),
    company: String(r.customer_name ?? r.party_name ?? r.opportunity_from ?? "\u2014"),
    amount: Number(r.opportunity_amount ?? 0),
    status: String(r.status ?? "Open").trim(),
    contact: String(r.contact_person ?? r.contact_display ?? "\u2014"),
    date: String(r.transaction_date ?? r.creation ?? ""),
  };
}

export function mapCustomer(r: Record<string, unknown>): Customer {
  return {
    id: String(r.name ?? ""),
    customerName: String(r.customer_name ?? r.name ?? ""),
    customerType: String(r.customer_type ?? "\u2014"),
    territory: String(r.territory ?? "\u2014"),
    outstanding: Number(r.outstanding_amount ?? 0),
  };
}

export function mapLead(r: Record<string, unknown>): Lead {
  return {
    id: String(r.name ?? ""),
    leadName: String(r.lead_name ?? r.name ?? ""),
    companyName: String(r.company_name ?? "\u2014"),
    source: String(r.source ?? "\u2014"),
    status: String(r.status ?? "Lead").trim(),
    email: String(r.email_id ?? "\u2014"),
    phone: String(r.phone ?? r.mobile_no ?? "\u2014"),
  };
}

/* ------------------------------------------------------------------ */
/*  Stats                                                              */
/* ------------------------------------------------------------------ */

export function deriveOppStats(rows: Opportunity[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  let pipeline = 0;
  let open = 0;
  let wonThisMonth = 0;
  let lostThisMonth = 0;
  for (const r of rows) {
    pipeline += r.amount;
    if (r.status === "Open") open++;
    const d = new Date(r.date);
    const sameMonth = d.getMonth() === month && d.getFullYear() === year;
    if (r.status === "Converted" && sameMonth) wonThisMonth++;
    if (r.status === "Lost" && sameMonth) lostThisMonth++;
  }
  return { pipeline, open, wonThisMonth, lostThisMonth };
}
