"use client";

import { use } from "react";
import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef, LineItemColumnDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "supplier",
    label: "Supplier",
    type: "text",
    required: true,
    placeholder: "e.g. Supplier Co.",
    section: "Order Details",
  },
  {
    key: "transaction_date",
    label: "Order Date",
    type: "date",
    required: true,
    defaultValue: new Date().toISOString().slice(0, 10),
    section: "Order Details",
  },
  {
    key: "schedule_date",
    label: "Required By",
    type: "date",
    section: "Order Details",
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
    section: "Order Details",
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

export default function PurchaseOrderDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  return (
    <ErpFormPage
      title={`Purchase Order ${decodeURIComponent(name)}`}
      doctype="Purchase Order"
      name={decodeURIComponent(name)}
      fields={FIELDS}
      backHref="/dashboard/procurement"
      lineItemColumns={LINE_ITEMS}
      lineItemLabel="Items"
      lineItemChildKey="items"
    />
  );
}
