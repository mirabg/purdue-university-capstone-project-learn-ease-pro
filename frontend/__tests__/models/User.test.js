import { describe, it, expect } from "vitest";
import { User } from "../../src/models/User";

describe("User Model", () => {
  describe("Constructor", () => {
    it("should create a user with default values when no data is provided", () => {
      const user = new User();

      expect(user.id).toBe(null);
      expect(user.firstName).toBe("");
      expect(user.lastName).toBe("");
      expect(user.email).toBe("");
      expect(user.role).toBe("student");
      expect(user.address).toBe("");
      expect(user.city).toBe("");
      expect(user.state).toBe("");
      expect(user.zipcode).toBe("");
      expect(user.phone).toBe("");
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBe(null);
      expect(user.updatedAt).toBe(null);
    });

    it("should create a user with provided data", () => {
      const userData = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipcode: "10001",
        phone: "555-1234",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      };

      const user = new User(userData);

      expect(user.id).toBe("123");
      expect(user.firstName).toBe("John");
      expect(user.lastName).toBe("Doe");
      expect(user.email).toBe("john@example.com");
      expect(user.role).toBe("admin");
      expect(user.address).toBe("123 Main St");
      expect(user.city).toBe("New York");
      expect(user.state).toBe("NY");
      expect(user.zipcode).toBe("10001");
      expect(user.phone).toBe("555-1234");
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBe("2024-01-01");
      expect(user.updatedAt).toBe("2024-01-02");
    });

    it("should handle MongoDB _id field", () => {
      const userData = {
        _id: "mongo123",
        firstName: "Jane",
      };

      const user = new User(userData);
      expect(user.id).toBe("mongo123");
    });

    it("should prefer id over _id if both are provided", () => {
      const userData = {
        _id: "mongo123",
        id: "regular123",
      };

      const user = new User(userData);
      expect(user.id).toBe("regular123");
    });

    it("should handle isActive as false", () => {
      const userData = {
        isActive: false,
      };

      const user = new User(userData);
      expect(user.isActive).toBe(false);
    });
  });

  describe("Getters", () => {
    describe("fullName", () => {
      it("should return full name with both first and last names", () => {
        const user = new User({
          firstName: "John",
          lastName: "Doe",
        });

        expect(user.fullName).toBe("John Doe");
      });

      it("should return only first name if last name is empty", () => {
        const user = new User({
          firstName: "John",
          lastName: "",
        });

        expect(user.fullName).toBe("John");
      });

      it("should return only last name if first name is empty", () => {
        const user = new User({
          firstName: "",
          lastName: "Doe",
        });

        expect(user.fullName).toBe("Doe");
      });

      it("should return empty string if both names are empty", () => {
        const user = new User();
        expect(user.fullName).toBe("");
      });

      it("should concatenate names with spaces", () => {
        const user = new User({
          firstName: "John ",
          lastName: " Doe",
        });

        expect(user.fullName).toBe("John   Doe");
      });
    });

    describe("isAdmin", () => {
      it("should return true when role is admin", () => {
        const user = new User({ role: "admin" });
        expect(user.isAdmin).toBe(true);
      });

      it("should return false when role is not admin", () => {
        const user = new User({ role: "student" });
        expect(user.isAdmin).toBe(false);
      });

      it("should return false for faculty role", () => {
        const user = new User({ role: "faculty" });
        expect(user.isAdmin).toBe(false);
      });
    });

    describe("isStudent", () => {
      it("should return true when role is student", () => {
        const user = new User({ role: "student" });
        expect(user.isStudent).toBe(true);
      });

      it("should return true for default role", () => {
        const user = new User();
        expect(user.isStudent).toBe(true);
      });

      it("should return false when role is admin", () => {
        const user = new User({ role: "admin" });
        expect(user.isStudent).toBe(false);
      });

      it("should return false when role is faculty", () => {
        const user = new User({ role: "faculty" });
        expect(user.isStudent).toBe(false);
      });
    });

    describe("isFaculty", () => {
      it("should return true when role is faculty", () => {
        const user = new User({ role: "faculty" });
        expect(user.isFaculty).toBe(true);
      });

      it("should return false when role is admin", () => {
        const user = new User({ role: "admin" });
        expect(user.isFaculty).toBe(false);
      });

      it("should return false when role is student", () => {
        const user = new User({ role: "student" });
        expect(user.isFaculty).toBe(false);
      });
    });
  });

  describe("toJSON", () => {
    it("should return user data as JSON object", () => {
      const userData = {
        id: "123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipcode: "10001",
        phone: "555-1234",
        isActive: true,
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json).toEqual({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "admin",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zipcode: "10001",
        phone: "555-1234",
        isActive: true,
      });
    });

    it("should not include id, createdAt, and updatedAt in JSON", () => {
      const userData = {
        id: "123",
        firstName: "John",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-02",
      };

      const user = new User(userData);
      const json = user.toJSON();

      expect(json).not.toHaveProperty("id");
      expect(json).not.toHaveProperty("createdAt");
      expect(json).not.toHaveProperty("updatedAt");
    });

    it("should include all required fields even if empty", () => {
      const user = new User();
      const json = user.toJSON();

      expect(json).toHaveProperty("firstName");
      expect(json).toHaveProperty("lastName");
      expect(json).toHaveProperty("email");
      expect(json).toHaveProperty("role");
      expect(json).toHaveProperty("address");
      expect(json).toHaveProperty("city");
      expect(json).toHaveProperty("state");
      expect(json).toHaveProperty("zipcode");
      expect(json).toHaveProperty("phone");
      expect(json).toHaveProperty("isActive");
    });
  });
});
