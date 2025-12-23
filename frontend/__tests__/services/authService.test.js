import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { authService } from "../../src/services/authService";
import api from "../../src/services/api";

// Mock the api module
vi.mock("../../src/services/api");

describe("authService", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value.toString();
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Replace global localStorage with mock
    global.localStorage = localStorageMock;
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("login", () => {
    test("should successfully login user and store token and user data", async () => {
      const mockResponse = {
        data: {
          token: "mock-jwt-token",
          user: {
            id: "user123",
            email: "test@example.com",
            name: "Test User",
            role: "student",
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const credentials = {
        email: "test@example.com",
        password: "password123",
      };
      const result = await authService.login(credentials);

      expect(api.post).toHaveBeenCalledWith("/users/login", credentials);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "token",
        "mock-jwt-token"
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockResponse.data.user)
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle login without token", async () => {
      const mockResponse = {
        data: {
          user: {
            id: "user123",
            email: "test@example.com",
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.login({
        email: "test@example.com",
        password: "pass",
      });

      expect(localStorage.setItem).toHaveBeenCalledTimes(1); // Only user, not token
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle login API error", async () => {
      const mockError = new Error("Invalid credentials");
      api.post.mockRejectedValue(mockError);

      await expect(
        authService.login({ email: "test@example.com", password: "wrong" })
      ).rejects.toThrow("Invalid credentials");

      expect(localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("register", () => {
    test("should successfully register user and store token and user data", async () => {
      const mockResponse = {
        data: {
          token: "new-user-token",
          user: {
            id: "newuser123",
            email: "newuser@example.com",
            name: "New User",
            role: "student",
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const userData = {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
        role: "student",
      };

      const result = await authService.register(userData);

      expect(api.post).toHaveBeenCalledWith("/users/register", userData);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "token",
        "new-user-token"
      );
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify(mockResponse.data.user)
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle registration without token", async () => {
      const mockResponse = {
        data: {
          user: {
            id: "newuser123",
            email: "newuser@example.com",
          },
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await authService.register({
        email: "newuser@example.com",
        password: "pass",
      });

      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle registration API error", async () => {
      const mockError = new Error("Email already exists");
      api.post.mockRejectedValue(mockError);

      await expect(
        authService.register({
          email: "existing@example.com",
          password: "pass",
        })
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("logout", () => {
    test("should remove token and user from localStorage", () => {
      localStorage.setItem("token", "some-token");
      localStorage.setItem("user", JSON.stringify({ id: "123" }));

      authService.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith("token");
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
    });
  });

  describe("getCurrentUser", () => {
    test("should return user from localStorage if available", () => {
      const mockUser = {
        id: "user123",
        email: "test@example.com",
        role: "student",
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = authService.getCurrentUser();

      expect(localStorage.getItem).toHaveBeenCalledWith("user");
      expect(result).toEqual(mockUser);
    });

    test("should decode JWT token if user not in localStorage", () => {
      // Mock token with base64 encoded payload
      const payload = {
        id: "user123",
        email: "test@example.com",
        role: "faculty",
      };
      const base64Payload = btoa(JSON.stringify(payload));
      const mockToken = `header.${base64Payload}.signature`;

      localStorage.getItem.mockImplementation((key) => {
        if (key === "user") return null;
        if (key === "token") return mockToken;
        return null;
      });

      const result = authService.getCurrentUser();

      expect(result).toEqual(payload);
    });

    test("should handle invalid JSON in localStorage", () => {
      localStorage.getItem.mockReturnValue("invalid-json");

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });

    test("should return null when no token exists", () => {
      localStorage.getItem.mockReturnValue(null);

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });

    test("should handle invalid token format", () => {
      localStorage.getItem.mockImplementation((key) => {
        if (key === "user") return null;
        if (key === "token") return "invalid.token";
        return null;
      });

      const result = authService.getCurrentUser();

      expect(result).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    test("should return true when token exists", () => {
      localStorage.getItem.mockReturnValue("some-token");

      const result = authService.isAuthenticated();

      expect(result).toBe(true);
      expect(localStorage.getItem).toHaveBeenCalledWith("token");
    });

    test("should return false when token does not exist", () => {
      localStorage.getItem.mockReturnValue(null);

      const result = authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe("isAdmin", () => {
    test("should return true for admin user", () => {
      const mockUser = { id: "admin123", role: "admin" };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = authService.isAdmin();

      expect(result).toBe(true);
    });

    test("should return false for non-admin user", () => {
      const mockUser = { id: "user123", role: "student" };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = authService.isAdmin();

      expect(result).toBe(false);
    });

    test("should return false when no user exists", () => {
      localStorage.getItem.mockReturnValue(null);

      const result = authService.isAdmin();

      expect(result).toBeFalsy();
    });
  });

  describe("isFaculty", () => {
    test("should return true for faculty user", () => {
      const mockUser = { id: "faculty123", role: "faculty" };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = authService.isFaculty();

      expect(result).toBe(true);
    });

    test("should return false for non-faculty user", () => {
      const mockUser = { id: "user123", role: "student" };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const result = authService.isFaculty();

      expect(result).toBe(false);
    });

    test("should return false when no user exists", () => {
      localStorage.getItem.mockReturnValue(null);

      const result = authService.isFaculty();

      expect(result).toBeFalsy();
    });
  });
});
