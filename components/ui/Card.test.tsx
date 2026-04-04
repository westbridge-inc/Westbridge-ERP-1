/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card";

describe("Card", () => {
  it("renders Card with children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeTruthy();
  });

  it("Card has data-slot attribute", () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.firstElementChild!.getAttribute("data-slot")).toBe("card");
  });

  it("renders full Card composition", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Invoice #001</CardTitle>
          <CardDescription>Due in 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Line items go here</p>
        </CardContent>
        <CardFooter>
          <button>Pay now</button>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByText("Invoice #001")).toBeTruthy();
    expect(screen.getByText("Due in 30 days")).toBeTruthy();
    expect(screen.getByText("Line items go here")).toBeTruthy();
    expect(screen.getByText("Pay now")).toBeTruthy();
  });

  it("CardHeader has data-slot attribute", () => {
    const { container } = render(
      <Card>
        <CardHeader>Header</CardHeader>
      </Card>,
    );
    const header = container.querySelector("[data-slot='card-header']");
    expect(header).toBeTruthy();
  });

  it("CardTitle has data-slot attribute", () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
      </Card>,
    );
    const title = container.querySelector("[data-slot='card-title']");
    expect(title).toBeTruthy();
    expect(title!.textContent).toBe("Title");
  });

  it("CardContent has data-slot attribute", () => {
    const { container } = render(
      <Card>
        <CardContent>Body</CardContent>
      </Card>,
    );
    const content = container.querySelector("[data-slot='card-content']");
    expect(content).toBeTruthy();
  });

  it("CardFooter has data-slot attribute", () => {
    const { container } = render(
      <Card>
        <CardFooter>Footer</CardFooter>
      </Card>,
    );
    const footer = container.querySelector("[data-slot='card-footer']");
    expect(footer).toBeTruthy();
  });

  it("accepts custom className", () => {
    const { container } = render(<Card className="custom-card">Styled</Card>);
    expect(container.firstElementChild!.className).toMatch(/custom-card/);
  });
});
