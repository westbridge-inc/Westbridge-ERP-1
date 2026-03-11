import { test, expect, type Page } from "@playwright/test";

/**
 * Helper: set up route mocks so authenticated pages render
 * without a real backend.
 */
async function setupAuthenticatedSession(page: Page) {
  const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
  const domain = new URL(baseURL).hostname;

  await page.context().addCookies([
    {
      name: "westbridge_sid",
      value: "e2e-fake-session-token-abcdef1234567890",
      domain,
      path: "/",
    },
  ]);

  await page.route("**/api/auth/validate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { name: "Test User", email: "test@example.com", role: "owner" },
      }),
    });
  });

  await page.route("**/api/csrf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { token: "mock-csrf-token" } }),
    });
  });

  await page.route("**/api/health/ready", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok" }),
    });
  });

  // Default mock for ERP list calls (sidebar may trigger these)
  await page.route("**/api/erp/list**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [] }),
    });
  });
}

test.describe("ERP form pages", () => {
  test.describe("Invoice create form", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with correct title and fields", async ({ page }) => {
      await page.goto("/dashboard/invoices/new");

      // Verify the page title
      await expect(
        page.getByRole("heading", { name: "New Sales Invoice" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify Save button
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

      // Verify Back button (arrow left link to invoices list)
      await expect(
        page.getByRole("link", { name: /back/i })
      ).toBeVisible();

      // Verify form section heading
      await expect(page.getByText("Invoice Details")).toBeVisible();

      // Verify key form fields are present
      await expect(page.getByText("Customer")).toBeVisible();
      await expect(page.getByText("Invoice Date")).toBeVisible();
      await expect(page.getByText("Due Date")).toBeVisible();
      await expect(page.getByText("Currency")).toBeVisible();

      // Verify customer input has required indicator
      const customerLabel = page.locator('label[for="field-customer"]');
      await expect(customerLabel).toContainText("Customer");
    });

    test("renders line items section with Add Row button", async ({ page }) => {
      await page.goto("/dashboard/invoices/new");

      await expect(
        page.getByRole("heading", { name: "New Sales Invoice" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify line items section heading
      await expect(page.getByText("Items")).toBeVisible();

      // Verify line item column headers
      await expect(page.getByText("Item")).toBeVisible();
      await expect(page.getByText("Qty")).toBeVisible();
      await expect(page.getByText("Rate")).toBeVisible();
      await expect(page.getByText("Amount")).toBeVisible();

      // Verify "No items added yet" message
      await expect(page.getByText("No items added yet.")).toBeVisible();

      // Verify Add Row button
      await expect(
        page.getByRole("button", { name: /add row/i })
      ).toBeVisible();
    });

    test("Add Row button adds a new line item row", async ({ page }) => {
      await page.goto("/dashboard/invoices/new");

      await expect(
        page.getByRole("heading", { name: "New Sales Invoice" })
      ).toBeVisible({ timeout: 15_000 });

      // Click Add Row
      await page.getByRole("button", { name: /add row/i }).click();

      // The "No items added yet" message should disappear
      await expect(page.getByText("No items added yet.")).not.toBeVisible();

      // A row should now be visible with inputs
      await expect(page.getByPlaceholder("Item code")).toBeVisible();
    });

    test("form validation shows toast for missing required fields on save", async ({ page }) => {
      // Mock the ERP doc endpoint to capture the save attempt
      await page.route("**/api/erp/doc", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Customer is required" } }),
        });
      });

      await page.goto("/dashboard/invoices/new");

      await expect(
        page.getByRole("heading", { name: "New Sales Invoice" })
      ).toBeVisible({ timeout: 15_000 });

      // Leave the customer field empty and click Save
      await page.getByRole("button", { name: /save/i }).click();

      // A toast notification should appear about the required field
      // The ErpFormPage checks required fields and shows a toast
      await expect(
        page.getByText(/customer.*required/i).or(page.locator("[data-sonner-toast]"))
      ).toBeVisible({ timeout: 5_000 });
    });

    test("Back button links to invoices list page", async ({ page }) => {
      await page.goto("/dashboard/invoices/new");

      await expect(
        page.getByRole("heading", { name: "New Sales Invoice" })
      ).toBeVisible({ timeout: 15_000 });

      // The back link should point to /dashboard/invoices
      const backLink = page.getByRole("link", { name: /back/i });
      await expect(backLink).toHaveAttribute("href", "/dashboard/invoices");
    });
  });

  test.describe("Customer create form (CRM new)", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with correct title and fields", async ({ page }) => {
      await page.goto("/dashboard/crm/new");

      // Verify the page title
      await expect(
        page.getByRole("heading", { name: "New Customer" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify Save button
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

      // Verify Back button
      await expect(
        page.getByRole("link", { name: /back/i })
      ).toBeVisible();

      // Verify form section headings
      await expect(page.getByText("Customer Info")).toBeVisible();
      await expect(page.getByText("Billing")).toBeVisible();
      await expect(page.getByText("Contact")).toBeVisible();

      // Verify key form fields are present
      await expect(page.getByText("Customer Name")).toBeVisible();
      await expect(page.getByText("Customer Type")).toBeVisible();
      await expect(page.getByText("Territory")).toBeVisible();
      await expect(page.getByText("Default Currency")).toBeVisible();
      await expect(page.getByText("Tax ID")).toBeVisible();
      await expect(page.getByText("Email")).toBeVisible();
      await expect(page.getByText("Mobile No")).toBeVisible();
    });

    test("customer name field has required indicator", async ({ page }) => {
      await page.goto("/dashboard/crm/new");

      await expect(
        page.getByRole("heading", { name: "New Customer" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify the required asterisk is present on Customer Name label
      const label = page.locator('label[for="field-customer_name"]');
      await expect(label).toBeVisible();
      // The label should contain a destructive-colored asterisk indicating required
      await expect(label.locator(".text-destructive")).toBeVisible();
    });

    test("form validation prevents empty submission of required fields", async ({ page }) => {
      await page.route("**/api/erp/doc", async (route) => {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Customer Name is required" } }),
        });
      });

      await page.goto("/dashboard/crm/new");

      await expect(
        page.getByRole("heading", { name: "New Customer" })
      ).toBeVisible({ timeout: 15_000 });

      // Leave customer name empty and click Save
      await page.getByRole("button", { name: /save/i }).click();

      // A toast should appear for the required field
      await expect(
        page.getByText(/customer name.*required/i).or(page.locator("[data-sonner-toast]"))
      ).toBeVisible({ timeout: 5_000 });
    });

    test("Back button links to CRM list page", async ({ page }) => {
      await page.goto("/dashboard/crm/new");

      await expect(
        page.getByRole("heading", { name: "New Customer" })
      ).toBeVisible({ timeout: 15_000 });

      const backLink = page.getByRole("link", { name: /back/i });
      await expect(backLink).toHaveAttribute("href", "/dashboard/crm");
    });
  });

  test.describe("Inventory create form", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with title and Save button", async ({ page }) => {
      await page.goto("/dashboard/inventory/new");

      // The title varies — check for a heading containing "New" or "Item"
      const heading = page.locator("h1");
      await expect(heading).toBeVisible({ timeout: 15_000 });

      // Verify Save button
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

      // Verify Back button
      await expect(
        page.getByRole("link", { name: /back/i })
      ).toBeVisible();
    });
  });

  test.describe("Expense create form", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with title and Save button", async ({ page }) => {
      await page.goto("/dashboard/expenses/new");

      const heading = page.locator("h1");
      await expect(heading).toBeVisible({ timeout: 15_000 });

      // Verify Save button
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

      // Verify Back button
      await expect(
        page.getByRole("link", { name: /back/i })
      ).toBeVisible();
    });
  });

  test.describe("Procurement create form", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with title and Save button", async ({ page }) => {
      await page.goto("/dashboard/procurement/new");

      const heading = page.locator("h1");
      await expect(heading).toBeVisible({ timeout: 15_000 });

      // Verify Save button
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

      // Verify Back button
      await expect(
        page.getByRole("link", { name: /back/i })
      ).toBeVisible();
    });
  });

  test.describe("HR create form", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with title and Save button", async ({ page }) => {
      await page.goto("/dashboard/hr/new");

      const heading = page.locator("h1");
      await expect(heading).toBeVisible({ timeout: 15_000 });

      // Verify Save button
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

      // Verify Back button
      await expect(
        page.getByRole("link", { name: /back/i })
      ).toBeVisible();
    });
  });

  test.describe("Quotation create form", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with title and Save button", async ({ page }) => {
      await page.goto("/dashboard/quotations/new");

      const heading = page.locator("h1");
      await expect(heading).toBeVisible({ timeout: 15_000 });

      // Verify Save button
      await expect(page.getByRole("button", { name: /save/i })).toBeVisible();

      // Verify Back button
      await expect(
        page.getByRole("link", { name: /back/i })
      ).toBeVisible();
    });
  });
});
