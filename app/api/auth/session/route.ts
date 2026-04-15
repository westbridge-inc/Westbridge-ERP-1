/**
 * POST /api/auth/session — Sets the session cookie from a token provided in the request body.
 * Called after successful login to set the httpOnly cookie via a fetch request.
 *
 * Replaces the previous GET-with-token-in-URL approach to prevent session tokens
 * from appearing in browser history, server logs, and referrer headers.
 */
import { NextRequest, NextResponse } from "next/server";

const SESSION_TOKEN_REGEX = /^[A-Za-z0-9\-_]+$/;

/**
 * Open redirect protection: only allow same-origin redirects to a path
 * starting with a single forward slash. Reject anything else (//evil.com,
 * https://evil.com, javascript:, etc.). Also blocks URL-encoded bypasses,
 * backslash tricks, and protocol-relative URLs.
 */
function isSafeRedirect(redirect: string): boolean {
  if (typeof redirect !== "string") return false;
  
  // Decode any URL-encoded characters to catch encoded bypasses
  let decoded = redirect;
  try {
    decoded = decodeURIComponent(redirect);
  } catch {
    // Invalid encoding — reject
    return false;
  }
  
  // Must start with exactly one forward slash
  if (!decoded.startsWith("/")) return false;
  
  // Reject protocol-relative URLs (//evil.com)
  if (decoded.startsWith("//")) return false;
  
  // Reject backslash tricks (/\\evil.com or /\/\/evil.com)
  if (decoded.includes("\\") || decoded.includes("://")) return false;
  
  // Reject any attempt to include @ for credential injection
  if (decoded.includes("@")) return false;
  
  // Only allow simple paths starting with /
  // Pattern: starts with / but not followed by another /
  const normalized = decoded.replace(/\/+/g, "/");
  if (!normalized.startsWith("/") || normalized.startsWith("//")) return false;
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { token?: string; redirect?: string };
    const token = body?.token;
    const requestedRedirect = body?.redirect;
    const redirect = requestedRedirect && isSafeRedirect(requestedRedirect) ? requestedRedirect : "/dashboard";

    if (!token || typeof token !== "string" || !SESSION_TOKEN_REGEX.test(token)) {
      return NextResponse.json(
        { error: { code: "INVALID_TOKEN", message: "Invalid or missing session token" } },
        { status: 400 },
      );
    }

    const res = NextResponse.json({ data: { success: true, redirect } });
    res.cookies.set("westbridge_sid", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    // Non-sensitive flag readable by client JS (navbar auth state).
    // Contains no secrets — just signals "a session exists".
    res.cookies.set("westbridge_logged_in", "1", {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch {
    return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Invalid request body" } }, { status: 400 });
  }
}
