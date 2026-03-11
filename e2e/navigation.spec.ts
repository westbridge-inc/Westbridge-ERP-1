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

  await page.route("**/api/erp/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ data: [] }),
    });
  });
}

test.describe("Overall navigation", () => {
  test.describe("Public pages", () => {
    test("login page is accessible", async ({ page }) => {
      const response = await page.goto("/login");
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible({
        timeout: 10_000,
      });
    });

    test("signup page is accessible", async ({ page }) => {
      const response = await page.goto("/signup");
      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { name: "Tell us about your business" })
      ).toBeVisible({ timeout: 10_000 });
    });

    test("forgot-password page is accessible", async ({ page }) => {
      const response = await page.goto("/forgot-password");
      expect(response?.status()).toBe(200);
      await expect(
        page.getByRole("heading", { name: "Forgot your password?" })
      ).toBeVisible({ timeout: 10_000 });
    });

    test("reset-password page is accessible", async ({ page }) => {
      const response = await page.goto("/reset-password");
      expect(response?.status()).toBe(200);
      // Without a token, it shows invalid link message
      await expect(
        page.getByText("Invalid reset link")
      ).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe("404 page behavior", () => {
    test("shows 404 for an invalid route", async ({ page }) => {
      const response = await page.goto("/this-route-does-not-exist-at-all");

      // Next.js returns 404 for non-existent pages
      expect(response?.status()).toBe(404);
    });

    test("shows 404 for invalid dashboard sub-route", async ({ page }) => {
      await setupAuthenticatedSession(page);

      const response = await page.goto("/dashboard/this-page-does-not-exist");

      // Even with auth, non-existent dashboard pages should 404
      expect(response?.status()).toBe(404);
    });
  });

  test.describe("Authenticated page access", () => {
    test.beforeEach(async ({ page }) => {
      await setupAuthenticatedSession(page);

      // Mock the dashboard data so the dashboard page renders
      await page.route("**/api/erp/dashboard", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              revenueMTD: 100000,
              revenueChange: 5,
              outstandingCount: 3,
              openDealsCount: 7,
              employeeCount: 20,
              employeeDelta: 1,
              revenueData: [],
              activity: [],
              isDemo: false,
            },
          }),
        });
      });
    });

    test("all main dashboard routes are accessible", async ({ page }) => {
      // Test each main route loads without redirecting to login
      const routes = [
        { path: "/dashboard", heading: /good (morning|afternoon|evening)/i },
        { path: "/dashboard/invoices", heading: /invoices/i },
        { path: "/dashboard/crm", heading: /crm pipeline/i },
        { path: "/dashboard/inventory", heading: /inventory/i },
        { path: "/dashboard/expenses", heading: /expenses/i },
        { path: "/dashboard/procurement", heading: /purchase orders|procurement/i },
        { path: "/dashboard/hr", heading: /employees|hr/i },
        { path: "/dashboard/quotations", heading: /quotations/i },
        { path: "/dashboard/settings", heading: /settings/i },
      ];

      for (const route of routes) {
        await page.goto(route.path);

        // Verify we did NOT get redirected to login
        await expect(page).not.toHaveURL(/\/login/);

        // Verify the expected heading is present
        await expect(
          page.getByRole("heading", { name: route.heading })
        ).toBeVisible({ timeout: 15_000 });
      }
    });

    test("navigating from login link on forgot password goes to login", async ({ page }) => {
      await page.goto("/forgot-password");
      await expect(page.getByRole("heading", { name: "Forgot your password?" })).toBeVisible({
        timeout: 10_000,
      });

      await page.getByRole("link", { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/login/);
    });

    test("navigating from login page Get Started link goes to signup", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });

      await page.getByRole("link", { name: /get started/i }).click();
      await expect(page).toHaveURL(/\/signup/);
    });

    test("sidebar navigation: clicking Invoices item navigates correctly", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(
        page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
      ).toBeVisible({ timeout: 15_000 });

      const sidebar = page.locator("aside, [data-sidebar]").first();

      // Click "Sales Invoices" link in sidebar
      await sidebar.getByRole("link", { name: "Sales Invoices" }).click();
      await expect(page).toHaveURL(/\/dashboard\/invoices/);

      await expect(
        page.getByRole("heading", { name: /invoices/i })
      ).toBeVisible({ timeout: 15_000 });
    });

    test("sidebar navigation: clicking Customers item navigates to CRM", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(
        page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
      ).toBeVisible({ timeout: 15_000 });

      const sidebar = page.locator("aside, [data-sidebar]").first();

      await sidebar.getByRole("link", { name: "Customers" }).click();
      await expect(page).toHaveURL(/\/dashboard\/crm/);

      await expect(
        page.getByRole("heading", { name: /crm pipeline/i })
      ).toBeVisible({ timeout: 15_000 });
    });

    test("sidebar navigation: clicking Items navigates to Inventory", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(
        page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
      ).toBeVisible({ timeout: 15_000 });

      const sidebar = page.locator("aside, [data-sidebar]").first();

      await sidebar.getByRole("link", { name: "Items" }).click();
      await expect(page).toHaveURL(/\/dashboard\/inventory/);

      await expect(
        page.getByRole("heading", { name: /inventory/i })
      ).toBeVisible({ timeout: 15_000 });
    });

    test("sidebar navigation: clicking Employees navigates to HR", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(
        page.getByRole("heading", { name: /good (morning|afternoon|evening)/i })
      ).toBeVisible({ timeout: 15_000 });

      const sidebar = page.locator("aside, [data-sidebar]").first();

      await sidebar.getByRole("link", { name: "Employees" }).click();
      await expect(page).toHaveURL(/\/dashboard\/hr/);

      await expect(
        page.getByRole("heading", { name: /employees|hr/i })
      ).toBeVisible({ timeout: 15_000 });
    });
  });
});
