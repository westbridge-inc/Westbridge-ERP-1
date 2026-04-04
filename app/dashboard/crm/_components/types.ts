export interface Opportunity {
  id: string;
  company: string;
  amount: number;
  status: string;
  contact: string;
  date: string;
}

export interface Customer {
  id: string;
  customerName: string;
  customerType: string;
  territory: string;
  outstanding: number;
}

export interface Lead {
  id: string;
  leadName: string;
  companyName: string;
  source: string;
  status: string;
  email: string;
  phone: string;
}

export type CrmView = "opportunities" | "customers" | "leads";

export const TAB_CONFIG: { key: CrmView; label: string; doctype: string }[] = [
  { key: "opportunities", label: "Opportunities", doctype: "Opportunity" },
  { key: "customers", label: "Customers", doctype: "Customer" },
  { key: "leads", label: "Leads", doctype: "Lead" },
];

export const OPP_STATUSES = ["All", "Open", "Quotation", "Converted", "Lost", "Replied"];
export const LEAD_STATUSES = ["All", "Lead", "Open", "Replied", "Converted", "Do Not Contact"];
