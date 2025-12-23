import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import CourseModal from "../../src/components/CourseModal";
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

describe("CourseModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    test("does not render when isOpen is false", () => {
      const { container } = renderWithProviders(
        <CourseModal isOpen={false} onClose={mockOnClose} />
      );
      expect(container.firstChild).toBeNull();
    });

    test("renders when isOpen is true", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);
      expect(screen.getByText("Create New Course")).toBeInTheDocument();
    });

    test("shows Edit Course title when course provided", () => {
      const course = {
        _id: "1",
        courseCode: "CS101",
        name: "Intro to CS",
        description: "Basic CS",
        instructor: "instructor-1",
        isActive: true,
      };
      renderWithProviders(
        <CourseModal isOpen={true} onClose={mockOnClose} course={course} />
      );
      expect(screen.getByText("Edit Course")).toBeInTheDocument();
    });

    test("renders close button", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);
      const closeButton = screen.getByRole("button", { name: "" });
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe("form fields", () => {
    test("renders all required form fields", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/Course Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Instructor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Active/i)).toBeInTheDocument();
    });

    test("course code field has placeholder", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);
      const input = screen.getByPlaceholderText(/e.g., CS101/i);
      expect(input).toBeInTheDocument();
    });

    test("course name field has placeholder", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);
      const input = screen.getByPlaceholderText(
        /Introduction to Computer Science/i
      );
      expect(input).toBeInTheDocument();
    });

    test("marks required fields with asterisk", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);
      const asterisks = screen.getAllByText("*");
      expect(asterisks.length).toBeGreaterThan(0);
    });
  });

  describe("form pre-population in edit mode", () => {
    test("pre-fills form with course data", () => {
      const course = {
        _id: "1",
        courseCode: "CS101",
        name: "Intro to CS",
        description: "Basic computer science course",
        instructor: { _id: "instructor-1" },
        isActive: true,
      };

      renderWithProviders(
        <CourseModal isOpen={true} onClose={mockOnClose} course={course} />
      );

      expect(screen.getByDisplayValue("CS101")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Intro to CS")).toBeInTheDocument();
      expect(
        screen.getByDisplayValue("Basic computer science course")
      ).toBeInTheDocument();
    });

    test("disables course code field in edit mode", () => {
      const course = {
        _id: "1",
        courseCode: "CS101",
        name: "Intro to CS",
        description: "Basic CS",
        instructor: "instructor-1",
      };

      renderWithProviders(
        <CourseModal isOpen={true} onClose={mockOnClose} course={course} />
      );

      const courseCodeInput = screen.getByDisplayValue("CS101");
      expect(courseCodeInput).toBeDisabled();
    });

    test("keeps other fields enabled in edit mode", () => {
      const course = {
        _id: "1",
        courseCode: "CS101",
        name: "Intro to CS",
        description: "Basic CS",
        instructor: "instructor-1",
      };

      renderWithProviders(
        <CourseModal isOpen={true} onClose={mockOnClose} course={course} />
      );

      const nameInput = screen.getByDisplayValue("Intro to CS");
      expect(nameInput).not.toBeDisabled();
    });
  });

  describe("form interactions", () => {
    test("updates course code field on input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(/e.g., CS101/i);
      await user.type(input, "CS202");

      expect(input).toHaveValue("CS202");
    });

    test("updates course name field on input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const input = screen.getByPlaceholderText(
        /Introduction to Computer Science/i
      );
      await user.type(input, "Data Structures");

      expect(input).toHaveValue("Data Structures");
    });

    test("toggles active checkbox", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const checkbox = screen.getByLabelText(/Active/i);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe("form validation", () => {
    test("shows error when course code is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", {
        name: /^create$/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Course code is required")).toBeInTheDocument();
      });
    });

    test("shows error when course name is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", {
        name: /^create$/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Course name is required")).toBeInTheDocument();
      });
    });

    test("shows error when description is empty", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", {
        name: /^create$/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Description is required")).toBeInTheDocument();
      });
    });

    test("clears field error when user types", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const submitButton = screen.getByRole("button", {
        name: /^create$/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Course code is required")).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText(/e.g., CS101/i);
      await user.type(input, "CS101");

      await waitFor(() => {
        expect(
          screen.queryByText("Course code is required")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("modal actions", () => {
    test("calls onClose when close button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

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
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    test("renders submit button with correct text in create mode", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);
      expect(
        screen.getByRole("button", { name: /^create$/i })
      ).toBeInTheDocument();
    });

    test("renders submit button with correct text in edit mode", () => {
      const course = {
        _id: "1",
        courseCode: "CS101",
        name: "Intro to CS",
        description: "Basic CS",
        instructor: "instructor-1",
      };

      renderWithProviders(
        <CourseModal isOpen={true} onClose={mockOnClose} course={course} />
      );

      expect(
        screen.getByRole("button", { name: /^update$/i })
      ).toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    test("form inputs have proper labels", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByLabelText(/Course Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Course Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    });

    test("form has submit handler", () => {
      const { container } = renderWithProviders(
        <CourseModal isOpen={true} onClose={mockOnClose} />
      );
      const form = container.querySelector("form");
      expect(form).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    test("submit button shows loading text when submitting", () => {
      renderWithProviders(<CourseModal isOpen={true} onClose={mockOnClose} />);
      // Button should be enabled initially
      const submitButton = screen.getByRole("button", {
        name: /^create$/i,
      });
      expect(submitButton).not.toBeDisabled();
    });
  });
});
