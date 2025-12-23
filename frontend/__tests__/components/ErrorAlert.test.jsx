import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorAlert from "../../src/components/ErrorAlert";

describe("ErrorAlert", () => {
  describe("rendering", () => {
    test("renders error message from string", () => {
      render(<ErrorAlert error="Test error message" />);
      expect(screen.getByText("Test error message")).toBeInTheDocument();
      expect(screen.getByText("Error")).toBeInTheDocument();
    });

    test("does not render when error is null", () => {
      const { container } = render(<ErrorAlert error={null} />);
      expect(container.firstChild).toBeNull();
    });

    test("does not render when error is undefined", () => {
      const { container } = render(<ErrorAlert error={undefined} />);
      expect(container.firstChild).toBeNull();
    });

    test("does not render when error is empty string", () => {
      const { container } = render(<ErrorAlert error="" />);
      expect(container.firstChild).toBeNull();
    });

    test("renders with custom className", () => {
      const { container } = render(
        <ErrorAlert error="Test error" className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });

  describe("error message extraction", () => {
    test("extracts message from error.data.message", () => {
      const error = { data: { message: "Custom error message" } };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });

    test("extracts message from error.data.error", () => {
      const error = { data: { error: "Error from data.error" } };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("Error from data.error")).toBeInTheDocument();
    });

    test("extracts message from error.message", () => {
      const error = { message: "Error message property" };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("Error message property")).toBeInTheDocument();
    });

    test("extracts message from error.error string", () => {
      const error = { error: "Error string property" };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("Error string property")).toBeInTheDocument();
    });

    test("uses default message when no specific message found", () => {
      const error = { someOtherProperty: "value" };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });

    test("uses custom default message", () => {
      const error = { someOtherProperty: "value" };
      render(
        <ErrorAlert error={error} defaultMessage="Custom default message" />
      );
      expect(screen.getByText("Custom default message")).toBeInTheDocument();
    });
  });

  describe("RTK Query error formats", () => {
    test("handles FETCH_ERROR status", () => {
      const error = { status: "FETCH_ERROR" };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(
          /Unable to connect to the server. Please check your internet connection/i
        )
      ).toBeInTheDocument();
    });

    test("handles FETCH_ERROR originalStatus", () => {
      const error = { originalStatus: "FETCH_ERROR" };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(
          /Unable to connect to the server. Please check your internet connection/i
        )
      ).toBeInTheDocument();
    });

    test("handles 500 Internal Server Error", () => {
      const error = { status: 500 };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(/The server encountered an error/i)
      ).toBeInTheDocument();
    });

    test("handles 500 originalStatus", () => {
      const error = { originalStatus: 500 };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(/The server encountered an error/i)
      ).toBeInTheDocument();
    });

    test("handles 503 Service Unavailable", () => {
      const error = { status: 503 };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(/The service is temporarily unavailable/i)
      ).toBeInTheDocument();
    });

    test("handles 401 Unauthorized", () => {
      const error = { status: 401 };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(/Your session has expired. Please log in again/i)
      ).toBeInTheDocument();
    });

    test("handles 403 Forbidden", () => {
      const error = { status: 403 };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(/You don't have permission to perform this action/i)
      ).toBeInTheDocument();
    });

    test("handles 404 Not Found with custom message", () => {
      const error = { status: 404, data: { message: "User not found" } };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("User not found")).toBeInTheDocument();
    });

    test("handles 404 Not Found without custom message", () => {
      const error = { status: 404 };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(/The requested resource was not found/i)
      ).toBeInTheDocument();
    });
  });

  describe("network errors", () => {
    test("handles Failed to fetch error", () => {
      const error = { error: "Failed to fetch from server" };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(
          /Unable to connect to the server. Please check your internet connection/i
        )
      ).toBeInTheDocument();
    });

    test("handles NetworkError", () => {
      const error = { error: "NetworkError when attempting to fetch" };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText(
          /Unable to connect to the server. Please check your internet connection/i
        )
      ).toBeInTheDocument();
    });

    test("handles other error strings", () => {
      const error = { error: "Some other error message" };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("Some other error message")).toBeInTheDocument();
    });
  });

  describe("dismiss functionality", () => {
    test("renders dismiss button when onDismiss provided", () => {
      const onDismiss = vi.fn();
      render(<ErrorAlert error="Test error" onDismiss={onDismiss} />);
      const dismissButton = screen.getByRole("button", { name: /dismiss/i });
      expect(dismissButton).toBeInTheDocument();
    });

    test("does not render dismiss button when onDismiss not provided", () => {
      render(<ErrorAlert error="Test error" />);
      const dismissButton = screen.queryByRole("button", { name: /dismiss/i });
      expect(dismissButton).not.toBeInTheDocument();
    });

    test("calls onDismiss when dismiss button clicked", async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      render(<ErrorAlert error="Test error" onDismiss={onDismiss} />);
      const dismissButton = screen.getByRole("button", { name: /dismiss/i });

      await user.click(dismissButton);

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    test("dismiss button has correct aria-label", () => {
      const onDismiss = vi.fn();
      render(<ErrorAlert error="Test error" onDismiss={onDismiss} />);
      const dismissButton = screen.getByRole("button", { name: "Dismiss" });
      expect(dismissButton).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    test("applies correct base classes", () => {
      const { container } = render(<ErrorAlert error="Test error" />);
      const alert = container.firstChild;
      expect(alert).toHaveClass("bg-red-50");
      expect(alert).toHaveClass("border");
      expect(alert).toHaveClass("border-red-200");
      expect(alert).toHaveClass("rounded-md");
      expect(alert).toHaveClass("p-4");
    });

    test("renders error icon", () => {
      const { container } = render(<ErrorAlert error="Test error" />);
      const icon = container.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    test("applies correct text styling", () => {
      render(<ErrorAlert error="Test error" />);
      const errorTitle = screen.getByText("Error");
      expect(errorTitle).toHaveClass("text-sm");
      expect(errorTitle).toHaveClass("font-medium");
      expect(errorTitle).toHaveClass("text-red-800");
    });
  });

  describe("complex error scenarios", () => {
    test("handles error with both status and message", () => {
      const error = {
        status: 404,
        data: { message: "Course with ID 123 not found" },
      };
      render(<ErrorAlert error={error} />);
      expect(
        screen.getByText("Course with ID 123 not found")
      ).toBeInTheDocument();
    });

    test("handles nested error objects", () => {
      const error = {
        response: {
          data: {
            error: "Nested error message",
          },
        },
      };
      render(<ErrorAlert error={error} />);
      // Should fall back to default message since this structure isn't specifically handled
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });

    test("prioritizes status codes over generic messages", () => {
      const error = {
        status: 500,
        message: "Generic message",
      };
      render(<ErrorAlert error={error} />);
      // Should show 500-specific message, not generic one
      expect(
        screen.getByText(/The server encountered an error/i)
      ).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    test("handles empty error object", () => {
      const error = {};
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });

    test("handles error with null message", () => {
      const error = { message: null };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });

    test("handles error with undefined message", () => {
      const error = { message: undefined };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });

    test("handles error with empty string message", () => {
      const error = { message: "" };
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });

    test("handles boolean error (edge case)", () => {
      const error = true;
      render(<ErrorAlert error={error} />);
      expect(screen.getByText("An error occurred")).toBeInTheDocument();
    });
  });
});
