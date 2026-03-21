"use client";

import { use } from "react";
import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef, LineItemColumnDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "posting_date",
    label: "Posting Date",
    type: "date",
    required: true,
    defaultValue: new Date().toISOString().slice(0, 10),
    section: "Entry Details",
  },
  {
    key: "title",
    label: "Title",
    type: "text",
    placeholder: "e.g. Monthly closing entry",
    section: "Entry Details",
  },
  {
    key: "voucher_type",
    label: "Voucher Type",
    type: "select",
    options: [
      { value: "Journal Entry", label: "Journal Entry" },
      { value: "Bank Entry", label: "Bank Entry" },
      { value: "Cash Entry", label: "Cash Entry" },
    ],
    defaultValue: "Journal Entry",
    section: "Entry Details",
  },
  {
    key: "total_debit",
    label: "Total Debit",
    type: "currency",
    section: "Entry Details",
    readOnly: true,
  },
  {
    key: "total_credit",
    label: "Total Credit",
    type: "currency",
    section: "Entry Details",
    readOnly: true,
  },
];

const LINE_ITEMS: LineItemColumnDef[] = [
  { key: "account", label: "Account", type: "text", placeholder: "Account name" },
  { key: "debit_in_account_currency", label: "Debit", type: "currency", placeholder: "0.00" },
  { key: "credit_in_account_currency", label: "Credit", type: "currency", placeholder: "0.00" },
  {
    key: "party_type",
    label: "Party Type",
    type: "select",
    options: [
      { value: "", label: "None" },
      { value: "Customer", label: "Customer" },
      { value: "Supplier", label: "Supplier" },
      { value: "Employee", label: "Employee" },
    ],
  },
  { key: "party", label: "Party", type: "text", placeholder: "Party name" },
];

export default function JournalEntryDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  return (
    <ErpFormPage
      title={`Journal Entry ${decodeURIComponent(name)}`}
      doctype="Journal Entry"
      name={decodeURIComponent(name)}
      fields={FIELDS}
      backHref="/dashboard/accounting?type=journal"
      lineItemColumns={LINE_ITEMS}
      lineItemLabel="Accounts"
      lineItemChildKey="accounts"
    />
  );
}
