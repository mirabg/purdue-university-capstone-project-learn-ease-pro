import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import StudentDashboard from "@views/StudentDashboard";
import { authService } from "@services/authService";
import { enrollmentService } from "@services/enrollmentService";
import api from "@services/api";

// Mock the authService
vi.mock("@services/authService", () => ({
  authService: {
    getCurrentUser: vi.fn(),
  },
}));

// Mock the enrollmentService
vi.mock("@services/enrollmentService", () => ({
  enrollmentService: {
    getAllEnrollments: vi.fn(),
  },
}));

// Mock the api
vi.mock("@services/api", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("StudentDashboard", () => {
  const mockUser = {
    id: "user123",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    role: "student",
  };

  const mockInstructor = {
    _id: "instructor1",
    firstName: "Jane",
    lastName: "Smith",
  };

  const mockEnrollments = [
    {
      _id: "enrollment1",
      course: {
        _id: "course1",
        name: "Introduction to Programming",
        courseCode: "CS101",
        description: "Learn the basics of programming",
        instructor: mockInstructor,
      },
      status: "accepted",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    authService.getCurrentUser.mockReturnValue(mockUser);
    api.get.mockResolvedValue({ data: {} });
    enrollmentService.getAllEnrollments.mockResolvedValue({ data: [] });
  });

  it("should render nothing while user is loading", () => {
    authService.getCurrentUser.mockReturnValue(null);

    const { container } = render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it("should display loading state", async () => {
    enrollmentService.getAllEnrollments.mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });
  });

  it("should render dashboard with user name", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({
      data: mockEnrollments,
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome, John!/i)).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Here's what's happening with your learning journey/i)
    ).toBeInTheDocument();
  });

  it("should display enrolled courses count", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({
      data: mockEnrollments,
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/1 Course/i)).toBeInTheDocument();
    });
  });

  it("should display enrolled courses in My Courses section", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({
      data: mockEnrollments,
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Introduction to Programming")
      ).toBeInTheDocument();
      expect(screen.getByText("CS101")).toBeInTheDocument();
    });
  });

  it("should display instructor information in enrolled courses", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({
      data: mockEnrollments,
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      const instructorTexts = screen.getAllByText("Instructor:");
      expect(instructorTexts.length).toBeGreaterThan(0);
      expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
    });
  });

  it("should display capitalized status with color badges", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({
      data: mockEnrollments,
    });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Accepted")).toBeInTheDocument();
    });
  });

  it("should show empty state when no courses enrolled", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/No courses yet/i)).toBeInTheDocument();
      expect(
        screen.getByText(/You haven't enrolled in any courses yet/i)
      ).toBeInTheDocument();
    });
  });

  it("should display Explore Courses button", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Discover New Courses/i)).toBeInTheDocument();
      expect(screen.getByText(/Explore Courses/i)).toBeInTheDocument();
    });
  });

  it("should make API call to verify token on mount", async () => {
    enrollmentService.getAllEnrollments.mockResolvedValue({ data: [] });

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
    const error401 = { response: { status: 401 } };
    api.get.mockRejectedValue(error401);
    enrollmentService.getAllEnrollments.mockResolvedValue({ data: [] });

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(api.get).toHaveBeenCalled();
    });
  });

  it("should handle non-401 errors from token verification", async () => {
    const error404 = { response: { status: 404 }, message: "Not found" };
    api.get.mockRejectedValue(error404);
    enrollmentService.getAllEnrollments.mockResolvedValue({ data: [] });

    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});

    render(
      <BrowserRouter>
        <StudentDashboard />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "User validation skipped:",
        "Not found"
      );
    });

    consoleSpy.mockRestore();
  });
});
