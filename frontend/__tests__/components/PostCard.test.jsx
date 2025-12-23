import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import PostCard from "../../src/components/PostCard";
import authReducer from "@/store/slices/authSlice";
import { apiSlice } from "@/store/apiSlice";

// Mock date-fns
vi.mock("date-fns", () => ({
  formatDistanceToNow: vi.fn(() => "2 hours"),
}));

// Mock ConfirmModal component
vi.mock("../ConfirmModal", () => ({
  default: ({ isOpen, onClose, onConfirm, title, message }) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

// Helper function to create a mock store
const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    preloadedState: {
      auth: authState,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
};

// Helper to create mock post data
const createMockPost = (overrides = {}) => ({
  _id: "post-1",
  title: "Test Post Title",
  content: "This is test post content",
  user: {
    _id: "user-1",
    firstName: "John",
    lastName: "Doe",
    role: "student",
  },
  isPinned: false,
  replyCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

// Helper to render with providers
const renderWithProviders = (
  component,
  { authState = {}, ...options } = {}
) => {
  const store = createMockStore(authState);
  return {
    ...render(<Provider store={store}>{component}</Provider>, options),
    store,
  };
};

describe("PostCard", () => {
  const mockPost = createMockPost();
  const defaultAuthState = {
    user: { id: "user-2", role: "student" },
    token: "mock-token",
    isAuthenticated: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    test("renders post title", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("Test Post Title")).toBeInTheDocument();
    });

    test("renders post content", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("This is test post content")).toBeInTheDocument();
    });

    test("renders author name", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    test("renders timestamp", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText(/2 hours ago/i)).toBeInTheDocument();
    });

    test("renders reply count", () => {
      const post = createMockPost({ replyCount: 5 });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText(/Show Replies \(5\)/i)).toBeInTheDocument();
    });
  });

  describe("role badges", () => {
    test("displays student badge", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("Student")).toBeInTheDocument();
    });

    test("displays faculty badge", () => {
      const post = createMockPost({
        user: { ...mockPost.user, role: "faculty" },
      });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("Instructor")).toBeInTheDocument();
    });

    test("displays admin badge", () => {
      const post = createMockPost({
        user: { ...mockPost.user, role: "admin" },
      });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    test("applies correct badge styling for student", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });
      const badge = screen.getByText("Student");
      expect(badge).toHaveClass("bg-blue-100");
      expect(badge).toHaveClass("text-blue-800");
    });

    test("applies correct badge styling for faculty", () => {
      const post = createMockPost({
        user: { ...mockPost.user, role: "faculty" },
      });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });
      const badge = screen.getByText("Instructor");
      expect(badge).toHaveClass("bg-purple-100");
      expect(badge).toHaveClass("text-purple-800");
    });
  });

  describe("pinned posts", () => {
    test("displays pinned indicator when post is pinned", () => {
      const post = createMockPost({ isPinned: true });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("Pinned")).toBeInTheDocument();
    });

    test("does not display pinned indicator when post is not pinned", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });
      expect(screen.queryByText("Pinned")).not.toBeInTheDocument();
    });
  });

  describe("edited indicator", () => {
    test("shows edited indicator when post was edited", () => {
      const post = createMockPost({
        createdAt: "2024-01-01T10:00:00Z",
        updatedAt: "2024-01-01T12:00:00Z",
      });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });
      expect(screen.getByText("edited")).toBeInTheDocument();
    });

    test("does not show edited indicator when post not edited", () => {
      const timestamp = "2024-01-01T10:00:00Z";
      const post = createMockPost({
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });
      expect(screen.queryByText("edited")).not.toBeInTheDocument();
    });
  });

  describe("action buttons visibility", () => {
    test("shows edit/delete buttons for post owner", () => {
      const authState = {
        user: { id: "user-1", role: "student" },
        token: "mock-token",
        isAuthenticated: true,
      };
      renderWithProviders(<PostCard post={mockPost} />, { authState });

      expect(screen.getByTitle("Edit post")).toBeInTheDocument();
      expect(screen.getByTitle("Delete post")).toBeInTheDocument();
    });

    test("shows edit/delete buttons for faculty", () => {
      const authState = {
        user: { id: "user-2", role: "faculty" },
        token: "mock-token",
        isAuthenticated: true,
      };
      renderWithProviders(<PostCard post={mockPost} />, { authState });

      expect(screen.getByTitle("Edit post")).toBeInTheDocument();
      expect(screen.getByTitle("Delete post")).toBeInTheDocument();
    });

    test("shows pin button for faculty", () => {
      const authState = {
        user: { id: "user-2", role: "faculty" },
        token: "mock-token",
        isAuthenticated: true,
      };
      renderWithProviders(<PostCard post={mockPost} />, { authState });

      const pinButton = screen.getByTitle("Pin post");
      expect(pinButton).toBeInTheDocument();
    });

    test("does not show action buttons for non-owner student", () => {
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });

      expect(screen.queryByTitle("Edit post")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Delete post")).not.toBeInTheDocument();
    });

    test("shows pin button for course instructor", () => {
      const courseInstructor = { _id: "user-2" };
      const authState = {
        user: { id: "user-2", role: "student" },
        token: "mock-token",
        isAuthenticated: true,
      };
      renderWithProviders(
        <PostCard post={mockPost} courseInstructor={courseInstructor} />,
        { authState }
      );

      expect(screen.getByTitle("Pin post")).toBeInTheDocument();
    });
  });

  describe("action button interactions", () => {
    test("calls onEdit when edit button clicked", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const authState = {
        user: { id: "user-1", role: "student" },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<PostCard post={mockPost} onEdit={onEdit} />, {
        authState,
      });

      const editButton = screen.getByTitle("Edit post");
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalledWith(mockPost);
    });

    test("calls onDelete when delete button clicked", async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      const authState = {
        user: { id: "user-1", role: "student" },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<PostCard post={mockPost} onDelete={onDelete} />, {
        authState,
      });

      const deleteButton = screen.getByTitle("Delete post");
      await user.click(deleteButton);

      expect(onDelete).toHaveBeenCalledWith(mockPost._id);
    });

    test("edit button prevents event propagation", async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      const parentOnClick = vi.fn();
      const authState = {
        user: { id: "user-1", role: "student" },
        token: "mock-token",
        isAuthenticated: true,
      };

      const { container } = renderWithProviders(
        <div onClick={parentOnClick}>
          <PostCard post={mockPost} onEdit={onEdit} />
        </div>,
        { authState }
      );

      const editButton = screen.getByTitle("Edit post");
      await user.click(editButton);

      expect(onEdit).toHaveBeenCalled();
      expect(parentOnClick).not.toHaveBeenCalled();
    });
  });

  describe("replies section", () => {
    test("toggles replies section when button clicked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });

      const toggleButton = screen.getByText(/Show Replies/i);
      expect(screen.queryByText("Write a reply...")).not.toBeInTheDocument();

      await user.click(toggleButton);

      // After clicking, replies section should be visible with reply form
      expect(screen.getByText(/Hide Replies/i)).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Write a reply...")
      ).toBeInTheDocument();
    });
  });

  describe("content formatting", () => {
    test("preserves whitespace in post content", () => {
      const post = createMockPost({
        content: "Line 1\n\nLine 2\n\nLine 3",
      });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });

      const content = screen.getByText(/Line 1/);
      expect(content).toHaveClass("whitespace-pre-wrap");
    });

    test("renders multi-line content correctly", () => {
      const post = createMockPost({
        content: "First line\nSecond line",
      });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });

      expect(screen.getByText(/First line/)).toBeInTheDocument();
    });
  });

  describe("styling", () => {
    test("applies correct container classes", () => {
      const { container } = renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });

      const postCard = container.firstChild;
      expect(postCard).toHaveClass("bg-white");
      expect(postCard).toHaveClass("border");
      expect(postCard).toHaveClass("rounded-lg");
      expect(postCard).toHaveClass("p-4");
    });

    test("applies hover effect classes", () => {
      const { container } = renderWithProviders(<PostCard post={mockPost} />, {
        authState: defaultAuthState,
      });

      const postCard = container.firstChild;
      expect(postCard).toHaveClass("hover:shadow-md");
      expect(postCard).toHaveClass("transition");
    });
  });

  describe("edge cases", () => {
    test("handles post with zero reply count", () => {
      const post = createMockPost({ replyCount: 0 });
      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });

      expect(screen.getByText(/Show Replies \(0\)/i)).toBeInTheDocument();
    });

    test("handles post without reply count", () => {
      const post = createMockPost();
      delete post.replyCount;

      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });

      expect(screen.getByText(/Show Replies \(0\)/i)).toBeInTheDocument();
    });

    test("handles missing user names gracefully", () => {
      const post = createMockPost({
        user: { _id: "user-1", role: "student" },
      });

      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });

      // Should render without crashing
      expect(screen.getByText("Test Post Title")).toBeInTheDocument();
    });

    test("handles long content", () => {
      const longContent = "A".repeat(1000);
      const post = createMockPost({ content: longContent });

      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });

      expect(screen.getByText(longContent)).toBeInTheDocument();
    });

    test("handles special characters in content", () => {
      const post = createMockPost({
        content: "Special chars: <>&\"'",
      });

      renderWithProviders(<PostCard post={post} />, {
        authState: defaultAuthState,
      });

      expect(screen.getByText(/Special chars: <>&"'/)).toBeInTheDocument();
    });
  });

  describe("permission checks", () => {
    test("faculty can edit any post", () => {
      const authState = {
        user: { id: "faculty-user", role: "faculty" },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<PostCard post={mockPost} />, { authState });

      expect(screen.getByTitle("Edit post")).toBeInTheDocument();
    });

    test("instructor can edit posts in their course", () => {
      const courseInstructor = { _id: "instructor-id" };
      const authState = {
        user: { id: "instructor-id", role: "student" },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(
        <PostCard post={mockPost} courseInstructor={courseInstructor} />,
        { authState }
      );

      expect(screen.getByTitle("Edit post")).toBeInTheDocument();
    });

    test("student cannot edit others' posts", () => {
      const authState = {
        user: { id: "different-user", role: "student" },
        token: "mock-token",
        isAuthenticated: true,
      };

      renderWithProviders(<PostCard post={mockPost} />, { authState });

      expect(screen.queryByTitle("Edit post")).not.toBeInTheDocument();
    });
  });
});
