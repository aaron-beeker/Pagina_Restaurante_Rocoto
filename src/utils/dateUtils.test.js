import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLocalDateString, formatDisplayDate } from "./dateUtils.js";

describe("dateUtils", () => {
  describe("getLocalDateString", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const date = new Date(2026, 4, 18, 12, 0, 0);
      const result = getLocalDateString(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should return correct date for known input", () => {
      const date = new Date(2026, 0, 15, 12, 0, 0);
      const result = getLocalDateString(date);
      expect(result).toBe("2026-01-15");
    });

    it("should use current date when no argument provided", () => {
      const today = new Date();
      const result = getLocalDateString();
      const expected = getLocalDateString(today);
      expect(result).toBe(expected);
    });

    it("should handle end of year correctly", () => {
      const date = new Date(2026, 11, 31, 12, 0, 0);
      const result = getLocalDateString(date);
      expect(result).toBe("2026-12-31");
    });

    it("should handle beginning of year correctly", () => {
      const date = new Date(2026, 0, 1, 12, 0, 0);
      const result = getLocalDateString(date);
      expect(result).toBe("2026-01-01");
    });
  });

  describe("formatDisplayDate", () => {
    it("should format YYYY-MM-DD to DD/MM/YYYY", () => {
      expect(formatDisplayDate("2026-05-18")).toBe("18/05/2026");
    });

    it("should handle single digit month and day", () => {
      expect(formatDisplayDate("2026-01-05")).toBe("05/01/2026");
    });

    it("should return --- for empty string", () => {
      expect(formatDisplayDate("")).toBe("---");
    });

    it("should return --- for null", () => {
      expect(formatDisplayDate(null)).toBe("---");
    });

    it("should return --- for undefined", () => {
      expect(formatDisplayDate(undefined)).toBe("---");
    });
  });
});
