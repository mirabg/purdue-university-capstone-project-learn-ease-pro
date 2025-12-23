import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Register from "../../src/views/Register";
import authReducer from "@/store/slices/authSlice";

// Mock functions
const mockNavigate = vi.fn();
const mockRegister = vi.fn();

// Mock react-router-dom
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock apiSlice
vi.mock("@/store/apiSlice", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRegisterMutation: () => [mockRegister, { isLoading: false }],
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

describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render registration form with all required fields", () => {
      renderWithProviders(<Register />);

      expect(
        screen.getByRole("heading", { name: /create student account/i })
      ).toBeInTheDocument();
      expect(screen.getByText(/join us today/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    });

    it("should render optional address fields", () => {
      renderWithProviders(<Register />);

      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
    });

    it("should render submit button", () => {
      renderWithProviders(<Register />);

      expect(
        screen.getByRole("button", { name: /create account/i })
      ).toBeInTheDocument();
    });

    it("should render link to login page", () => {
      renderWithProviders(<Register />);

      const loginLink = screen.getByRole("link", { name: /sign in/i });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Input Handling", () => {
    it("should update firstName field on input change", () => {
      renderWithProviders(<Register />);

      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: "John" } });

      expect(firstNameInput).toHaveValue("John");
    });

    it("should update lastName field on input change", () => {
      renderWithProviders(<Register />);

      const lastNameInput = screen.getByLabelText(/last name/i);
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });

      expect(lastNameInput).toHaveValue("Doe");
    });

    it("should update email field on input change", () => {
      renderWithProviders(<Register />);

      const emailInput = screen.getByLabelText(/email address/i);
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });

      expect(emailInput).toHaveValue("john@example.com");
    });

    it("should update password field on input change", () => {
      renderWithProviders(<Register />);

      const passwordInput = screen.getByLabelText(/^password \*/i);
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(passwordInput).toHaveValue("password123");
    });

    it("should update confirmPassword field on input change", () => {
      renderWithProviders(<Register />);

      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      expect(confirmPasswordInput).toHaveValue("password123");
    });

    it("should update address field on input change", () => {
      renderWithProviders(<Register />);

      const addressInput = screen.getByLabelText(/address/i);
      fireEvent.change(addressInput, { target: { value: "123 Main St" } });

      expect(addressInput).toHaveValue("123 Main St");
    });

    it("should update city field on input change", () => {
      renderWithProviders(<Register />);

      const cityInput = screen.getByLabelText(/city/i);
      fireEvent.change(cityInput, { target: { value: "New York" } });

      expect(cityInput).toHaveValue("New York");
    });

    it("should update state field on input change", () => {
      renderWithProviders(<Register />);

      const stateInput = screen.getByLabelText(/state/i);
      fireEvent.change(stateInput, { target: { value: "NY" } });

      expect(stateInput).toHaveValue("NY");
    });

    it("should update zipcode field on input change", () => {
      renderWithProviders(<Register />);

      const zipcodeInput = screen.getByLabelText(/zip code/i);
      fireEvent.change(zipcodeInput, { target: { value: "10001" } });

      expect(zipcodeInput).toHaveValue("10001");
    });
  });

  describe("Phone Number Formatting", () => {
    it("should format phone number as xxx-xxx-xxxx", () => {
      renderWithProviders(<Register />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });

      expect(phoneInput).toHaveValue("123-456-7890");
    });

    it("should format partial phone number correctly (6 digits)", () => {
      renderWithProviders(<Register />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, { target: { value: "123456" } });

      expect(phoneInput).toHaveValue("123-456");
    });

    it("should format partial phone number correctly (3 digits)", () => {
      renderWithProviders(<Register />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, { target: { value: "123" } });

      expect(phoneInput).toHaveValue("123");
    });

    it("should remove non-digit characters from phone number", () => {
      renderWithProviders(<Register />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, {
        target: { value: "abc123def456ghi7890" },
      });

      expect(phoneInput).toHaveValue("123-456-7890");
    });

    it("should limit phone number to 10 digits", () => {
      renderWithProviders(<Register />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, { target: { value: "12345678901234" } });

      expect(phoneInput).toHaveValue("123-456-7890");
    });

    it("should handle phone number with existing dashes", () => {
      renderWithProviders(<Register />);

      const phoneInput = screen.getByLabelText(/phone number/i);
      fireEvent.change(phoneInput, { target: { value: "123-456-7890" } });

      expect(phoneInput).toHaveValue("123-456-7890");
    });
  });

  describe("Password Validation", () => {
    it("should display error when passwords do not match", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn(),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "differentpassword" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it("should display error when password is less than 6 characters", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn(),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "12345" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "12345" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters long/i)
        ).toBeInTheDocument();
      });

      expect(mockRegister).not.toHaveBeenCalled();
    });

    it("should accept password with exactly 6 characters", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "john@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "123456" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "123456" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalled();
      });
    });

    it("should clear error when user starts typing", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn(),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "differentpassword" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });

      await waitFor(() => {
        expect(
          screen.queryByText(/passwords do not match/i)
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Successful Registration", () => {
    it("should call register mutation with correct data on successful submission", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "john@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.change(phoneInput, { target: { value: "1234567890" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "password123",
          phone: "123-456-7890",
          address: "",
          city: "",
          state: "",
          zipcode: "",
        });
      });
    });

    it("should navigate to student dashboard on successful registration", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "john@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
      });
    });

    it("should exclude confirmPassword from registration data", async () => {
      renderWithProviders(<Register />);

      const unwrapMock = vi.fn().mockResolvedValue({
        data: { id: "1", email: "john@example.com", role: "student" },
        token: "fake-token",
      });

      mockRegister.mockReturnValue({
        unwrap: unwrapMock,
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const callArgs = mockRegister.mock.calls[0][0];
        expect(callArgs).not.toHaveProperty("confirmPassword");
        expect(callArgs).toHaveProperty("password");
      });
    });

    it("should include optional fields in registration data when provided", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "john@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const addressInput = screen.getByLabelText(/address/i);
      const cityInput = screen.getByLabelText(/city/i);
      const stateInput = screen.getByLabelText(/state/i);
      const zipcodeInput = screen.getByLabelText(/zip code/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.change(addressInput, { target: { value: "123 Main St" } });
      fireEvent.change(cityInput, { target: { value: "New York" } });
      fireEvent.change(stateInput, { target: { value: "NY" } });
      fireEvent.change(zipcodeInput, { target: { value: "10001" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            address: "123 Main St",
            city: "New York",
            state: "NY",
            zipcode: "10001",
          })
        );
      });
    });
  });

  describe("Registration Errors", () => {
    it("should display error message on registration failure with message property", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "Email already exists" },
        }),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, {
        target: { value: "existing@example.com" },
      });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });
    });

    it("should display error message on registration failure with error property", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { error: "Invalid email format" },
        }),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "invalid-email" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it("should display default error message when no specific error provided", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({}),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/registration failed\. please try again\./i)
        ).toBeInTheDocument();
      });
    });

    it("should not navigate on registration failure", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "Registration failed" },
        }),
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Authenticated User Redirect", () => {
    it("should redirect authenticated student to student dashboard", () => {
      renderWithProviders(<Register />, {
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
      renderWithProviders(<Register />, {
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
      renderWithProviders(<Register />, {
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
      renderWithProviders(<Register />);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Form Submission", () => {
    it("should prevent default form submission behavior", async () => {
      renderWithProviders(<Register />);

      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "john@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      const form = screen
        .getByRole("button", { name: /create account/i })
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
      renderWithProviders(<Register />);

      // First, trigger a validation error
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password \*/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      fireEvent.change(firstNameInput, { target: { value: "John" } });
      fireEvent.change(lastNameInput, { target: { value: "Doe" } });
      fireEvent.change(emailInput, { target: { value: "john@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: "differentpassword" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      // Now fix the password and submit again
      mockRegister.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({
          data: { id: "1", email: "john@example.com", role: "student" },
          token: "fake-token",
        }),
      });

      fireEvent.change(confirmPasswordInput, {
        target: { value: "password123" },
      });
      fireEvent.click(submitButton);

      // The error should be cleared during submission
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled();
      });
    });

    it("should handle empty form submission", async () => {
      renderWithProviders(<Register />);

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      fireEvent.click(submitButton);

      // HTML5 validation should prevent submission
      expect(mockRegister).not.toHaveBeenCalled();
    });
  });
});
