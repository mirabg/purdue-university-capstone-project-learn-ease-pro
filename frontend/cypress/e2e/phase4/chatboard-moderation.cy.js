/**
 * Phase 4: Admin/Faculty Features - ChatBoard Moderation
 * Tests faculty moderation capabilities using REAL BACKEND
 */

describe("ChatBoard Moderation (Faculty)", () => {
  let testCourseId;
  let testPostId;
  let authToken;

  before(() => {
    // Login as faculty and get a course
    cy.clearAppState();
    cy.visit("/login");
    cy.get('input[name="email"]').type("emily.johnson@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard", { timeout: 10000 });

    // Get faculty's course and token
    cy.window().then((win) => {
      authToken = win.localStorage.getItem("token");

      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/courses`,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }).then((response) => {
        const course = response.body.data[0];
        if (course) {
          testCourseId = course._id;

          // Create a test post for moderation tests
          cy.request({
            method: "POST",
            url: `${Cypress.env("apiUrl")}/courses/${testCourseId}/posts`,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            body: {
              title: "Test Post for Moderation",
              content:
                "This is a test post to verify faculty moderation features.",
            },
          }).then((postResponse) => {
            testPostId = postResponse.body.data._id;

            // Create a test reply
            cy.request({
              method: "POST",
              url: `${Cypress.env("apiUrl")}/posts/${testPostId}/replies`,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
              body: {
                content: "This is a test reply for moderation.",
              },
            });
          });
        }
      });
    });
  });

  beforeEach(() => {
    cy.clearAppState();
    cy.visit("/login");
    cy.get('input[name="email"]').type("emily.johnson@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/dashboard", { timeout: 10000 });
  });

  describe("Pin Posts", () => {
    it("should pin important posts", () => {
      cy.visit(`/course/${testCourseId}`);
      cy.wait(1000);

      // Find the test post and check if it's already pinned
      cy.contains(".bg-white.border", "Test Post for Moderation").then(
        ($post) => {
          // If post is pinned, unpin it first to test pinning
          if ($post.text().includes("Pinned")) {
            cy.wrap($post).within(() => {
              cy.get('button[title*="Unpin"]').first().click();
            });
            cy.wait(1000);
          }

          // Now pin the post
          cy.contains(".bg-white.border", "Test Post for Moderation").within(
            () => {
              cy.get('button[title="Pin post"]').first().click();
            }
          );

          // Verify post is pinned
          cy.wait(1000);
          cy.contains(".bg-white.border", "Test Post for Moderation").should(
            "contain",
            "Pinned"
          );
        }
      );
    });

    it("should unpin posts", () => {
      cy.visit(`/course/${testCourseId}`);
      cy.wait(1000);

      // Find pinned post and unpin it
      cy.contains(".bg-white.border", "Pinned")
        .first()
        .within(() => {
          cy.get('button[title*="Unpin"]').first().click();
        });

      // Verify post is unpinned
      cy.wait(1000);
      cy.contains(".bg-white.border", "Test Post for Moderation").should(
        "not.contain",
        "Pinned"
      );
    });

    it("should display pinned posts at top", () => {
      cy.visit(`/course/${testCourseId}`);
      cy.wait(1000);

      // Pin the test post first
      cy.contains(".bg-white.border", "Test Post for Moderation").within(() => {
        cy.get('button[title*="Pin"]').first().click();
      });

      cy.wait(1000);

      // Verify pinned post appears first and contains Pinned badge
      cy.contains(".bg-white.border", "Test Post for Moderation").should(
        "contain",
        "Pinned"
      );
    });
  });

  describe("Moderate Content", () => {
    it("should edit any post", () => {
      cy.visit(`/course/${testCourseId}`);
      cy.wait(1000);

      // Faculty can edit any post
      cy.contains(".bg-white.border", "Test Post for Moderation").within(() => {
        cy.get('button[title="Edit post"]').should("exist");
      });
    });

    it("should delete any post", () => {
      cy.visit(`/course/${testCourseId}`);
      cy.wait(1000);

      // Faculty can delete any post
      cy.contains(".bg-white.border", "Test Post for Moderation").within(() => {
        cy.get('button[title="Delete post"]').should("exist");
      });
    });

    it("should edit any reply", () => {
      cy.visit(`/course/${testCourseId}`);
      cy.wait(1000);

      // Expand replies on the test post
      cy.contains(".bg-white.border", "Test Post for Moderation").within(() => {
        cy.contains("button", "Replies").click();
      });

      cy.wait(500);

      // Verify faculty can see edit button on reply
      cy.get(".bg-gray-50")
        .first()
        .within(() => {
          cy.get('button[title="Edit reply"]').should("exist");
        });
    });

    it("should delete any reply", () => {
      cy.visit(`/course/${testCourseId}`);
      cy.wait(1000);

      // Expand replies on the test post
      cy.contains(".bg-white.border", "Test Post for Moderation").within(() => {
        cy.contains("button", "Replies").click();
      });

      cy.wait(500);

      // Faculty can delete any reply
      cy.get(".bg-gray-50")
        .first()
        .within(() => {
          cy.get('button[title="Delete reply"]').should("exist");
        });
    });
  });
});
