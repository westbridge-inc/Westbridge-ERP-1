"use client";

import { use } from "react";
import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "item_code",
    label: "Item Code",
    type: "text",
    required: true,
    section: "Item Details",
  },
  {
    key: "item_name",
    label: "Item Name",
    type: "text",
    required: true,
    section: "Item Details",
  },
  {
    key: "item_group",
    label: "Item Group",
    type: "text",
    section: "Item Details",
  },
  {
    key: "stock_uom",
    label: "Stock UOM",
    type: "select",
    options: [
      { value: "Nos", label: "Nos" },
      { value: "Kg", label: "Kg" },
      { value: "Ltr", label: "Ltr" },
      { value: "Box", label: "Box" },
      { value: "Set", label: "Set" },
    ],
    defaultValue: "Nos",
    section: "Stock",
  },
  {
    key: "valuation_method",
    label: "Valuation Method",
    type: "select",
    options: [
      { value: "FIFO", label: "FIFO" },
      { value: "Moving Average", label: "Moving Average" },
    ],
    section: "Stock",
  },
  {
    key: "default_warehouse",
    label: "Default Warehouse",
    type: "text",
    section: "Stock",
  },
  {
    key: "description",
    label: "Description",
    type: "textarea",
    section: "Description",
  },
];

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  return (
    <ErpFormPage
      title={`Item ${decodeURIComponent(name)}`}
      doctype="Item"
      name={decodeURIComponent(name)}
      fields={FIELDS}
      backHref="/dashboard/inventory"
    />
  );
}
