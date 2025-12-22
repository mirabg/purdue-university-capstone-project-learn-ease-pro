/**
 * Phase 2: Core Course Features - Course Enrollment
 * Tests enrollment, unenrollment, and enrollment status
 *
 * STATUS: IMPLEMENTED ✅
 */

describe("Course Enrollment", () => {
  beforeEach(() => {
    cy.clearAppState();
    cy.loginAsStudent();
    
    // Mock enrollments API - needed for all tests
    cy.intercept("GET", "**/api/enrollments*", {
      statusCode: 200,
      body: {
        success: true,
        data: [],
      },
    }).as("enrollmentsApi");
  });

  describe("Enroll in Course", () => {
    it("should successfully enroll student in a course", () => {
      // Mock courses API
      cy.intercept("GET", "**/api/courses*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: "course1",
              courseCode: "CS101",
              name: "Introduction to Programming",
              description: "Learn the basics of programming",
              instructor: {
                firstName: "John",
                lastName: "Doe",
              },
              credits: 3,
            },
          ],
          count: 1,
        },
      }).as("coursesApi");

      // Mock enrollment creation
      cy.intercept("POST", "**/api/enrollments", {
        statusCode: 201,
        body: {
          success: true,
          data: {
            _id: "enrollment1",
            course: "course1",
            student: "2",
            status: "pending",
          },
          message: "Successfully enrolled",
        },
      }).as("createEnrollment");

      cy.viewport(1280, 720);
      cy.visit("/student/explore-courses");
      cy.wait("@coursesApi");

      // Click enroll button
      cy.contains("button", "Enroll").first().click();

      // Wait for enrollment API call
      cy.wait("@createEnrollment");

      // Should show success message
      cy.contains(
        "Successfully enrolled! Your request is pending approval."
      ).should("be.visible");
    });

    it("should show enrollment confirmation message", () => {
      cy.intercept("GET", "**/api/courses*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: "course1",
              courseCode: "CS101",
              name: "Introduction to Programming",
              description: "Learn programming",
              instructor: { firstName: "John", lastName: "Doe" },
            },
          ],
          count: 1,
        },
      }).as("coursesApi");

      cy.intercept("POST", "**/api/enrollments", {
        statusCode: 201,
        body: {
          success: true,
          data: {
            _id: "enrollment1",
            course: "course1",
            student: "2",
            status: "pending",
          },
        },
      }).as("createEnrollment");

      cy.visit("/student/explore-courses");
      cy.wait("@coursesApi");

      cy.contains("button", "Enroll").click();
      cy.wait("@createEnrollment");

      // Check for success message
      cy.contains("Successfully enrolled!").should("be.visible");
    });

    it("should handle enrollment error gracefully", () => {
      cy.intercept("GET", "**/api/courses*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: "course1",
              courseCode: "CS101",
              name: "Programming",
              description: "Learn programming",
              instructor: { firstName: "John", lastName: "Doe" },
            },
          ],
          count: 1,
        },
      }).as("coursesApi");

      // Mock enrollment failure
      cy.intercept("POST", "**/api/enrollments", {
        statusCode: 400,
        body: {
          success: false,
          message: "Already enrolled in this course",
        },
      }).as("createEnrollmentError");

      cy.visit("/student/explore-courses");
      cy.wait("@coursesApi");

      cy.contains("button", "Enroll").click();
      cy.wait("@createEnrollmentError");

      // Should show error message
      cy.contains("Already enrolled in this course").should("be.visible");
    });
  });

  describe("Enrollment Status", () => {
    it("should filter out enrolled courses from available courses", () => {
      cy.intercept("GET", "**/api/courses*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: "course1",
              courseCode: "CS101",
              name: "Programming",
              description: "Learn programming",
              instructor: { firstName: "John", lastName: "Doe" },
            },
            {
              _id: "course2",
              courseCode: "CS201",
              name: "Data Structures",
              description: "Advanced topics",
              instructor: { firstName: "Jane", lastName: "Smith" },
            },
          ],
          count: 2,
        },
      }).as("coursesApi");

      // Override enrollments to show student enrolled in course1
      cy.intercept("GET", "**/api/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: "enrollment1",
              course: {
                _id: "course1",
                courseCode: "CS101",
                name: "Programming",
              },
              student: "2",
              status: "active",
            },
          ],
        },
      }).as("enrollmentsWithCourse");

      cy.viewport(1280, 720);
      cy.visit("/student/explore-courses");
      cy.wait("@coursesApi");

      // Should show only course2
      cy.contains("td", "CS201").should("be.visible");
      cy.contains("Displaying 1 of 1 available course").should("be.visible");
    });

    it("should show appropriate message when all courses are enrolled", () => {
      cy.intercept("GET", "**/api/courses*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: "course1",
              courseCode: "CS101",
              name: "Programming",
              description: "Learn programming",
              instructor: { firstName: "John", lastName: "Doe" },
            },
          ],
          count: 1,
        },
      }).as("coursesApi");

      // Student enrolled in all courses
      cy.intercept("GET", "**/api/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              _id: "enrollment1",
              course: {
                _id: "course1",
                courseCode: "CS101",
                name: "Programming",
              },
              student: "2",
              status: "active",
            },
          ],
        },
      }).as("enrollmentsAll");

      cy.visit("/student/explore-courses");
      cy.wait("@coursesApi");

      // Should show message about being enrolled in all courses
      cy.contains("You're enrolled in all available courses!").should(
        "be.visible"
      );
    });
  });
});
