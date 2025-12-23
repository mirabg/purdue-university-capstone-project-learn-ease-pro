import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { configureStore } from "@reduxjs/toolkit";
import Header from "../../src/components/Header";
import authReducer from "@/store/slices/authSlice";

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

// Helper to render with providers
const renderWithProviders = (component, initialState = {}) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{component}</MemoryRouter>
      </Provider>
    ),
    store,
  };
};

describe("Header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    test("renders header element", () => {
      renderWithProviders(<Header />);
      const header = screen.getByRole("banner");
      expect(header).toBeInTheDocument();
    });

    test("renders logo", () => {
      renderWithProviders(<Header />);
      const logo = screen.getByAltText("Logo");
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", "/images/logo.svg");
    });

    test("logo links to home page", () => {
      renderWithProviders(<Header />);
      const logoLink = screen.getByRole("link");
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("unauthenticated state", () => {
    test("does not show user info when not authenticated", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: null,
          isAuthenticated: false,
          token: null,
        },
      });

      expect(screen.queryByText(/User:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Role:/i)).not.toBeInTheDocument();
    });

    test("does not show logout button when not authenticated", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: null,
          isAuthenticated: false,
          token: null,
        },
      });

      expect(
        screen.queryByRole("button", { name: /logout/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("authenticated state", () => {
    test("shows user info when authenticated", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText(/User:/i)).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    test("shows role when authenticated", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            role: "faculty",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText(/Role:/i)).toBeInTheDocument();
      expect(screen.getByText("Faculty")).toBeInTheDocument();
    });

    test("capitalizes role name", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "Admin",
            lastName: "User",
            email: "admin@example.com",
            role: "admin",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    test("shows logout button when authenticated", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(
        screen.getByRole("button", { name: /logout/i })
      ).toBeInTheDocument();
    });
  });

  describe("user name display", () => {
    test("displays full name when both firstName and lastName exist", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    test("displays firstName only when lastName is missing", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText("John")).toBeInTheDocument();
    });

    test("displays email when firstName is missing", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  describe("logout functionality", () => {
    test("calls logout action and navigates to login on logout click", async () => {
      const user = userEvent.setup();
      const { store } = renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      await user.click(logoutButton);

      // Check that logout action was dispatched
      const state = store.getState();
      expect(state.auth.isAuthenticated).toBe(false);
      expect(state.auth.user).toBe(null);
      expect(state.auth.token).toBe(null);

      // Check navigation
      expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("logout button has correct styling", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toHaveClass("bg-primary-600");
      expect(logoutButton).toHaveClass("text-white");
    });
  });

  describe("role display variations", () => {
    test("displays student role correctly", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText("Student")).toBeInTheDocument();
    });

    test("displays faculty role correctly", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "2",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane@example.com",
            role: "faculty",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText("Faculty")).toBeInTheDocument();
    });

    test("displays admin role correctly", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "3",
            firstName: "Admin",
            lastName: "User",
            email: "admin@example.com",
            role: "admin",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
  });

  describe("styling and layout", () => {
    test("header has correct background and border", () => {
      renderWithProviders(<Header />);
      const header = screen.getByRole("banner");
      expect(header).toHaveClass("bg-white");
      expect(header).toHaveClass("shadow-sm");
      expect(header).toHaveClass("border-b");
    });

    test("user info is positioned on the right", () => {
      const { container } = renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      const userInfoContainer = container.querySelector(".absolute.right-0");
      expect(userInfoContainer).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    test("logout button is accessible", () => {
      renderWithProviders(<Header />, {
        auth: {
          user: {
            _id: "1",
            firstName: "John",
            lastName: "Doe",
            email: "john@example.com",
            role: "student",
          },
          isAuthenticated: true,
          token: "mock-token",
        },
      });

      const logoutButton = screen.getByRole("button", { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    test("logo has alt text", () => {
      renderWithProviders(<Header />);
      const logo = screen.getByAltText("Logo");
      expect(logo).toBeInTheDocument();
    });
  });
});
