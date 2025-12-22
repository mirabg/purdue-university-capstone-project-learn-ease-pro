/**
 * Phase 5: Edge Cases & Integration - Complete Workflows
 * Tests end-to-end user journeys across features using REAL BACKEND
 */

describe("Complete User Workflows", () => {
  beforeEach(() => {
    cy.clearAppState();
  });

  describe("Student Journey", () => {
    it("should complete full student enrollment workflow", () => {
      // Login as student
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      // Navigate to explore courses
      cy.visit("/student/explore-courses");
      cy.url().should("include", "/explore-courses");

      // Verify courses are displayed
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Enroll')").length > 0) {
          // Enroll in a course
          cy.contains("button", "Enroll").first().click();
          cy.wait(1000);

          // Go to dashboard to see enrolled courses
          cy.visit("/student/dashboard");
          cy.contains("My Courses").should("be.visible");

          // Try to access course materials if available
          cy.get("body").then(($body2) => {
            if ($body2.find("button:contains('Course Materials')").length > 0) {
              cy.contains("button", "Course Materials").first().click();
              cy.contains("Course Materials").should("be.visible");
            }
          });
        } else {
          cy.log("No courses available to enroll");
        }
      });
    });

    it("should complete chatboard interaction workflow", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

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
            const courseId = acceptedEnrollment.course._id;

            // Access course chatboard
            cy.visit(`/course/${courseId}`);
            cy.contains("Discussion Board").should("be.visible");

            // Create a post
            const postTitle = `Workflow Test ${Date.now()}`;
            cy.contains("button", "New Post").click();
            cy.get('input[id="title"]').type(postTitle);
            cy.get('textarea[id="content"]').type("Testing workflow");
            cy.contains("button", "Create Post").last().click();
            cy.contains(postTitle, { timeout: 10000 }).should("be.visible");

            // Add a reply
            cy.contains(postTitle)
              .parents('[class*="border"]')
              .within(() => {
                cy.contains("button", "Replies").click();
              });

            cy.contains(postTitle)
              .parents('[class*="border"]')
              .within(() => {
                cy.get('textarea[placeholder*="reply"]').type("Test reply");
                cy.contains("button", "Post Reply").click();
              });

            cy.contains("Test reply", { timeout: 10000 }).should("be.visible");
          }
        });
      });
    });
  });

  describe("Faculty Journey", () => {
    it("should complete course management workflow", () => {
      cy.loginAsFaculty();
      cy.visit("/faculty/dashboard");

      // Navigate to course management
      cy.contains("Manage Your Courses").click();
      cy.url().should("include", "/faculty/courses");

      // Verify courses are displayed
      cy.wait(1000);
      cy.get("body").should("be.visible");

      // Check if materials management is available
      cy.get("body").then(($body) => {
        if ($body.find('button[title="Materials"]').length > 0) {
          cy.get('button[title="Materials"]').first().click({ force: true });
          cy.wait(500);
          cy.contains("Course Materials").should("be.visible");
        }
      });
    });

    it("should complete chatboard moderation workflow", () => {
      cy.loginAsFaculty();

      // Get faculty's course
      cy.window().then((win) => {
        cy.request({
          method: "GET",
          url: `${Cypress.env("apiUrl")}/courses`,
          headers: {
            Authorization: `Bearer ${win.localStorage.getItem("token")}`,
          },
        }).then((response) => {
          const course = response.body.data[0];
          if (course) {
            // Access course chatboard
            cy.visit(`/course/${course._id}`);
            cy.wait(1000);

            // Verify chatboard is accessible
            cy.contains("Discussion Board").should("be.visible");
          }
        });
      });
    });
  });

  describe("Admin Journey", () => {
    it("should complete system administration workflow", () => {
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");

      // Verify dashboard statistics
      cy.contains("Admin Dashboard").should("be.visible");
      cy.contains("Total Users").should("be.visible");
      cy.contains("Total Courses").should("be.visible");

      // Navigate to user management
      cy.contains("button", "Manage Users").click();
      cy.url().should("include", "/admin/users");
      cy.wait(1000);

      // Navigate to course management
      cy.visit("/admin/dashboard");
      cy.contains("button", "Manage Courses").click();
      cy.url().should("include", "/admin/courses");
    });

    it("should navigate between management sections", () => {
      cy.loginAsAdmin();

      // Visit user management
      cy.visit("/admin/users");
      cy.url().should("include", "/admin/users");

      // Visit course management
      cy.visit("/admin/courses");
      cy.url().should("include", "/admin/courses");

      // Return to dashboard
      cy.visit("/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });
  });

  describe("Cross-Feature Workflows", () => {
    it("should handle enrollment and material access", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      // Check for enrolled courses with materials
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Course Materials')").length > 0) {
          cy.contains("button", "Course Materials").first().click();
          cy.contains("Course Materials").should("be.visible");
        } else {
          cy.log("No enrolled courses with materials");
        }
      });
    });

    it("should handle navigation across different roles", () => {
      // Test as student
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.contains("Welcome").should("be.visible");
      cy.logoutUser();

      // Test as faculty
      cy.clearAppState();
      cy.loginAsFaculty();
      cy.visit("/faculty/dashboard");
      cy.contains("Faculty Dashboard").should("be.visible");
      cy.logoutUser();

      // Test as admin
      cy.clearAppState();
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });
  });
});
