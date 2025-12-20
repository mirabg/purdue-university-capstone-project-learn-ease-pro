import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Register from "@views/Register";
import { authService } from "@services/authService";

// Mock the authService
vi.mock("@services/authService", () => ({
  authService: {
    register: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render registration form", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    expect(screen.getByText(/Create Student Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create Account/i })
    ).toBeInTheDocument();
  });

  it("should update form fields on input", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);

    fireEvent.change(firstNameInput, { target: { value: "John" } });
    fireEvent.change(lastNameInput, { target: { value: "Doe" } });
    fireEvent.change(emailInput, { target: { value: "john@example.com" } });

    expect(firstNameInput.value).toBe("John");
    expect(lastNameInput.value).toBe("Doe");
    expect(emailInput.value).toBe("john@example.com");
  });

  it("should auto-format phone number", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const phoneInput = screen.getByLabelText(/Phone Number/i);

    fireEvent.change(phoneInput, { target: { value: "5551234567" } });

    expect(phoneInput.value).toBe("555-123-4567");
  });

  it("should auto-format phone number with partial input (4-6 digits)", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const phoneInput = screen.getByLabelText(/Phone Number/i);

    fireEvent.change(phoneInput, { target: { value: "55512" } });

    expect(phoneInput.value).toBe("555-12");
  });

  it("should show error when passwords don't match", async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password \*/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "differentpassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });

  it("should show error when password is too short", async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password \*/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });
  });

  it("should call authService.register and navigate on successful registration", async () => {
    authService.register.mockResolvedValue({ success: true });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password \*/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "password123",
        phone: "",
        address: "",
        city: "",
        state: "",
        zipcode: "",
      });
      expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
    });
  });

  it("should display error message on registration failure", async () => {
    const errorMessage = "User already exists with this email";
    authService.register.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password \*/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("should clear error when user starts typing", async () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password \*/i), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "12345" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 6 characters/i)
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "Jane" },
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Password must be at least 6 characters/i)
      ).not.toBeInTheDocument();
    });
  });

  it("should show loading state during registration", async () => {
    authService.register.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ success: true }), 100)
        )
    );

    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/First Name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/Last Name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/^Password \*/i), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    expect(screen.getByText(/Creating Account.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it("should have link to login page", () => {
    render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );

    const loginLink = screen.getByText(/Sign in/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
  });
});
