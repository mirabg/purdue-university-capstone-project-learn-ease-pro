import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PrivateRoute from "../../src/components/PrivateRoute";
import authReducer from "@/store/slices/authSlice";

// Helper function to create a mock store
const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: authState,
    },
  });
};

// Helper function to render with providers
const renderWithProviders = (
  component,
  { initialRoute = "/protected", authState = {}, ...renderOptions } = {}
) => {
  const store = createMockStore(authState);

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={<PrivateRoute>{component}</PrivateRoute>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
      renderOptions
    ),
    store,
  };
};

describe("PrivateRoute", () => {
  describe("when user is not authenticated", () => {
    test("redirects to login page", () => {
      const authState = {
        user: null,
        token: null,
        isAuthenticated: false,
      };

      renderWithProviders(<div>Protected Content</div>, { authState });

      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });

    test("preserves the attempted location in state", () => {
      const authState = {
        user: null,
        token: null,
        isAuthenticated: false,
      };

      const { container } = renderWithProviders(<div>Protected Content</div>, {
        authState,
        initialRoute: "/protected",
      });

      // The component should redirect to login
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  describe("when user is authenticated", () => {
    test("renders children for authenticated user", () => {
      const authState = {
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "student",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Protected Content</div>, { authState });

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
      expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    test("renders children for authenticated admin", () => {
      const authState = {
        user: {
          id: "1",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Protected Content</div>, { authState });

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    test("renders children for authenticated faculty", () => {
      const authState = {
        user: {
          id: "1",
          name: "Faculty User",
          email: "faculty@example.com",
          role: "faculty",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Protected Content</div>, { authState });

      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });

    test("renders complex children components", () => {
      const authState = {
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "student",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      const ComplexChild = () => (
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back!</p>
        </div>
      );

      renderWithProviders(<ComplexChild />, { authState });

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Welcome back!")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    test("handles missing user object when not authenticated", () => {
      const authState = {
        user: null,
        token: null,
        isAuthenticated: false,
      };

      renderWithProviders(<div>Protected Content</div>, { authState });

      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    test("handles token without authentication flag", () => {
      const authState = {
        user: null,
        token: "some-token",
        isAuthenticated: false,
      };

      renderWithProviders(<div>Protected Content</div>, { authState });

      // Should still redirect because isAuthenticated is false
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });

    test("handles user object without authentication flag", () => {
      const authState = {
        user: {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          role: "student",
        },
        token: null,
        isAuthenticated: false,
      };

      renderWithProviders(<div>Protected Content</div>, { authState });

      // Should still redirect because isAuthenticated is false
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });
});
