/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders with label text", () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeTruthy();
  });

  it("renders as a checkbox input", () => {
    render(<Checkbox label="Agree" />);
    expect(screen.getByRole("checkbox")).toBeTruthy();
  });

  it("toggles checked state on click", () => {
    render(<Checkbox label="Toggle me" />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("calls onChange when toggled", () => {
    const onChange = vi.fn();
    render(<Checkbox label="Change" onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is set", () => {
    render(<Checkbox label="Disabled" disabled />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });

  it("renders with defaultChecked", () => {
    render(<Checkbox label="Pre-checked" defaultChecked />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("label and input are linked via htmlFor/id", () => {
    render(<Checkbox label="Linked" />);
    const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
    const label = checkbox.closest("label");
    expect(label).toBeTruthy();
    expect(label!.getAttribute("for")).toBe(checkbox.id);
  });
});
