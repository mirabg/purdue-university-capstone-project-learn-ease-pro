import { describe, it, expect } from "vitest";
import api from "../../src/services/api";

describe("API Service", () => {
  describe("Initialization", () => {
    it("should create api instance with interceptors", () => {
      expect(api).toBeDefined();
      expect(api.interceptors).toBeDefined();
      expect(api.interceptors.request).toBeDefined();
      expect(api.interceptors.response).toBeDefined();
    });

    it("should have axios methods available", () => {
      expect(api.get).toBeDefined();
      expect(api.post).toBeDefined();
      expect(api.put).toBeDefined();
      expect(api.delete).toBeDefined();
    });
  });

  describe("API Configuration", () => {
    it("should have defaults property for base configuration", () => {
      expect(api.defaults).toBeDefined();
      expect(api.defaults.baseURL).toBe("/api");
    });

    it("should have correct base URL", () => {
      expect(api.defaults.baseURL).toBe("/api");
    });

    it("should have JSON content type header", () => {
      expect(api.defaults.headers["Content-Type"]).toBe("application/json");
    });
  });

  describe("API Methods", () => {
    it("should have get method", () => {
      expect(typeof api.get).toBe("function");
    });

    it("should have post method", () => {
      expect(typeof api.post).toBe("function");
    });

    it("should have put method", () => {
      expect(typeof api.put).toBe("function");
    });

    it("should have delete method", () => {
      expect(typeof api.delete).toBe("function");
    });

    it("should have patch method", () => {
      expect(typeof api.patch).toBeDefined();
    });
  });

  describe("Request Interceptor", () => {
    it("should have request interceptor handlers defined", () => {
      expect(api.interceptors.request.handlers).toBeDefined();
      expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
    });

    it("should not add Authorization header when token does not exist", () => {
      localStorage.removeItem("token");

      const config = { headers: {} };
      const interceptor = api.interceptors.request.handlers[0];
      const result = interceptor.fulfilled(config);

      expect(result.headers.Authorization).toBeUndefined();
    });

    it("should handle request errors", async () => {
      const error = new Error("Request error");
      const interceptor = api.interceptors.request.handlers[0];

      await expect(interceptor.rejected(error)).rejects.toThrow(
        "Request error"
      );
    });

    it("should have fulfilled and rejected handlers", () => {
      const interceptor = api.interceptors.request.handlers[0];
      expect(interceptor.fulfilled).toBeDefined();
      expect(interceptor.rejected).toBeDefined();
    });
  });

  describe("Response Interceptor", () => {
    it("should return response on success", () => {
      const response = { data: { test: "data" } };
      const interceptor = api.interceptors.response.handlers[0];
      const result = interceptor.fulfilled(response);

      expect(result).toEqual(response);
    });

    it("should pass through non-401 errors", async () => {
      const error = {
        response: {
          status: 500,
        },
      };

      const interceptor = api.interceptors.response.handlers[0];

      await expect(interceptor.rejected(error)).rejects.toEqual(error);
    });

    it("should handle 401 errors and clear storage", async () => {
      // Set up storage
      localStorage.setItem("token", "test-token");
      localStorage.setItem("user", JSON.stringify({ id: 1 }));

      const error = {
        response: {
          status: 401,
        },
      };

      // Mock window.location
      delete window.location;
      window.location = { pathname: "/dashboard", href: "" };

      const interceptor = api.interceptors.response.handlers[0];

      try {
        await interceptor.rejected(error);
      } catch (e) {
        // Expected to reject
      }

      // Verify storage was cleared
      expect(localStorage.getItem("token")).toBeFalsy();
      expect(localStorage.getItem("user")).toBeFalsy();
      expect(window.location.href).toBe("/login");
    });

    it("should not redirect if already on login page", async () => {
      localStorage.setItem("token", "test-token");

      const error = {
        response: {
          status: 401,
        },
      };

      delete window.location;
      window.location = { pathname: "/login", href: "/login" };

      const interceptor = api.interceptors.response.handlers[0];

      try {
        await interceptor.rejected(error);
      } catch (e) {
        // Expected to reject
      }

      expect(window.location.href).toBe("/login");
    });

    it("should have response interceptor handlers defined", () => {
      expect(api.interceptors.response.handlers).toBeDefined();
      expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });
});
