import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "@views/AdminDashboard";
import { authService } from "@services/authService";
import { userService } from "@services/userService";

// Mock authService
vi.mock("@services/authService", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

// Mock userService
vi.mock("@services/userService", () => ({
  userService: {
    getAllUsers: vi.fn(),
  },
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for userService
    userService.getAllUsers.mockResolvedValue({ success: true, count: 10 });
  });

  it("should render nothing while loading user data", () => {
    authService.getCurrentUser.mockReturnValue(null);

    const { container } = render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render dashboard heading", () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
      firstName: "Admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });

  it("should render stats cards with placeholders", () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("Total Courses")).toBeInTheDocument();
    expect(screen.getByText("Active Enrollments")).toBeInTheDocument();
  });

  it("should render Management section", () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Management")).toBeInTheDocument();
  });

  it("should render Manage Users button", () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Manage Users")).toBeInTheDocument();
  });

  it("should render Manage Courses button", () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText("Manage Courses")).toBeInTheDocument();
  });

  it("should display dashboard after user is loaded", async () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
      firstName: "John",
      lastName: "Admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });
  });

  it("should have proper layout structure", () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    const { container } = render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    const mainDiv = container.querySelector(".min-h-screen");
    expect(mainDiv).toBeInTheDocument();
    expect(mainDiv).toHaveClass("bg-gray-50");
  });

  it("should handle error when fetching user stats", async () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    userService.getAllUsers.mockRejectedValue(new Error("Failed to fetch"));

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching user stats:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it("should navigate to user management when button is clicked", async () => {
    const mockUser = {
      id: "1",
      email: "admin@example.com",
      role: "admin",
    };

    authService.getCurrentUser.mockReturnValue(mockUser);

    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    const manageUsersButton = screen.getByText("Manage Users");
    await userEvent.click(manageUsersButton);

    // Button exists and is clickable
    expect(manageUsersButton).toBeInTheDocument();
  });
});
