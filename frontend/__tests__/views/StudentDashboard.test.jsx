import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import StudentDashboard from "@views/StudentDashboard";
import { authService } from "@services/authService";
import api from "@services/api";

// Mock the authService
vi.mock("@services/authService", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

// Mock the api
vi.mock("@services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("StudentDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: {} }); // Default mock
  });

  it("should render nothing while loading user data", () => {
    authService.getCurrentUser.mockReturnValue(null);

    const { container } = render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it("should render dashboard with user name", () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Welcome, John!/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Here's what's happening with your learning journey/i)
    ).toBeInTheDocument();
  });

  it("should render stats cards", () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/Enrolled Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/Completed Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/In Progress/i)).toBeInTheDocument();
  });

  it("should render My Courses section", () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/My Courses/i)).toBeInTheDocument();
    expect(screen.getByText(/No courses yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/You haven't enrolled in any courses yet/i)
    ).toBeInTheDocument();
  });

  it("should render Explore Courses button", () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    const browseButton = screen.getByRole("button", {
      name: /Explore Courses/i,
    });
    expect(browseButton).toBeInTheDocument();
  });

  it("should display initial course stats as 0", () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    // Get all text content with "0"
    const stats = screen.getAllByText("0");
    // Should have 3 zeros for the three stat cards
    expect(stats.length).toBeGreaterThanOrEqual(3);
  });

  it("should render Recent Activity section", () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(
      screen.getByRole("heading", { name: /Recent Activity/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/No recent activity/i)).toBeInTheDocument();
  });

  it("should make API call to verify token on mount", async () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    api.get.mockResolvedValue({ data: { user: {} } });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users/me");
    });
  });

  it("should handle 401 error from token verification", async () => {
    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    api.get.mockRejectedValue({
      response: { status: 401 },
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("/users/me");
    });

    // Should still render the dashboard
    expect(screen.getByText(/Welcome, John!/i)).toBeInTheDocument();
  });

  it("should handle non-401 errors from token verification", async () => {
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    authService.getCurrentUser.mockReturnValue({
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      role: "student",
    });

    const error = new Error("Network error");
    api.get.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "User validation skipped:",
        "Network error"
      );
    });

    consoleSpy.mockRestore();
  });
});
