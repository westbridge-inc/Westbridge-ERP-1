/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("renders as a switch role", () => {
    render(<Switch />);
    expect(screen.getByRole("switch")).toBeTruthy();
  });

  it("defaults to unchecked state", () => {
    render(<Switch />);
    const el = screen.getByRole("switch");
    expect(el.getAttribute("data-state")).toBe("unchecked");
  });

  it("renders checked when defaultChecked", () => {
    render(<Switch defaultChecked />);
    const el = screen.getByRole("switch");
    expect(el.getAttribute("data-state")).toBe("checked");
  });

  it("toggles state on click", () => {
    render(<Switch />);
    const el = screen.getByRole("switch");
    expect(el.getAttribute("data-state")).toBe("unchecked");
    fireEvent.click(el);
    expect(el.getAttribute("data-state")).toBe("checked");
  });

  it("calls onCheckedChange when toggled", () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("is disabled when disabled prop is set", () => {
    render(<Switch disabled />);
    const el = screen.getByRole("switch");
    expect(el.getAttribute("disabled")).not.toBeNull();
  });

  it("has data-slot attribute", () => {
    render(<Switch />);
    const el = screen.getByRole("switch");
    expect(el.getAttribute("data-slot")).toBe("switch");
  });
});
