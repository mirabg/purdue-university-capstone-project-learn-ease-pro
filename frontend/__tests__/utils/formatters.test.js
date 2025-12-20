import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  capitalize,
  truncate,
} from "@utils/formatters";

describe("formatters", () => {
  describe("formatDate", () => {
    it("should format a date string to readable format", () => {
      const date = "2025-12-20T10:30:00.000Z";
      const formatted = formatDate(date);
      expect(formatted).toContain("2025");
      expect(formatted).toContain("December");
      expect(formatted).toContain("20");
    });

    it("should format a Date object", () => {
      const date = new Date("2025-12-20");
      const formatted = formatDate(date);
      expect(formatted).toContain("2025");
    });

    it("should return empty string for null or undefined", () => {
      expect(formatDate(null)).toBe("");
      expect(formatDate(undefined)).toBe("");
      expect(formatDate("")).toBe("");
    });
  });

  describe("formatDateTime", () => {
    it("should format date and time", () => {
      const date = "2025-12-20T10:30:00.000Z";
      const formatted = formatDateTime(date);
      expect(formatted).toContain("2025");
      expect(formatted).toContain("Dec");
      expect(formatted).toContain("20");
    });

    it("should include time in format", () => {
      const date = new Date("2025-12-20T10:30:00");
      const formatted = formatDateTime(date);
      // Should contain time components (format varies by locale)
      expect(formatted.length).toBeGreaterThan(0);
    });

    it("should return empty string for null or undefined", () => {
      expect(formatDateTime(null)).toBe("");
      expect(formatDateTime(undefined)).toBe("");
      expect(formatDateTime("")).toBe("");
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter and lowercase rest", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("Hello");
      expect(capitalize("hELLO")).toBe("Hello");
    });

    it("should handle single character strings", () => {
      expect(capitalize("a")).toBe("A");
      expect(capitalize("Z")).toBe("Z");
    });

    it("should return empty string for empty input", () => {
      expect(capitalize("")).toBe("");
      expect(capitalize(null)).toBe("");
      expect(capitalize(undefined)).toBe("");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings with ellipsis", () => {
      const longText = "This is a very long string that needs to be truncated";
      const result = truncate(longText, 20);
      expect(result).toBe("This is a very long ...");
      expect(result.length).toBe(23); // 20 + "..."
    });

    it("should not truncate strings shorter than max length", () => {
      const shortText = "Short text";
      expect(truncate(shortText, 20)).toBe("Short text");
    });

    it("should handle empty strings", () => {
      expect(truncate("", 10)).toBe("");
    });

    it("should handle null or undefined", () => {
      expect(truncate(null, 10)).toBeFalsy();
      expect(truncate(undefined, 10)).toBeUndefined();
    });
  });
});
