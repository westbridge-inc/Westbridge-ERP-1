/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders with animate-pulse class", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.className).toMatch(/animate-pulse/);
  });

  it("renders with rounded-md and bg-muted classes", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/rounded-md/);
    expect(el.className).toMatch(/bg-muted/);
  });

  it("accepts custom className", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toMatch(/h-4/);
    expect(el.className).toMatch(/w-32/);
  });

  it("has data-slot attribute", () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("data-slot")).toBe("skeleton");
  });

  it("passes through additional HTML attributes", () => {
    const { container } = render(<Skeleton aria-label="Loading" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("aria-label")).toBe("Loading");
  });
});
