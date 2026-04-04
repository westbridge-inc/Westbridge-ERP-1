export interface RawInvoice {
  name?: string;
  grand_total?: number;
  outstanding_amount?: number;
  posting_date?: string;
  due_date?: string;
  status?: string;
  customer?: string;
  customer_name?: string;
  docstatus?: number;
}

export interface RawPayment {
  name?: string;
  paid_amount?: number;
  posting_date?: string;
  party?: string;
  party_name?: string;
  payment_type?: string;
  mode_of_payment?: string;
}

export interface GenericRow {
  id: string;
  [key: string]: unknown;
}

export type PageState = "loading" | "error" | "empty" | "success";

export interface TreeNode {
  id: string;
  accountName: string;
  accountType: string;
  rootType: string;
  isGroup: boolean;
  children: TreeNode[];
  level: number;
}
