/**
 * Server-side environment validation for the Next.js frontend.
 *
 * Validates that BACKEND_URL is set and is HTTPS in production. Crashes
 * the server at startup if missing — fail fast instead of silently falling
 * through to localhost defaults.
 *
 * Use this in API route handlers and Server Components instead of
 * `process.env.BACKEND_URL ?? "http://localhost:4000"` defaults.
 */

const NODE_ENV = process.env.NODE_ENV ?? "development";

function validateBackendUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    if (NODE_ENV === "production") {
      throw new Error(
        "BACKEND_URL environment variable is required in production. " + "Set it via fly secrets or Railway variables.",
      );
    }
    return "http://localhost:4000";
  }
  if (NODE_ENV === "production" && !url.startsWith("https://")) {
    throw new Error(`BACKEND_URL must use HTTPS in production (got ${url})`);
  }
  return url;
}

export const BACKEND_URL = validateBackendUrl();
