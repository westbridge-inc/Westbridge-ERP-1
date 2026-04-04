/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with placeholder", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeTruthy();
  });

  it("accepts value and fires onChange", () => {
    const onChange = vi.fn();
    render(<Input value="hello" onChange={onChange} />);
    const input = screen.getByDisplayValue("hello") as HTMLInputElement;
    expect(input).toBeTruthy();
    fireEvent.change(input, { target: { value: "world" } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("shows disabled state", () => {
    render(<Input disabled placeholder="disabled" />);
    const input = screen.getByPlaceholderText("disabled") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("supports aria-invalid for error state", () => {
    render(<Input aria-invalid="true" placeholder="error" />);
    const input = screen.getByPlaceholderText("error");
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("has data-slot attribute", () => {
    render(<Input placeholder="test" />);
    const input = screen.getByPlaceholderText("test");
    expect(input.getAttribute("data-slot")).toBe("input");
  });

  it("supports custom className", () => {
    render(<Input placeholder="styled" className="custom-class" />);
    const input = screen.getByPlaceholderText("styled");
    expect(input.className).toMatch(/custom-class/);
  });

  it("renders with type=password", () => {
    render(<Input type="password" placeholder="password" />);
    const input = screen.getByPlaceholderText("password") as HTMLInputElement;
    expect(input.type).toBe("password");
  });
});
