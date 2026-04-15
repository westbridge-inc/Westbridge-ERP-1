/**
 * CSRF validation middleware for state-changing requests.
 * 
 * This middleware validates CSRF tokens on POST, PUT, DELETE, and PATCH requests
 * to prevent cross-site request forgery attacks.
 */

import { NextRequest, NextResponse } from "next/server";
import { COOKIE } from "@/lib/constants";

/**
 * Extract CSRF token from cookie header
 */
function getCsrfTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const match = cookie.match(new RegExp(`${COOKIE.CSRF_NAME}=([^;]+)`));
    if (match) {
      return match[1];
    }
  }
  return null;
}

/**
 * Validate CSRF token for state-changing requests.
 * Returns true if valid, false if invalid or missing.
 */
export function validateCsrfToken(request: NextRequest): boolean {
  const method = request.method.toUpperCase();
  
  // Only validate state-changing methods
  const stateChangingMethods = ["POST", "PUT", "DELETE", "PATCH"];
  if (!stateChangingMethods.includes(method)) {
    return true;
  }
  
  // Skip CSRF validation for health checks and CSRF endpoint itself
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Allow CSRF token fetch endpoint
  if (pathname === "/api/csrf") {
    return true;
  }
  
  // Allow health check endpoints
  if (pathname.startsWith("/api/health")) {
    return true;
  }
  
  // Get CSRF token from header
  const csrfTokenHeader = request.headers.get("x-csrf-token");
  if (!csrfTokenHeader) {
    return false;
  }
  
  // Get CSRF token from cookie
  const cookieHeader = request.headers.get("cookie");
  const csrfTokenCookie = getCsrfTokenFromCookie(cookieHeader);
  
  if (!csrfTokenCookie) {
    return false;
  }
  
  // Compare header token with cookie token (double-submit cookie pattern)
  return csrfTokenHeader === csrfTokenCookie;
}

/**
 * Create a CSRF validation error response
 */
export function createCsrfErrorResponse(): NextResponse {
  return NextResponse.json(
    { error: { code: "CSRF_INVALID", message: "Invalid or missing CSRF token" } },
    { status: 403 }
  );
}
