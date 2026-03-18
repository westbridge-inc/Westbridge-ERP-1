/**
 * @vitest-environment happy-dom
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "./ErrorBoundary";

// Mock Sentry
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

function ThrowingComponent(): React.ReactNode {
  throw new Error("test crash");
}

function SafeComponent() {
  return <div>Safe content</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <SafeComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Safe content")).toBeDefined();
  });

  it("renders fallback on error", () => {
    // Suppress console.error from React's error boundary logging
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Something went wrong loading this section.")).toBeDefined();
    spy.mockRestore();
  });

  it("renders custom fallback on error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary fallback={<div>Custom error</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Custom error")).toBeDefined();
    spy.mockRestore();
  });

  it("reports to Sentry with boundary name", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const Sentry = await import("@sentry/nextjs");
    const { captureException } = Sentry;
    render(
      <ErrorBoundary boundary="test-widget">
        <ThrowingComponent />
      </ErrorBoundary>,
    );
    expect(captureException).toHaveBeenCalled();
    spy.mockRestore();
  });
});
