/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InvoicesListClient, type InvoiceRow } from "./InvoicesListClient";

/* ---------- mocks ---------- */

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/ui/Toasts", () => ({
  useToasts: () => ({ addToast: vi.fn() }),
}));

vi.mock("@/lib/locale/currency", () => ({
  formatCurrency: (amount: number, currency: string) => `${currency} ${amount.toFixed(2)}`,
}));

vi.mock("@/lib/locale/date", () => ({
  formatDate: (d: string) => d,
}));

vi.mock("@/lib/utils/csv", () => ({
  downloadCsv: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  api: { erp: { delete: vi.fn() } },
}));

vi.mock("@/components/ai/AIChatPanel", () => ({
  AIChatPanel: () => <div data-testid="ai-chat-panel" />,
}));

/* ---------- fixtures ---------- */

const mockInvoices: InvoiceRow[] = [
  {
    id: "INV-001",
    customer: "Acme Corp",
    amount: 1500,
    currency: "USD",
    status: "Paid",
    date: "2024-01-15",
    dueDate: "2024-02-15",
  },
  {
    id: "INV-002",
    customer: "Globex Inc",
    amount: 3200,
    currency: "USD",
    status: "Draft",
    date: "2024-01-20",
    dueDate: "2024-02-20",
  },
  {
    id: "INV-003",
    customer: "Wayne Enterprises",
    amount: 750,
    currency: "USD",
    status: "Overdue",
    date: "2024-01-10",
    dueDate: "2024-01-25",
  },
];

/* ---------- tests ---------- */

describe("InvoicesListClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders table with mock invoice data", () => {
    render(<InvoicesListClient invoices={mockInvoices} currentPage={0} hasMore={false} />);
    expect(screen.getByText("Invoices")).toBeTruthy();
    expect(screen.getAllByText("INV-001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Acme Corp").length).toBeGreaterThan(0);
    expect(screen.getAllByText("INV-002").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Globex Inc").length).toBeGreaterThan(0);
    expect(screen.getAllByText("INV-003").length).toBeGreaterThan(0);
  });

  it("renders empty state when invoices array is empty", () => {
    render(<InvoicesListClient invoices={[]} currentPage={0} hasMore={false} />);
    expect(screen.getByText("No invoices yet")).toBeTruthy();
    expect(screen.getByText("+ Create New")).toBeTruthy();
  });

  it("filter tabs render and switch active filter", () => {
    render(<InvoicesListClient invoices={mockInvoices} currentPage={0} hasMore={false} />);

    // All filter tabs are rendered
    const allBtn = screen.getByRole("button", { name: "All" });
    const paidBtn = screen.getByRole("button", { name: "Paid" });
    const draftBtn = screen.getByRole("button", { name: "Draft" });
    const overdueBtn = screen.getByRole("button", { name: "Overdue" });

    expect(allBtn).toBeTruthy();
    expect(paidBtn).toBeTruthy();
    expect(draftBtn).toBeTruthy();
    expect(overdueBtn).toBeTruthy();

    // Click "Paid" filter — only Paid invoice should remain visible
    fireEvent.click(paidBtn);
    expect(screen.getAllByText("INV-001").length).toBeGreaterThan(0);
    expect(screen.queryByText("INV-002")).toBeNull();
    expect(screen.queryByText("INV-003")).toBeNull();
  });

  it("search input accepts user input", () => {
    render(<InvoicesListClient invoices={mockInvoices} currentPage={0} hasMore={false} />);

    const searchInput = screen.getByPlaceholderText("Search invoices...");
    fireEvent.change(searchInput, { target: { value: "Acme" } });

    // Search is now server-side via URL params — input should accept the value
    expect((searchInput as HTMLInputElement).value).toBe("Acme");
  });

  it("renders custom title and subtitle", () => {
    render(
      <InvoicesListClient
        invoices={mockInvoices}
        currentPage={0}
        hasMore={false}
        title="Sales Orders"
        subtitle="Manage your orders"
      />,
    );
    expect(screen.getByText("Sales Orders")).toBeTruthy();
    expect(screen.getByText("Manage your orders")).toBeTruthy();
  });

  it("displays page number", () => {
    render(<InvoicesListClient invoices={mockInvoices} currentPage={2} hasMore={true} />);
    expect(screen.getByText("Page 3")).toBeTruthy();
  });
});
