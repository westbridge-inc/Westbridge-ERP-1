"use client";

import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef, LineItemColumnDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "employee",
    label: "Employee",
    type: "text",
    required: true,
    placeholder: "Employee ID",
    section: "Claim Details",
  },
  {
    key: "posting_date",
    label: "Posting Date",
    type: "date",
    required: true,
    defaultValue: new Date().toISOString().slice(0, 10),
    section: "Claim Details",
  },
  {
    key: "total_claimed_amount",
    label: "Total Claimed Amount",
    type: "currency",
    section: "Claim Details",
  },
  {
    key: "remarks",
    label: "Remarks",
    type: "textarea",
    section: "Notes",
  },
];

const LINE_ITEMS: LineItemColumnDef[] = [
  { key: "expense_date", label: "Date", type: "date" },
  { key: "expense_type", label: "Expense Type", type: "text", placeholder: "e.g. Travel" },
  { key: "description", label: "Description", type: "text" },
  { key: "amount", label: "Amount", type: "currency" },
];

export default function NewExpenseClaimPage() {
  return (
    <ErpFormPage
      title="New Expense Claim"
      doctype="Expense Claim"
      fields={FIELDS}
      backHref="/dashboard/expenses"
      lineItemColumns={LINE_ITEMS}
      lineItemLabel="Expenses"
      lineItemChildKey="expenses"
    />
  );
}
