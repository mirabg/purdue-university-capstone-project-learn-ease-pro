import { describe, it, expect } from "vitest";
import { validators } from "@utils/validators";

describe("validators", () => {
  describe("isValidEmail", () => {
    it("should return true for valid email addresses", () => {
      expect(validators.isValidEmail("test@example.com")).toBe(true);
      expect(validators.isValidEmail("user.name@domain.co")).toBe(true);
      expect(validators.isValidEmail("user+tag@example.com")).toBe(true);
    });

    it("should return false for invalid email addresses", () => {
      expect(validators.isValidEmail("invalid")).toBe(false);
      expect(validators.isValidEmail("@example.com")).toBe(false);
      expect(validators.isValidEmail("user@")).toBe(false);
      expect(validators.isValidEmail("user@domain")).toBe(false);
      expect(validators.isValidEmail("")).toBe(false);
    });
  });

  describe("isValidPhone", () => {
    it("should return true for valid phone format (xxx-xxx-xxxx)", () => {
      expect(validators.isValidPhone("123-456-7890")).toBe(true);
      expect(validators.isValidPhone("555-123-4567")).toBe(true);
    });

    it("should return false for invalid phone formats", () => {
      expect(validators.isValidPhone("1234567890")).toBe(false);
      expect(validators.isValidPhone("123-45-6789")).toBe(false);
      expect(validators.isValidPhone("123.456.7890")).toBe(false);
      expect(validators.isValidPhone("")).toBe(false);
      expect(validators.isValidPhone("abc-def-ghij")).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("should return true for passwords with 6 or more characters", () => {
      expect(validators.isValidPassword("123456")).toBe(true);
      expect(validators.isValidPassword("password")).toBe(true);
      expect(validators.isValidPassword("securePassword123!")).toBe(true);
    });

    it("should return false for passwords with less than 6 characters", () => {
      expect(validators.isValidPassword("12345")).toBe(false);
      expect(validators.isValidPassword("pass")).toBe(false);
      expect(validators.isValidPassword("")).toBeFalsy();
    });

    it("should return false for null or undefined", () => {
      expect(validators.isValidPassword(null)).toBeFalsy();
      expect(validators.isValidPassword(undefined)).toBeFalsy();
    });
  });

  describe("isRequired", () => {
    it("should return true for non-empty values", () => {
      expect(validators.isRequired("text")).toBe(true);
      expect(validators.isRequired("123")).toBe(true);
      expect(validators.isRequired(123)).toBe(true);
      expect(validators.isRequired(true)).toBe(true);
      expect(validators.isRequired(false)).toBe(true);
      expect(validators.isRequired(0)).toBe(true);
    });

    it("should return false for empty values", () => {
      expect(validators.isRequired("")).toBe(false);
      expect(validators.isRequired("   ")).toBe(false);
      expect(validators.isRequired(null)).toBe(false);
      expect(validators.isRequired(undefined)).toBe(false);
    });
  });

  describe("maxLength", () => {
    it("should return true for strings within max length", () => {
      expect(validators.maxLength("hello", 10)).toBe(true);
      expect(validators.maxLength("test", 4)).toBe(true);
      expect(validators.maxLength("", 5)).toBe(true);
    });

    it("should return false for strings exceeding max length", () => {
      expect(validators.maxLength("hello world", 5)).toBe(false);
      expect(validators.maxLength("testing", 5)).toBe(false);
    });

    it("should return true for null or undefined", () => {
      expect(validators.maxLength(null, 5)).toBe(true);
      expect(validators.maxLength(undefined, 5)).toBe(true);
    });
  });
});
