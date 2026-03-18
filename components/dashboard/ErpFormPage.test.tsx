/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErpFormPage, type FormFieldDef } from "./ErpFormPage";

/* ---------- mocks ---------- */

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/api/client", () => ({
  api: { erp: { get: vi.fn(), create: vi.fn(), update: vi.fn() } },
}));

/* ---------- fixtures ---------- */

const basicFields: FormFieldDef[] = [
  {
    key: "customerName",
    label: "Customer Name",
    type: "text",
    required: true,
    placeholder: "Enter customer name",
  },
  {
    key: "amount",
    label: "Amount",
    type: "number",
    required: true,
    placeholder: "0.00",
  },
  {
    key: "invoiceDate",
    label: "Invoice Date",
    type: "date",
  },
  {
    key: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Add notes...",
  },
];

const sectionedFields: FormFieldDef[] = [
  { key: "name", label: "Name", type: "text", section: "Basic Info" },
  { key: "email", label: "Email", type: "text", section: "Basic Info" },
  { key: "address", label: "Address", type: "textarea", section: "Contact" },
];

/* ---------- tests ---------- */

describe("ErpFormPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    globalThis.fetch = vi.fn();
  });

  it("renders form fields from config", () => {
    render(
      <ErpFormPage title="New Invoice" doctype="Sales Invoice" fields={basicFields} backHref="/dashboard/invoices" />,
    );

    expect(screen.getByText("New Invoice")).toBeTruthy();
    expect(screen.getByText("Customer Name")).toBeTruthy();
    expect(screen.getByText("Amount")).toBeTruthy();
    expect(screen.getByText("Invoice Date")).toBeTruthy();
    expect(screen.getByText("Notes")).toBeTruthy();

    // Check placeholders
    expect(screen.getByPlaceholderText("Enter customer name")).toBeTruthy();
    expect(screen.getByPlaceholderText("0.00")).toBeTruthy();
    expect(screen.getByPlaceholderText("Add notes...")).toBeTruthy();
  });

  it("shows required field indicators", () => {
    render(
      <ErpFormPage title="New Invoice" doctype="Sales Invoice" fields={basicFields} backHref="/dashboard/invoices" />,
    );

    // Required fields have the asterisk (*) marker
    const labels = screen.getAllByText("*");
    expect(labels.length).toBe(2); // customerName and amount are required
  });

  it("shows loading skeleton in edit mode", () => {
    render(
      <ErpFormPage
        title="Edit Invoice"
        doctype="Sales Invoice"
        name="INV-001"
        fields={basicFields}
        backHref="/dashboard/invoices"
      />,
    );

    // In edit mode with name prop, loading state is shown initially
    // The skeleton uses animate-pulse classes - check that the title is NOT rendered
    // (since the skeleton replaces it with a placeholder div)
    const pulseElements = document.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("renders Save button in create mode", () => {
    render(
      <ErpFormPage title="New Invoice" doctype="Sales Invoice" fields={basicFields} backHref="/dashboard/invoices" />,
    );

    expect(screen.getByRole("button", { name: /save/i })).toBeTruthy();
  });

  it("renders Back navigation link", () => {
    render(
      <ErpFormPage title="New Invoice" doctype="Sales Invoice" fields={basicFields} backHref="/dashboard/invoices" />,
    );

    const backLink = screen.getByRole("link", { name: /back/i });
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute("href")).toBe("/dashboard/invoices");
  });

  it("renders field sections as grouped cards", () => {
    render(<ErpFormPage title="New Customer" doctype="Customer" fields={sectionedFields} backHref="/dashboard/crm" />);

    expect(screen.getByText("Basic Info")).toBeTruthy();
    expect(screen.getByText("Contact")).toBeTruthy();
  });

  it("allows typing in text fields", () => {
    render(
      <ErpFormPage title="New Invoice" doctype="Sales Invoice" fields={basicFields} backHref="/dashboard/invoices" />,
    );

    const nameInput = screen.getByPlaceholderText("Enter customer name") as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: "Acme Corp" } });
    expect(nameInput.value).toBe("Acme Corp");
  });

  it("renders line items section when lineItemColumns provided", () => {
    render(
      <ErpFormPage
        title="New Invoice"
        doctype="Sales Invoice"
        fields={basicFields}
        backHref="/dashboard/invoices"
        lineItemColumns={[
          { key: "item", label: "Item", type: "text" },
          { key: "qty", label: "Qty", type: "number" },
          { key: "rate", label: "Rate", type: "currency" },
        ]}
        lineItemLabel="Line Items"
      />,
    );

    expect(screen.getByText("Line Items")).toBeTruthy();
    expect(screen.getByText("No items added yet.")).toBeTruthy();
    expect(screen.getByRole("button", { name: /add row/i })).toBeTruthy();
  });

  it("adds a line item row when Add Row is clicked", () => {
    render(
      <ErpFormPage
        title="New Invoice"
        doctype="Sales Invoice"
        fields={basicFields}
        backHref="/dashboard/invoices"
        lineItemColumns={[
          { key: "item", label: "Item", type: "text" },
          { key: "qty", label: "Qty", type: "number" },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add row/i }));
    // After adding a row, "No items added yet." should be gone
    expect(screen.queryByText("No items added yet.")).toBeNull();
    // Row number 1 should appear
    expect(screen.getByText("1")).toBeTruthy();
  });
});
