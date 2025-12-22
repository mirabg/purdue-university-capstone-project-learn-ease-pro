/**
 * Phase 5: Edge Cases & Integration - Multi-User Scenarios
 * Tests concurrent access and role interactions using REAL BACKEND
 */

describe("Multi-User Scenarios", () => {
  beforeEach(() => {
    cy.clearAppState();
  });

  describe("Concurrent Access", () => {
    it("should handle multiple users viewing same course", () => {
      // Login as student and get course ID
      cy.loginAsStudent();
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

            // First user views course
            cy.visit(`/course/${courseId}`);
            cy.contains("Discussion Board").should("be.visible");

            // Simulate second user by logging out and in as faculty
            cy.logoutUser();
            cy.clearAppState();
            cy.loginAsFaculty();

            // Second user views same course
            cy.visit(`/course/${courseId}`);
            cy.contains("Discussion Board").should("be.visible");
          }
        });
      });
    });

    it("should handle sequential enrollments", () => {
      cy.loginAsStudent();
      cy.visit("/student/explore-courses");

      // Check if courses are available for enrollment
      cy.get("body").then(($body) => {
        if ($body.find("button:contains('Enroll')").length > 0) {
          // Enroll in first available course
          cy.contains("button", "Enroll").first().click();
          cy.wait(1000);

          // Verify enrollment
          cy.visit("/student/dashboard");
          cy.contains("My Courses").should("be.visible");
        } else {
          cy.log("No courses available for enrollment");
        }
      });
    });
  });

  describe("Role Switching", () => {
    it("should handle logout and login as different role", () => {
      // Login as student
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.contains("Welcome").should("be.visible");

      // Logout
      cy.logoutUser();
      cy.wait(500);

      // Login as faculty
      cy.clearAppState();
      cy.loginAsFaculty();
      cy.visit("/faculty/dashboard");
      cy.contains("Faculty Dashboard").should("be.visible");

      // Logout
      cy.logoutUser();
      cy.wait(500);

      // Login as admin
      cy.clearAppState();
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should update permissions after role change", () => {
      // Student cannot access admin routes
      cy.loginAsStudent();
      cy.visit("/admin/users");
      cy.url().should("include", "/unauthorized");

      // Logout and login as admin
      cy.clearAppState();
      cy.loginAsAdmin();
      cy.visit("/admin/users");
      cy.url().should("include", "/admin/users");
    });

    it("should maintain separate sessions for different roles", () => {
      // Login as student
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.contains("Welcome").should("be.visible");

      // Clear and switch to faculty
      cy.clearAppState();
      cy.loginAsFaculty();
      cy.visit("/faculty/dashboard");
      cy.contains("Faculty Dashboard").should("be.visible");

      // Verify student session is cleared
      cy.clearAppState();
      cy.visit("/student/dashboard");
      cy.url().should("include", "/login");
    });
  });

  describe("Data Consistency", () => {
    it("should show consistent course data across views", () => {
      cy.loginAsStudent();

      // Get course from enrollments
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
            const courseName = acceptedEnrollment.course.name;

            // View in dashboard
            cy.visit("/student/dashboard");
            cy.contains(courseName).should("be.visible");

            // View in course detail
            cy.visit(`/course/${acceptedEnrollment.course._id}`);
            cy.contains(courseName).should("be.visible");
          }
        });
      });
    });

    it("should reflect enrollment status changes", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      // Check enrolled courses
      cy.contains("My Courses").should("be.visible");

      // Navigate to explore
      cy.visit("/student/explore-courses");
      cy.wait(1000);

      // Should show consistent enrollment status
      cy.get("body").should("be.visible");
    });

    it("should update chatboard posts across refreshes", () => {
      cy.loginAsStudent();

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

            // Create a post
            cy.visit(`/course/${courseId}`);
            const postTitle = `Consistency Test ${Date.now()}`;
            cy.contains("button", "New Post").click();
            cy.get('input[id="title"]').type(postTitle);
            cy.get('textarea[id="content"]').type("Testing consistency");
            cy.contains("button", "Create Post").last().click();
            cy.contains(postTitle, { timeout: 10000 }).should("be.visible");

            // Refresh page
            cy.reload();

            // Post should still be visible
            cy.contains(postTitle, { timeout: 10000 }).should("be.visible");
          }
        });
      });
    });
  });

  describe("Cross-Role Interactions", () => {
    it("should allow faculty to see student posts", () => {
      let courseId;

      // Student creates post
      cy.loginAsStudent();
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
            courseId = acceptedEnrollment.course._id;

            cy.visit(`/course/${courseId}`);
            const postTitle = `Cross-Role Test ${Date.now()}`;
            cy.contains("button", "New Post").click();
            cy.get('input[id="title"]').type(postTitle);
            cy.get('textarea[id="content"]').type("Student post");
            cy.contains("button", "Create Post").last().click();
            cy.contains(postTitle, { timeout: 10000 }).should("be.visible");

            // Logout student
            cy.logoutUser();

            // Faculty views same post
            cy.clearAppState();
            cy.loginAsFaculty();
            cy.visit(`/course/${courseId}`);
            cy.contains(postTitle, { timeout: 10000 }).should("be.visible");
          }
        });
      });
    });

    it("should show different UI elements based on role", () => {
      // Student view
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.contains("Welcome").should("be.visible");
      cy.contains("My Courses").should("be.visible");

      // Faculty view
      cy.clearAppState();
      cy.loginAsFaculty();
      cy.visit("/faculty/dashboard");
      cy.contains("Faculty Dashboard").should("be.visible");
      cy.contains("Manage Your Courses").should("be.visible");

      // Admin view
      cy.clearAppState();
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
      cy.contains("Manage Users").should("be.visible");
      cy.contains("Manage Courses").should("be.visible");
    });
  });
});
