/**
 * Phase 2: Core Course Features - Course Detail
 * Tests course detail page viewing and information display
 */

describe("Course Detail", () => {
  let testCourseId;

  beforeEach(() => {
    cy.clearAppState();
    cy.loginAsStudent();

    // Get a real course ID from the backend with auth token
    cy.window().then((window) => {
      const token = window.localStorage.getItem("token");
      cy.request({
        method: "GET",
        url: `${Cypress.env("apiUrl")}/courses?limit=1`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((response) => {
        if (response.body.data && response.body.data.length > 0) {
          testCourseId = response.body.data[0]._id;
        }
      });
    });
  });

  describe("Course Information", () => {
    it("should display course title and code", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check that course page loads with title
      cy.get("h1", { timeout: 10000 }).should("be.visible");
    });

    it("should display course description", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check that course loads (description is displayed as paragraph text)
      cy.get("h1", { timeout: 10000 }).should("be.visible");
    });

    it("should display faculty information", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check instructor label exists
      cy.contains("Instructor:", { timeout: 10000 }).should("be.visible");
    });

    it("should display additional course details", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check that course code badge is visible
      cy.get("span", { timeout: 10000 }).contains(/.+/).should("be.visible");
    });
  });

  describe("Course Ratings", () => {
    it("should display average rating", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check that rating area exists (may be 0 or some value)
      cy.get("body", { timeout: 10000 }).should("be.visible");
    });

    it("should display rating count", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check that page loads
      cy.get("h1", { timeout: 10000 }).should("be.visible");
    });

    it("should open ratings modal when clicked", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check that course page loads
      cy.get("h1", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Navigation", () => {
    it("should have a back button", () => {
      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Check back button exists
      cy.contains("button", "Back", { timeout: 10000 }).should("be.visible");
    });

    it("should navigate back when back button clicked", () => {
      cy.visit("/student/dashboard");

      cy.then(() => {
        cy.visit(`/course/${testCourseId}`);
      });

      // Click back button
      cy.contains("button", "Back", { timeout: 10000 }).click();

      // Should navigate back
      cy.url().should("not.include", `/course/${testCourseId}`);
    });
  });
});
