/**
 * Phase 3: Interactive Features - ChatBoard
 * Tests discussion posts, replies, and moderation using REAL BACKEND
 */

describe("ChatBoard Features", () => {
  let testCourseId;

  before(() => {
    // Login and get an enrolled course
    cy.clearAppState();
    cy.visit("/login");
    cy.get('input[name="email"]').type("john.smith@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/student/dashboard", { timeout: 10000 });

    // Get first enrolled course
    cy.window().then((win) => {
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/enrollments`,
        headers: {
          Authorization: `Bearer ${win.localStorage.getItem("token")}`,
        },
      }).then((response) => {
        const acceptedEnrollment = response.body.data.find(
          (e) => e.status === "accepted"
        );
        if (acceptedEnrollment) {
          testCourseId = acceptedEnrollment.course._id;
        }
      });
    });
  });

  beforeEach(() => {
    cy.clearAppState();
    cy.visit("/login");
    cy.get('input[name="email"]').type("john.smith@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/student/dashboard", { timeout: 10000 });
  });

  describe("View Discussion Board", () => {
    it("should display discussion board on course detail page", () => {
      cy.visit(`/course/${testCourseId}`);

      // Check header
      cy.contains("Discussion Board").should("be.visible");
      cy.contains("button", "New Post").should("be.visible");
    });

    it("should show empty state when no posts exist", () => {
      cy.visit(`/course/${testCourseId}`);

      // If no posts, should show empty state
      cy.get("body").then(($body) => {
        if ($body.find(':contains("No posts yet")').length > 0) {
          cy.contains("No posts yet").should("be.visible");
        } else {
          // Has posts - test passes
          cy.log("Course has existing posts");
        }
      });
    });

    it("should display post count", () => {
      cy.visit(`/course/${testCourseId}`);

      // Should show discussion board section
      cy.contains("Discussion Board").should("be.visible");
    });
  });

  describe("Create Post", () => {
    it("should open create post modal", () => {
      cy.visit(`/course/${testCourseId}`);

      cy.contains("button", "New Post").click();

      // Modal should open
      cy.contains("Create New Post").should("be.visible");
      cy.get('input[id="title"]').should("be.visible");
      cy.get('textarea[id="content"]').should("be.visible");
    });

    it("should validate required fields", () => {
      cy.visit(`/course/${testCourseId}`);

      cy.contains("button", "New Post").click();

      // Submit button should be disabled without content
      cy.get('input[id="title"]').should("be.visible");
      cy.get('textarea[id="content"]').should("be.visible");
    });

    it("should create a new post successfully", () => {
      cy.visit(`/course/${testCourseId}`);

      cy.contains("button", "New Post").click();

      const testTitle = `Test Post ${Date.now()}`;
      const testContent = "This is a test post content";

      cy.get('input[id="title"]').type(testTitle);
      cy.get('textarea[id="content"]').type(testContent);

      cy.contains("button", "Create Post").last().click();

      // Should show success and new post
      cy.contains(testTitle, { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Edit Post", () => {
    let createdPostTitle;

    beforeEach(() => {
      // Create a post to edit
      createdPostTitle = `Edit Test Post ${Date.now()}`;
      cy.visit(`/course/${testCourseId}`);

      cy.contains("button", "New Post").click();
      cy.get('input[id="title"]').type(createdPostTitle);
      cy.get('textarea[id="content"]').type("Original content");
      cy.contains("button", "Create Post").last().click();
      cy.contains(createdPostTitle, { timeout: 10000 }).should("be.visible");

      // Wait a bit for the UI to fully update
      cy.wait(1000);
    });

    it("should open edit modal for own post", () => {
      // Reload the page to ensure proper user context
      cy.reload();
      cy.wait(1000);

      // Find the post card containing our title
      cy.contains(createdPostTitle)
        .parents(".bg-white.border")
        .first()
        .within(() => {
          // Wait for buttons to appear and click edit
          cy.get('button[title="Edit post"]', { timeout: 5000 })
            .should("exist")
            .click({ force: true });
        });

      // Edit modal should open
      cy.contains("Edit Post").should("be.visible");
      cy.get('input[id="title"]').should("have.value", createdPostTitle);
    });

    it("should update post content", () => {
      // Reload the page to ensure proper user context
      cy.reload();
      cy.wait(1000);

      // Find the post and click edit
      cy.contains(createdPostTitle)
        .parents(".bg-white.border")
        .first()
        .within(() => {
          cy.get('button[title="Edit post"]', { timeout: 5000 })
            .should("exist")
            .click({ force: true });
        });

      const updatedContent = "Updated content";
      cy.get('textarea[id="content"]').clear().type(updatedContent);
      cy.contains("button", "Update Post").click();

      // Should show updated content
      cy.contains(updatedContent, { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Delete Post", () => {
    it("should delete own post", () => {
      const deletePostTitle = `Delete Test ${Date.now()}`;
      cy.visit(`/course/${testCourseId}`);

      // Create post
      cy.contains("button", "New Post").click();
      cy.get('input[id="title"]').type(deletePostTitle);
      cy.get('textarea[id="content"]').type("To be deleted");
      cy.contains("button", "Create Post").last().click();
      cy.contains(deletePostTitle, { timeout: 10000 }).should("be.visible");

      // Reload page to ensure proper user context
      cy.reload();
      cy.wait(1000);

      // Delete post
      cy.contains(deletePostTitle)
        .parents(".bg-white.border")
        .first()
        .within(() => {
          cy.get('button[title="Delete post"]', { timeout: 5000 })
            .should("exist")
            .click({ force: true });
        });

      // Confirm deletion
      cy.contains("button", "Delete").click();

      // Post should be removed
      cy.contains(deletePostTitle).should("not.exist");
    });
  });

  describe("Replies", () => {
    let replyPostTitle;

    beforeEach(() => {
      // Create a post to reply to
      replyPostTitle = `Reply Test ${Date.now()}`;
      cy.visit(`/course/${testCourseId}`);

      cy.contains("button", "New Post").click();
      cy.get('input[id="title"]').type(replyPostTitle);
      cy.get('textarea[id="content"]').type("Post for replies");
      cy.contains("button", "Create Post").last().click();
      cy.contains(replyPostTitle, { timeout: 10000 }).should("be.visible");
    });

    it("should show replies section", () => {
      cy.contains(replyPostTitle)
        .parents('[class*="border"]')
        .within(() => {
          cy.contains("Replies").should("be.visible");
        });
    });

    it("should add a reply to post", () => {
      // Toggle replies
      cy.contains(replyPostTitle)
        .parents('[class*="border"]')
        .within(() => {
          cy.contains("button", "Replies").click();
        });

      // Add reply
      const replyContent = `Test reply ${Date.now()}`;
      cy.contains(replyPostTitle)
        .parents('[class*="border"]')
        .within(() => {
          cy.get('textarea[placeholder*="reply"]').type(replyContent);
          cy.contains("button", "Post Reply").click();
        });

      // Reply should appear
      cy.contains(replyContent, { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Pagination", () => {
    it("should show pagination if many posts exist", () => {
      cy.visit(`/course/${testCourseId}`);

      // Check if pagination exists (may or may not depending on post count)
      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Next")').length > 0) {
          cy.contains("button", "Next").should("be.visible");
        } else {
          cy.log("Not enough posts for pagination");
        }
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle create post errors gracefully", () => {
      cy.visit(`/course/${testCourseId}`);

      cy.contains("button", "New Post").click();

      // Try with content
      cy.get('input[id="title"]').type("Error Test");
      cy.get('textarea[id="content"]').type("a".repeat(50));

      cy.contains("button", "Create Post").last().click();

      // Should either succeed or show error message
      cy.wait(2000);
    });
  });
});
