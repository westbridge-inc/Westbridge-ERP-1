/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCard } from "./MetricCard";
import { DollarSign } from "lucide-react";

describe("MetricCard", () => {
  it("renders label and value", () => {
    render(<MetricCard label="Revenue" value="$12,345" />);
    expect(screen.getByText("Revenue")).toBeDefined();
    expect(screen.getByText("$12,345")).toBeDefined();
  });

  it("has accessible region with aria-label", () => {
    render(<MetricCard label="Total Sales" value={42} />);
    expect(screen.getByRole("region", { name: "Total Sales" })).toBeDefined();
  });

  it("renders positive trend indicator", () => {
    render(<MetricCard label="Growth" value="15%" trend={5.2} subtext="+5.2% vs last month" />);
    expect(screen.getByText("+5.2% vs last month")).toBeDefined();
  });

  it("renders negative trend indicator", () => {
    render(<MetricCard label="Churn" value="3%" trend={-1.5} subtext="-1.5% vs last month" />);
    expect(screen.getByText("-1.5% vs last month")).toBeDefined();
  });

  it("renders neutral trend (zero)", () => {
    render(<MetricCard label="Flat" value="0%" trend={0} subtext="No change" />);
    expect(screen.getByText("No change")).toBeDefined();
  });

  it("renders with an icon", () => {
    render(<MetricCard label="Revenue" value="$50K" icon={DollarSign} />);
    expect(screen.getByRole("region", { name: "Revenue" })).toBeDefined();
  });

  it("applies success subtext variant", () => {
    render(<MetricCard label="Profit" value="$10K" subtext="Up 10%" subtextVariant="success" />);
    const subtextEl = screen.getByText("Up 10%");
    expect(subtextEl.className).toMatch(/success/);
  });

  it("applies error subtext variant", () => {
    render(<MetricCard label="Loss" value="$5K" subtext="Down 5%" subtextVariant="error" />);
    const subtextEl = screen.getByText("Down 5%");
    expect(subtextEl.className).toMatch(/destructive/);
  });

  it("applies default (muted) subtext variant", () => {
    render(<MetricCard label="Pending" value="12" subtext="Awaiting review" subtextVariant="default" />);
    const subtextEl = screen.getByText("Awaiting review");
    expect(subtextEl.className).toMatch(/muted/);
  });

  it("renders without subtext or trend", () => {
    render(<MetricCard label="Count" value={99} />);
    expect(screen.getByText("99")).toBeDefined();
    // No subtext row should be present
    expect(screen.queryByText(/vs/)).toBeNull();
  });
});
