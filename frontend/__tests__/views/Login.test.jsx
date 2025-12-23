import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Login from "../../src/views/Login";
import authReducer from "@/store/slices/authSlice";

// Mock functions
const mockNavigate = vi.fn();
const mockLogin = vi.fn();
const mockLocation = { state: null, pathname: "/login" };

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

// Mock apiSlice
vi.mock("@/store/apiSlice", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useLoginMutation: () => [mockLogin, { isLoading: false }],
  };
});

// Helper function to create mock store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        ...initialState.auth,
      },
    },
  });
};

// Helper function to render with providers
const renderWithProviders = (
  ui,
  { initialState = {}, ...renderOptions } = {}
) => {
  const store = createMockStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <MemoryRouter>{ui}</MemoryRouter>
      </Provider>,
      renderOptions
    ),
    store,
  };
};

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation.state = null;
  });

  describe("Rendering", () => {
    it("should render login form with all required fields", () => {
      renderWithProviders(<Login />);

      expect(
        screen.getByRole("heading", { name: /login/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/sign in to your account to continue/i)
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("should render email input with correct attributes", () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).toHaveAttribute("placeholder", "Enter your email");
    });

    it("should render password input with correct attributes", () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toHaveAttribute("required");
      expect(passwordInput).toHaveAttribute(
        "placeholder",
        "Enter your password"
      );
    });

    it("should render link to register page", () => {
      renderWithProviders(<Login />);

      const registerLink = screen.getByRole("link", { name: /sign up/i });
      expect(registerLink).toBeInTheDocument();
      expect(registerLink).toHaveAttribute("href", "/register");
    });
  });

  describe("Form Input Handling", () => {
    it("should update email field on input change", () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput).toHaveValue("test@example.com");
    });

    it("should update password field on input change", () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(passwordInput).toHaveValue("password123");
    });

    it("should clear error when user starts typing in email field", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "Invalid credentials" },
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid/i)).toBeInTheDocument();
      });

      fireEvent.change(emailInput, { target: { value: "new@example.com" } });

      await waitFor(() => {
        expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Successful Login - Role-Based Navigation", () => {
    it("should navigate to student dashboard on successful student login", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "student@example.com", role: "student" },
          token: "fake-token-student",
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, {
        target: { value: "student@example.com" },
      });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
      });
    });

    it("should navigate to faculty dashboard on successful faculty login", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "2", email: "faculty@example.com", role: "faculty" },
          token: "fake-token-faculty",
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, {
        target: { value: "faculty@example.com" },
      });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/faculty/dashboard");
      });
    });

    it("should navigate to admin dashboard on successful admin login", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "3", email: "admin@example.com", role: "admin" },
          token: "fake-token-admin",
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "admin@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
      });
    });

    it("should call login mutation with correct credentials", async () => {
      renderWithProviders(<Login />);

      const unwrapMock = vi.fn().mockResolvedValue({
        data: { id: "1", email: "test@example.com", role: "student" },
        token: "fake-token",
      });

      mockLogin.mockReturnValue({
        unwrap: unwrapMock,
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "password123",
        });
      });
    });
  });

  describe("Login Errors", () => {
    it("should display error message on login failure with custom message", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "Invalid credentials" },
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "wrong@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });

    it("should display error message on login failure with error property", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { error: "Authentication failed" },
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/authentication failed/i)).toBeInTheDocument();
      });
    });

    it("should display default error message when no specific error message provided", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({}),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/invalid email or password/i)
        ).toBeInTheDocument();
      });
    });

    it("should not navigate on login failure", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "Login failed" },
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated User Redirect", () => {
    it("should redirect authenticated student to student dashboard", () => {
      renderWithProviders(<Login />, {
        initialState: {
          auth: {
            isAuthenticated: true,
            user: { id: "1", role: "student" },
            token: "token",
          },
        },
      });

      expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard", {
        replace: true,
      });
    });

    it("should redirect authenticated faculty to faculty dashboard", () => {
      renderWithProviders(<Login />, {
        initialState: {
          auth: {
            isAuthenticated: true,
            user: { id: "2", role: "faculty" },
            token: "token",
          },
        },
      });

      expect(mockNavigate).toHaveBeenCalledWith("/faculty/dashboard", {
        replace: true,
      });
    });

    it("should redirect authenticated admin to admin dashboard", () => {
      renderWithProviders(<Login />, {
        initialState: {
          auth: {
            isAuthenticated: true,
            user: { id: "3", role: "admin" },
            token: "token",
          },
        },
      });

      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard", {
        replace: true,
      });
    });

    it("should not redirect unauthenticated users", () => {
      renderWithProviders(<Login />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Location State Message Display", () => {
    it("should display message from location state", () => {
      mockLocation.state = { message: "Please log in to continue" };

      renderWithProviders(<Login />);

      expect(
        screen.getByText(/please log in to continue/i)
      ).toBeInTheDocument();
    });

    it("should not display message when location state is null", () => {
      mockLocation.state = null;

      renderWithProviders(<Login />);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should display session expired message from location state", () => {
      mockLocation.state = { message: "Your session has expired" };

      renderWithProviders(<Login />);

      expect(screen.getByText(/your session has expired/i)).toBeInTheDocument();
    });
  });

  describe("Form Submission", () => {
    it("should prevent default form submission behavior", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "test@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      const form = screen
        .getByRole("button", { name: /sign in/i })
        .closest("form");
      const submitEvent = new Event("submit", {
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(submitEvent, "preventDefault");

      fireEvent(form, submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should clear error state on form submission", async () => {
      renderWithProviders(<Login />);

      // First, trigger an error
      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "Invalid credentials" },
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrong" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Now submit again with successful login
      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "test@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      fireEvent.change(passwordInput, { target: { value: "correct" } });
      fireEvent.click(submitButton);

      // The error should be cleared during submission
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle user without role defaulting to student dashboard", async () => {
      renderWithProviders(<Login />);

      mockLogin.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "test@example.com" },
          token: "fake-token",
        }),
      });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
      });
    });

    it("should handle empty form submission", async () => {
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });
});
