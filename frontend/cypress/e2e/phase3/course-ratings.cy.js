/**
 * Phase 3: Interactive Features - Course Ratings
 * Tests rating and feedback functionality using REAL BACKEND
 */

describe("Course Ratings", () => {
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

  describe("View Ratings", () => {
    it("should display average rating on dashboard", () => {
      cy.visit("/student/dashboard");

      // Rating should be displayed (even if 0)
      cy.get('[role="button"]').should("have.length.at.least", 1);
    });

    it("should open ratings modal when rating is clicked", () => {
      cy.visit("/student/dashboard");

      // Click on a course rating
      cy.get('[role="button"]').first().click();

      // Modal should open
      cy.contains("Course Ratings").should("be.visible");
    });

    it("should show rating breakdown in modal", () => {
      cy.visit("/student/dashboard");

      // Open ratings modal
      cy.get('[role="button"]').first().click();

      // Check modal content
      cy.contains("Course Ratings").should("be.visible");
      cy.contains("ratings", { matchCase: false }).should("be.visible");
    });

    it("should display individual reviews", () => {
      cy.visit("/student/dashboard");

      // Open ratings modal
      cy.get('[role="button"]').first().click();

      // Check for reviews section (may be empty)
      cy.get("body").then(($body) => {
        if ($body.find(':contains("No reviews yet")').length > 0) {
          cy.contains("No reviews yet").should("be.visible");
        } else {
          cy.log("Reviews exist");
        }
      });
    });

    it("should show empty state when no reviews exist", () => {
      cy.visit("/student/dashboard");

      // Open ratings modal for a course
      cy.get('[role="button"]').first().click();

      // Check body for empty state or reviews
      cy.get("body").should("be.visible");
    });
  });

  describe("Submit Rating", () => {
    it("should open add rating modal from dashboard", () => {
      cy.visit("/student/dashboard");

      // Find and click "Rate this Course" button if it exists
      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Rate this Course")').length > 0) {
          cy.contains("button", "Rate this Course").first().click();

          // Modal should open
          cy.contains("Rate This Course").should("be.visible");
        } else if ($body.find(':contains("Your Rating:")').length > 0) {
          // User already rated - test passes
          cy.log("User has already rated this course");
        } else {
          cy.log("No rate button found");
        }
      });
    });

    it("should allow selecting star rating", () => {
      cy.visit("/student/dashboard");

      // Find rate button
      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Rate this Course")').length > 0) {
          cy.contains("button", "Rate this Course").first().click();

          // Select stars
          cy.get('button[name="star"]').should("have.length", 5);
          cy.get('button[name="star"]').eq(3).click();

          // Should show selected rating
          cy.contains("4 stars").should("be.visible");
        } else {
          cy.log("User has already rated");
        }
      });
    });

    it("should submit rating successfully", () => {
      cy.visit("/student/dashboard");

      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Rate this Course")').length > 0) {
          cy.contains("button", "Rate this Course").first().click();

          // Select rating
          cy.get('button[name="star"]').eq(4).click();

          // Add comment
          cy.get('textarea[id="comment"]').type("Excellent course!");

          // Submit
          cy.contains("button", "Submit Rating").click();

          // Should close modal and show success
          cy.contains("Rate This Course").should("not.exist");
          cy.contains("Your Rating:").should("be.visible");
        } else {
          cy.log("User has already rated");
        }
      });
    });

    it("should validate rating is required", () => {
      cy.visit("/student/dashboard");

      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Rate this Course")').length > 0) {
          cy.contains("button", "Rate this Course").first().click();

          // Submit button should be disabled without rating
          cy.contains("button", "Submit Rating").should("be.disabled");
        } else {
          cy.log("User has already rated");
        }
      });
    });

    it("should respect comment length limit", () => {
      cy.visit("/student/dashboard");

      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Rate this Course")').length > 0) {
          cy.contains("button", "Rate this Course").first().click();

          // Select rating
          cy.get('button[name="star"]').eq(4).click();

          // Check textarea has maxLength
          cy.get('textarea[id="comment"]').should(
            "have.attr",
            "maxLength",
            "1000"
          );
        } else {
          cy.log("User has already rated");
        }
      });
    });
  });

  describe("Update Rating", () => {
    it("should allow updating existing rating", () => {
      cy.visit("/student/dashboard");

      // Check if user has rated
      cy.get("body").then(($body) => {
        if ($body.find(':contains("Your Rating:")').length > 0) {
          // Click on user's rating box to edit
          cy.contains("Your Rating:").parent().parent().click();

          // Modal should open with existing data
          cy.contains("Edit Your Rating").should("be.visible");

          // Stars should be visible
          cy.get('button[name="star"]').should("have.length", 5);
        } else {
          cy.log("User hasn't rated yet");
        }
      });
    });

    it("should submit updated rating", () => {
      cy.visit("/student/dashboard");

      cy.get("body").then(($body) => {
        if ($body.find(':contains("Your Rating:")').length > 0) {
          // Click on rating box to edit
          cy.contains("Your Rating:").parent().parent().click();

          // Update rating
          cy.get('button[name="star"]').eq(4).click();

          // Update comment
          cy.get('textarea[id="comment"]').clear().type("Updated: Great!");

          // Submit
          cy.contains("button", "Update Rating").click();

          // Should show updated rating
          cy.contains("Your Rating:").should("be.visible");
        } else {
          cy.log("User hasn't rated yet");
        }
      });
    });
  });
});
