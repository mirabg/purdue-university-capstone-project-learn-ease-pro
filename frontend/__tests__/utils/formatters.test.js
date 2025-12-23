import { describe, test, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  capitalize,
  truncate,
} from "../../src/utils/formatters";

describe("formatters", () => {
  describe("formatDate", () => {
    test("should format a valid date string", () => {
      const result = formatDate("2024-01-15T12:00:00Z");
      expect(result).toContain("2024");
      expect(result).toMatch(/January 1[45]/);
    });

    test("should format a Date object", () => {
      const date = new Date(2024, 5, 20); // Month is 0-indexed
      const result = formatDate(date);
      expect(result).toBe("June 20, 2024");
    });

    test("should handle ISO 8601 datetime string", () => {
      const result = formatDate("2024-12-25T10:30:00Z");
      // Note: This depends on timezone, so we check it contains expected parts
      expect(result).toContain("December");
      expect(result).toContain("2024");
    });

    test("should return empty string for null", () => {
      const result = formatDate(null);
      expect(result).toBe("");
    });

    test("should return empty string for undefined", () => {
      const result = formatDate(undefined);
      expect(result).toBe("");
    });

    test("should return empty string for empty string", () => {
      const result = formatDate("");
      expect(result).toBe("");
    });

    test("should handle invalid date string", () => {
      const result = formatDate("invalid-date");
      expect(result).toBe("Invalid Date");
    });

    test("should handle timestamp in milliseconds", () => {
      const timestamp = new Date(2024, 0, 1).getTime(); // Jan 1, 2024 local time
      const result = formatDate(timestamp);
      expect(result).toContain("January");
      expect(result).toContain("2024");
    });
  });

  describe("formatDateTime", () => {
    test("should format a valid date string with time", () => {
      const result = formatDateTime("2024-01-15T14:30:00");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
      expect(result).toContain("2:30");
    });

    test("should format a Date object with time", () => {
      const date = new Date("2024-06-20T09:45:00");
      const result = formatDateTime(date);
      expect(result).toContain("Jun");
      expect(result).toContain("20");
      expect(result).toContain("2024");
      expect(result).toContain("9:45");
    });

    test("should return empty string for null", () => {
      const result = formatDateTime(null);
      expect(result).toBe("");
    });

    test("should return empty string for undefined", () => {
      const result = formatDateTime(undefined);
      expect(result).toBe("");
    });

    test("should return empty string for empty string", () => {
      const result = formatDateTime("");
      expect(result).toBe("");
    });

    test("should handle invalid date string", () => {
      const result = formatDateTime("not-a-date");
      expect(result).toBe("Invalid Date");
    });

    test("should handle midnight times", () => {
      const result = formatDateTime("2024-01-15T00:00:00");
      expect(result).toContain("12:00 AM");
    });

    test("should handle noon times", () => {
      const result = formatDateTime("2024-01-15T12:00:00");
      expect(result).toContain("12:00 PM");
    });

    test("should handle timestamp in milliseconds", () => {
      const timestamp = new Date(2024, 0, 1).getTime(); // Jan 1, 2024 local time
      const result = formatDateTime(timestamp);
      expect(result).toContain("Jan");
      expect(result).toContain("2024");
    });
  });

  describe("capitalize", () => {
    test("should capitalize first letter of lowercase string", () => {
      const result = capitalize("hello");
      expect(result).toBe("Hello");
    });

    test("should capitalize first letter and lowercase rest", () => {
      const result = capitalize("HELLO");
      expect(result).toBe("Hello");
    });

    test("should handle mixed case string", () => {
      const result = capitalize("hELLo WoRLD");
      expect(result).toBe("Hello world");
    });

    test("should handle single character", () => {
      const result = capitalize("a");
      expect(result).toBe("A");
    });

    test("should handle already capitalized string", () => {
      const result = capitalize("Hello");
      expect(result).toBe("Hello");
    });

    test("should return empty string for null", () => {
      const result = capitalize(null);
      expect(result).toBe("");
    });

    test("should return empty string for undefined", () => {
      const result = capitalize(undefined);
      expect(result).toBe("");
    });

    test("should return empty string for empty string", () => {
      const result = capitalize("");
      expect(result).toBe("");
    });

    test("should handle string with numbers", () => {
      const result = capitalize("123abc");
      expect(result).toBe("123abc");
    });

    test("should handle string starting with space", () => {
      const result = capitalize(" hello");
      expect(result).toBe(" hello");
    });

    test("should handle special characters", () => {
      const result = capitalize("!hello");
      expect(result).toBe("!hello");
    });
  });

  describe("truncate", () => {
    test("should truncate string longer than max length", () => {
      const longString =
        "This is a very long string that needs to be truncated";
      const result = truncate(longString, 20);
      expect(result).toBe("This is a very long ...");
      expect(result.length).toBe(23); // 20 + "..."
    });

    test("should not truncate string shorter than max length", () => {
      const shortString = "Short text";
      const result = truncate(shortString, 20);
      expect(result).toBe("Short text");
    });

    test("should not truncate string equal to max length", () => {
      const exactString = "12345678901234567890"; // 20 characters
      const result = truncate(exactString, 20);
      expect(result).toBe("12345678901234567890");
    });

    test("should use default max length of 50", () => {
      const longString = "a".repeat(60);
      const result = truncate(longString);
      expect(result).toBe("a".repeat(50) + "...");
    });

    test("should handle empty string", () => {
      const result = truncate("", 20);
      expect(result).toBe("");
    });

    test("should handle null", () => {
      const result = truncate(null, 20);
      expect(result).toBeNull();
    });

    test("should handle undefined", () => {
      const result = truncate(undefined, 20);
      expect(result).toBeUndefined();
    });

    test("should truncate to very small length", () => {
      const result = truncate("Hello World", 3);
      expect(result).toBe("Hel...");
    });

    test("should handle max length of 0", () => {
      const result = truncate("Hello", 0);
      expect(result).toBe("...");
    });

    test("should handle strings with special characters", () => {
      const specialString = "Hello! @#$% ^&*() World 123";
      const result = truncate(specialString, 10);
      expect(result).toBe("Hello! @#$...");
    });

    test("should handle strings with emojis", () => {
      const emojiString = "Hello 👋 World 🌍";
      const result = truncate(emojiString, 8);
      expect(result).toContain("...");
      expect(result.length).toBeLessThanOrEqual(11); // 8 + "..."
    });

    test("should handle whitespace-only strings", () => {
      const whitespaceString = "     ";
      const result = truncate(whitespaceString, 3);
      expect(result).toBe("   ...");
    });

    test("should handle newlines and tabs", () => {
      const multilineString = "Line 1\nLine 2\tTabbed";
      const result = truncate(multilineString, 10);
      expect(result).toContain("...");
    });
  });
});
