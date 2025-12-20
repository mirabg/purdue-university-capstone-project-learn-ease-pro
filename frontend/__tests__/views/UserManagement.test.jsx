import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import UserManagement from "@views/UserManagement";
import { userService } from "@services/userService";

vi.mock("@services/userService");
vi.mock("@components/UserModal", () => ({
  default: () => <div data-testid="user-modal">Mock Modal</div>,
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("UserManagement", () => {
  const mockUsers = [
    {
      _id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
      isActive: true,
    },
    {
      _id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@example.com",
      role: "instructor",
      isActive: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render user management page", async () => {
    userService.getAllUsers.mockResolvedValue({
      success: true,
      data: mockUsers,
      count: 2,
      totalPages: 1,
    });

    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("User Management")).toBeInTheDocument();
    });
  });

  it("should display users", async () => {
    userService.getAllUsers.mockResolvedValue({
      success: true,
      data: mockUsers,
      count: 2,
      totalPages: 1,
    });

    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });
  });

  it("should show loading state", () => {
    userService.getAllUsers.mockImplementation(() => new Promise(() => {}));

    renderWithRouter(<UserManagement />);

    const spinner = document.querySelector(".animate-spin");
    expect(spinner).toBeTruthy();
  });

  it("should handle errors", async () => {
    userService.getAllUsers.mockRejectedValue({
      response: { data: { message: "Failed to load" } },
    });

    renderWithRouter(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });
  });
});
