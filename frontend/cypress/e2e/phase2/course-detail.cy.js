/**
 * Phase 2: Core Course Features - Course Detail
 * Tests course detail page viewing and information display
 */

describe("Course Detail", () => {
  const mockCourse = {
    _id: "course-123",
    courseCode: "CS101",
    name: "Introduction to Computer Science",
    description:
      "Learn the fundamentals of computer programming and problem solving.",
    credits: 3,
    semester: "Fall",
    year: 2024,
    department: "Computer Science",
    isActive: true,
    instructor: {
      _id: "instructor-123",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@university.edu",
    },
    averageRating: 4.5,
    ratingCount: 23,
  };

  beforeEach(() => {
    cy.clearAppState();
    cy.loginAsStudent();

    // Mock posts API for ChatBoard - needed for all tests
    cy.intercept("GET", "**/api/courses/*/posts*", {
      statusCode: 200,
      body: {
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalPosts: 0,
        },
      },
    }).as("postsApi");

    // Mock course details API
    cy.intercept("GET", "**/api/courses/course-123*", {
      statusCode: 200,
      body: {
        success: true,
        data: mockCourse,
      },
    }).as("courseApi");
  });

  describe("Course Information", () => {
    it("should display course title and code", () => {
      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Check course code badge
      cy.contains(mockCourse.courseCode).should("be.visible");

      // Check course title
      cy.contains("h1", mockCourse.name).should("be.visible");
    });

    it("should display course description", () => {
      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Check description
      cy.contains(mockCourse.description).should("be.visible");
    });

    it("should display faculty information", () => {
      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Check instructor name
      cy.contains("Instructor:").should("be.visible");
      cy.contains(
        `${mockCourse.instructor.firstName} ${mockCourse.instructor.lastName}`
      ).should("be.visible");
    });

    it("should display additional course details", () => {
      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Check credits
      cy.contains(`${mockCourse.credits} credits`).should("be.visible");

      // Check semester
      cy.contains("Semester:").should("be.visible");
      cy.contains(mockCourse.semester).should("be.visible");

      // Check year
      cy.contains("Year:").should("be.visible");
      cy.contains(mockCourse.year.toString()).should("be.visible");

      // Check department
      cy.contains("Department:").should("be.visible");
      cy.contains(mockCourse.department).should("be.visible");
    });
  });

  describe("Course Ratings", () => {
    it("should display average rating", () => {
      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Check that rating is displayed
      cy.contains(mockCourse.averageRating.toString()).should("be.visible");
    });

    it("should display rating count", () => {
      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Check rating count
      cy.contains(`(${mockCourse.ratingCount})`).should("be.visible");
    });

    it("should open ratings modal when clicked", () => {
      // Mock the feedback API for ratings modal
      cy.intercept("GET", "**/api/courses/course-123/feedback*", {
        statusCode: 200,
        body: {
          success: true,
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
          },
        },
      }).as("feedbackApi");

      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Click on rating to open modal
      cy.contains(mockCourse.averageRating.toString()).click();

      // Wait for feedback API and check modal opened
      cy.wait("@feedbackApi");
      cy.contains("Course Ratings").should("be.visible");
    });
  });

  describe("Navigation", () => {
    it("should have a back button", () => {
      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Check back button exists
      cy.contains("button", "Back").should("be.visible");
    });

    it("should navigate back when back button clicked", () => {
      // Mock enrollments API for dashboard
      cy.intercept("GET", "**/api/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [],
        },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");
      cy.wait("@enrollmentsApi");

      cy.visit("/course/course-123");
      cy.wait("@courseApi");

      // Click back button
      cy.contains("button", "Back").click();

      // Should navigate back to previous page
      cy.url().should("not.include", "/course/course-123");
    });
  });

  describe("Error Handling", () => {
    it("should display error message when course fails to load", () => {
      cy.intercept("GET", "**/api/courses/course-999*", {
        statusCode: 404,
        body: {
          success: false,
          message: "Course not found",
        },
      }).as("courseNotFound");

      cy.visit("/course/course-999");
      cy.wait("@courseNotFound");

      // Should show error message
      cy.contains("Course not found").should("be.visible");
      cy.contains("Go Back").should("be.visible");
    });
  });
});
