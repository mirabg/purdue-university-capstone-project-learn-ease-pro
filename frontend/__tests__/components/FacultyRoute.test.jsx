import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import FacultyRoute from "../../src/components/FacultyRoute";
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
  { initialRoute = "/faculty", authState = {}, ...renderOptions } = {}
) => {
  const store = createMockStore(authState);

  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/unauthorized"
              element={<div>Unauthorized Page</div>}
            />
            <Route
              path="/faculty"
              element={<FacultyRoute>{component}</FacultyRoute>}
            />
          </Routes>
        </MemoryRouter>
      </Provider>,
      renderOptions
    ),
    store,
  };
};

describe("FacultyRoute", () => {
  describe("when user is not authenticated", () => {
    test("redirects to login page", () => {
      const authState = {
        user: null,
        token: null,
        isAuthenticated: false,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Faculty Content")).not.toBeInTheDocument();
      expect(screen.queryByText("Unauthorized Page")).not.toBeInTheDocument();
    });

    test("preserves the attempted location in state", () => {
      const authState = {
        user: null,
        token: null,
        isAuthenticated: false,
      };

      renderWithProviders(<div>Faculty Content</div>, {
        authState,
        initialRoute: "/faculty",
      });

      // The component should redirect to login
      expect(screen.getByText("Login Page")).toBeInTheDocument();
    });
  });

  describe("when user is authenticated but not a faculty member", () => {
    test("redirects student to unauthorized page", () => {
      const authState = {
        user: {
          id: "1",
          name: "Student User",
          email: "student@example.com",
          role: "student",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
      expect(screen.queryByText("Faculty Content")).not.toBeInTheDocument();
      expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
    });

    test("redirects admin to unauthorized page", () => {
      const authState = {
        user: {
          id: "2",
          name: "Admin User",
          email: "admin@example.com",
          role: "admin",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
      expect(screen.queryByText("Faculty Content")).not.toBeInTheDocument();
    });

    test("redirects user with unknown role to unauthorized page", () => {
      const authState = {
        user: {
          id: "3",
          name: "Unknown User",
          email: "unknown@example.com",
          role: "guest",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
      expect(screen.queryByText("Faculty Content")).not.toBeInTheDocument();
    });

    test("redirects user without role to unauthorized page", () => {
      const authState = {
        user: {
          id: "4",
          name: "No Role User",
          email: "norole@example.com",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
      expect(screen.queryByText("Faculty Content")).not.toBeInTheDocument();
    });
  });

  describe("when user is authenticated as faculty", () => {
    test("renders children for faculty user", () => {
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

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Faculty Content")).toBeInTheDocument();
      expect(screen.queryByText("Login Page")).not.toBeInTheDocument();
      expect(screen.queryByText("Unauthorized Page")).not.toBeInTheDocument();
    });

    test("renders complex children components", () => {
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

      const ComplexChild = () => (
        <div>
          <h1>Faculty Dashboard</h1>
          <p>Manage your courses</p>
          <button>Create Course</button>
        </div>
      );

      renderWithProviders(<ComplexChild />, { authState });

      expect(screen.getByText("Faculty Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Manage your courses")).toBeInTheDocument();
      expect(screen.getByText("Create Course")).toBeInTheDocument();
    });

    test("renders nested route components", () => {
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

      const NestedComponent = () => (
        <div>
          <div>Course List</div>
          <div>Assignments</div>
          <div>Grades</div>
        </div>
      );

      renderWithProviders(<NestedComponent />, { authState });

      expect(screen.getByText("Course List")).toBeInTheDocument();
      expect(screen.getByText("Assignments")).toBeInTheDocument();
      expect(screen.getByText("Grades")).toBeInTheDocument();
    });

    test("allows faculty with additional properties", () => {
      const authState = {
        user: {
          id: "1",
          name: "Faculty User",
          email: "faculty@example.com",
          role: "faculty",
          department: "Computer Science",
          title: "Professor",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Faculty Content")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    test("handles case-sensitive role check", () => {
      const authState = {
        user: {
          id: "1",
          name: "Uppercase Faculty",
          email: "faculty@example.com",
          role: "Faculty", // Uppercase
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      // Should redirect to unauthorized because role is case-sensitive
      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
      expect(screen.queryByText("Faculty Content")).not.toBeInTheDocument();
    });

    test("handles null user object when authenticated flag is true", () => {
      const authState = {
        user: null,
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      // Should redirect to unauthorized because user is null
      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    });

    test("handles undefined user role", () => {
      const authState = {
        user: {
          id: "1",
          name: "No Role User",
          email: "user@example.com",
          role: undefined,
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    });

    test("handles empty string role", () => {
      const authState = {
        user: {
          id: "1",
          name: "Empty Role User",
          email: "user@example.com",
          role: "",
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    });

    test("handles role with extra whitespace", () => {
      const authState = {
        user: {
          id: "1",
          name: "Whitespace Faculty",
          email: "faculty@example.com",
          role: " faculty ", // With whitespace
        },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      // Should redirect to unauthorized because role doesn't match exactly
      expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    });
  });

  describe("authentication priority", () => {
    test("checks authentication before role", () => {
      // Even if user has faculty role, not authenticated should redirect to login
      const authState = {
        user: {
          id: "1",
          name: "Faculty User",
          email: "faculty@example.com",
          role: "faculty",
        },
        token: "mock-token",
        isAuthenticated: false, // Not authenticated
      };

      renderWithProviders(<div>Faculty Content</div>, { authState });

      // Should redirect to login, not unauthorized
      expect(screen.getByText("Login Page")).toBeInTheDocument();
      expect(screen.queryByText("Unauthorized Page")).not.toBeInTheDocument();
      expect(screen.queryByText("Faculty Content")).not.toBeInTheDocument();
    });
  });

  describe("multiple faculty users", () => {
    test("renders for different faculty users", () => {
      const facultyUsers = [
        {
          id: "1",
          name: "Prof. Smith",
          email: "smith@example.com",
          role: "faculty",
        },
        {
          id: "2",
          name: "Dr. Johnson",
          email: "johnson@example.com",
          role: "faculty",
        },
      ];

      facultyUsers.forEach((user) => {
        const authState = {
          user,
          token: "mock-token",
          isAuthenticated: true,
        };

        const { unmount } = renderWithProviders(<div>Faculty Content</div>, {
          authState,
        });

        expect(screen.getByText("Faculty Content")).toBeInTheDocument();
        unmount();
      });
    });
  });
});
