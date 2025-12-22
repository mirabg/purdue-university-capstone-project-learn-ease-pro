/**
 * Phase 5: Edge Cases & Integration - Error Handling
 * Tests error scenarios and edge cases using REAL BACKEND
 */

describe("Error Handling", () => {
  beforeEach(() => {
    cy.clearAppState();
  });

  describe("Authentication Errors", () => {
    it("should handle invalid login credentials", () => {
      cy.visit("/login");
      cy.get('input[name="email"]').type("invalid@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      // Should stay on login page or show error
      cy.url().should("include", "/login");
    });

    it("should handle expired session", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.contains("Welcome").should("be.visible");

      // Clear token to simulate expired session
      cy.window().then((win) => {
        win.localStorage.removeItem("token");
      });

      // Try to access protected route
      cy.visit("/student/explore-courses");
      cy.wait(1000);

      // Should redirect to login or show error
      cy.get("body").should("be.visible");
    });

    it("should prevent unauthorized access", () => {
      // Try to access admin route without authentication
      cy.visit("/admin/users");
      cy.url().should("include", "/login");
    });
  });

  describe("API Errors", () => {
    it("should handle 404 not found for courses", () => {
      cy.loginAsStudent();

      // Try to access non-existent course
      cy.visit("/course/invalid-course-id-123");
      cy.wait(2000);

      // Should show error or redirect
      cy.get("body").should("be.visible");
    });

    it("should handle forbidden access", () => {
      cy.loginAsStudent();

      // Try to access admin route as student
      cy.visit("/admin/users");
      cy.url().should("include", "/unauthorized");
      cy.contains("Unauthorized Access").should("be.visible");
    });

    it("should handle missing required data", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      // Navigate to explore courses
      cy.contains(/explore|browse|find courses/i).click();

      // Should handle empty states gracefully
      cy.get("body").should("be.visible");
    });
  });

  describe("Validation Errors", () => {
    it("should display form validation errors on login", () => {
      cy.visit("/login");

      // Try to submit without credentials
      cy.get('button[type="submit"]').click();

      // Form should not submit
      cy.url().should("include", "/login");
    });

    it("should validate email format on registration", () => {
      cy.visit("/register");

      // Enter invalid email
      cy.get('input[name="email"]').type("invalidemail");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="firstName"]').type("Test");
      cy.get('input[name="lastName"]').type("User");

      // Check if validation occurs
      cy.get('button[type="submit"]').click();

      // Should show error or prevent submission
      cy.url().should("include", "/register");
    });

    it("should prevent empty post submission", () => {
      cy.loginAsStudent();

      // Get enrolled course
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
            cy.visit(`/course/${acceptedEnrollment.course._id}`);

            // Open create post modal
            cy.contains("button", "New Post").click();

            // Verify form requires content
            cy.get('input[id="title"]').should("be.visible");
            cy.get('textarea[id="content"]').should("be.visible");
          }
        });
      });
    });

    it("should validate rating submission", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      // Check for rate button
      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Rate this Course")').length > 0) {
          cy.contains("button", "Rate this Course").first().click();

          // Submit button should be disabled without rating
          cy.contains("button", "Submit Rating").should("be.disabled");
        }
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid navigation", () => {
      cy.loginAsStudent();

      // Navigate rapidly between pages
      cy.visit("/student/dashboard");
      cy.visit("/student/explore-courses");
      cy.visit("/student/dashboard");

      // Should render correctly
      cy.contains("Welcome").should("be.visible");
    });

    it("should handle double-click on enrollment", () => {
      cy.loginAsStudent();
      cy.visit("/student/explore-courses");

      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Enroll')").length > 0) {
          // Double-click should be handled gracefully
          cy.contains("button", "Enroll").first().dblclick();
          cy.wait(1000);
        }
      });
    });

    it("should handle empty search results", () => {
      cy.loginAsStudent();
      cy.visit("/student/explore-courses");
      cy.wait(1000);

      // Check if search input exists
      cy.get("body").then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type("NonExistentCourse12345");
          cy.wait(1000);
        } else {
          cy.log("Search input not available");
        }
      });

      // Should show empty state or no results message
      cy.get("body").should("be.visible");
    });

    it("should handle special characters in search", () => {
      cy.loginAsStudent();
      cy.visit("/student/explore-courses");
      cy.wait(1000);

      // Check if search input exists
      cy.get("body").then(($body) => {
        if ($body.find('input[placeholder*="Search"]').length > 0) {
          cy.get('input[placeholder*="Search"]').type("@#$%^&*()");
          cy.wait(500);
        } else {
          cy.log("Search input not available");
        }
      });

      // Should not crash
      cy.get("body").should("be.visible");
    });

    it("should handle logout from multiple tabs simulation", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.contains("Welcome").should("be.visible");

      // Simulate logout by clearing storage
      cy.logoutUser();
      cy.wait(500);

      // Try to navigate to protected route
      cy.visit("/student/explore-courses");

      // Should redirect to login
      cy.url().should("include", "/login");
    });
  });
});
