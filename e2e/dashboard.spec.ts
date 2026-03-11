import { test, expect, type Page } from "@playwright/test";

/**
 * Helper: set up route mocks so that the dashboard pages render
 * without requiring a real backend. The middleware checks for a session
 * cookie, so we also inject one and mock the validate endpoint.
 */
async function setupAuthenticatedSession(page: Page) {
  const baseURL = process.env.BASE_URL ?? "http://localhost:3000";
  const domain = new URL(baseURL).hostname;

  // Set a fake session cookie so middleware doesn't redirect to /login
  await page.context().addCookies([
    {
      name: "westbridge_sid",
      value: "e2e-fake-session-token-abcdef1234567890",
      domain,
      path: "/",
    },
  ]);

  // Mock the auth validate endpoint to return 200 (session valid)
  await page.route("**/api/auth/validate", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: { name: "Test User", email: "test@example.com", role: "owner" },
      }),
    });
  });

  // Mock the CSRF endpoint
  await page.route("**/api/csrf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: { token: "mock-csrf-token" } }),
    });
  });

  // Mock the dashboard data endpoint
  await page.route("**/api/erp/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          revenueMTD: 125000,
          revenueChange: 12,
          outstandingCount: 5,
          openDealsCount: 8,
          employeeCount: 24,
          employeeDelta: 3,
          revenueData: [
            { month: "Oct", value: 1.8 },
            { month: "Nov", value: 2.1 },
            { month: "Dec", value: 1.9 },
            { month: "Jan", value: 2.4 },
            { month: "Feb", value: 2.7 },
            { month: "Mar", value: 3.1 },
          ],
          activity: [
            { text: "Invoice INV-001 paid", time: "2 hours ago", type: "success" },
            { text: "New customer added: Acme Corp", time: "5 hours ago", type: "info" },
          ],
          isDemo: true,
        },
      }),
    });
  });

  // Mock the health endpoint
  await page.route("**/api/health/ready", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok" }),
    });
  });
}

test.describe("Dashboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedSession(page);
  });

  test("dashboard page loads with greeting and KPI cards", async ({ page }) => {
    await page.goto("/dashboard");

    // Verify a greeting is displayed (Good morning/afternoon/evening)
    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 15_000 });

    // Verify the subtitle
    await expect(
      page.getByText("Here's what's happening at your account")
    ).toBeVisible();

    // Verify KPI metric cards are present
    await expect(page.getByText("Total Revenue")).toBeVisible();
    await expect(page.getByText("Active Users")).toBeVisible();
    await expect(page.getByText("Invoices")).toBeVisible();
    await expect(page.getByText("Pending Orders")).toBeVisible();

    // Verify Revenue chart section
    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Last 6 months")).toBeVisible();
  });

  test("dashboard shows recent activity and quick actions", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for dashboard to load
    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 15_000 });

    // Verify Recent Activity section
    await expect(page.getByText("Recent Activity")).toBeVisible();
    await expect(page.getByText("Invoice INV-001 paid")).toBeVisible();

    // Verify Quick Actions section
    await expect(page.getByText("Quick Actions")).toBeVisible();
    await expect(page.getByRole("link", { name: /new invoice/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /add expense/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /create quote/i })).toBeVisible();
  });

  test("sidebar navigation sections are present", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for the page to load
    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 15_000 });

    // The sidebar should have section labels for all main modules
    const sidebar = page.locator("aside, [data-sidebar]").first();
    await expect(sidebar).toBeVisible();

    // Verify key sidebar section titles
    await expect(sidebar.getByText("Overview")).toBeVisible();
    await expect(sidebar.getByText("Sales")).toBeVisible();
    await expect(sidebar.getByText("Purchasing")).toBeVisible();
    await expect(sidebar.getByText("Inventory")).toBeVisible();
    await expect(sidebar.getByText("Accounting")).toBeVisible();
    await expect(sidebar.getByText("HR")).toBeVisible();
    await expect(sidebar.getByText("Projects")).toBeVisible();
  });

  test("sidebar contains navigation links for key modules", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 15_000 });

    const sidebar = page.locator("aside, [data-sidebar]").first();

    // Verify specific navigation links within the sidebar
    await expect(sidebar.getByRole("link", { name: "Dashboard" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Quotations" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Customers" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Items" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Employees" })).toBeVisible();
    await expect(sidebar.getByRole("link", { name: "Settings" })).toBeVisible();
  });

  test("sidebar Settings link navigates to settings page", async ({ page }) => {
    // Mock additional endpoints that settings page may call
    await page.route("**/api/erp/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: [] }),
      });
    });

    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 15_000 });

    const sidebar = page.locator("aside, [data-sidebar]").first();

    // Click the Settings link
    await sidebar.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/dashboard\/settings/);
  });

  test("ERP connection status badge is shown", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 15_000 });

    // Since we mocked health to return 200, expect "ERP Connected"
    await expect(page.getByText("ERP Connected")).toBeVisible({ timeout: 10_000 });
  });

  test("demo data warning banner is displayed when isDemo is true", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(
      page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
    ).toBeVisible({ timeout: 15_000 });

    // Verify the demo data warning
    await expect(page.getByText(/sample data/i)).toBeVisible();
  });
});
