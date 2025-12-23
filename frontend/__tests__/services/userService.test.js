import { describe, test, expect, vi, beforeEach } from "vitest";
import { userService } from "../../src/services/userService";
import api from "../../src/services/api";

vi.mock("../../src/services/api");

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    test("should fetch all users with default pagination", async () => {
      const mockResponse = {
        data: {
          users: [
            { id: "1", name: "User 1", email: "user1@example.com" },
            { id: "2", name: "User 2", email: "user2@example.com" },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getAllUsers();

      expect(api.get).toHaveBeenCalledWith("/users?page=1&limit=10");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch users with custom pagination", async () => {
      const mockResponse = {
        data: {
          users: [],
          total: 100,
          page: 5,
          limit: 20,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      await userService.getAllUsers(5, 20);

      expect(api.get).toHaveBeenCalledWith("/users?page=5&limit=20");
    });

    test("should fetch users with search query", async () => {
      const mockResponse = {
        data: {
          users: [{ id: "1", name: "John Doe" }],
          total: 1,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      await userService.getAllUsers(1, 10, "John");

      expect(api.get).toHaveBeenCalledWith(
        "/users?page=1&limit=10&search=John"
      );
    });

    test("should handle API error", async () => {
      api.get.mockRejectedValue(new Error("Unauthorized"));

      await expect(userService.getAllUsers()).rejects.toThrow("Unauthorized");
    });
  });

  describe("getUserById", () => {
    test("should fetch user by ID", async () => {
      const mockResponse = {
        data: {
          id: "user123",
          name: "Test User",
          email: "test@example.com",
          role: "student",
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getUserById("user123");

      expect(api.get).toHaveBeenCalledWith("/users/user123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle user not found error", async () => {
      api.get.mockRejectedValue(new Error("User not found"));

      await expect(userService.getUserById("invalid")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("getFacultyUsers", () => {
    test("should fetch all faculty users", async () => {
      const mockResponse = {
        data: [
          { id: "1", name: "Faculty 1", role: "faculty" },
          { id: "2", name: "Faculty 2", role: "faculty" },
        ],
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getFacultyUsers();

      expect(api.get).toHaveBeenCalledWith("/users/faculty");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle empty faculty list", async () => {
      const mockResponse = {
        data: [],
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await userService.getFacultyUsers();

      expect(result).toEqual([]);
    });

    test("should handle fetch error", async () => {
      api.get.mockRejectedValue(new Error("Server error"));

      await expect(userService.getFacultyUsers()).rejects.toThrow(
        "Server error"
      );
    });
  });

  describe("createUser", () => {
    test("should create a new user", async () => {
      const userData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        role: "student",
      };

      const mockResponse = {
        data: {
          id: "newuser123",
          name: userData.name,
          email: userData.email,
          role: userData.role,
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await userService.createUser(userData);

      expect(api.post).toHaveBeenCalledWith("/users", userData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle validation error", async () => {
      api.post.mockRejectedValue(new Error("Email is required"));

      await expect(userService.createUser({})).rejects.toThrow(
        "Email is required"
      );
    });

    test("should handle duplicate email error", async () => {
      api.post.mockRejectedValue(new Error("Email already exists"));

      await expect(
        userService.createUser({ email: "existing@example.com" })
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("updateUser", () => {
    test("should update a user", async () => {
      const userData = {
        name: "Updated Name",
        email: "updated@example.com",
      };

      const mockResponse = {
        data: {
          id: "user123",
          ...userData,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await userService.updateUser("user123", userData);

      expect(api.put).toHaveBeenCalledWith("/users/user123", userData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle partial update", async () => {
      const userData = {
        name: "Only Name Updated",
      };

      const mockResponse = {
        data: {
          id: "user123",
          name: "Only Name Updated",
          email: "original@example.com",
        },
      };

      api.put.mockResolvedValue(mockResponse);

      await userService.updateUser("user123", userData);

      expect(api.put).toHaveBeenCalledWith("/users/user123", userData);
    });

    test("should handle update error", async () => {
      api.put.mockRejectedValue(new Error("Unauthorized"));

      await expect(userService.updateUser("user123", {})).rejects.toThrow(
        "Unauthorized"
      );
    });

    test("should handle user not found", async () => {
      api.put.mockRejectedValue(new Error("User not found"));

      await expect(
        userService.updateUser("invalid", { name: "Test" })
      ).rejects.toThrow("User not found");
    });
  });

  describe("deleteUser", () => {
    test("should delete a user", async () => {
      const mockResponse = {
        data: {
          message: "User deleted successfully",
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await userService.deleteUser("user123");

      expect(api.delete).toHaveBeenCalledWith("/users/user123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle delete error", async () => {
      api.delete.mockRejectedValue(new Error("User not found"));

      await expect(userService.deleteUser("invalid")).rejects.toThrow(
        "User not found"
      );
    });

    test("should handle unauthorized delete", async () => {
      api.delete.mockRejectedValue(new Error("Unauthorized - Admin only"));

      await expect(userService.deleteUser("user123")).rejects.toThrow(
        "Unauthorized - Admin only"
      );
    });
  });
});
