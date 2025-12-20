import { describe, it, expect, vi, beforeEach } from "vitest";
import { userService } from "@services/userService";
import api from "@services/api";

// Mock the api module
vi.mock("@services/api");

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllUsers", () => {
    it("should fetch all users", async () => {
      const mockUsers = [
        { id: "1", email: "user1@example.com", role: "user" },
        { id: "2", email: "user2@example.com", role: "admin" },
      ];

      api.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.getAllUsers();

      expect(api.get).toHaveBeenCalledWith("/users?page=1&limit=10");
      expect(result).toEqual(mockUsers);
    });

    it("should fetch users with search parameter", async () => {
      const mockUsers = [{ id: "1", email: "john@example.com", role: "user" }];

      api.get.mockResolvedValue({ data: mockUsers });

      const result = await userService.getAllUsers(1, 10, "john");

      expect(api.get).toHaveBeenCalledWith(
        "/users?page=1&limit=10&search=john"
      );
      expect(result).toEqual(mockUsers);
    });

    it("should handle errors when fetching users", async () => {
      const error = new Error("Network error");
      api.get.mockRejectedValue(error);

      await expect(userService.getAllUsers()).rejects.toThrow("Network error");
    });
  });

  describe("getUserById", () => {
    it("should fetch a user by ID", async () => {
      const mockUser = { id: "1", email: "user@example.com", role: "user" };
      api.get.mockResolvedValue({ data: mockUser });

      const result = await userService.getUserById("1");

      expect(api.get).toHaveBeenCalledWith("/users/1");
      expect(result).toEqual(mockUser);
    });

    it("should handle errors when fetching user by ID", async () => {
      const error = new Error("User not found");
      api.get.mockRejectedValue(error);

      await expect(userService.getUserById("999")).rejects.toThrow(
        "User not found"
      );
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const userId = "1";
      const updateData = { firstName: "John", lastName: "Doe" };
      const mockResponse = { id: "1", ...updateData };

      api.put.mockResolvedValue({ data: mockResponse });

      const result = await userService.updateUser(userId, updateData);

      expect(api.put).toHaveBeenCalledWith(`/users/${userId}`, updateData);
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors when updating user", async () => {
      const error = new Error("Update failed");
      api.put.mockRejectedValue(error);

      await expect(
        userService.updateUser("1", { firstName: "John" })
      ).rejects.toThrow("Update failed");
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      const userId = "1";
      const mockResponse = { message: "User deleted successfully" };

      api.delete.mockResolvedValue({ data: mockResponse });

      const result = await userService.deleteUser(userId);

      expect(api.delete).toHaveBeenCalledWith(`/users/${userId}`);
      expect(result).toEqual(mockResponse);
    });

    it("should handle errors when deleting user", async () => {
      const error = new Error("Delete failed");
      api.delete.mockRejectedValue(error);

      await expect(userService.deleteUser("1")).rejects.toThrow(
        "Delete failed"
      );
    });
  });
});
