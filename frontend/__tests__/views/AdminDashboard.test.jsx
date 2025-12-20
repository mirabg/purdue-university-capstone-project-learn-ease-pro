import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AdminDashboard from "@views/AdminDashboard";
import { authService } from "@services/authService";

// Mock authService
vi.mock("@services/authService", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
