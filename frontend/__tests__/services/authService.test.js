import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock api module before importing authService
vi.mock("@services/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

import { authService } from "@services/authService";
import api from "@services/api";

describe("authService", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should store token in localStorage on successful login", async () => {
      const mockResponse = {
        data: {
          token: "test-token",
          user: { id: "1", email: "test@example.com" },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const credentials = { email: "test@example.com", password: "password" };
      const result = await authService.login(credentials);

      expect(localStorage.setItem).toHaveBeenCalledWith("token", "test-token");
      expect(result).toEqual(mockResponse.data);
    });

    it("should store user in localStorage on successful login", async () => {
      const mockUser = { id: "1", email: "test@example.com", role: "student" };
      const mockResponse = {
        data: {
          token: "test-token",
          user: mockUser,
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const credentials = { email: "test@example.com", password: "password" };
      await authService.login(credentials);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
    });
  });

  describe("register", () => {
    it("should store token in localStorage on successful registration", async () => {
      const mockResponse = {
        data: {
          token: "test-token",
          user: { id: "1", email: "test@example.com" },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        password: "password123",
      };
      const result = await authService.register(userData);

      expect(localStorage.setItem).toHaveBeenCalledWith("token", "test-token");
      expect(result).toEqual(mockResponse.data);
    });

    it("should store user in localStorage on successful registration", async () => {
      const mockUser = { id: "1", email: "test@example.com", role: "student" };
      const mockResponse = {
        data: {
          token: "test-token",
          user: mockUser,
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const userData = {
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        password: "password123",
      };
      await authService.register(userData);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockUser)
      );
    });
  });

  describe("logout", () => {
    it("should remove token from localStorage", () => {
      localStorage.setItem("token", "test-token");
      authService.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
    });

    it("should remove user from localStorage", () => {
      localStorage.setItem("user", JSON.stringify({ id: "1" }));
      authService.logout();
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });
  });

  describe("getCurrentUser", () => {
    it("should return null if no token exists", () => {
      localStorage.getItem.mockReturnValue(null);
      const user = authService.getCurrentUser();
      expect(user).toBeNull();
    });

    it("should return user from localStorage if available", () => {
      const mockUser = { id: "1", email: "test@example.com", role: "student" };
      localStorage.getItem.mockImplementation((key) => {
        if (key === "user") return JSON.stringify(mockUser);
        return null;
      });

      const user = authService.getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it("should fall back to token decode if localStorage user parse fails", () => {
      const payload = {
        id: "123",
        email: "test@example.com",
        role: "user",
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      localStorage.getItem.mockImplementation((key) => {
        if (key === "user") return "invalid json";
        if (key === "token") return token;
        return null;
      });

      const user = authService.getCurrentUser();
      expect(user).toEqual(payload);
    });

    it("should decode and return user data from valid token", () => {
      // Create a valid JWT token payload
      const payload = {
        id: "123",
        email: "test@example.com",
        role: "user",
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;

      localStorage.getItem.mockReturnValue(token);

      const user = authService.getCurrentUser();
      expect(user).toEqual(payload);
    });

    it("should return null for invalid token", () => {
      localStorage.getItem.mockReturnValue("invalid-token");
      const user = authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("should return false if no token exists", () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authService.isAuthenticated()).toBe(false);
    });

    it("should return true if token exists", () => {
      localStorage.getItem.mockReturnValue("test-token");
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe("isAdmin", () => {
    it("should return false if no user is logged in", () => {
      localStorage.getItem.mockReturnValue(null);
      expect(authService.isAdmin()).toBeFalsy();
    });

    it("should return true for admin user", () => {
      const payload = {
        id: "123",
        email: "admin@example.com",
        role: "admin",
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;
      localStorage.getItem.mockReturnValue(token);

      expect(authService.isAdmin()).toBe(true);
    });

    it("should return false for non-admin user", () => {
      const payload = {
        id: "123",
        email: "user@example.com",
        role: "user",
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const token = `header.${base64Payload}.signature`;
      localStorage.getItem.mockReturnValue(token);

      expect(authService.isAdmin()).toBe(false);
    });

    it("should return false for invalid token", () => {
      localStorage.getItem.mockReturnValue("invalid-token");
      expect(authService.isAdmin()).toBeFalsy();
    });
  });
});
