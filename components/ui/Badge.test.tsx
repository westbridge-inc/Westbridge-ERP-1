/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders with text content", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeTruthy();
  });

  it("applies default variant class when no variant specified", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el.className).toMatch(/bg-primary/);
  });

  it("applies success variant class", () => {
    render(<Badge variant="success">Paid</Badge>);
    const el = screen.getByText("Paid");
    expect(el.className).toMatch(/bg-success/);
  });

  it("applies destructive variant class", () => {
    render(<Badge variant="destructive">Overdue</Badge>);
    const el = screen.getByText("Overdue");
    expect(el.className).toMatch(/bg-destructive/);
  });

  it("applies warning variant class", () => {
    render(<Badge variant="warning">Pending</Badge>);
    const el = screen.getByText("Pending");
    expect(el.className).toMatch(/bg-warning/);
  });

  it("applies outline variant class", () => {
    render(<Badge variant="outline">Draft</Badge>);
    const el = screen.getByText("Draft");
    expect(el.className).toMatch(/border-border/);
  });

  it("status 'Paid' auto-maps to success variant", () => {
    render(<Badge status="Paid">Paid</Badge>);
    const el = screen.getByText("Paid");
    expect(el.className).toMatch(/bg-success/);
  });

  it("status 'Draft' auto-maps to outline variant", () => {
    render(<Badge status="Draft">Draft</Badge>);
    const el = screen.getByText("Draft");
    expect(el.className).toMatch(/border-border/);
  });

  it("status 'Overdue' auto-maps to destructive variant", () => {
    render(<Badge status="Overdue">Overdue</Badge>);
    const el = screen.getByText("Overdue");
    expect(el.className).toMatch(/bg-destructive/);
  });

  it("status 'Pending' auto-maps to warning variant", () => {
    render(<Badge status="Pending">Pending</Badge>);
    const el = screen.getByText("Pending");
    expect(el.className).toMatch(/bg-warning/);
  });

  it("unknown status falls back to secondary variant", () => {
    render(<Badge status="CustomUnknown">CustomUnknown</Badge>);
    const el = screen.getByText("CustomUnknown");
    expect(el.className).toMatch(/bg-secondary/);
  });

  it("explicit variant takes precedence over status", () => {
    render(
      <Badge variant="destructive" status="Paid">
        Paid
      </Badge>,
    );
    const el = screen.getByText("Paid");
    expect(el.className).toMatch(/bg-destructive/);
  });

  it("has data-slot attribute", () => {
    render(<Badge>Slot</Badge>);
    const el = screen.getByText("Slot");
    expect(el.getAttribute("data-slot")).toBe("badge");
  });
});
