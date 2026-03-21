"use client";

import { use } from "react";
import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "project_name",
    label: "Project Name",
    type: "text",
    required: true,
    placeholder: "Enter project name",
    section: "Project Details",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Open", label: "Open" },
      { value: "Completed", label: "Completed" },
      { value: "Cancelled", label: "Cancelled" },
    ],
    defaultValue: "Open",
    section: "Project Details",
  },
  {
    key: "expected_start_date",
    label: "Expected Start Date",
    type: "date",
    section: "Project Details",
  },
  {
    key: "expected_end_date",
    label: "Expected End Date",
    type: "date",
    section: "Project Details",
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Project notes...",
    section: "Notes",
  },
];

export default function ProjectDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = use(params);
  return (
    <ErpFormPage
      title={`Project ${decodeURIComponent(name)}`}
      doctype="Project"
      name={decodeURIComponent(name)}
      fields={FIELDS}
      backHref="/dashboard/projects"
    />
  );
}
