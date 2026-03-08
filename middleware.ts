import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COOKIE } from "@/lib/constants";

// Tokens are base64url — only these characters are valid.
// Reject anything else before forwarding in a Cookie header to prevent
// HTTP header injection (CRLF injection via a malformed cookie value).
const SESSION_TOKEN_REGEX = /^[A-Za-z0-9\-_]+$/;

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get(COOKIE.SESSION_NAME)?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Reject malformed tokens immediately — never forward them in a header.
    if (!SESSION_TOKEN_REGEX.test(sessionToken)) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(COOKIE.SESSION_NAME);
      return response;
    }

    // Validate the session is real, not expired, and not revoked.
    // FAIL CLOSED: any error (network, timeout, unexpected) redirects to /login.
    // A 5-second timeout prevents a hung validation service from blocking all
    // dashboard requests, and ensures we never silently pass unauthenticated
    // requests through on service degradation.
    try {
      const validateUrl = new URL("/api/auth/validate", request.url);
      const res = await fetch(validateUrl.toString(), {
        method: "GET",
        headers: {
          Cookie: `${COOKIE.SESSION_NAME}=${sessionToken}`,
          "User-Agent": request.headers.get("user-agent") ?? "",
          "X-Forwarded-For": request.headers.get("x-forwarded-for") ?? "",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });

      if (!res.ok) {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete(COOKIE.SESSION_NAME);
        return response;
      }
    } catch {
      // Fail closed: network error, timeout, or any unexpected failure means
      // we cannot confirm the session is valid — redirect to login.
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(COOKIE.SESSION_NAME);
      return response;
    }
  }

  // On /login, only redirect to /dashboard if the token passes the same
  // validation check. A stale/revoked token should not cause a redirect loop.
  if (pathname === "/login" && sessionToken) {
    if (!SESSION_TOKEN_REGEX.test(sessionToken)) {
      const response = NextResponse.next();
      response.cookies.delete(COOKIE.SESSION_NAME);
      return response;
    }
    try {
      const validateUrl = new URL("/api/auth/validate", request.url);
      const res = await fetch(validateUrl.toString(), {
        method: "GET",
        headers: {
          Cookie: `${COOKIE.SESSION_NAME}=${sessionToken}`,
          "User-Agent": request.headers.get("user-agent") ?? "",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(5_000),
      });
      if (res.ok) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // Cannot validate — stay on /login.
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
