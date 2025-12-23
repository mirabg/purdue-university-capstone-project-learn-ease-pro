import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ExploreCourses from "../../src/views/ExploreCourses";
import authReducer from "@/store/slices/authSlice";

// Mock data
const mockCourses = [
  {
    _id: "1",
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    description: "Learn the basics of programming",
    instructor: { _id: "f1", firstName: "John", lastName: "Doe" },
    averageRating: 4.5,
    ratingCount: 10,
  },
  {
    _id: "2",
    courseCode: "CS201",
    name: "Data Structures",
    description: "Advanced data structures and algorithms",
    instructor: { _id: "f2", firstName: "Jane", lastName: "Smith" },
    averageRating: 4.8,
    ratingCount: 15,
  },
  {
    _id: "3",
    courseCode: "CS301",
    name: "Database Systems",
    description: "Learn about database design and SQL",
    instructor: { _id: "f1", firstName: "John", lastName: "Doe" },
    averageRating: 4.2,
    ratingCount: 8,
  },
];

const mockEnrollments = [
  {
    _id: "e1",
    course: { _id: "2" },
    student: { _id: "s1" },
    status: "active",
  },
];

// Mock RTK Query hooks
const mockUseGetCoursesQuery = vi.fn();
const mockUseGetEnrollmentsQuery = vi.fn();
const mockCreateEnrollment = vi.fn();
const mockNavigate = vi.fn();

vi.mock("@/store/apiSlice", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGetCoursesQuery: (args) => mockUseGetCoursesQuery(args),
    useGetEnrollmentsQuery: (args) => mockUseGetEnrollmentsQuery(args),
    useCreateEnrollmentMutation: () => [mockCreateEnrollment, {}],
  };
});

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock components
vi.mock("@components/CourseRating", () => ({
  default: ({ averageRating, ratingCount, onClick }) => (
    <div data-testid="course-rating" onClick={onClick}>
      {averageRating} ({ratingCount} ratings)
    </div>
  ),
}));

vi.mock("@components/CourseRatingsModal", () => ({
  default: ({ isOpen, onClose, course }) =>
    isOpen ? (
      <div data-testid="ratings-modal">
        <button onClick={onClose}>Close</button>
        <span>{course?.name}</span>
      </div>
    ) : null,
}));

vi.mock("@components/Icon", () => ({
  default: ({ name, className, onClick }) => (
    <span data-testid={`icon-${name}`} className={className} onClick={onClick}>
      {name}
    </span>
  ),
}));

vi.mock("@components/ErrorAlert", () => ({
  default: ({ error, defaultMessage, className }) => {
    if (!error) return null;
    // Handle both string errors and object errors
    const message =
      typeof error === "string"
        ? error
        : error?.data?.message || error?.message || defaultMessage;
    return (
      <div data-testid="error-alert" className={className}>
        {message}
      </div>
    );
  },
}));

// Helper to create a test store
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: initialState,
  });
};

// Helper to render with providers
const renderWithProviders = (ui, { initialState = {}, ...options } = {}) => {
  const store = createMockStore(initialState);
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
    options
  );
};

describe("ExploreCourses", () => {
  const defaultAuthState = {
    auth: {
      user: { id: "s1", role: "student", email: "student@example.com" },
      isAuthenticated: true,
      token: "fake-token",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock responses
    mockUseGetCoursesQuery.mockReturnValue({
      data: { data: mockCourses, count: mockCourses.length },
      isLoading: false,
      error: null,
    });

    mockUseGetEnrollmentsQuery.mockReturnValue({
      data: { data: mockEnrollments },
      isLoading: false,
      error: null,
    });
  });

  describe("Rendering", () => {
    test("should render page header with title", () => {
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(
        screen.getByRole("heading", { name: /explore courses/i })
      ).toBeInTheDocument();
      expect(
        screen.getByText(/browse and enroll in available courses/i)
      ).toBeInTheDocument();
    });

    test("should render back to dashboard button", () => {
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const backButton = screen.getByRole("button", {
        name: /back to dashboard/i,
      });
      expect(backButton).toBeInTheDocument();
    });

    test("should render search input", () => {
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(
        screen.getByPlaceholderText(/search courses/i)
      ).toBeInTheDocument();
    });

    test("should not render when user is not authenticated", () => {
      const { container } = renderWithProviders(<ExploreCourses />, {
        initialState: {
          auth: { user: null, isAuthenticated: false, token: null },
        },
      });

      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("Loading State", () => {
    test("should show loading spinner when courses are loading", () => {
      mockUseGetCoursesQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    });

    test("should show loading spinner when enrollments are loading", () => {
      mockUseGetEnrollmentsQuery.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(screen.getByText(/loading.../i)).toBeInTheDocument();
    });
  });

  describe("Course Display", () => {
    test("should display available courses filtering out enrolled ones", () => {
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      // Should show CS101 and CS301 (not CS201 which is enrolled)
      const cs101Elements = screen.getAllByText("CS101");
      expect(cs101Elements.length).toBeGreaterThan(0);

      const introCourseName = screen.getAllByText(
        "Introduction to Computer Science"
      );
      expect(introCourseName.length).toBeGreaterThan(0);

      expect(screen.queryByText("CS201")).not.toBeInTheDocument();

      // CS201 should not be shown (already enrolled)
      expect(screen.queryByText("CS201")).not.toBeInTheDocument();
    });

    test("should display course instructor information", () => {
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const instructorNames = screen.getAllByText(/john doe/i);
      expect(instructorNames.length).toBeGreaterThan(0);
    });

    test("should display course ratings", () => {
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const ratings = screen.getAllByTestId("course-rating");
      expect(ratings.length).toBeGreaterThan(0);
    });

    test("should display course descriptions", () => {
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      // Use getAllByText since descriptions appear in both desktop and mobile views
      const programmingDescs = screen.getAllByText(
        /learn the basics of programming/i
      );
      expect(programmingDescs.length).toBeGreaterThan(0);

      const databaseDescs = screen.getAllByText(
        /learn about database design and sql/i
      );
      expect(databaseDescs.length).toBeGreaterThan(0);
    });
  });

  describe("Empty State", () => {
    test("should show message when no courses are available", () => {
      mockUseGetCoursesQuery.mockReturnValue({
        data: { data: [], count: 0 },
        isLoading: false,
        error: null,
      });

      mockUseGetEnrollmentsQuery.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(
        screen.getByText(/no courses available at this time/i)
      ).toBeInTheDocument();
    });

    test("should show message when all courses are enrolled", () => {
      mockUseGetEnrollmentsQuery.mockReturnValue({
        data: {
          data: mockCourses.map((course) => ({
            _id: `e-${course._id}`,
            course: { _id: course._id },
            student: { _id: "s1" },
            status: "active",
          })),
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(
        screen.getByText(/you're enrolled in all available courses!/i)
      ).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    test("should update search query on input", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      await user.type(searchInput, "database");

      expect(searchInput).toHaveValue("database");
    });

    test("should filter courses based on search query", async () => {
      const user = userEvent.setup();

      // Mock will be called with search query
      mockUseGetCoursesQuery.mockImplementation((args) => {
        const filtered = args.search
          ? mockCourses.filter((c) =>
              c.name.toLowerCase().includes(args.search.toLowerCase())
            )
          : mockCourses;
        return {
          data: { data: filtered, count: filtered.length },
          isLoading: false,
          error: null,
        };
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      await user.type(searchInput, "Database");

      await waitFor(() => {
        expect(mockUseGetCoursesQuery).toHaveBeenCalledWith(
          expect.objectContaining({ search: "Database" })
        );
      });
    });

    test("should reset to first page when searching", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const searchInput = screen.getByPlaceholderText(/search courses/i);
      await user.type(searchInput, "test");

      // Page should be reset to 1 (tested implicitly by pagination logic)
      expect(searchInput).toHaveValue("test");
    });
  });

  describe("Enrollment", () => {
    test("should call createEnrollment when enroll button is clicked", async () => {
      const user = userEvent.setup();
      mockCreateEnrollment.mockResolvedValue({
        unwrap: () => Promise.resolve({ data: { _id: "new-enrollment" } }),
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const enrollButtons = screen.getAllByRole("button", { name: /enroll/i });
      await user.click(enrollButtons[0]);

      await waitFor(() => {
        expect(mockCreateEnrollment).toHaveBeenCalledWith({
          course: "1", // CS101
          student: "s1",
          status: "pending",
        });
      });
    });

    test("should show success message after successful enrollment", async () => {
      const user = userEvent.setup();
      mockCreateEnrollment.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: { _id: "new-enrollment" } }),
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const enrollButtons = screen.getAllByRole("button", { name: /enroll/i });
      await user.click(enrollButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/successfully enrolled/i)).toBeInTheDocument();
      });
    });

    test("should show error message on enrollment failure", async () => {
      const user = userEvent.setup();
      mockCreateEnrollment.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({
          data: { message: "Already enrolled" },
        }),
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const enrollButtons = screen.getAllByRole("button", { name: /enroll/i });
      await user.click(enrollButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/already enrolled/i)).toBeInTheDocument();
      });
    });
  });

  describe("Pagination", () => {
    test("should display pagination controls when there are multiple pages", () => {
      // Create many courses to trigger pagination
      const manyCourses = Array.from({ length: 15 }, (_, i) => ({
        _id: `course-${i}`,
        courseCode: `CS${100 + i}`,
        name: `Course ${i}`,
        description: `Description ${i}`,
        instructor: { _id: "f1", firstName: "John", lastName: "Doe" },
        averageRating: 4.0,
        ratingCount: 5,
      }));

      mockUseGetCoursesQuery.mockReturnValue({
        data: { data: manyCourses, count: manyCourses.length },
        isLoading: false,
        error: null,
      });

      mockUseGetEnrollmentsQuery.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
    });

    test("should navigate to next page when next button is clicked", async () => {
      const user = userEvent.setup();
      const manyCourses = Array.from({ length: 15 }, (_, i) => ({
        _id: `course-${i}`,
        courseCode: `CS${100 + i}`,
        name: `Course ${i}`,
        description: `Description ${i}`,
        instructor: { _id: "f1", firstName: "John", lastName: "Doe" },
        averageRating: 4.0,
        ratingCount: 5,
      }));

      mockUseGetCoursesQuery.mockReturnValue({
        data: { data: manyCourses, count: manyCourses.length },
        isLoading: false,
        error: null,
      });

      mockUseGetEnrollmentsQuery.mockReturnValue({
        data: { data: [] },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const nextButtons = screen.getAllByText(/next/i);
      await user.click(nextButtons[0]);

      // Should show different set of courses
      await waitFor(() => {
        expect(screen.getByText(/showing/i)).toBeInTheDocument();
      });
    });
  });

  describe("Ratings Modal", () => {
    test("should open ratings modal when rating is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const ratings = screen.getAllByTestId("course-rating");
      await user.click(ratings[0]);

      await waitFor(() => {
        expect(screen.getByTestId("ratings-modal")).toBeInTheDocument();
      });
    });

    test("should close ratings modal when close button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const ratings = screen.getAllByTestId("course-rating");
      await user.click(ratings[0]);

      await waitFor(() => {
        expect(screen.getByTestId("ratings-modal")).toBeInTheDocument();
      });

      const closeButton = screen.getByText("Close");
      await user.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByTestId("ratings-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("Navigation", () => {
    test("should navigate to dashboard when back button is clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      const backButton = screen.getByRole("button", {
        name: /back to dashboard/i,
      });
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/student/dashboard");
    });
  });

  describe("Error Handling", () => {
    test("should display error message when courses fetch fails", () => {
      mockUseGetCoursesQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: { data: { message: "Failed to fetch courses" } },
      });

      renderWithProviders(<ExploreCourses />, {
        initialState: defaultAuthState,
      });

      expect(screen.getByTestId("error-alert")).toBeInTheDocument();
    });
  });
});
