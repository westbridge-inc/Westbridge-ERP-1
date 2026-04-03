import { describe, it, expect } from "vitest";
import { formatDate, formatDateLong, formatDateTime, formatRelativeDate } from "./date";

describe("date", () => {
  const d = new Date("2025-03-15T12:00:00.000Z");
  describe("formatDate", () => {
    it("returns DD/MM/YYYY", () => {
      expect(formatDate(d)).toBe("15/03/2025");
    });
    it("accepts string", () => {
      const out = formatDate("2025-03-15");
      expect(out).toMatch(/^\d{2}\/\d{2}\/2025$/);
    });
  });
  describe("formatDateLong", () => {
    it("returns locale date string", () => {
      expect(formatDateLong(d)).toMatch(/15/);
      expect(formatDateLong(d)).toMatch(/2025/);
    });
  });
  describe("formatDateTime", () => {
    it("includes time", () => {
      expect(formatDateTime(d)).toMatch(/\d{1,2}:\d{2}/);
    });
  });
  describe("formatRelativeDate", () => {
    const now = new Date("2025-03-15T14:30:00.000Z");
    it("returns 'Just now' for < 1 min", () => {
      const recent = new Date(now.getTime() - 30_000);
      expect(formatRelativeDate(recent, now)).toBe("Just now");
    });
    it("returns minutes ago", () => {
      const fiveMinAgo = new Date(now.getTime() - 5 * 60_000);
      expect(formatRelativeDate(fiveMinAgo, now)).toBe("5 minutes ago");
    });
    it("returns singular minute", () => {
      const oneMinAgo = new Date(now.getTime() - 60_000);
      expect(formatRelativeDate(oneMinAgo, now)).toBe("1 minute ago");
    });
    it("returns hours ago", () => {
      const twoHrsAgo = new Date(now.getTime() - 2 * 60 * 60_000);
      expect(formatRelativeDate(twoHrsAgo, now)).toBe("2 hours ago");
    });
    it("returns 'Yesterday'", () => {
      const yesterday = new Date("2025-03-14T10:00:00.000Z");
      expect(formatRelativeDate(yesterday, now)).toBe("Yesterday");
    });
    it("returns weekday name within 7 days", () => {
      const threeDaysAgo = new Date("2025-03-12T12:00:00.000Z");
      const result = formatRelativeDate(threeDaysAgo, now);
      expect(result).toBe("Wednesday");
    });
    it("returns absolute date for older dates", () => {
      const old = new Date("2025-02-01T12:00:00.000Z");
      const result = formatRelativeDate(old, now);
      expect(result).toMatch(/1/);
      expect(result).toMatch(/Feb/);
      expect(result).toMatch(/2025/);
    });
  });
});
