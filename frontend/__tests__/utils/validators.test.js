import { describe, test, expect } from "vitest";
import { validators } from "../../src/utils/validators";

describe("validators", () => {
  describe("isValidEmail", () => {
    test("should validate correct email format", () => {
      expect(validators.isValidEmail("user@example.com")).toBe(true);
      expect(validators.isValidEmail("test.user@domain.com")).toBe(true);
      expect(validators.isValidEmail("user+tag@example.co.uk")).toBe(true);
      expect(validators.isValidEmail("user_name@example.com")).toBe(true);
      expect(validators.isValidEmail("user123@test-domain.org")).toBe(true);
    });

    test("should reject email without @", () => {
      expect(validators.isValidEmail("userexample.com")).toBe(false);
    });

    test("should reject email without domain", () => {
      expect(validators.isValidEmail("user@")).toBe(false);
    });

    test("should reject email without local part", () => {
      expect(validators.isValidEmail("@example.com")).toBe(false);
    });

    test("should reject email without extension", () => {
      expect(validators.isValidEmail("user@domain")).toBe(false);
    });

    test("should reject email with spaces", () => {
      expect(validators.isValidEmail("user name@example.com")).toBe(false);
      expect(validators.isValidEmail("user@exam ple.com")).toBe(false);
    });

    test("should reject empty string", () => {
      expect(validators.isValidEmail("")).toBe(false);
    });

    test("should reject null", () => {
      expect(validators.isValidEmail(null)).toBe(false);
    });

    test("should reject undefined", () => {
      expect(validators.isValidEmail(undefined)).toBe(false);
    });

    test("should reject multiple @ symbols", () => {
      expect(validators.isValidEmail("user@@example.com")).toBe(false);
      expect(validators.isValidEmail("user@exam@ple.com")).toBe(false);
    });

    test("should reject email with only special characters", () => {
      expect(validators.isValidEmail("@@@.")).toBe(false);
    });

    test("should accept email starting with dot (simple regex limitation)", () => {
      // Note: The simple regex accepts this, though technically invalid
      expect(validators.isValidEmail(".user@example.com")).toBe(true);
    });

    test("should accept email ending with dot (simple regex limitation)", () => {
      // Note: The simple regex accepts this, though technically invalid
      expect(validators.isValidEmail("user@example.com.")).toBe(true);
    });

    test("should handle email with numbers", () => {
      expect(validators.isValidEmail("user123@example456.com")).toBe(true);
    });

    test("should handle subdomain emails", () => {
      expect(validators.isValidEmail("user@mail.example.com")).toBe(true);
    });
  });

  describe("isValidPhone", () => {
    test("should validate correct phone format xxx-xxx-xxxx", () => {
      expect(validators.isValidPhone("123-456-7890")).toBe(true);
      expect(validators.isValidPhone("555-123-4567")).toBe(true);
      expect(validators.isValidPhone("000-000-0000")).toBe(true);
    });

    test("should reject phone without dashes", () => {
      expect(validators.isValidPhone("1234567890")).toBe(false);
    });

    test("should reject phone with wrong format", () => {
      expect(validators.isValidPhone("123-45-67890")).toBe(false);
      expect(validators.isValidPhone("1234-567-890")).toBe(false);
    });

    test("should reject phone with spaces instead of dashes", () => {
      expect(validators.isValidPhone("123 456 7890")).toBe(false);
    });

    test("should reject phone with dots", () => {
      expect(validators.isValidPhone("123.456.7890")).toBe(false);
    });

    test("should reject phone with parentheses", () => {
      expect(validators.isValidPhone("(123) 456-7890")).toBe(false);
    });

    test("should reject phone with letters", () => {
      expect(validators.isValidPhone("abc-def-ghij")).toBe(false);
      expect(validators.isValidPhone("123-abc-7890")).toBe(false);
    });

    test("should reject phone with too few digits", () => {
      expect(validators.isValidPhone("12-456-7890")).toBe(false);
      expect(validators.isValidPhone("123-45-7890")).toBe(false);
      expect(validators.isValidPhone("123-456-789")).toBe(false);
    });

    test("should reject phone with too many digits", () => {
      expect(validators.isValidPhone("1234-456-7890")).toBe(false);
      expect(validators.isValidPhone("123-4567-7890")).toBe(false);
      expect(validators.isValidPhone("123-456-78901")).toBe(false);
    });

    test("should reject empty string", () => {
      expect(validators.isValidPhone("")).toBe(false);
    });

    test("should reject null", () => {
      expect(validators.isValidPhone(null)).toBe(false);
    });

    test("should reject undefined", () => {
      expect(validators.isValidPhone(undefined)).toBe(false);
    });

    test("should reject phone with special characters", () => {
      expect(validators.isValidPhone("123-456-789!")).toBe(false);
      expect(validators.isValidPhone("@23-456-7890")).toBe(false);
    });

    test("should reject phone with country code", () => {
      expect(validators.isValidPhone("+1-123-456-7890")).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    test("should validate password with 6 characters", () => {
      expect(validators.isValidPassword("123456")).toBe(true);
      expect(validators.isValidPassword("abcdef")).toBe(true);
      expect(validators.isValidPassword("Pass12")).toBe(true);
    });

    test("should validate password longer than 6 characters", () => {
      expect(validators.isValidPassword("1234567890")).toBe(true);
      expect(validators.isValidPassword("MyP@ssw0rd!")).toBe(true);
      expect(validators.isValidPassword("VeryLongPassword123")).toBe(true);
    });

    test("should reject password with less than 6 characters", () => {
      expect(validators.isValidPassword("12345")).toBe(false);
      expect(validators.isValidPassword("abc")).toBe(false);
      expect(validators.isValidPassword("a")).toBe(false);
    });

    test("should reject empty string", () => {
      expect(validators.isValidPassword("")).toBeFalsy();
    });

    test("should reject null", () => {
      expect(validators.isValidPassword(null)).toBeFalsy();
    });

    test("should reject undefined", () => {
      expect(validators.isValidPassword(undefined)).toBeFalsy();
    });

    test("should validate password with spaces", () => {
      expect(validators.isValidPassword("pass word")).toBe(true);
      expect(validators.isValidPassword("      ")).toBe(true); // 6 spaces
    });

    test("should validate password with special characters", () => {
      expect(validators.isValidPassword("!@#$%^")).toBe(true);
      expect(validators.isValidPassword("P@ssw0rd!")).toBe(true);
    });

    test("should validate password with only numbers", () => {
      expect(validators.isValidPassword("123456")).toBe(true);
    });

    test("should validate password with mixed case", () => {
      expect(validators.isValidPassword("PaSsWoRd")).toBe(true);
    });

    test("should handle password exactly 6 characters", () => {
      expect(validators.isValidPassword("abcdef")).toBe(true);
    });
  });

  describe("isRequired", () => {
    test("should validate non-empty string", () => {
      expect(validators.isRequired("test")).toBe(true);
      expect(validators.isRequired("Hello World")).toBe(true);
      expect(validators.isRequired("a")).toBe(true);
    });

    test("should validate non-zero number", () => {
      expect(validators.isRequired(123)).toBe(true);
      expect(validators.isRequired(-5)).toBe(true);
      expect(validators.isRequired(0.5)).toBe(true);
    });

    test("should validate zero as valid", () => {
      expect(validators.isRequired(0)).toBe(true);
    });

    test("should validate boolean true", () => {
      expect(validators.isRequired(true)).toBe(true);
    });

    test("should validate boolean false", () => {
      expect(validators.isRequired(false)).toBe(true);
    });

    test("should validate array", () => {
      expect(validators.isRequired([1, 2, 3])).toBe(true);
      expect(validators.isRequired([])).toBe(false); // Empty array has toString() = ""
    });

    test("should validate object", () => {
      expect(validators.isRequired({ key: "value" })).toBe(true);
    });

    test("should reject null", () => {
      expect(validators.isRequired(null)).toBe(false);
    });

    test("should reject undefined", () => {
      expect(validators.isRequired(undefined)).toBe(false);
    });

    test("should reject empty string", () => {
      expect(validators.isRequired("")).toBe(false);
    });

    test("should reject string with only spaces", () => {
      expect(validators.isRequired("   ")).toBe(false);
      expect(validators.isRequired("\t")).toBe(false);
      expect(validators.isRequired("\n")).toBe(false);
    });

    test("should validate string with spaces and content", () => {
      expect(validators.isRequired("  hello  ")).toBe(true);
    });

    test("should validate special characters", () => {
      expect(validators.isRequired("!@#$%")).toBe(true);
    });

    test("should handle empty array converted to string", () => {
      const emptyArray = [];
      expect(validators.isRequired(emptyArray)).toBe(false); // [].toString() = ""
    });
  });

  describe("maxLength", () => {
    test("should validate string shorter than max", () => {
      expect(validators.maxLength("hello", 10)).toBe(true);
      expect(validators.maxLength("test", 5)).toBe(true);
    });

    test("should validate string equal to max", () => {
      expect(validators.maxLength("hello", 5)).toBe(true);
      expect(validators.maxLength("12345", 5)).toBe(true);
    });

    test("should reject string longer than max", () => {
      expect(validators.maxLength("hello world", 5)).toBe(false);
      expect(validators.maxLength("testing", 6)).toBe(false);
    });

    test("should validate empty string", () => {
      expect(validators.maxLength("", 5)).toBe(true);
      expect(validators.maxLength("", 0)).toBe(true);
    });

    test("should validate null", () => {
      expect(validators.maxLength(null, 5)).toBe(true);
    });

    test("should validate undefined", () => {
      expect(validators.maxLength(undefined, 5)).toBe(true);
    });

    test("should handle max length of 0", () => {
      expect(validators.maxLength("a", 0)).toBe(false);
      expect(validators.maxLength("", 0)).toBe(true);
    });

    test("should validate string with special characters", () => {
      expect(validators.maxLength("!@#$%", 5)).toBe(true);
      expect(validators.maxLength("!@#$%^", 5)).toBe(false);
    });

    test("should validate string with spaces", () => {
      expect(validators.maxLength("  hello  ", 9)).toBe(true);
      expect(validators.maxLength("  hello  ", 8)).toBe(false);
    });

    test("should validate string with emojis", () => {
      expect(validators.maxLength("👋", 2)).toBe(true); // Emoji counts as 2 chars
    });

    test("should validate string with newlines", () => {
      expect(validators.maxLength("line1\nline2", 11)).toBe(true);
      expect(validators.maxLength("line1\nline2", 10)).toBe(false);
    });

    test("should validate very long string", () => {
      const longString = "a".repeat(100);
      expect(validators.maxLength(longString, 100)).toBe(true);
      expect(validators.maxLength(longString, 99)).toBe(false);
    });

    test("should handle negative max length", () => {
      expect(validators.maxLength("test", -1)).toBe(false);
      expect(validators.maxLength("", -1)).toBe(true);
    });
  });
});
