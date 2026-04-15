/**
 * Server-side environment validation for the Next.js frontend.
 *
 * Validates that BACKEND_URL is set and is HTTPS in production. Crashes
 * the server at startup if missing — fail fast instead of silently falling
 * through to localhost defaults. Also validates against DNS rebinding attacks
 * by rejecting private/internal IP ranges in production.
 *
 * Use this in API route handlers and Server Components instead of
 * `process.env.BACKEND_URL ?? "http://localhost:4000"` defaults.
 */

const NODE_ENV = process.env.NODE_ENV ?? "development";

// Next.js sets NEXT_PHASE during build — runtime env vars aren't available
// during the build phase, so skip validation then. The check still runs at
// actual runtime when each request comes in.
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

/**
 * Check if an IP address is in a private/internal range.
 * Returns true if the IP is private (RFC 1918) or loopback.
 */
function isPrivateIP(ip: string): boolean {
  // IPv4 private ranges
  const ipv4PrivateRanges = [
    /^10\./,                          // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,                    // 192.168.0.0/16
    /^127\./,                         // 127.0.0.0/8 (loopback)
    /^0\./,                           // 0.0.0.0/8
    /^169\.254\./,                    // 169.254.0.0/16 (link-local)
  ];
  
  // IPv6 private ranges
  const ipv6PrivatePatterns = [
    /^::1$/,                          // ::1 (loopback)
    /^fe80:/i,                        // fe80::/10 (link-local)
    /^fc00:/i,                        // fc00::/7 (unique local)
    /^fd[0-9a-f]{2}:/i,               // fd00::/8 (ULA)
  ];
  
  // Check IPv4
  for (const pattern of ipv4PrivateRanges) {
    if (pattern.test(ip)) return true;
  }
  
  // Check IPv6
  for (const pattern of ipv6PrivatePatterns) {
    if (pattern.test(ip)) return true;
  }
  
  return false;
}

/**
 * Validate that a URL does not point to a private/internal address.
 * Returns true if the URL is safe (public), false if private/dangerous.
 */
function isPublicURL(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;
    
    // Reject localhost explicitly
    if (hostname === "localhost" || hostname === "localhost.localdomain") {
      return false;
    }
    
    // Check if hostname is an IP address
    const ipv4Pattern = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
    const ipv6Pattern = /^\[?([0-9a-fA-F:]+)\]?$/;
    
    if (ipv4Pattern.test(hostname)) {
      return !isPrivateIP(hostname);
    }
    
    if (ipv6Pattern.test(hostname)) {
      const ipv6 = hostname.replace(/^\[|\]$/g, "");
      return !isPrivateIP(ipv6);
    }
    
    // For domain names, we can't do DNS resolution here synchronously.
    // In production, ensure your infrastructure prevents DNS rebinding.
    // This check catches obvious cases but relies on network-level protections
    // for full DNS rebinding prevention.
    return true;
  } catch {
    // Invalid URL
    return false;
  }
}

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
  
  // Additional security: reject private/internal URLs in production
  if (NODE_ENV === "production" && !isBuildPhase) {
    if (!isPublicURL(url)) {
      throw new Error(`BACKEND_URL must not point to a private/internal address (got ${url})`);
    }
  }
  
  return url;
}

export const BACKEND_URL = validateBackendUrl();
