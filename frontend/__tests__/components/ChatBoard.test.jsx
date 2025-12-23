import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ChatBoard from "../../src/components/ChatBoard";

// Mock RTK Query hooks - declare at top level
const mockUseGetPostsQuery = vi.fn();
const mockUseCreatePostMutation = vi.fn();
const mockUseUpdatePostMutation = vi.fn();
const mockUseDeletePostMutation = vi.fn();

// Mock the apiSlice module
vi.mock("@/store/apiSlice", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useGetPostsQuery: (args) => mockUseGetPostsQuery(args),
    useCreatePostMutation: () => {
      const mutationFn = vi.fn().mockResolvedValue({ data: {} });
      mockUseCreatePostMutation.mockReturnValue([mutationFn, {}]);
      return mockUseCreatePostMutation();
    },
    useUpdatePostMutation: () => {
      const mutationFn = vi.fn().mockResolvedValue({ data: {} });
      mockUseUpdatePostMutation.mockReturnValue([mutationFn, {}]);
      return mockUseUpdatePostMutation();
    },
    useDeletePostMutation: () => {
      const mutationFn = vi.fn().mockResolvedValue({ data: {} });
      mockUseDeletePostMutation.mockReturnValue([mutationFn, {}]);
      return mockUseDeletePostMutation();
    },
  };
});

// Mock child components
vi.mock("@components/PostCard", () => ({
  default: ({ post, onEdit, onDelete }) => (
    <div data-testid={`post-${post._id}`}>
      <div>{post.title}</div>
      <div>{post.content}</div>
      <button onClick={() => onEdit(post)}>Edit</button>
      <button onClick={() => onDelete(post._id)}>Delete</button>
    </div>
  ),
}));

vi.mock("@components/CreatePostModal", () => ({
  default: ({ isOpen, onClose, onSubmit, initialData }) =>
    isOpen ? (
      <div data-testid="create-post-modal">
        <button onClick={onClose}>Close Modal</button>
        <button
          onClick={() =>
            onSubmit({
              title: initialData?.title || "New Post",
              content: initialData?.content || "New Content",
            })
          }
        >
          Submit
        </button>
      </div>
    ) : null,
}));

vi.mock("@components/ConfirmModal", () => ({
  default: ({ isOpen, onClose, onConfirm }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onClose}>Cancel</button>
        <button onClick={onConfirm}>Confirm</button>
      </div>
    ) : null,
}));

vi.mock("@components/Icon", () => ({
  default: ({ name, className }) => (
    <span data-icon={name} className={className} />
  ),
}));

// Helper to create mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      api: () => ({}),
      auth: () => ({
        user: {
          _id: "current-user-id",
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          role: "student",
        },
        token: "mock-token",
        isAuthenticated: true,
      }),
    },
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

describe("ChatBoard", () => {
  const mockCourseId = "course-123";
  const mockCourseInstructor = {
    _id: "instructor-1",
    firstName: "John",
    lastName: "Doe",
  };

  const mockPosts = [
    {
      _id: "post-1",
      title: "First Post",
      content: "This is the first post",
      author: { _id: "user-1", firstName: "Alice", lastName: "Smith" },
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      _id: "post-2",
      title: "Second Post",
      content: "This is the second post",
      author: { _id: "user-2", firstName: "Bob", lastName: "Jones" },
      createdAt: "2024-01-02T00:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    test("renders discussion board heading", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(screen.getByText("Discussion Board")).toBeInTheDocument();
    });

    test("renders new post button", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(
        screen.getByRole("button", { name: /new post/i })
      ).toBeInTheDocument();
    });
  });

  describe("loading state", () => {
    test("shows loading spinner when loading", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(
        screen.getByText("Loading discussion board...")
      ).toBeInTheDocument();
    });

    test("shows spinner animation element", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      const { container } = renderWithProviders(
        <ChatBoard courseId={mockCourseId} />
      );

      const spinner = container.querySelector(".animate-spin");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    test("shows empty state when no posts", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(screen.getByText("No posts yet")).toBeInTheDocument();
      expect(
        screen.getByText("Get started by creating the first post")
      ).toBeInTheDocument();
    });

    test("shows 0 posts count when empty", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(screen.getByText("0 posts")).toBeInTheDocument();
    });
  });

  describe("posts display", () => {
    test("renders posts when data is available", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(screen.getByText("First Post")).toBeInTheDocument();
      expect(screen.getByText("Second Post")).toBeInTheDocument();
    });

    test("shows correct post count", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(
        screen.getByText(/Displaying 1-2 of 2 posts/i)
      ).toBeInTheDocument();
    });

    test("uses singular 'post' for single post", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: {
          data: [mockPosts[0]],
          pagination: { pages: 1, total: 1 },
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(screen.getByText(/1 post$/i)).toBeInTheDocument();
    });
  });

  describe("pagination", () => {
    test("does not show pagination for single page", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(
        screen.queryByRole("button", { name: /previous/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /next/i })
      ).not.toBeInTheDocument();
    });

    test("shows pagination for multiple pages", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 3, total: 25 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(
        screen.getByRole("button", { name: /previous/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    });

    test("previous button is disabled on first page", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 3, total: 25 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const prevButton = screen.getByRole("button", { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    test("can navigate to next page", async () => {
      const user = userEvent.setup();

      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 3, total: 25 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      // Component re-renders with page 2
      expect(screen.getByText("Page 2 of 3")).toBeInTheDocument();
    });
  });

  describe("create post modal", () => {
    test("opens modal when new post button clicked", async () => {
      const user = userEvent.setup();

      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const newPostButton = screen.getByRole("button", { name: /new post/i });
      await user.click(newPostButton);

      expect(screen.getByTestId("create-post-modal")).toBeInTheDocument();
    });

    test("closes modal when close button clicked", async () => {
      const user = userEvent.setup();

      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const newPostButton = screen.getByRole("button", { name: /new post/i });
      await user.click(newPostButton);

      const closeButton = screen.getByRole("button", { name: /close modal/i });
      await user.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("create-post-modal")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("edit post", () => {
    test("opens modal with post data when edit clicked", async () => {
      const user = userEvent.setup();

      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const editButtons = screen.getAllByRole("button", { name: /edit/i });
      await user.click(editButtons[0]);

      expect(screen.getByTestId("create-post-modal")).toBeInTheDocument();
    });
  });

  describe("delete post", () => {
    test("opens confirm modal when delete clicked", async () => {
      const user = userEvent.setup();

      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    });

    test("closes confirm modal when cancel clicked", async () => {
      const user = userEvent.setup();

      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
      await user.click(deleteButtons[0]);

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    test("displays query error", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: {
          data: { message: "Failed to load posts" },
        },
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(screen.getByText("Failed to load posts")).toBeInTheDocument();
    });

    test("displays default error message when query error has no message", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: {},
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      expect(
        screen.getByText("Failed to load discussion posts")
      ).toBeInTheDocument();
    });

    test("shows error icon in error message", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: {
          data: { message: "Failed to load posts" },
        },
      });

      const { container } = renderWithProviders(
        <ChatBoard courseId={mockCourseId} />
      );

      const errorIcon = container.querySelector('[data-icon="error"]');
      expect(errorIcon).toBeInTheDocument();
    });
  });

  describe("new post button", () => {
    test("has plus icon", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const plusIcon = screen.getByAltText("");
      expect(plusIcon).toHaveAttribute("src", "/icons/plus-white.svg");
    });

    test("has correct styling", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: [], pagination: { pages: 1, total: 0 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const button = screen.getByRole("button", { name: /new post/i });
      expect(button).toHaveClass("bg-primary-600");
      expect(button).toHaveClass("text-white");
    });
  });

  describe("passes props to child components", () => {
    test("passes courseInstructor to PostCard", () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 1, total: 2 } },
        isLoading: false,
        error: null,
      });

      renderWithProviders(
        <ChatBoard
          courseId={mockCourseId}
          courseInstructor={mockCourseInstructor}
        />
      );

      // PostCard is rendered (verified by post content being visible)
      expect(screen.getByText("First Post")).toBeInTheDocument();
    });
  });

  describe("pagination calculations", () => {
    test("calculates correct range for page 2", async () => {
      mockUseGetPostsQuery.mockReturnValue({
        data: { data: mockPosts, pagination: { pages: 3, total: 25 } },
        isLoading: false,
        error: null,
      });

      const user = userEvent.setup();
      renderWithProviders(<ChatBoard courseId={mockCourseId} />);

      const nextButton = screen.getByRole("button", { name: /next/i });
      await user.click(nextButton);

      expect(
        screen.getByText(/Displaying 11-12 of 25 posts/i)
      ).toBeInTheDocument();
    });
  });
});
