import { test, expect, type Page } from "@playwright/test";

/**
 * Helper: mock backend APIs so authenticated dashboard pages render
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
}

/**
 * Helper: mock the ERP list endpoint to return sample data for a given doctype.
 */
function mockErpList(page: Page, sampleData: Record<string, unknown>[]) {
  return page.route("**/api/erp/list**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: sampleData }),
    });
  });
}

test.describe("ERP list pages", () => {
  test.describe("Invoices list page", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with heading and Create New button", async ({ page }) => {
      await mockErpList(page, [
        {
          name: "INV-001",
          customer_name: "Acme Corp",
          grand_total: 5000,
          currency: "USD",
          status: "Unpaid",
          posting_date: "2025-01-15",
          due_date: "2025-02-15",
        },
        {
          name: "INV-002",
          customer_name: "Beta Inc",
          grand_total: 3200,
          currency: "USD",
          status: "Paid",
          posting_date: "2025-01-20",
          due_date: "2025-02-20",
        },
      ]);

      await page.goto("/dashboard/invoices");

      // Verify page heading
      await expect(
        page.getByRole("heading", { name: "Invoices" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify subtitle
      await expect(page.getByText("Manage and track invoices")).toBeVisible();

      // Verify Create New button
      await expect(page.getByRole("button", { name: /create new/i })).toBeVisible();

      // Verify table headers are present
      await expect(page.getByText("Invoice #")).toBeVisible();
      await expect(page.getByText("Customer")).toBeVisible();
      await expect(page.getByText("Amount")).toBeVisible();
      await expect(page.getByText("Status")).toBeVisible();

      // Verify data is rendered
      await expect(page.getByText("INV-001")).toBeVisible();
      await expect(page.getByText("Acme Corp")).toBeVisible();
    });

    test("shows filter tabs", async ({ page }) => {
      await mockErpList(page, [
        {
          name: "INV-001",
          customer_name: "Acme Corp",
          grand_total: 5000,
          currency: "USD",
          status: "Unpaid",
          posting_date: "2025-01-15",
          due_date: "2025-02-15",
        },
      ]);

      await page.goto("/dashboard/invoices");

      await expect(
        page.getByRole("heading", { name: "Invoices" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify filter buttons
      await expect(page.getByRole("button", { name: "All" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Draft" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Unpaid" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Paid" })).toBeVisible();
      await expect(page.getByRole("button", { name: "Overdue" })).toBeVisible();
    });

    test("Create New button navigates to new invoice form", async ({ page }) => {
      await mockErpList(page, []);

      await page.goto("/dashboard/invoices");

      await expect(
        page.getByRole("heading", { name: "Invoices" })
      ).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: /create new/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/invoices\/new/);
    });

    test("shows search input for filtering invoices", async ({ page }) => {
      await mockErpList(page, [
        {
          name: "INV-001",
          customer_name: "Acme Corp",
          grand_total: 5000,
          currency: "USD",
          status: "Paid",
          posting_date: "2025-01-15",
          due_date: "2025-02-15",
        },
      ]);

      await page.goto("/dashboard/invoices");

      await expect(
        page.getByRole("heading", { name: "Invoices" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify search input
      await expect(page.getByPlaceholder("Search invoices...")).toBeVisible();
    });
  });

  test.describe("CRM page", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with heading and Create New button", async ({ page }) => {
      // CRM uses direct fetch, not useErpList — mock the specific endpoint
      await page.route("**/api/erp/list?doctype=Opportunity**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                name: "OPP-001",
                party_name: "Acme Corp",
                opportunity_amount: 50000,
                contact_person: "John Doe",
                status: "Open",
                creation: "2025-01-15",
              },
              {
                name: "OPP-002",
                party_name: "Beta Inc",
                opportunity_amount: 25000,
                contact_person: "Jane Smith",
                status: "Quotation",
                creation: "2025-01-20",
              },
            ],
          }),
        });
      });

      await page.goto("/dashboard/crm");

      // Verify page heading
      await expect(
        page.getByRole("heading", { name: "CRM Pipeline" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify subtitle
      await expect(
        page.getByText("Track deals through your sales pipeline")
      ).toBeVisible();

      // Verify Create New button/link
      await expect(
        page.getByRole("link", { name: /create new/i })
      ).toBeVisible();
    });

    test("renders kanban columns for deal stages", async ({ page }) => {
      await page.route("**/api/erp/list?doctype=Opportunity**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: [
              {
                name: "OPP-001",
                party_name: "Acme Corp",
                opportunity_amount: 50000,
                contact_person: "John Doe",
                status: "Open",
                creation: "2025-01-15",
              },
            ],
          }),
        });
      });

      await page.goto("/dashboard/crm");

      await expect(
        page.getByRole("heading", { name: "CRM Pipeline" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify kanban column headers appear (at least "Open")
      await expect(page.getByRole("heading", { name: "Open" })).toBeVisible();

      // Verify deal card content
      await expect(page.getByText("Acme Corp")).toBeVisible();
    });

    test("Create New link navigates to new CRM form", async ({ page }) => {
      await page.route("**/api/erp/list**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: [] }),
        });
      });

      await page.goto("/dashboard/crm");

      await expect(
        page.getByRole("heading", { name: "CRM Pipeline" })
      ).toBeVisible({ timeout: 15_000 });

      await page.getByRole("link", { name: /create new/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/crm\/new/);
    });
  });

  test.describe("Inventory page", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with heading, metric cards, and Create New button", async ({ page }) => {
      await mockErpList(page, [
        {
          name: "ITEM-001",
          item_name: "Widget A",
          default_warehouse: "Main Warehouse",
          total_projected_qty: 50,
          valuation_rate: 25,
          stock_uom: "Nos",
        },
        {
          name: "ITEM-002",
          item_name: "Gadget B",
          default_warehouse: "Main Warehouse",
          total_projected_qty: 3,
          valuation_rate: 100,
          stock_uom: "Nos",
        },
      ]);

      await page.goto("/dashboard/inventory");

      // Verify page heading
      await expect(
        page.getByRole("heading", { name: "Inventory" })
      ).toBeVisible({ timeout: 15_000 });

      // Verify subtitle
      await expect(
        page.getByText("Stock levels and warehouse management")
      ).toBeVisible();

      // Verify Create New button
      await expect(page.getByRole("button", { name: /create new/i })).toBeVisible();

      // Verify metric cards
      await expect(page.getByText("Total Items")).toBeVisible();
      await expect(page.getByText("Low Stock")).toBeVisible();
      await expect(page.getByText("Out of Stock")).toBeVisible();
      await expect(page.getByText("Total Value")).toBeVisible();

      // Verify table headers
      await expect(page.getByText("Item")).toBeVisible();
      await expect(page.getByText("Warehouse")).toBeVisible();
      await expect(page.getByText("Qty")).toBeVisible();
      await expect(page.getByText("UOM")).toBeVisible();
    });

    test("Create New button navigates to new inventory form", async ({ page }) => {
      await mockErpList(page, []);

      await page.goto("/dashboard/inventory");

      await expect(
        page.getByRole("heading", { name: "Inventory" })
      ).toBeVisible({ timeout: 15_000 });

      await page.getByRole("button", { name: /create new/i }).click();
      await expect(page).toHaveURL(/\/dashboard\/inventory\/new/);
    });
  });

  test.describe("Expenses page", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with heading and Create New button", async ({ page }) => {
      await mockErpList(page, []);

      await page.goto("/dashboard/expenses");

      // Verify page heading
      await expect(
        page.getByRole("heading", { name: /expenses/i })
      ).toBeVisible({ timeout: 15_000 });

      // Verify Create New button
      await expect(page.getByRole("button", { name: /create new/i }).or(
        page.getByRole("link", { name: /create new/i })
      )).toBeVisible();
    });
  });

  test.describe("Procurement page", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with heading and Create New button", async ({ page }) => {
      await mockErpList(page, []);

      await page.goto("/dashboard/procurement");

      // Verify page heading
      await expect(
        page.getByRole("heading", { name: /purchase orders|procurement/i })
      ).toBeVisible({ timeout: 15_000 });

      // Verify Create New button
      await expect(page.getByRole("button", { name: /create new/i }).or(
        page.getByRole("link", { name: /create new/i })
      )).toBeVisible();
    });
  });

  test.describe("HR page", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with heading and Create New button", async ({ page }) => {
      await mockErpList(page, []);

      await page.goto("/dashboard/hr");

      // Verify page heading
      await expect(
        page.getByRole("heading", { name: /employees|hr/i })
      ).toBeVisible({ timeout: 15_000 });

      // Verify Create New button
      await expect(page.getByRole("button", { name: /create new/i }).or(
        page.getByRole("link", { name: /create new/i })
      )).toBeVisible();
    });
  });

  test.describe("Quotations page", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);
    });

    test("renders with heading and Create New button", async ({ page }) => {
      await mockErpList(page, []);

      await page.goto("/dashboard/quotations");

      // Verify page heading
      await expect(
        page.getByRole("heading", { name: /quotations/i })
      ).toBeVisible({ timeout: 15_000 });

      // Verify Create New button
      await expect(page.getByRole("button", { name: /create new/i }).or(
        page.getByRole("link", { name: /create new/i })
      )).toBeVisible();
    });
  });
});
