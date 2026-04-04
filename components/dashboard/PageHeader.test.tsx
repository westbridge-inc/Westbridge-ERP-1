/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders title", () => {
    render(<PageHeader title="Invoices" />);
    expect(screen.getByText("Invoices")).toBeTruthy();
  });

  it("renders title as h1 heading", () => {
    render(<PageHeader title="Invoices" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeTruthy();
    expect(heading.textContent).toBe("Invoices");
  });

  it("renders description when provided", () => {
    render(<PageHeader title="Invoices" description="Manage your invoices" />);
    expect(screen.getByText("Manage your invoices")).toBeTruthy();
  });

  it("does not render description when not provided", () => {
    render(<PageHeader title="Invoices" />);
    // Only the heading should be present, no paragraph in the title section
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.parentElement?.querySelectorAll("p").length).toBe(0);
  });

  it("renders action when provided", () => {
    render(<PageHeader title="Invoices" action={<button>Create Invoice</button>} />);
    expect(screen.getByText("Create Invoice")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Create Invoice" })).toBeTruthy();
  });

  it("does not render action container when no action", () => {
    const { container } = render(<PageHeader title="Invoices" />);
    // Only the title div should be present, no action div
    const topLevelChildren = container.firstElementChild!.children;
    expect(topLevelChildren.length).toBe(1);
  });
});
