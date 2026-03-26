import { ErpFormPage } from "@/components/dashboard/ErpFormPage";
import type { FormFieldDef } from "@/components/dashboard/ErpFormPage";

const FIELDS: FormFieldDef[] = [
  {
    key: "customer_name",
    label: "Customer Name",
    type: "text",
    required: true,
    section: "Customer Info",
  },
  {
    key: "customer_type",
    label: "Customer Type",
    type: "select",
    options: [
      { value: "Company", label: "Company" },
      { value: "Individual", label: "Individual" },
    ],
    section: "Customer Info",
  },
  {
    key: "customer_group",
    label: "Customer Group",
    type: "text",
    section: "Customer Info",
  },
  {
    key: "territory",
    label: "Territory",
    type: "text",
    section: "Customer Info",
  },
  {
    key: "default_currency",
    label: "Default Currency",
    type: "select",
    options: [
      { value: "USD", label: "USD" },
      { value: "GYD", label: "GYD" },
      { value: "EUR", label: "EUR" },
      { value: "GBP", label: "GBP" },
    ],
    section: "Billing",
  },
  {
    key: "tax_id",
    label: "Tax ID",
    type: "text",
    section: "Billing",
  },
  {
    key: "email_id",
    label: "Email",
    type: "text",
    placeholder: "email@example.com",
    section: "Contact",
  },
  {
    key: "mobile_no",
    label: "Mobile No",
    type: "text",
    section: "Contact",
  },
];

export default async function CustomerDetailPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return (
    <ErpFormPage
      title={`Customer ${decodeURIComponent(name)}`}
      doctype="Customer"
      name={decodeURIComponent(name)}
      fields={FIELDS}
      backHref="/dashboard/crm"
    />
  );
}
