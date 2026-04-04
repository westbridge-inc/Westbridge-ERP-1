/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Select, SelectTrigger, SelectValue } from "./Select";

describe("Select", () => {
  it("renders trigger with placeholder", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByText("Select an option")).toBeTruthy();
  });

  it("renders trigger as a combobox role", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>,
    );
    expect(screen.getByRole("combobox")).toBeTruthy();
  });

  it("has data-slot attribute on trigger", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("data-slot")).toBe("select-trigger");
  });

  it("trigger is disabled when disabled", () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Disabled" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.hasAttribute("disabled") || trigger.getAttribute("data-disabled") !== null).toBe(true);
  });

  it("accepts custom className on trigger", () => {
    render(
      <Select>
        <SelectTrigger className="custom-select">
          <SelectValue placeholder="Styled" />
        </SelectTrigger>
      </Select>,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.className).toMatch(/custom-select/);
  });
});
