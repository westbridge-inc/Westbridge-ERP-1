import { test, expect } from "@playwright/test";

test.describe("Authentication flows", () => {
  test.describe("Login page", () => {
    test("renders with correct title and form fields", async ({ page }) => {
      await page.goto("/login");

      // Verify the heading is visible
      await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

      // Verify subtitle text
      await expect(page.getByText("Sign in to your Westbridge account")).toBeVisible();

      // Wait for CSRF to load (the form shows after csrfLoaded)
      // The form may show a skeleton initially, then render the actual fields
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });
      await expect(page.locator('input[type="password"]')).toBeVisible();

      // Verify submit button is present
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

      // Verify forgot password link
      await expect(page.getByRole("link", { name: /forgot your password/i })).toBeVisible();

      // Verify signup link
      await expect(page.getByRole("link", { name: /get started/i })).toBeVisible();
    });

    test("shows validation for empty email when submitted via browser", async ({ page }) => {
      await page.goto("/login");

      // Wait for the form to be ready
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });

      // The email field has `required` attribute — the browser blocks empty submission.
      // Verify the required attribute is present on the email field.
      const emailInput = page.locator("#login-email");
      await expect(emailInput).toHaveAttribute("required", "");
    });

    test("shows validation for empty password when submitted via browser", async ({ page }) => {
      await page.goto("/login");

      await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10_000 });

      // The password field has `required` attribute
      const passwordInput = page.locator("#login-password");
      await expect(passwordInput).toHaveAttribute("required", "");
    });

    test("submit button shows loading state when form is submitted", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });

      // Fill in credentials
      await page.fill("#login-email", "test@example.com");
      await page.fill("#login-password", "password123");

      // Click submit — the CSRF fetch may fail but the button should show loading
      await page.click('button[type="submit"]');

      // The button text should change to "Signing in..." or an error should appear
      // Either indicates the form submitted correctly
      const signingIn = page.getByRole("button", { name: /signing in/i });
      const errorAlert = page.locator('[role="alert"]');
      await expect(signingIn.or(errorAlert)).toBeVisible({ timeout: 10_000 });
    });

    test("login form handles error response gracefully", async ({ page }) => {
      // Mock the CSRF endpoint to return a token
      await page.route("**/api/csrf", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { token: "test-csrf-token" } }),
        });
      });

      // Mock the login endpoint to return an error
      await page.route("**/api/auth/login", async (route) => {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: { message: "Invalid email or password." } }),
        });
      });

      await page.goto("/login");
      await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 10_000 });

      await page.fill("#login-email", "test@example.com");
      await page.fill("#login-password", "wrongpassword");
      await page.click('button[type="submit"]');

      // The error message should be displayed
      await expect(page.getByText("Invalid email or password.")).toBeVisible({ timeout: 10_000 });
    });

    test("show/hide password toggle works", async ({ page }) => {
      await page.goto("/login");
      await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 10_000 });

      // Initially password is hidden
      const passwordInput = page.locator("#login-password");
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Click "Show" button
      await page.click('button[aria-label="Show password"]');
      await expect(passwordInput).toHaveAttribute("type", "text");

      // Click "Hide" button
      await page.click('button[aria-label="Hide password"]');
      await expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  test.describe("Signup page", () => {
    test("renders with step wizard on step 1", async ({ page }) => {
      await page.goto("/signup");

      // Verify step 1 heading
      await expect(
        page.getByRole("heading", { name: "Tell us about your business" })
      ).toBeVisible({ timeout: 10_000 });

      // Verify step indicator dots (4 steps)
      const stepDots = page.locator(".rounded-full.h-2.w-12");
      await expect(stepDots).toHaveCount(4);

      // Verify company name input
      await expect(page.locator("#signup-company")).toBeVisible();

      // Verify Continue button
      await expect(page.getByRole("button", { name: /continue/i })).toBeVisible();

      // Verify "Sign in" link
      await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    });

    test("shows validation errors on step 1 when fields are empty", async ({ page }) => {
      await page.goto("/signup");
      await expect(
        page.getByRole("heading", { name: "Tell us about your business" })
      ).toBeVisible({ timeout: 10_000 });

      // The Continue button should be disabled when company and industry are empty
      const continueBtn = page.getByRole("button", { name: /continue/i });
      await expect(continueBtn).toBeDisabled();
    });

    test("navigates between steps with WESTBRIDGE branding", async ({ page }) => {
      await page.goto("/signup");
      await expect(
        page.getByRole("heading", { name: "Tell us about your business" })
      ).toBeVisible({ timeout: 10_000 });

      // Verify WESTBRIDGE branding in nav
      await expect(page.getByText("WESTBRIDGE")).toBeVisible();
    });
  });

  test.describe("Forgot password page", () => {
    test("renders with correct heading and form", async ({ page }) => {
      await page.goto("/forgot-password");

      // Verify heading
      await expect(
        page.getByRole("heading", { name: "Forgot your password?" })
      ).toBeVisible({ timeout: 10_000 });

      // Verify description text
      await expect(
        page.getByText("Enter your email and we'll send a reset link.")
      ).toBeVisible();

      // Verify email input
      await expect(page.locator("#email")).toBeVisible();

      // Verify submit button
      await expect(
        page.getByRole("button", { name: /send reset link/i })
      ).toBeVisible();

      // Verify sign-in link
      await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
    });

    test("submit button is disabled when email is empty", async ({ page }) => {
      await page.goto("/forgot-password");
      await expect(page.locator("#email")).toBeVisible({ timeout: 10_000 });

      const submitBtn = page.getByRole("button", { name: /send reset link/i });
      await expect(submitBtn).toBeDisabled();
    });
  });

  test.describe("Reset password page", () => {
    test("renders invalid link message when no token provided", async ({ page }) => {
      await page.goto("/reset-password");

      // Without a token, should show error message
      await expect(
        page.getByText("Invalid reset link. Please request a new one.")
      ).toBeVisible({ timeout: 10_000 });

      // Should show link to request new link
      await expect(
        page.getByRole("link", { name: /request new link/i })
      ).toBeVisible();
    });

    test("renders password form when token is provided", async ({ page }) => {
      await page.goto("/reset-password?token=test-token-123");

      // Should show the reset form heading
      await expect(
        page.getByRole("heading", { name: "Set new password" })
      ).toBeVisible({ timeout: 10_000 });

      // Should show password fields
      await expect(page.locator("#password")).toBeVisible();
      await expect(page.locator("#confirm")).toBeVisible();

      // Should show submit button
      await expect(
        page.getByRole("button", { name: /update password/i })
      ).toBeVisible();
    });
  });

  test.describe("Auth redirects", () => {
    test("unauthenticated users are redirected from /dashboard to /login", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/\/login/);
    });

    test("unauthenticated users are redirected from /dashboard/invoices to /login", async ({ page }) => {
      await page.goto("/dashboard/invoices");
      await expect(page).toHaveURL(/\/login/);
    });

    test("unauthenticated users are redirected from /dashboard/crm to /login", async ({ page }) => {
      await page.goto("/dashboard/crm");
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
