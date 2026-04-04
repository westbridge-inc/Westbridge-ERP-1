export interface PurchaseOrder {
  id: string;
  supplier: string;
  amount: number;
  orderDate: string;
  expected: string;
  status: string;
}

export interface SupplierRow {
  id: string;
  name: string;
  supplierType: string;
  country: string;
}

export const TYPE_CONFIG = {
  default: { doctype: "Purchase Order", title: "Purchase Orders", subtitle: "Track purchases from suppliers." },
  invoice: { doctype: "Purchase Invoice", title: "Purchase Invoices", subtitle: "Manage purchase invoices and bills" },
  supplier: { doctype: "Supplier", title: "Suppliers", subtitle: "Manage your suppliers" },
} as const;
