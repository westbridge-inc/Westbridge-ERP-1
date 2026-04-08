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

// Next.js sets NEXT_PHASE during build — runtime env vars aren't available
// during the build phase, so skip validation then. The check still runs at
// actual runtime when each request comes in.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

function validateBackendUrl(): string {
  const url = process.env.BACKEND_URL;
  if (!url) {
    if (NODE_ENV === "production" && !isBuildPhase) {
      throw new Error(
        "BACKEND_URL environment variable is required in production. " + "Set it via fly secrets or Railway variables.",
      );
    }
    return "http://localhost:4000"; // Build-time placeholder
  }
  if (NODE_ENV === "production" && !isBuildPhase && !url.startsWith("https://")) {
    throw new Error(`BACKEND_URL must use HTTPS in production (got ${url})`);
  }
  return url;
}

export const BACKEND_URL = validateBackendUrl();
