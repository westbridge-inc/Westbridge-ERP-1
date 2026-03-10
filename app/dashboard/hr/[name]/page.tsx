"use client";

import { use } from "react";
import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "employee_name",
    label: "Employee Name",
    type: "text",
    required: true,
    section: "Personal",
  },
  {
    key: "gender",
    label: "Gender",
    type: "select",
    options: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Other", label: "Other" },
    ],
    section: "Personal",
  },
  {
    key: "date_of_birth",
    label: "Date of Birth",
    type: "date",
    section: "Personal",
  },
  {
    key: "company",
    label: "Company",
    type: "text",
    section: "Employment",
  },
  {
    key: "department",
    label: "Department",
    type: "text",
    section: "Employment",
  },
  {
    key: "designation",
    label: "Designation",
    type: "text",
    section: "Employment",
  },
  {
    key: "date_of_joining",
    label: "Date of Joining",
    type: "date",
    required: true,
    defaultValue: new Date().toISOString().slice(0, 10),
    section: "Employment",
  },
  {
    key: "status",
    label: "Status",
    type: "select",
    options: [
      { value: "Active", label: "Active" },
      { value: "Inactive", label: "Inactive" },
      { value: "Suspended", label: "Suspended" },
      { value: "Left", label: "Left" },
    ],
    defaultValue: "Active",
    section: "Employment",
  },
];

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = use(params);
  return (
    <ErpFormPage
      title={`Employee ${decodeURIComponent(name)}`}
      doctype="Employee"
      name={decodeURIComponent(name)}
      fields={FIELDS}
      backHref="/dashboard/hr"
    />
  );
}
