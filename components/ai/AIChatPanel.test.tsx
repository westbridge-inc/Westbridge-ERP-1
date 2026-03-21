/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AIChatPanel } from "./AIChatPanel";

/* ---------- mocks ---------- */

vi.mock("react-markdown", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <span>{children}</span>,
}));

/* ---------- tests ---------- */

describe("AIChatPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  it("renders the trigger button", () => {
    render(<AIChatPanel />);
    const btn = screen.getByRole("button", { name: /open ai assistant/i });
    expect(btn).toBeTruthy();
    expect(btn.textContent).toContain("Ask AI");
  });

  it("opens panel when trigger button is clicked", () => {
    render(<AIChatPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open ai assistant/i }));
    expect(screen.getByText("Bridge AI")).toBeTruthy();
    expect(screen.getByText("What do you want to know?")).toBeTruthy();
  });

  it("shows module-specific suggestions on empty state", () => {
    render(<AIChatPanel module="finance" />);
    fireEvent.click(screen.getByRole("button", { name: /open ai assistant/i }));
    expect(screen.getByText("Summarise last 30 days revenue")).toBeTruthy();
    expect(screen.getByText("Show overdue invoices")).toBeTruthy();
    expect(screen.getByText("What are my top 5 expenses?")).toBeTruthy();
  });

  it("shows general suggestions when no module specified", () => {
    render(<AIChatPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open ai assistant/i }));
    expect(screen.getByText("How is the business doing?")).toBeTruthy();
  });

  it("shows module badge in header", () => {
    render(<AIChatPanel module="crm" />);
    fireEvent.click(screen.getByRole("button", { name: /open ai assistant/i }));
    expect(screen.getByText("crm")).toBeTruthy();
  });

  it("has an input field for typing messages", () => {
    render(<AIChatPanel module="finance" />);
    fireEvent.click(screen.getByRole("button", { name: /open ai assistant/i }));
    const input = screen.getByPlaceholderText(/ask about your finance data/i);
    expect(input).toBeTruthy();
  });

  it("closes panel when close button is clicked", () => {
    render(<AIChatPanel />);
    fireEvent.click(screen.getByRole("button", { name: /open ai assistant/i }));
    expect(screen.getByText("Bridge AI")).toBeTruthy();

    // The close button is the X button in the header
    const closeButtons = document.querySelectorAll("button");
    // Find the button that contains the X icon in the panel header
    let closeBtn: HTMLButtonElement | null = null;
    closeButtons.forEach((btn) => {
      if (btn.querySelector(".lucide-x") || btn.querySelector("[class*='lucide']")) {
        // Check if this is inside the panel header
        const parent = btn.closest(".border-b");
        if (parent) closeBtn = btn;
      }
    });
    // Click the close button if found, otherwise look for it differently
    if (closeBtn) {
      fireEvent.click(closeBtn);
    } else {
      // Fallback: find by structure — it's the last button in the header div
      const headerDiv = screen.getByText("Bridge AI").closest("div.flex");
      if (headerDiv?.parentElement) {
        const buttons = headerDiv.parentElement.querySelectorAll("button");
        const lastButton = buttons[buttons.length - 1];
        if (lastButton) fireEvent.click(lastButton);
      }
    }
    expect(screen.queryByText("What do you want to know?")).toBeNull();
  });
});
