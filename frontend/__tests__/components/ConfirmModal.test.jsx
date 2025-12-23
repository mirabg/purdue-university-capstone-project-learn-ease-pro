import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmModal from "../../src/components/ConfirmModal";

describe("ConfirmModal", () => {
  describe("rendering", () => {
    test("does not render when isOpen is false", () => {
      const { container } = render(
        <ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      expect(container.firstChild).toBeNull();
    });

    test("renders when isOpen is true", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    test("renders custom title", () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Delete Course"
        />
      );
      expect(screen.getByText("Delete Course")).toBeInTheDocument();
    });

    test("renders default title when not provided", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    test("renders custom message", () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          message="Are you sure you want to delete this course?"
        />
      );
      expect(
        screen.getByText("Are you sure you want to delete this course?")
      ).toBeInTheDocument();
    });

    test("renders default message when not provided", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      expect(
        screen.getByText("Are you sure you want to proceed?")
      ).toBeInTheDocument();
    });
  });

  describe("buttons", () => {
    test("renders Cancel button", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    test("renders Delete button", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    test("Cancel button has correct styling", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toHaveClass("border-gray-300");
      expect(cancelButton).toHaveClass("text-gray-700");
    });

    test("Delete button has danger styling", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      const deleteButton = screen.getByText("Delete");
      expect(deleteButton).toHaveClass("bg-red-600");
      expect(deleteButton).toHaveClass("text-white");
    });
  });

  describe("interactions", () => {
    test("calls onClose when Cancel button clicked", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(
        <ConfirmModal isOpen={true} onClose={onClose} onConfirm={vi.fn()} />
      );

      await user.click(screen.getByText("Cancel"));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("calls onConfirm when Delete button clicked", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();

      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={onConfirm} />
      );

      await user.click(screen.getByText("Delete"));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    test("calls both onConfirm and onClose when Delete button clicked", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      const onClose = vi.fn();

      render(
        <ConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />
      );

      await user.click(screen.getByText("Delete"));

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("calls onConfirm before onClose", async () => {
      const user = userEvent.setup();
      const callOrder = [];
      const onConfirm = vi.fn(() => callOrder.push("confirm"));
      const onClose = vi.fn(() => callOrder.push("close"));

      render(
        <ConfirmModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />
      );

      await user.click(screen.getByText("Delete"));

      expect(callOrder).toEqual(["confirm", "close"]);
    });
  });

  describe("modal styling and structure", () => {
    test("applies modal overlay styling", () => {
      const { container } = render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      const overlay = container.firstChild;
      expect(overlay).toHaveClass("fixed");
      expect(overlay).toHaveClass("inset-0");
      expect(overlay).toHaveClass("bg-gray-600");
      expect(overlay).toHaveClass("bg-opacity-50");
      expect(overlay).toHaveClass("z-50");
    });

    test("applies modal content styling", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );
      const title = screen.getByText("Confirm Action");
      expect(title).toHaveClass("text-lg");
      expect(title).toHaveClass("font-semibold");
    });

    test("has correct DOM structure", () => {
      const { container } = render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );

      // Check overlay > modal > content structure
      const overlay = container.firstChild;
      const modal = overlay?.querySelector(".bg-white");
      const content = modal?.querySelector(".p-6");

      expect(overlay).toBeInTheDocument();
      expect(modal).toBeInTheDocument();
      expect(content).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    test("handles empty title gracefully", () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title=""
        />
      );
      // Should render default title
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    test("handles empty message gracefully", () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          message=""
        />
      );
      // Should render default message
      expect(
        screen.getByText("Are you sure you want to proceed?")
      ).toBeInTheDocument();
    });

    test("handles null title", () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title={null}
        />
      );
      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    test("handles null message", () => {
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          message={null}
        />
      );
      expect(
        screen.getByText("Are you sure you want to proceed?")
      ).toBeInTheDocument();
    });

    test("handles long message text", () => {
      const longMessage = "A".repeat(500);
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          message={longMessage}
        />
      );
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    test("handles special characters in message", () => {
      const message = "Delete item: <>&\"'?";
      render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          message={message}
        />
      );
      expect(screen.getByText(message)).toBeInTheDocument();
    });
  });

  describe("multiple instances", () => {
    test("can toggle between open and closed", () => {
      const { rerender, container } = render(
        <ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
      );

      expect(container.firstChild).toBeNull();

      rerender(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );

      expect(screen.getByText("Confirm Action")).toBeInTheDocument();

      rerender(
        <ConfirmModal isOpen={false} onClose={vi.fn()} onConfirm={vi.fn()} />
      );

      expect(container.firstChild).toBeNull();
    });

    test("updates content when props change", () => {
      const { rerender } = render(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="First Title"
          message="First Message"
        />
      );

      expect(screen.getByText("First Title")).toBeInTheDocument();
      expect(screen.getByText("First Message")).toBeInTheDocument();

      rerender(
        <ConfirmModal
          isOpen={true}
          onClose={vi.fn()}
          onConfirm={vi.fn()}
          title="Second Title"
          message="Second Message"
        />
      );

      expect(screen.getByText("Second Title")).toBeInTheDocument();
      expect(screen.getByText("Second Message")).toBeInTheDocument();
      expect(screen.queryByText("First Title")).not.toBeInTheDocument();
      expect(screen.queryByText("First Message")).not.toBeInTheDocument();
    });
  });

  describe("accessibility", () => {
    test("buttons are keyboard accessible", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );

      const cancelButton = screen.getByText("Cancel");
      const deleteButton = screen.getByText("Delete");

      expect(cancelButton.tagName).toBe("BUTTON");
      expect(deleteButton.tagName).toBe("BUTTON");
    });

    test("buttons have focus styles", () => {
      render(
        <ConfirmModal isOpen={true} onClose={vi.fn()} onConfirm={vi.fn()} />
      );

      const cancelButton = screen.getByText("Cancel");
      expect(cancelButton).toHaveClass("focus:outline-none");
      expect(cancelButton).toHaveClass("focus:ring-2");
    });
  });
});
