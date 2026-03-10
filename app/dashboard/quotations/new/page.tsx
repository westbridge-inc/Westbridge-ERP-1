"use client";

import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef, LineItemColumnDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "party_name",
    label: "Customer",
    type: "text",
    required: true,
    placeholder: "Customer name",
    section: "Quote Details",
  },
  {
    key: "transaction_date",
    label: "Quotation Date",
    type: "date",
    required: true,
    defaultValue: new Date().toISOString().slice(0, 10),
    section: "Quote Details",
  },
  {
    key: "valid_till",
    label: "Valid Till",
    type: "date",
    section: "Quote Details",
  },
  {
    key: "currency",
    label: "Currency",
    type: "select",
    options: [
      { value: "USD", label: "USD" },
      { value: "GYD", label: "GYD" },
      { value: "EUR", label: "EUR" },
      { value: "GBP", label: "GBP" },
    ],
    defaultValue: "USD",
    section: "Quote Details",
  },
];

const LINE_ITEMS: LineItemColumnDef[] = [
  { key: "item_code", label: "Item", type: "text", placeholder: "Item code" },
  { key: "qty", label: "Qty", type: "number", placeholder: "0" },
  { key: "rate", label: "Rate", type: "currency", placeholder: "0.00" },
  {
    key: "amount",
    label: "Amount",
    type: "currency",
    computed: (row) => Number(row.qty ?? 0) * Number(row.rate ?? 0),
  },
];

export default function NewQuotationPage() {
  return (
    <ErpFormPage
      title="New Quotation"
      doctype="Quotation"
      fields={FIELDS}
      backHref="/dashboard/quotations"
      lineItemColumns={LINE_ITEMS}
      lineItemLabel="Items"
      lineItemChildKey="items"
    />
  );
}
