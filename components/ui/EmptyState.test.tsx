/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders title", () => {
    render(<EmptyState title="No invoices found" />);
    expect(screen.getByText("No invoices found")).toBeTruthy();
  });

  it("renders description when provided", () => {
    render(<EmptyState title="No data" description="Try adjusting your filters" />);
    expect(screen.getByText("Try adjusting your filters")).toBeTruthy();
  });

  it("does not render description when not provided", () => {
    render(<EmptyState title="No data" />);
    expect(screen.queryByText("Try adjusting")).toBeNull();
  });

  it("renders action button when actionLabel and onAction provided", () => {
    const onAction = vi.fn();
    render(<EmptyState title="No items" actionLabel="Create item" onAction={onAction} />);
    const btn = screen.getByText("Create item");
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it("renders action as link when actionHref provided", () => {
    render(<EmptyState title="No items" actionLabel="Go to dashboard" actionHref="/dashboard" />);
    const link = screen.getByText("Go to dashboard");
    expect(link).toBeTruthy();
    // The link should be inside an anchor tag
    const anchor = link.closest("a");
    expect(anchor).toBeTruthy();
    expect(anchor!.getAttribute("href")).toBe("/dashboard");
  });

  it("hides button when no actionLabel", () => {
    render(<EmptyState title="No items" onAction={() => {}} />);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("hides button when actionLabel provided but no onAction/actionHref", () => {
    render(<EmptyState title="No items" actionLabel="Create item" />);
    expect(screen.queryByText("Create item")).toBeNull();
  });

  it("renders icon when provided", () => {
    render(<EmptyState title="Empty" icon={<svg data-testid="test-icon" />} />);
    expect(screen.getByTestId("test-icon")).toBeTruthy();
  });

  it("renders supportLine when provided", () => {
    render(<EmptyState title="Empty" supportLine="Need help? Contact support" />);
    expect(screen.getByText("Need help? Contact support")).toBeTruthy();
  });

  it("has role=status for accessibility", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.getByRole("status")).toBeTruthy();
  });
});
