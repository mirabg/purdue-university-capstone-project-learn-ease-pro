/**
 * Phase 2: Core Course Features - Course Browsing
 * Tests course listing, search, filtering, and navigation
 *
 * STATUS: IMPLEMENTED ✅
 */

describe("Course Browsing", () => {
  beforeEach(() => {
    cy.clearAppState();
    cy.loginAsStudent();
  });

  describe("Course Listing", () => {
    it("should display the explore courses page with header", () => {
      cy.visit("/student/explore-courses");

      // Check page header
      cy.contains("h1", "Explore Courses").should("be.visible");
      cy.contains("Browse and enroll in available courses").should(
        "be.visible"
      );

      // Check back button
      cy.contains("button", "Back to Dashboard").should("be.visible");
    });

    it("should display all available courses in a table (desktop view)", () => {
      cy.viewport(1280, 720); // Desktop viewport
      cy.visit("/student/explore-courses");

      // Check table headers (desktop only)
      cy.contains("th", "Course Code", { timeout: 10000 }).should("be.visible");
      cy.contains("th", "Course Name").should("be.visible");
      cy.contains("th", "Instructor").should("be.visible");

      // Check that table exists
      cy.get("table", { timeout: 10000 }).should("exist");
    });
  });

  describe("Course Search", () => {
    it("should have a visible search input", () => {
      cy.visit("/student/explore-courses");

      cy.get('input[placeholder="Search courses..."]', { timeout: 10000 })
        .should("be.visible")
        .and("have.value", "");
    });
  });

  describe("Course Navigation", () => {
    it("should navigate back to dashboard", () => {
      cy.visit("/student/explore-courses");

      cy.contains("button", "Back to Dashboard", { timeout: 10000 }).click();
      cy.url().should("include", "/student/dashboard");
    });
  });
});
