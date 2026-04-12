import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE } from "@/lib/constants";

// Tokens are base64url — only these characters are valid.
const SESSION_TOKEN_REGEX = /^[A-Za-z0-9\-_]+$/;

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:4000";

// ─── CSP helpers ────────────────────────────────────────────────────────────
// NOTE: Next.js injects inline scripts for hydration/data that cannot currently
// be given a nonce.  Until the framework supports nonce propagation to its own
// inline scripts, 'unsafe-inline' is required for script-src in production.
// The CSP is still valuable because it restricts connect-src, frame-ancestors,
// base-uri, form-action, and more — preventing many attack vectors.

const isProd = process.env.NODE_ENV === "production";
const apiHost = process.env.NEXT_PUBLIC_API_URL ?? "";
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "";
const posthogHost = process.env.POSTHOG_HOST ?? "https://app.posthog.com";

function buildCsp(): string {
  const scriptSrc = isProd
    ? "script-src 'self' 'unsafe-inline' https://cdn.paddle.com"
    : "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.paddle.com";

  const styleSrc = "style-src 'self' 'unsafe-inline'";

  const connectSrcParts = ["'self'"];
  if (apiHost) connectSrcParts.push(apiHost);
  if (sentryDsn) connectSrcParts.push("https://*.ingest.sentry.io", "https://*.ingest.de.sentry.io");
  if (posthogHost) connectSrcParts.push(posthogHost);
  // Paddle — payment gateway
  connectSrcParts.push("https://*.paddle.com", "https://cdn.paddle.com");

  const parts = [
    "default-src 'self'",
    scriptSrc,
    styleSrc,
    "img-src 'self' data: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSrcParts.join(" ")}`,
    "frame-src https://*.paddle.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ];

  if (isProd) {
    parts.push("upgrade-insecure-requests");
  }

  return parts.join("; ");
}

// Pre-compute the CSP string (it's the same for every request)
const CSP = buildCsp();

// ─── Middleware ──────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  // ── Basic Auth: Acquisition Staging Lock ─────────────────────────────
  const basicAuth = request.headers.get("authorization");
  // Credentials: admin / FrappeAcquisition2026
  if (basicAuth !== "Basic YWRtaW46RnJhcHBlQWNxdWlzaXRpb24yMDI2") {
    return new NextResponse("Acquisition Staging Environment — Authorization Required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Secure Area"' },
    });
  }

  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(COOKIE.SESSION_NAME)?.value;

  // ── Auth: protect /dashboard routes ──────────────────────────────────────

  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      return addSecurityHeaders(NextResponse.redirect(new URL("/login", request.url)));
    }

    if (!SESSION_TOKEN_REGEX.test(sessionToken)) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(COOKIE.SESSION_NAME);
      response.cookies.set("westbridge_logged_in", "", { maxAge: 0, path: "/" });
      return addSecurityHeaders(response);
    }

    try {
      const validateUrl = `${BACKEND_URL}/api/auth/validate`;
      const res = await fetch(validateUrl, {
        method: "GET",
        headers: {
          Cookie: `${COOKIE.SESSION_NAME}=${sessionToken}`,
          "User-Agent": request.headers.get("user-agent") ?? "",
          "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        // FAIL CLOSED — auth gating MUST NOT depend on backend being healthy.
        // 401/403: session is invalid → redirect.
        // 5xx / any other non-ok: we cannot prove the session is valid →
        // redirect to /login with a maintenance hint instead of letting an
        // unauthenticated request reach the dashboard. Do NOT clear the
        // cookie here — a transient backend hiccup should not log the user
        // out permanently; they can retry once the backend recovers.
        const loginUrl = new URL("/login", request.url);
        if (res.status >= 500) {
          loginUrl.searchParams.set("reason", "session_check_unavailable");
        }
        const response = NextResponse.redirect(loginUrl);
        if (res.status === 401 || res.status === 403) {
          // Only clear the cookie on an explicit auth rejection.
          response.cookies.delete(COOKIE.SESSION_NAME);
        }
        return addSecurityHeaders(response);
      }
    } catch {
      // Network error or timeout — fail CLOSED. Same rationale as above:
      // we cannot validate the session, so we must not authorize access.
      // The cookie is preserved so the user can retry immediately when the
      // backend recovers, without re-entering credentials.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("reason", "session_check_unavailable");
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  // ── Auth: redirect logged-in users away from /login ──────────────────────

  if (pathname === "/login" && sessionToken) {
    if (!SESSION_TOKEN_REGEX.test(sessionToken)) {
      const response = NextResponse.next();
      response.cookies.delete(COOKIE.SESSION_NAME);
      response.cookies.set("westbridge_logged_in", "", { maxAge: 0, path: "/" });
      return addSecurityHeaders(response);
    }
    try {
      const validateUrl = `${BACKEND_URL}/api/auth/validate`;
      const res = await fetch(validateUrl, {
        method: "GET",
        headers: {
          Cookie: `${COOKIE.SESSION_NAME}=${sessionToken}`,
          "User-Agent": request.headers.get("user-agent") ?? "",
          "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        return addSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
      }
    } catch {
      // Cannot validate — stay on /login.
    }
  }

  // ── Default: add security headers and continue ───────────────────────────

  return addSecurityHeaders(NextResponse.next());
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("Content-Security-Policy", CSP);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  if (isProd) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    {
      source: "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
