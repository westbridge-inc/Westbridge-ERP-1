/**
 * Catch-all API proxy route handler.
 * Proxies allowed /api/* requests to the backend, forwarding cookies and security headers.
 *
 * Only paths matching ALLOWED_PATH_PREFIXES are forwarded. All other paths
 * return 404 to prevent exposure of internal backend routes.
 */
import { NextRequest } from "next/server";

import { BACKEND_URL } from "@/lib/env-server";

/**
 * Allowlist of API path prefixes that may be proxied to the backend.
 * Any request whose pathname does not start with one of these is rejected.
 */
const ALLOWED_PATH_PREFIXES = [
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/change-password",
  "/api/auth/2fa/",
  "/api/erp/",
  "/api/invite",
  "/api/admin/",
  // Bare-path variants for routes that have BOTH a top-level handler (e.g.
  // GET /api/audit listing) AND sub-paths (GET /api/audit/export). The
  // trailing-slash entry only matches sub-paths via startsWith — the bare
  // entry catches the listing endpoint that would otherwise 404.
  "/api/audit",
  "/api/team",
  "/api/account/",
  "/api/billing/",
  "/api/ai/",
  "/api/analytics/",
  // Both `/api/health` (bare — load balancer probes) AND `/api/health/live`
  // + `/api/health/ready` (k8s-style sub-paths). The trailing-slash variant
  // covers the latter; the bare variant covers the former.
  "/api/health",
  "/api/events/",
  "/api/webhooks/",
  // Bare /api/reports lists generated reports; /api/reports/:jobId fetches one.
  // Same trailing-slash gotcha as audit / team.
  "/api/reports",
  "/api/leads/",
  "/api/signup",
  "/api/modules",
  "/api/flags",
  "/api/settings/",
  "/api/document/",
  "/api/sso/",
  // Cortex (AI-Native overhaul). Streaming SSE responses for /api/cortex/chat
  // are detected via Content-Type below and forwarded as a ReadableStream
  // instead of being buffered.
  "/api/cortex/",
] as const;

function isAllowedPath(pathname: string): boolean {
  return ALLOWED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

async function proxyRequest(request: NextRequest) {
  const url = new URL(request.url);

  // Reject paths not in the allowlist
  if (!isAllowedPath(url.pathname)) {
    return new Response(JSON.stringify({ error: { code: "NOT_FOUND", message: "Route not found" } }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const backendUrl = `${BACKEND_URL}${url.pathname}${url.search}`;

  const headers: Record<string, string> = {};

  // Forward essential headers for auth and fingerprint matching
  const cookie = request.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;

  const ua = request.headers.get("user-agent");
  if (ua) headers["User-Agent"] = ua;

  const xff = request.headers.get("x-forwarded-for");
  if (xff) headers["X-Forwarded-For"] = xff;

  const contentType = request.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const csrfToken = request.headers.get("x-csrf-token");
  if (csrfToken) headers["x-csrf-token"] = csrfToken;

  try {
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
    };

    // Forward body for non-GET/HEAD requests
    if (request.method !== "GET" && request.method !== "HEAD") {
      fetchOptions.body = await request.text();
    }

    const backendRes = await fetch(backendUrl, fetchOptions);
    const backendContentType = backendRes.headers.get("content-type") ?? "application/json";

    const responseHeaders = new Headers({ "Content-Type": backendContentType });

    // Forward Set-Cookie headers from backend
    for (const c of backendRes.headers.getSetCookie()) {
      responseHeaders.append("Set-Cookie", c);
    }

    // Server-Sent Events: forward the ReadableStream directly so chunks reach
    // the browser as the backend writes them. Buffering with .text() would
    // collapse the stream into a single big payload and defeat the point of
    // SSE for the Cortex chat endpoint.
    if (backendContentType.startsWith("text/event-stream")) {
      // Add the headers SSE clients depend on for incremental delivery.
      responseHeaders.set("Cache-Control", "no-cache, no-transform");
      responseHeaders.set("Connection", "keep-alive");
      responseHeaders.set("X-Accel-Buffering", "no");
      return new Response(backendRes.body, {
        status: backendRes.status,
        headers: responseHeaders,
      });
    }

    // Default path: buffer the response. Keeps the existing behaviour for
    // every JSON / form / file endpoint we already proxy.
    const body = await backendRes.text();
    return new Response(body, {
      status: backendRes.status,
      headers: responseHeaders,
    });
  } catch {
    // Never expose internal error details to the client (CodeQL: js/stack-trace-exposure)
    return new Response(
      JSON.stringify({ error: { code: "PROXY_ERROR", message: "Unable to reach backend service" } }),
      { status: 502, headers: { "Content-Type": "application/json" } },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const DELETE = proxyRequest;
export const PATCH = proxyRequest;
