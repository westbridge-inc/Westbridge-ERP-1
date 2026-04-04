/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorState } from "./ErrorState";

describe("ErrorState", () => {
  it("renders default title and message", () => {
    render(<ErrorState message="Server returned 500" />);
    expect(screen.getByText("Something went wrong")).toBeTruthy();
    expect(screen.getByText("Server returned 500")).toBeTruthy();
  });

  it("renders custom title", () => {
    render(<ErrorState title="Failed to load invoices" message="Network error" />);
    expect(screen.getByText("Failed to load invoices")).toBeTruthy();
    expect(screen.getByText("Network error")).toBeTruthy();
  });

  it("renders retry button when onRetry provided", () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Error occurred" onRetry={onRetry} />);
    const retryBtn = screen.getByText("Try again");
    expect(retryBtn).toBeTruthy();
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("hides retry button when no onRetry", () => {
    render(<ErrorState message="Error occurred" />);
    expect(screen.queryByText("Try again")).toBeNull();
  });

  it("has role=alert for accessibility", () => {
    render(<ErrorState message="Something broke" />);
    expect(screen.getByRole("alert")).toBeTruthy();
  });
});
