/**
 * Phase 3: Interactive Features - Course Ratings
 * Tests rating and feedback functionality
 */

describe("Course Ratings", () => {
  const mockCourse = {
    _id: "course-123",
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    averageRating: 4.5,
    ratingCount: 10,
  };

  const mockFeedback = [
    {
      _id: "feedback-1",
      rating: 5,
      comment: "Excellent course! Very informative.",
      user: {
        _id: "user-1",
        firstName: "Alice",
        lastName: "Smith",
      },
      createdAt: "2024-12-01T10:00:00Z",
    },
    {
      _id: "feedback-2",
      rating: 4,
      comment: "Good content, but could use more examples.",
      user: {
        _id: "user-2",
        firstName: "Bob",
        lastName: "Jones",
      },
      createdAt: "2024-12-02T11:00:00Z",
    },
  ];

  const mockStatistics = {
    averageRating: 4.5,
    totalFeedback: 10,
    ratingDistribution: [
      { _id: 5, count: 6 },
      { _id: 4, count: 3 },
      { _id: 3, count: 1 },
      { _id: 2, count: 0 },
      { _id: 1, count: 0 },
    ],
  };

  beforeEach(() => {
    cy.clearAppState();
    cy.loginAsStudent();

    // Mock enrollments API
    cy.intercept("GET", "**/api/enrollments*", {
      statusCode: 200,
      body: {
        success: true,
        data: [
          {
            _id: "enrollment-1",
            course: mockCourse,
            status: "accepted",
          },
        ],
      },
    }).as("enrollmentsApi");
  });

  describe("View Ratings", () => {
    it("should display average rating on dashboard", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Check that rating is displayed
      cy.contains(mockCourse.averageRating.toString()).should("be.visible");
      cy.contains(`(${mockCourse.ratingCount})`).should("be.visible");
    });

    it("should open ratings modal when rating is clicked", () => {
      // Mock feedback API
      cy.intercept("GET", "**/api/courses/course-123/feedback*", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            feedback: mockFeedback,
            statistics: mockStatistics,
          },
        },
      }).as("feedbackApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Click on rating
      cy.contains(mockCourse.averageRating.toString()).click();

      // Wait for feedback to load
      cy.wait("@feedbackApi");

      // Modal should open
      cy.contains("Course Ratings & Reviews").should("be.visible");
    });

    it("should show rating breakdown in modal", () => {
      cy.intercept("GET", "**/api/courses/course-123/feedback*", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            feedback: mockFeedback,
            statistics: mockStatistics,
          },
        },
      }).as("feedbackApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open ratings modal
      cy.contains(mockCourse.averageRating.toString()).click();
      cy.wait("@feedbackApi");

      // Check statistics are displayed
      cy.contains("4.5").should("be.visible");
      cy.contains("10 ratings").should("be.visible");

      // Check rating bars exist (visual representation)
      cy.get(".bg-yellow-400").should("have.length.at.least", 1);
    });

    it("should display individual reviews", () => {
      cy.intercept("GET", "**/api/courses/course-123/feedback*", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            feedback: mockFeedback,
            statistics: mockStatistics,
          },
        },
      }).as("feedbackApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open ratings modal
      cy.contains(mockCourse.averageRating.toString()).click();
      cy.wait("@feedbackApi");

      // Check reviews are displayed
      mockFeedback.forEach((feedback) => {
        cy.contains(feedback.comment).should("be.visible");
        cy.contains(
          `${feedback.user.firstName} ${feedback.user.lastName}`
        ).should("be.visible");
      });
    });

    it("should show empty state when no reviews exist", () => {
      cy.intercept("GET", "**/api/courses/course-123/feedback*", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            feedback: [],
            statistics: {
              averageRating: 0,
              totalFeedback: 0,
              ratingDistribution: [],
            },
          },
        },
      }).as("feedbackApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open ratings modal
      cy.contains(mockCourse.averageRating.toString()).click();
      cy.wait("@feedbackApi");

      // Should show empty state
      cy.contains("No reviews yet for this course").should("be.visible");
    });
  });

  describe("Submit Rating", () => {
    beforeEach(() => {
      // Mock user feedback to check if they've already rated
      cy.intercept("GET", "**/api/courses/course-123/feedback/user", {
        statusCode: 404,
        body: {
          success: false,
          message: "No feedback found",
        },
      }).as("userFeedback");
    });

    it("should open add rating modal from dashboard", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Click "Add Rating" button
      cy.contains("button", /Rate|Add Rating/i)
        .first()
        .click();

      // Modal should open
      cy.contains("Rate This Course").should("be.visible");
      cy.contains(mockCourse.courseCode).should("be.visible");
    });

    it("should allow selecting star rating", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open rating modal
      cy.contains("button", /Rate|Add Rating/i)
        .first()
        .click();

      // Click on 4 stars
      cy.get('button[name="star"]').eq(3).click();

      // Should show selected rating
      cy.contains("4 stars").should("be.visible");
    });

    it("should submit rating successfully", () => {
      // Mock rating submission
      cy.intercept("POST", "**/api/courses/course-123/feedback", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            _id: "feedback-new",
            rating: 5,
            comment: "Great course!",
          },
        },
      }).as("submitFeedback");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open rating modal
      cy.contains("button", /Rate|Add Rating/i)
        .first()
        .click();

      // Select rating
      cy.get('button[name="star"]').eq(4).click();

      // Add comment
      cy.get('textarea[id="comment"]').type("Great course!");

      // Submit
      cy.contains("button", "Submit Rating").click();

      // Wait for submission
      cy.wait("@submitFeedback");

      // Modal should close
      cy.contains("Rate This Course").should("not.exist");
    });

    it("should validate rating is required", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open rating modal
      cy.contains("button", /Rate|Add Rating/i)
        .first()
        .click();

      // Try to submit without rating
      cy.contains("button", "Submit Rating").should("be.disabled");
    });

    it("should respect comment length limit", () => {
      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Open rating modal
      cy.contains("button", /Rate|Add Rating/i)
        .first()
        .click();

      // Select rating
      cy.get('button[name="star"]').eq(4).click();

      // Type long comment
      const longComment = "a".repeat(1001);
      cy.get('textarea[id="comment"]')
        .invoke("val", longComment)
        .trigger("input");

      // Should show character count
      cy.contains(/1000.*characters/i).should("be.visible");

      // The textarea should enforce maxLength
      cy.get('textarea[id="comment"]').should("have.attr", "maxLength", "1000");
    });
  });

  describe("Update Rating", () => {
    it("should allow updating existing rating", () => {
      const existingFeedback = {
        _id: "feedback-existing",
        rating: 4,
        comment: "Good course",
        course: "course-123",
      };

      // Mock existing user feedback
      cy.intercept("GET", "**/api/courses/course-123/feedback/user", {
        statusCode: 200,
        body: {
          success: true,
          data: existingFeedback,
        },
      }).as("userFeedback");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Button should say "Edit Rating" instead of "Add Rating"
      cy.contains("button", /Edit Rating/i).should("be.visible");

      // Click edit rating
      cy.contains("button", /Edit Rating/i)
        .first()
        .click();

      // Modal should open with existing data
      cy.contains("Edit Your Rating").should("be.visible");

      // Should show current rating (4 stars selected)
      cy.get('button[name="star"]')
        .eq(3)
        .find("svg")
        .should("have.class", "fill-current");

      // Comment should be pre-filled
      cy.get('textarea[id="comment"]').should(
        "have.value",
        existingFeedback.comment
      );
    });

    it("should submit updated rating", () => {
      const existingFeedback = {
        _id: "feedback-existing",
        rating: 4,
        comment: "Good course",
        course: "course-123",
      };

      cy.intercept("GET", "**/api/courses/course-123/feedback/user", {
        statusCode: 200,
        body: {
          success: true,
          data: existingFeedback,
        },
      }).as("userFeedback");

      // Mock update
      cy.intercept("POST", "**/api/courses/course-123/feedback", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            ...existingFeedback,
            rating: 5,
            comment: "Excellent course!",
          },
        },
      }).as("updateFeedback");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      // Edit rating
      cy.contains("button", /Edit Rating/i)
        .first()
        .click();

      // Update to 5 stars
      cy.get('button[name="star"]').eq(4).click();

      // Update comment
      cy.get('textarea[id="comment"]').clear().type("Excellent course!");

      // Submit
      cy.contains("button", "Update Rating").click();

      // Wait for update
      cy.wait("@updateFeedback");
    });
  });
});
