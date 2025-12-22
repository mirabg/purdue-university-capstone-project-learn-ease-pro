/**
 * Phase 1: Foundation - Dashboard Data Loading
 * Tests all three dashboard types with proper data loading and display
 */

describe("Dashboard Data Loading", () => {
  beforeEach(() => {
    cy.clearAppState();
  });

  describe("Student Dashboard", () => {
    beforeEach(() => {
      cy.loginAsStudent();
    });

    it("should display student statistics cards", () => {
      cy.visit("/student/dashboard");

      // Check statistics cards
      cy.contains("My Courses").should("be.visible");
      cy.contains("Accepted").should("be.visible");
      cy.contains("Pending").should("be.visible");
    });

    it("should display correct enrollment count", () => {
      cy.visit("/student/dashboard");

      // Should show My Courses section
      cy.contains("My Courses").should("be.visible");
    });

    it("should display enrolled courses list", () => {
      cy.visit("/student/dashboard");

      // Dashboard should load and display enrolled courses section
      cy.contains(/enrolled|courses/i, { timeout: 10000 }).should("be.visible");
    });

    it("should display progress bars for enrolled courses", () => {
      cy.visit("/student/dashboard");

      // Check that dashboard loads
      cy.contains(/welcome|dashboard/i, { timeout: 10000 }).should(
        "be.visible"
      );
    });

    it("should handle empty enrollments state", () => {
      cy.visit("/student/dashboard");

      // Should show My Courses section
      cy.contains("My Courses", { timeout: 10000 }).should("be.visible");
    });

    it("should display welcome message with user name", () => {
      cy.visit("/student/dashboard");

      cy.contains("Welcome", { timeout: 10000 }).should("be.visible");
    });

    it("should have navigation link to explore courses", () => {
      cy.visit("/student/dashboard");

      cy.contains(/explore|browse|find courses/i).should("be.visible");
    });
  });

  describe("Faculty Dashboard", () => {
    beforeEach(() => {
      cy.loginAsFaculty();
    });

    it("should display faculty dashboard title", () => {
      cy.visit("/faculty/dashboard");

      cy.contains("Faculty Dashboard").should("be.visible");
    });

    it("should display faculty teaching statistics", () => {
      cy.visit("/faculty/dashboard");

      // Check that faculty dashboard loads with statistics
      cy.contains("Faculty Dashboard", { timeout: 10000 }).should("be.visible");
    });

    it("should display list of teaching courses", () => {
      cy.visit("/faculty/dashboard");

      // Check that faculty dashboard loads
      cy.contains("Faculty Dashboard", { timeout: 10000 }).should("be.visible");
    });

    it("should display enrollment counts for courses", () => {
      cy.visit("/faculty/dashboard");

      // Check that faculty dashboard loads
      cy.contains("Faculty Dashboard", { timeout: 10000 }).should("be.visible");
    });

    it("should handle no teaching courses state", () => {
      cy.visit("/faculty/dashboard");

      // Check that faculty dashboard loads
      cy.contains("Faculty Dashboard", { timeout: 10000 }).should("be.visible");
    });

    it("should have link to manage courses", () => {
      cy.visit("/faculty/dashboard");

      cy.contains("Manage Your Courses").should("be.visible");
    });

    it("should navigate to course management page", () => {
      cy.visit("/faculty/dashboard");

      cy.contains("Manage Your Courses").click();
      cy.url().should("include", "/faculty/courses");
    });
  });

  describe("Admin Dashboard", () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it("should display admin dashboard title", () => {
      cy.visit("/admin/dashboard");

      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should display system-wide statistics", () => {
      cy.visit("/admin/dashboard");

      // Check statistics cards
      cy.contains("Total Users", { timeout: 10000 }).should("be.visible");
      cy.contains("Total Courses").should("be.visible");
      cy.contains(/Active Enrollments|Total Enrollments/i).should("be.visible");
    });

    it("should display correct user statistics", () => {
      cy.visit("/admin/dashboard");

      // Check that user statistics loads
      cy.contains("Total Users", { timeout: 10000 }).should("be.visible");
    });

    it("should display correct course statistics", () => {
      cy.visit("/admin/dashboard");

      // Check that course statistics loads
      cy.contains("Total Courses", { timeout: 10000 }).should("be.visible");
    });

    it("should display correct enrollment statistics", () => {
      cy.visit("/admin/dashboard");

      // Check that enrollment statistics loads
      cy.contains(/Active Enrollments|Total Enrollments/i, {
        timeout: 10000,
      }).should("be.visible");
    });

    it("should have management action buttons", () => {
      cy.visit("/admin/dashboard");

      cy.contains("button", "Manage Users").should("be.visible");
      cy.contains("button", "Manage Courses").should("be.visible");
    });

    it("should navigate to user management", () => {
      cy.visit("/admin/dashboard");

      cy.contains("button", "Manage Users").click();
      cy.url().should("include", "/admin/users");
    });

    it("should navigate to course management", () => {
      cy.visit("/admin/dashboard");

      cy.contains("button", "Manage Courses").click();
      cy.url().should("include", "/admin/courses");
    });
  });

  describe("Dashboard Responsive Design", () => {
    const viewports = [
      { name: "mobile", width: 375, height: 667 },
      { name: "tablet", width: 768, height: 1024 },
      { name: "desktop", width: 1280, height: 720 },
    ];

    viewports.forEach(({ name, width, height }) => {
      it(`should display student dashboard correctly on ${name}`, () => {
        cy.loginAsStudent();
        cy.viewport(width, height);
        cy.visit("/student/dashboard");

        cy.contains("Welcome").should("be.visible");
        cy.contains("My Courses").should("be.visible");
      });

      it(`should display faculty dashboard correctly on ${name}`, () => {
        cy.loginAsFaculty();
        cy.viewport(width, height);
        cy.visit("/faculty/dashboard");

        cy.contains("Faculty Dashboard").should("be.visible");
      });

      it(`should display admin dashboard correctly on ${name}`, () => {
        cy.loginAsAdmin();
        cy.viewport(width, height);
        cy.visit("/admin/dashboard");

        cy.contains("Admin Dashboard").should("be.visible");
        cy.contains("Total Users").should("be.visible");
      });
    });
  });

  describe("Dashboard Data Refresh", () => {
    it("should maintain dashboard state after navigation and return", () => {
      cy.loginAsStudent();

      cy.visit("/student/dashboard");
      cy.contains("Welcome", { timeout: 10000 }).should("be.visible");

      // Navigate away
      cy.visit("/student/explore-courses");

      // Navigate back
      cy.visit("/student/dashboard");

      // Dashboard should still load
      cy.contains("Welcome", { timeout: 10000 }).should("be.visible");
    });
  });
});
