import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import UserModal from "@components/UserModal";

vi.mock("@services/userService");

describe("UserModal", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create mode", () => {
    render(<UserModal user={null} onClose={mockOnClose} />);
    expect(screen.getByText("Create New User")).toBeInTheDocument();
  });

  it("should render edit mode with user data", () => {
    const mockUser = {
      _id: "123",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
      isActive: true,
    };

    render(<UserModal user={mockUser} onClose={mockOnClose} />);
    expect(screen.getByText("Edit User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
  });
});
