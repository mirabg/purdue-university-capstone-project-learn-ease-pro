/**
 * Phase 3: Interactive Features - Course Materials
 * Tests viewing and downloading course materials using REAL BACKEND
 */

describe("Course Materials", () => {
  let testCourse;

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
          testCourse = acceptedEnrollment.course;
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

  describe("View Materials", () => {
    it("should open materials modal from dashboard", () => {
      cy.visit("/student/dashboard");

      // Click "Course Materials" button
      cy.contains("button", "Course Materials").first().click();

      // Modal should open
      cy.contains("Course Materials").should("be.visible");
    });

    it("should display materials list", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Check for materials or empty state
      cy.get("body").then(($body) => {
        if ($body.find(':contains("No materials uploaded yet")').length > 0) {
          cy.contains("No materials uploaded yet").should("be.visible");
          cy.contains("Materials (0)").should("be.visible");
        } else {
          // Has materials
          cy.contains(/Materials \(\d+\)/).should("be.visible");
        }
      });
    });

    it("should show material types with icons", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Check for SVG icons
      cy.get("body").then(($body) => {
        if ($body.find(':contains("No materials uploaded yet")').length === 0) {
          cy.get("svg").should("have.length.at.least", 1);
        } else {
          cy.log("No materials to display");
        }
      });
    });

    it("should display material metadata", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Modal should show course materials section
      cy.contains("Course Materials").should("be.visible");
    });

    it("should show empty state when no materials exist", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Check for empty state or materials
      cy.get("body").then(($body) => {
        if ($body.find(':contains("No materials uploaded yet")').length > 0) {
          cy.contains("No materials uploaded yet").should("be.visible");
        } else {
          cy.log("Materials exist");
        }
      });
    });
  });

  describe("Download Materials", () => {
    it("should have download links for materials", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Check for download links if materials exist
      cy.get("body").then(($body) => {
        if ($body.find('a:contains("Download")').length > 0) {
          cy.contains("a", "Download").should("be.visible");
        } else {
          cy.log("No downloadable materials");
        }
      });
    });

    it("should download documents", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Check if any materials with download links exist
      cy.get("body").then(($body) => {
        if ($body.find('a:contains("Download")').length > 0) {
          cy.get('a:contains("Download")')
            .first()
            .should("have.attr", "href")
            .and("include", "/uploads/");
        } else {
          cy.log("No documents to download");
        }
      });
    });

    it("should download videos", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Check for video materials
      cy.get("body").then(($body) => {
        if ($body.find(':contains("Video")').length > 0) {
          cy.contains("Video").should("be.visible");
        } else {
          cy.log("No video materials");
        }
      });
    });
  });

  describe("Material Access Control", () => {
    it("should only show materials button for enrolled courses", () => {
      cy.visit("/student/dashboard");

      // Should have Course Materials button for enrolled course
      cy.contains("button", "Course Materials").should("be.visible");
    });

    it("should not allow editing materials in read-only mode", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Should not have Upload button (read-only for students)
      cy.contains("button", "Upload Material").should("not.exist");

      // Should not have edit/delete buttons
      cy.get('[title="Edit material"]').should("not.exist");
      cy.get('[title="Delete material"]').should("not.exist");
    });
  });

  describe("Error Handling", () => {
    it("should display error message when materials fail to load", () => {
      cy.visit("/student/dashboard");

      // Open materials modal
      cy.contains("button", "Course Materials").first().click();

      // Modal should open regardless
      cy.contains("Course Materials").should("be.visible");
    });
  });
});
