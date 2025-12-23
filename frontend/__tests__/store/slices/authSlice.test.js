import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import authReducer, {
  loginSuccess,
  logout,
  updateUser,
  selectUser,
  selectToken,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsFaculty,
  selectIsStudent,
} from "../../../src/store/slices/authSlice";

describe("authSlice", () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        if (value !== null && value !== undefined) {
          store[key] = value.toString();
        }
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  // Mock window.atob
  const mockAtob = vi.fn((str) => {
    return Buffer.from(str, "base64").toString("binary");
  });

  beforeEach(() => {
    global.localStorage = localStorageMock;
    global.window = { atob: mockAtob };
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    test("should have default initial state when localStorage is empty", () => {
      const state = authReducer(undefined, { type: "@@INIT" });

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      // When localStorage is empty, token will be null (getItem returns null)
      // But the actual implementation sets it as is from localStorage
    });
  });

  describe("reducers", () => {
    describe("loginSuccess", () => {
      test("should set user, token, and isAuthenticated on login", () => {
        const user = { id: "123", email: "test@example.com", role: "student" };
        const token = "mock-jwt-token";

        const state = authReducer(
          { user: null, token: null, isAuthenticated: false },
          loginSuccess({ user, token })
        );

        expect(state.user).toEqual(user);
        expect(state.token).toBe(token);
        expect(state.isAuthenticated).toBe(true);
        expect(localStorage.setItem).toHaveBeenCalledWith("token", token);
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "user",
          JSON.stringify(user)
        );
      });

      test("should overwrite existing auth state on new login", () => {
        const oldUser = {
          id: "old",
          email: "old@example.com",
          role: "student",
        };
        const newUser = {
          id: "new",
          email: "new@example.com",
          role: "faculty",
        };
        const oldToken = "old-token";
        const newToken = "new-token";

        let state = authReducer(
          { user: oldUser, token: oldToken, isAuthenticated: true },
          loginSuccess({ user: newUser, token: newToken })
        );

        expect(state.user).toEqual(newUser);
        expect(state.token).toBe(newToken);
        expect(state.isAuthenticated).toBe(true);
      });
    });

    describe("logout", () => {
      test("should clear user, token, and isAuthenticated", () => {
        const initialState = {
          user: { id: "123", email: "test@example.com", role: "student" },
          token: "mock-token",
          isAuthenticated: true,
        };

        const state = authReducer(initialState, logout());

        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(localStorage.removeItem).toHaveBeenCalledWith("token");
        expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      });

      test("should handle logout when already logged out", () => {
        const initialState = {
          user: null,
          token: null,
          isAuthenticated: false,
        };

        const state = authReducer(initialState, logout());

        expect(state.user).toBeNull();
        expect(state.token).toBeNull();
        expect(state.isAuthenticated).toBe(false);
      });
    });

    describe("updateUser", () => {
      test("should update user properties", () => {
        const initialState = {
          user: {
            id: "123",
            name: "Old Name",
            email: "test@example.com",
            role: "student",
          },
          token: "mock-token",
          isAuthenticated: true,
        };

        const state = authReducer(
          initialState,
          updateUser({ name: "New Name" })
        );

        expect(state.user).toEqual({
          id: "123",
          name: "New Name",
          email: "test@example.com",
          role: "student",
        });
        expect(localStorage.setItem).toHaveBeenCalledWith(
          "user",
          JSON.stringify(state.user)
        );
      });

      test("should merge updates with existing user", () => {
        const initialState = {
          user: {
            id: "123",
            name: "Test",
            email: "test@example.com",
            role: "student",
          },
          token: "mock-token",
          isAuthenticated: true,
        };

        const state = authReducer(
          initialState,
          updateUser({ email: "new@example.com" })
        );

        expect(state.user.id).toBe("123");
        expect(state.user.name).toBe("Test");
        expect(state.user.email).toBe("new@example.com");
      });

      test("should handle multiple property updates", () => {
        const initialState = {
          user: {
            id: "123",
            name: "Test",
            email: "test@example.com",
            role: "student",
          },
          token: "mock-token",
          isAuthenticated: true,
        };

        const state = authReducer(
          initialState,
          updateUser({
            name: "New Name",
            email: "new@example.com",
            role: "faculty",
          })
        );

        expect(state.user).toEqual({
          id: "123",
          name: "New Name",
          email: "new@example.com",
          role: "faculty",
        });
      });
    });
  });

  describe("selectors", () => {
    const mockState = {
      auth: {
        user: { id: "123", email: "test@example.com", role: "faculty" },
        token: "mock-token",
        isAuthenticated: true,
      },
    };

    describe("selectUser", () => {
      test("should select user from state", () => {
        const user = selectUser(mockState);
        expect(user).toEqual(mockState.auth.user);
      });

      test("should return null when no user", () => {
        const state = {
          auth: { user: null, token: null, isAuthenticated: false },
        };
        const user = selectUser(state);
        expect(user).toBeNull();
      });
    });

    describe("selectToken", () => {
      test("should select token from state", () => {
        const token = selectToken(mockState);
        expect(token).toBe("mock-token");
      });

      test("should return null when no token", () => {
        const state = {
          auth: { user: null, token: null, isAuthenticated: false },
        };
        const token = selectToken(state);
        expect(token).toBeNull();
      });
    });

    describe("selectIsAuthenticated", () => {
      test("should return true when authenticated", () => {
        const isAuth = selectIsAuthenticated(mockState);
        expect(isAuth).toBe(true);
      });

      test("should return false when not authenticated", () => {
        const state = {
          auth: { user: null, token: null, isAuthenticated: false },
        };
        const isAuth = selectIsAuthenticated(state);
        expect(isAuth).toBe(false);
      });
    });

    describe("selectIsAdmin", () => {
      test("should return true for admin user", () => {
        const state = {
          auth: {
            user: { id: "123", role: "admin" },
            token: "token",
            isAuthenticated: true,
          },
        };
        const isAdmin = selectIsAdmin(state);
        expect(isAdmin).toBe(true);
      });

      test("should return false for non-admin user", () => {
        const isAdmin = selectIsAdmin(mockState);
        expect(isAdmin).toBe(false);
      });

      test("should return false when no user", () => {
        const state = {
          auth: { user: null, token: null, isAuthenticated: false },
        };
        const isAdmin = selectIsAdmin(state);
        expect(isAdmin).toBe(false);
      });
    });

    describe("selectIsFaculty", () => {
      test("should return true for faculty user", () => {
        const isFaculty = selectIsFaculty(mockState);
        expect(isFaculty).toBe(true);
      });

      test("should return false for non-faculty user", () => {
        const state = {
          auth: {
            user: { id: "123", role: "student" },
            token: "token",
            isAuthenticated: true,
          },
        };
        const isFaculty = selectIsFaculty(state);
        expect(isFaculty).toBe(false);
      });

      test("should return false when no user", () => {
        const state = {
          auth: { user: null, token: null, isAuthenticated: false },
        };
        const isFaculty = selectIsFaculty(state);
        expect(isFaculty).toBe(false);
      });
    });

    describe("selectIsStudent", () => {
      test("should return true for student user", () => {
        const state = {
          auth: {
            user: { id: "123", role: "student" },
            token: "token",
            isAuthenticated: true,
          },
        };
        const isStudent = selectIsStudent(state);
        expect(isStudent).toBe(true);
      });

      test("should return false for non-student user", () => {
        const isStudent = selectIsStudent(mockState);
        expect(isStudent).toBe(false);
      });

      test("should return false when no user", () => {
        const state = {
          auth: { user: null, token: null, isAuthenticated: false },
        };
        const isStudent = selectIsStudent(state);
        expect(isStudent).toBe(false);
      });
    });
  });

  describe("edge cases", () => {
    test("should handle loginSuccess with missing user data", () => {
      const state = authReducer(
        { user: null, token: null, isAuthenticated: false },
        loginSuccess({ user: null, token: "token" })
      );

      expect(state.user).toBeNull();
      expect(state.token).toBe("token");
      expect(state.isAuthenticated).toBe(true);
    });

    test("should handle loginSuccess with missing token", () => {
      const user = { id: "123", email: "test@example.com" };
      const state = authReducer(
        { user: null, token: null, isAuthenticated: false },
        loginSuccess({ user, token: null })
      );

      expect(state.user).toEqual(user);
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(true);
    });

    test("should handle updateUser with null user", () => {
      const initialState = {
        user: null,
        token: "token",
        isAuthenticated: true,
      };

      const state = authReducer(initialState, updateUser({ name: "Test" }));

      expect(state.user).toEqual({ name: "Test" });
    });

    test("should handle updateUser with empty object", () => {
      const initialState = {
        user: { id: "123", name: "Test" },
        token: "token",
        isAuthenticated: true,
      };

      const state = authReducer(initialState, updateUser({}));

      expect(state.user).toEqual({ id: "123", name: "Test" });
    });
  });
});
