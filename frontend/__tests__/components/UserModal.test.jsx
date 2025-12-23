import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import UserModal from "../../src/components/UserModal";
import { apiSlice } from "@/store/apiSlice";

// Mock the Icon component
vi.mock("@components/Icon", () => ({
  default: ({ name, className }) => (
    <span data-icon={name} className={className} />
  ),
}));

// Helper to create mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
};

// Helper to render with providers
const renderWithProviders = (component) => {
  const store = createMockStore();
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe("UserModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    test("renders create user modal", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      expect(screen.getByText("Create New User")).toBeInTheDocument();
    });

    test("renders edit user modal when user provided", () => {
      const user = {
        _id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "student",
      };
      renderWithProviders(<UserModal user={user} onClose={mockOnClose} />);
      expect(screen.getByText("Edit User")).toBeInTheDocument();
    });

    test("renders close button", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      const closeButton = screen.getByRole("button", { name: "" });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("form fields", () => {
    test("renders all personal information fields", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    test("renders password fields in create mode", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    });

    test("renders address fields", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      expect(screen.getByLabelText(/^Address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Zipcode/i)).toBeInTheDocument();
    });

    test("renders phone field", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      expect(screen.getByLabelText(/Phone/i)).toBeInTheDocument();
    });

    test("renders role dropdown", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    test("renders active toggle", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      expect(screen.getByLabelText(/Active/i)).toBeInTheDocument();
    });
  });

  describe("form pre-population in edit mode", () => {
    test("pre-fills form with user data", () => {
      const user = {
        _id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "student",
        address: "123 Main St",
        city: "Springfield",
        state: "IL",
        zipcode: "62701",
        phone: "555-555-5555",
        isActive: true,
      };

      renderWithProviders(<UserModal user={user} onClose={mockOnClose} />);

      expect(screen.getByDisplayValue("John")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
      expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
      expect(screen.getByDisplayValue("123 Main St")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Springfield")).toBeInTheDocument();
    });

    test("does not pre-fill password in edit mode", () => {
      const user = {
        _id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "student",
      };

      renderWithProviders(<UserModal user={user} onClose={mockOnClose} />);

      const passwordInputs = screen.getAllByLabelText(/Password/i);
      passwordInputs.forEach((input) => {
        expect(input).toHaveValue("");
      });
    });
  });

  describe("form interactions", () => {
    test("updates first name field on input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const input = screen.getByLabelText(/First Name/i);
      await user.type(input, "Jane");

      expect(input).toHaveValue("Jane");
    });

    test("updates email field on input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const input = screen.getByLabelText(/Email/i);
      await user.type(input, "test@example.com");

      expect(input).toHaveValue("test@example.com");
    });

    test("formats phone number automatically", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const input = screen.getByLabelText(/Phone/i);
      await user.type(input, "5551234567");

      expect(input).toHaveValue("555-123-4567");
    });

    test("changes role selection", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const select = screen.getByLabelText(/Role/i);
      await user.selectOptions(select, "faculty");

      expect(select).toHaveValue("faculty");
    });

    test("toggles active checkbox", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const checkbox = screen.getByLabelText(/Active/i);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("form validation", () => {
    test("shows error when first name is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: /^create$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("First name is required")).toBeInTheDocument();
      });
    });

    test("shows error when last name is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: /^create$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Last name is required")).toBeInTheDocument();
      });
    });

    test("shows error when email is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: /^create$/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });

    test("clears field error when user types", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", { name: /^create$/i });
      await user.click(submitButton);

      const input = screen.getByLabelText(/First Name/i);
      await user.type(input, "John");

      await waitFor(() => {
        expect(
          screen.queryByText("First name is required")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("role options", () => {
    test("displays all role options", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const select = screen.getByLabelText(/Role/i);
      const options = Array.from(select.querySelectorAll("option"));
      const optionTexts = options.map((opt) => opt.textContent);

      expect(optionTexts).toContain("Student");
      expect(optionTexts).toContain("Faculty");
      expect(optionTexts).toContain("Admin");
    });

    test("defaults to student role", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      const select = screen.getByLabelText(/Role/i);
      expect(select).toHaveValue("student");
    });
  });

  describe("modal actions", () => {
    test("calls onClose when close button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole("button");
      const closeButton = closeButtons.find((btn) => {
        const icon = btn.querySelector('[data-icon="close"]');
        return icon !== null;
      });

      await user.click(closeButton);
      expect(mockOnClose).toHaveBeenCalled();
    });

    test("calls onClose when cancel button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("renders submit button with correct text in create mode", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      expect(
        screen.getByRole("button", { name: /^create$/i })
      ).toBeInTheDocument();
    });

    test("renders submit button with correct text in edit mode", () => {
      const user = {
        _id: "1",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "student",
      };

      renderWithProviders(<UserModal user={user} onClose={mockOnClose} />);

      expect(
        screen.getByRole("button", { name: /^update$/i })
      ).toBeInTheDocument();
    });
  });

  describe("phone number formatting", () => {
    test("formats 10-digit phone number", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const input = screen.getByLabelText(/Phone/i);
      await user.type(input, "1234567890");

      expect(input).toHaveValue("123-456-7890");
    });

    test("handles partial phone number input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const input = screen.getByLabelText(/Phone/i);
      await user.type(input, "12345");

      expect(input).toHaveValue("123-45");
    });

    test("limits phone number to 10 digits", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const input = screen.getByLabelText(/Phone/i);
      await user.type(input, "12345678901234");

      expect(input).toHaveValue("123-456-7890");
    });

    test("removes non-digit characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      const input = screen.getByLabelText(/Phone/i);
      await user.type(input, "123abc456def7890");

      expect(input).toHaveValue("123-456-7890");
    });
  });

  describe("accessibility", () => {
    test("form inputs have proper labels", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);

      expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    });

    test("required fields are marked", () => {
      renderWithProviders(<UserModal onClose={mockOnClose} />);
      const asterisks = screen.getAllByText("*");
      expect(asterisks.length).toBeGreaterThan(0);
    });
  });
});
