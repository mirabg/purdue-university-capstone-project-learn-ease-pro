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

    it("should display student dashboard with loading state", () => {
      // Mock slow API to test loading state
      cy.intercept("GET", "**/api/users/*/enrollments", (req) => {
        req.reply({
          delay: 1000,
          statusCode: 200,
          body: { success: true, data: [] },
        });
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");

      // Should show loading indicator
      cy.contains(/loading|wait/i).should("be.visible");
    });

    it("should display student statistics cards", () => {
      cy.intercept("GET", "**/api/users/*/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: "1",
              courseId: "101",
              status: "active",
              progress: 0,
              course: {
                id: "101",
                name: "Introduction to Computer Science",
                courseCode: "CS101",
              },
            },
            {
              id: "2",
              courseId: "102",
              status: "completed",
              progress: 100,
              course: {
                id: "102",
                name: "Data Structures",
                courseCode: "CS102",
              },
            },
          ],
        },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");

      // Check statistics cards
      cy.contains("Enrolled Courses").should("be.visible");
      cy.contains("Completed Courses").should("be.visible");
      cy.contains("In Progress").should("be.visible");
    });

    it("should display correct enrollment count", () => {
      cy.intercept("GET", "**/api/users/*/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            { id: "1", courseId: "101", status: "active", progress: 0 },
            { id: "2", courseId: "102", status: "active", progress: 50 },
            { id: "3", courseId: "103", status: "completed", progress: 100 },
          ],
        },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");
      cy.waitForApi("@enrollmentsApi");

      // Should show 3 enrolled courses (active + completed)
      cy.contains("Enrolled Courses")
        .parent()
        .within(() => {
          cy.contains("3").should("be.visible");
        });
    });

    it("should display enrolled courses list", () => {
      cy.intercept("GET", "**/api/users/*/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: "1",
              courseId: "101",
              status: "active",
              progress: 45,
              course: {
                id: "101",
                name: "Introduction to Computer Science",
                courseCode: "CS101",
                credits: 3,
              },
            },
            {
              id: "2",
              courseId: "102",
              status: "active",
              progress: 80,
              course: {
                id: "102",
                name: "Data Structures",
                courseCode: "CS102",
                credits: 4,
              },
            },
          ],
        },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");
      cy.waitForApi("@enrollmentsApi");

      // Check course names appear
      cy.contains("Introduction to Computer Science").should("be.visible");
      cy.contains("Data Structures").should("be.visible");

      // Check course codes
      cy.contains("CS101").should("be.visible");
      cy.contains("CS102").should("be.visible");
    });

    it("should display progress bars for enrolled courses", () => {
      cy.intercept("GET", "**/api/users/*/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: "1",
              courseId: "101",
              status: "active",
              progress: 65,
              course: {
                id: "101",
                name: "Computer Science",
                courseCode: "CS101",
              },
            },
          ],
        },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");
      cy.waitForApi("@enrollmentsApi");

      // Should show progress percentage
      cy.contains("65%").should("be.visible");
    });

    it("should handle empty enrollments state", () => {
      cy.intercept("GET", "**/api/users/*/enrollments*", {
        statusCode: 200,
        body: { success: true, data: [] },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");
      cy.waitForApi("@enrollmentsApi");

      // Should show 0 enrolled courses
      cy.contains("Enrolled Courses")
        .parent()
        .within(() => {
          cy.contains("0").should("be.visible");
        });

      // Should show empty state message
      cy.contains(/no courses|not enrolled|get started/i).should("be.visible");
    });

    it("should handle API errors gracefully", () => {
      cy.intercept("GET", "**/api/users/*/enrollments*", {
        statusCode: 500,
        body: { success: false, message: "Internal server error" },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");

      // Should show error message
      cy.contains(/error|failed|problem/i).should("be.visible");
    });

    it("should display welcome message with user name", () => {
      cy.visit("/student/dashboard");

      cy.contains("Welcome").should("be.visible");
      cy.contains("Student User").should("be.visible");
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
      cy.intercept("GET", "**/api/courses?faculty=*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: "201",
              name: "Advanced Programming",
              courseCode: "CS301",
              faculty: "3",
              enrollmentCount: 25,
            },
            {
              id: "202",
              name: "Database Systems",
              courseCode: "CS302",
              faculty: "3",
              enrollmentCount: 30,
            },
          ],
        },
      }).as("facultyCoursesApi");

      cy.visit("/faculty/dashboard");
      cy.waitForApi("@facultyCoursesApi");

      // Check statistics
      cy.contains(/teaching|courses taught/i).should("be.visible");
      cy.contains("2").should("be.visible");
    });

    it("should display list of teaching courses", () => {
      cy.intercept("GET", "**/api/courses?faculty=*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: "201",
              name: "Advanced Programming",
              courseCode: "CS301",
              faculty: "3",
              enrollmentCount: 25,
            },
            {
              id: "202",
              name: "Database Systems",
              courseCode: "CS302",
              faculty: "3",
              enrollmentCount: 30,
            },
          ],
        },
      }).as("facultyCoursesApi");

      cy.visit("/faculty/dashboard");
      cy.waitForApi("@facultyCoursesApi");

      // Check course names
      cy.contains("Advanced Programming").should("be.visible");
      cy.contains("Database Systems").should("be.visible");

      // Check course codes
      cy.contains("CS301").should("be.visible");
      cy.contains("CS302").should("be.visible");
    });

    it("should display enrollment counts for courses", () => {
      cy.intercept("GET", "**/api/courses?faculty=*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: "201",
              name: "Advanced Programming",
              courseCode: "CS301",
              enrollmentCount: 25,
            },
          ],
        },
      }).as("facultyCoursesApi");

      cy.visit("/faculty/dashboard");
      cy.waitForApi("@facultyCoursesApi");

      cy.contains(/25.*student/i).should("be.visible");
    });

    it("should handle no teaching courses state", () => {
      cy.intercept("GET", "**/api/courses?faculty=*", {
        statusCode: 200,
        body: { success: true, data: [] },
      }).as("facultyCoursesApi");

      cy.visit("/faculty/dashboard");
      cy.waitForApi("@facultyCoursesApi");

      cy.contains(/no courses|not teaching/i).should("be.visible");
    });

    it("should have link to manage courses", () => {
      cy.visit("/faculty/dashboard");

      cy.contains(/manage courses|course management/i).should("be.visible");
    });

    it("should navigate to course management page", () => {
      cy.visit("/faculty/dashboard");

      cy.contains(/manage courses|course management/i).click();
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
      cy.intercept("GET", "**/api/users/stats", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            totalUsers: 150,
            totalStudents: 100,
            totalFaculty: 45,
            totalAdmins: 5,
          },
        },
      }).as("userStatsApi");

      cy.intercept("GET", "**/api/courses/stats", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            totalCourses: 50,
            activeCourses: 40,
            totalEnrollments: 500,
          },
        },
      }).as("courseStatsApi");

      cy.visit("/admin/dashboard");

      // Check statistics cards
      cy.contains("Total Users").should("be.visible");
      cy.contains("Total Courses").should("be.visible");
      cy.contains("Active Enrollments").should("be.visible");
    });

    it("should display correct user statistics", () => {
      cy.intercept("GET", "**/api/users/stats", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            totalUsers: 150,
            totalStudents: 100,
            totalFaculty: 45,
            totalAdmins: 5,
          },
        },
      }).as("userStatsApi");

      cy.visit("/admin/dashboard");
      cy.waitForApi("@userStatsApi");

      cy.contains("Total Users")
        .parent()
        .within(() => {
          cy.contains("150").should("be.visible");
        });
    });

    it("should display correct course statistics", () => {
      cy.intercept("GET", "**/api/courses/stats", {
        statusCode: 200,
        body: {
          success: true,
          data: {
            totalCourses: 50,
            activeCourses: 40,
          },
        },
      }).as("courseStatsApi");

      cy.visit("/admin/dashboard");
      cy.waitForApi("@courseStatsApi");

      cy.contains("Total Courses")
        .parent()
        .within(() => {
          cy.contains("50").should("be.visible");
        });
    });

    it("should display correct enrollment statistics", () => {
      cy.intercept("GET", "**/api/courses/stats", {
        statusCode: 200,
        body: {
          success: true,
          data: { totalEnrollments: 500 },
        },
      }).as("courseStatsApi");

      cy.visit("/admin/dashboard");
      cy.waitForApi("@courseStatsApi");

      cy.contains("Active Enrollments")
        .parent()
        .within(() => {
          cy.contains("500").should("be.visible");
        });
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

    it("should handle statistics API errors", () => {
      cy.intercept("GET", "**/api/users/stats", {
        statusCode: 500,
        body: { success: false, message: "Server error" },
      }).as("userStatsApi");

      cy.visit("/admin/dashboard");

      // Should handle error gracefully
      cy.contains(/error|failed|unavailable/i).should("be.visible");
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
        cy.contains("Enrolled Courses").should("be.visible");
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
    it("should refresh student dashboard data on reload", () => {
      cy.loginAsStudent();

      let callCount = 0;
      cy.intercept("GET", "**/api/users/*/enrollments*", (req) => {
        callCount++;
        req.reply({
          statusCode: 200,
          body: { success: true, data: [] },
        });
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");
      cy.waitForApi("@enrollmentsApi");

      cy.reload();
      cy.waitForApi("@enrollmentsApi");

      // Should have made two API calls
      cy.wrap(callCount).should("be.gte", 2);
    });

    it("should maintain dashboard state after navigation and return", () => {
      cy.loginAsStudent();

      cy.intercept("GET", "**/api/users/*/enrollments*", {
        statusCode: 200,
        body: {
          success: true,
          data: [
            {
              id: "1",
              courseId: "101",
              course: { name: "Test Course", courseCode: "TC101" },
            },
          ],
        },
      }).as("enrollmentsApi");

      cy.visit("/student/dashboard");
      cy.waitForApi("@enrollmentsApi");
      cy.contains("Test Course").should("be.visible");

      // Navigate away
      cy.visit("/student/explore-courses");

      // Navigate back
      cy.visit("/student/dashboard");

      // Data should still be visible
      cy.contains("Test Course").should("be.visible");
    });
  });
});
