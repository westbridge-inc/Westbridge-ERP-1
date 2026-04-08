"use client";

import { useState, useEffect } from "react";

/**
 * Fetches and caches a CSRF token from the backend via the Next.js proxy.
 *
 * Returns null while loading. The token is fetched once on mount.
 * Use this in any component that needs to make CSRF-protected requests.
 *
 * @example
 *   const csrfToken = useCsrfToken();
 *   if (!csrfToken) return <Skeleton />;
 *   await fetch("/api/something", {
 *     headers: { "X-CSRF-Token": csrfToken },
 *     ...
 *   });
 */
export function useCsrfToken(): string | null {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchToken(): Promise<void> {
      try {
        const res = await fetch("/api/csrf", { credentials: "include" });
        if (!res.ok) return;
        const data = (await res.json()) as { data?: { token?: string }; token?: string };
        if (!cancelled) {
          // Support both response shapes for backwards compatibility
          setToken(data?.data?.token ?? data?.token ?? null);
        }
      } catch {
        // Silent fail — caller can detect null token
      }
    }

    fetchToken();

    return () => {
      cancelled = true;
    };
  }, []);

  return token;
}
