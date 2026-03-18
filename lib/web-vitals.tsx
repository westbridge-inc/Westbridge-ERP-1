"use client";

import { useReportWebVitals } from "next/web-vitals";
import { posthog } from "@/lib/analytics/posthog.client";

/**
 * Reports Core Web Vitals (CLS, INP, LCP, FCP, TTFB) to PostHog.
 *
 * Uses Next.js's built-in `useReportWebVitals` hook which is backed by the
 * `web-vitals` library bundled with Next.js — no extra dependency needed.
 *
 * Render this component once in the dashboard layout (client-side only).
 */
export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Only report if PostHog is initialised
    if (typeof window === "undefined") return;
    try {
      posthog.capture("web_vital", {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
      });
    } catch {
      // PostHog may not be initialised — silently ignore
    }
  });

  return null;
}
