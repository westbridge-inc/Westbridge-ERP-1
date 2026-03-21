"use client";

import { use } from "react";
import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef, LineItemColumnDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "item",
    label: "Item",
    type: "text",
    required: true,
    placeholder: "Item name or code",
    section: "BOM Details",
  },
  {
    key: "quantity",
    label: "Quantity",
    type: "number",
    required: true,
    placeholder: "1",
    defaultValue: 1,
    section: "BOM Details",
  },
  {
    key: "is_active",
    label: "Is Active",
    type: "select",
    options: [
      { value: "1", label: "Yes" },
      { value: "0", label: "No" },
    ],
    defaultValue: "1",
    section: "BOM Details",
  },
  {
    key: "is_default",
    label: "Is Default",
    type: "select",
    options: [
      { value: "1", label: "Yes" },
      { value: "0", label: "No" },
    ],
    defaultValue: "0",
    section: "BOM Details",
  },
];

const LINE_ITEMS: LineItemColumnDef[] = [
  { key: "item_code", label: "Item Code", type: "text", placeholder: "e.g. ITEM-001" },
  { key: "qty", label: "Qty", type: "number" },
  { key: "rate", label: "Rate", type: "currency" },
  {
    key: "amount",
    label: "Amount",
    type: "currency",
    computed: (row) => Number(row.qty || 0) * Number(row.rate || 0),
  },
];

export default function BomDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  return (
    <ErpFormPage
      title={`BOM ${decodeURIComponent(name)}`}
      doctype="BOM"
      name={decodeURIComponent(name)}
      fields={FIELDS}
      backHref="/dashboard/manufacturing"
      lineItemColumns={LINE_ITEMS}
      lineItemLabel="Raw Materials"
      lineItemChildKey="items"
    />
  );
}
