/**
 * Caribbean date/time formatting. DD/MM/YYYY, America/Guyana timezone.
 */

import { LOCALE } from "@/lib/constants";

/** Format date as DD/MM/YYYY */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Format date for display in locale (e.g. "15 Mar 2025") */
export function formatDateLong(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: LOCALE.DEFAULT_TIMEZONE,
  });
}

/** Format datetime with time in locale */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: LOCALE.DEFAULT_TIMEZONE,
  });
}

/**
 * Smart date: relative for recent dates, absolute for older.
 *   - < 1 min  → "Just now"
 *   - < 1 hour → "12 minutes ago"
 *   - < 24 hrs → "3 hours ago"
 *   - yesterday → "Yesterday"
 *   - < 7 days → "Monday" (weekday name)
 *   - older    → "03 Apr 2026" (formatDateLong)
 */
export function formatRelativeDate(date: Date | string, now?: Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const ref = now ?? new Date();
  const diffMs = ref.getTime() - d.getTime();

  // Future dates or invalid — fall back to absolute
  if (diffMs < 0 || Number.isNaN(diffMs)) return formatDateLong(d);

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;

  // Check if it was yesterday (calendar day)
  const yesterday = new Date(ref);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()
  ) {
    return "Yesterday";
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    return d.toLocaleDateString("en-GB", { weekday: "long", timeZone: LOCALE.DEFAULT_TIMEZONE });
  }

  return formatDateLong(d);
}
