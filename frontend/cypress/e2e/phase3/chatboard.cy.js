/**
 * Phase 3: Interactive Features - ChatBoard
 * Tests discussion posts, replies, and moderation
 */

describe("ChatBoard Features", () => {
  const mockCourse = {
    _id: "course-123",
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    instructor: {
      _id: "instructor-123",
      firstName: "John",
      lastName: "Doe",
    },
  };

  const mockPosts = [
    {
      _id: "post-1",
      title: "Question about assignment 1",
      content: "Can someone help me understand the requirements?",
      author: {
        _id: "student-1",
        firstName: "Alice",
        lastName: "Smith",
      },
      isPinned: false,
      createdAt: "2024-12-01T10:00:00Z",
      updatedAt: "2024-12-01T10:00:00Z",
    },
    {
      _id: "post-2",
      title: "Important: Exam schedule",
      content: "The final exam is scheduled for next week.",
      author: {
        _id: "instructor-123",
        firstName: "John",
        lastName: "Doe",
      },
      isPinned: true,
      createdAt: "2024-12-01T09:00:00Z",
      updatedAt: "2024-12-01T09:00:00Z",
    },
  ];

  beforeEach(() => {
    cy.clearAppState();
    cy.loginAsStudent();

    // Mock course API
    cy.intercept("GET", "**/api/courses/course-123*", {
      statusCode: 200,
      body: {
        success: true,
        data: mockCourse,
      },
    }).as("courseApi");
  });

  describe("View Discussion Board", () => {
    it("should display all posts for a course", () => {
      // Mock posts API
      cy.intercept("GET", "**/api/courses/course-123/posts*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockPosts,
          pagination: {
            page: 1,
            pages: 1,
            total: 2,
          },
        },
      }).as("postsApi");

      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Check header
      cy.contains("Discussion Board").should("be.visible");

      // Check posts are displayed
      mockPosts.forEach((post) => {
        cy.contains(post.title).should("be.visible");
        cy.contains(post.content).should("be.visible");
      });
    });

    it("should show empty state when no posts exist", () => {
      cy.intercept("GET", "**/api/courses/course-123/posts*", {
        statusCode: 200,
        body: {
          success: true,
          data: [],
          pagination: {
            page: 1,
            pages: 1,
            total: 0,
          },
        },
      }).as("postsApi");

      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Check empty state
      cy.contains("No posts yet").should("be.visible");
      cy.contains("Get started by creating the first post").should(
        "be.visible"
      );
    });

    it("should display post count", () => {
      cy.intercept("GET", "**/api/courses/course-123/posts*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockPosts,
          pagination: {
            page: 1,
            pages: 1,
            total: 2,
          },
        },
      }).as("postsApi");

      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Check post count is displayed
      cy.contains(/Displaying.*1-2 of 2 posts/i).should("be.visible");
    });
  });

  describe("Create Post", () => {
    beforeEach(() => {
      cy.intercept("GET", "**/api/courses/course-123/posts*", {
        statusCode: 200,
        body: {
          success: true,
          data: mockPosts,
          pagination: {
            page: 1,
            pages: 1,
            total: 2,
          },
        },
      }).as("postsApi");
    });

    it("should open create post modal when New Post button clicked", () => {
      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Click New Post button
      cy.contains("button", "New Post").click();

      // Check modal opened
      cy.contains("Create New Post").should("be.visible");
      cy.get('input[name="title"]').should("be.visible");
      cy.get('textarea[name="content"]').should("be.visible");
    });

    it("should validate post title and content", () => {
      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Open modal
      cy.contains("button", "New Post").click();

      // Try to submit without filling fields
      cy.contains("button", "Create Post").click();

      // Should show validation errors
      cy.contains("Title is required").should("be.visible");
      cy.contains("Content is required").should("be.visible");
    });

    it("should create a new post successfully", () => {
      const newPost = {
        title: "My new question",
        content: "I have a question about the lecture",
      };

      // Mock post creation
      cy.intercept("POST", "**/api/courses/course-123/posts", {
        statusCode: 201,
        body: {
          success: true,
          data: {
            _id: "post-3",
            ...newPost,
            author: {
              _id: "student-1",
              firstName: "Student",
              lastName: "User",
            },
            createdAt: new Date().toISOString(),
          },
        },
      }).as("createPost");

      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Open modal
      cy.contains("button", "New Post").click();

      // Fill form
      cy.get('input[name="title"]').type(newPost.title);
      cy.get('textarea[name="content"]').type(newPost.content);

      // Submit
      cy.contains("button", "Create Post").click();

      // Wait for API call
      cy.wait("@createPost");

      // Modal should close
      cy.contains("Create New Post").should("not.exist");
    });
  });

  describe("Edit and Delete", () => {
    beforeEach(() => {
      // Mock posts where current user is the author
      const userPosts = [
        {
          ...mockPosts[0],
          author: {
            _id: "student-user-id", // Cypress custom command logs in with this ID
            firstName: "Student",
            lastName: "User",
          },
        },
      ];

      cy.intercept("GET", "**/api/courses/course-123/posts*", {
        statusCode: 200,
        body: {
          success: true,
          data: userPosts,
          pagination: {
            page: 1,
            pages: 1,
            total: 1,
          },
        },
      }).as("postsApi");
    });

    it("should allow editing own posts", () => {
      // Mock update post
      cy.intercept("PUT", "**/api/courses/course-123/posts/post-1", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            _id: "post-1",
            title: "Updated title",
            content: "Updated content",
          },
        },
      }).as("updatePost");

      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Click edit button (look for edit icon or button)
      cy.get('[title="Edit Post"]').first().click();

      // Should open edit modal
      cy.contains("Edit Post").should("be.visible");

      // Update fields
      cy.get('input[name="title"]').clear().type("Updated title");
      cy.get('textarea[name="content"]').clear().type("Updated content");

      // Submit
      cy.contains("button", "Update Post").click();

      // Wait for API call
      cy.wait("@updatePost");
    });

    it("should allow deleting own posts", () => {
      // Mock delete post
      cy.intercept("DELETE", "**/api/courses/course-123/posts/post-1", {
        statusCode: 200,
        body: {
          success: true,
          message: "Post deleted successfully",
        },
      }).as("deletePost");

      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Click delete button
      cy.get('[title="Delete Post"]').first().click();

      // Confirm delete modal should appear
      cy.contains("Delete Post").should("be.visible");
      cy.contains("Are you sure you want to delete this post").should(
        "be.visible"
      );

      // Confirm deletion
      cy.contains("button", "Delete").click();

      // Wait for API call
      cy.wait("@deletePost");
    });
  });

  describe("Pagination", () => {
    it("should display pagination when multiple pages exist", () => {
      const manyPosts = Array.from({ length: 10 }, (_, i) => ({
        _id: `post-${i}`,
        title: `Post ${i + 1}`,
        content: `Content ${i + 1}`,
        author: {
          _id: "student-1",
          firstName: "Student",
          lastName: "User",
        },
        isPinned: false,
        createdAt: new Date().toISOString(),
      }));

      cy.intercept("GET", "**/api/courses/course-123/posts*", {
        statusCode: 200,
        body: {
          success: true,
          data: manyPosts,
          pagination: {
            page: 1,
            pages: 3,
            total: 25,
          },
        },
      }).as("postsApi");

      cy.visit("/course/course-123");
      cy.wait("@postsApi");

      // Check pagination exists
      cy.contains("Page 1 of 3").should("be.visible");
      cy.contains("button", "Next").should("be.visible");
      cy.contains("button", "Previous").should("be.visible");
    });
  });

  describe("Error Handling", () => {
    it("should display error message when posts fail to load", () => {
      cy.intercept("GET", "**/api/courses/course-123/posts*", {
        statusCode: 500,
        body: {
          success: false,
          message: "Failed to load posts",
        },
      }).as("postsError");

      cy.visit("/course/course-123");
      cy.wait("@postsError");

      // Should show error
      cy.contains(/Failed to load|Error/i).should("be.visible");
    });
  });
});
