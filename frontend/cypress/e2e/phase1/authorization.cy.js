/**
 * Phase 1: Foundation - Role-Based Authorization & Routing
 * Tests route protection, role-based access, and unauthorized handling
 */

describe("Authorization & Role-Based Routing", () => {
  beforeEach(() => {
    cy.clearAppState();
  });

  describe("Unauthenticated Access", () => {
    const protectedRoutes = [
      "/student/dashboard",
      "/student/explore-courses",
      "/faculty/dashboard",
      "/faculty/courses",
      "/admin/dashboard",
      "/admin/users",
      "/admin/courses",
    ];

    protectedRoutes.forEach((route) => {
      it(`should redirect unauthenticated user from ${route} to login`, () => {
        cy.visit(route);
        cy.url().should("include", "/login");
      });
    });

    it("should allow access to public routes without authentication", () => {
      // Login page
      cy.visit("/login");
      cy.url().should("include", "/login");
      cy.contains("h2", "Login").should("be.visible");

      // Register page
      cy.visit("/register");
      cy.url().should("include", "/register");
      cy.contains("h2", "Create Account").should("be.visible");
    });
  });

  describe("Student Role Access Control", () => {
    beforeEach(() => {
      cy.loginAsStudent();
    });

    it("should allow student to access student dashboard", () => {
      cy.visit("/student/dashboard");
      cy.url().should("include", "/student/dashboard");
      cy.contains("Welcome").should("be.visible");
    });

    it("should allow student to access explore courses page", () => {
      cy.visit("/student/explore-courses");
      cy.url().should("include", "/student/explore-courses");
    });

    it("should allow student to access course detail pages", () => {
      cy.visit("/course/123");
      cy.url().should("include", "/course/123");
    });

    it("should redirect student from faculty dashboard to unauthorized", () => {
      cy.visit("/faculty/dashboard");
      cy.url().should("include", "/unauthorized");
      cy.contains("Access Denied").should("be.visible");
    });

    it("should redirect student from faculty courses to unauthorized", () => {
      cy.visit("/faculty/courses");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect student from admin dashboard to unauthorized", () => {
      cy.visit("/admin/dashboard");
      cy.url().should("include", "/unauthorized");
      cy.contains("Access Denied").should("be.visible");
    });

    it("should redirect student from admin users page to unauthorized", () => {
      cy.visit("/admin/users");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect student from admin courses page to unauthorized", () => {
      cy.visit("/admin/courses");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect root path to student dashboard", () => {
      cy.visit("/");
      cy.url().should("include", "/student/dashboard");
    });
  });

  describe("Faculty Role Access Control", () => {
    beforeEach(() => {
      cy.loginAsFaculty();
    });

    it("should allow faculty to access faculty dashboard", () => {
      cy.visit("/faculty/dashboard");
      cy.url().should("include", "/faculty/dashboard");
      cy.contains("Faculty Dashboard").should("be.visible");
    });

    it("should allow faculty to access course management", () => {
      cy.visit("/faculty/courses");
      cy.url().should("include", "/faculty/courses");
    });

    it("should allow faculty to access course detail pages", () => {
      cy.visit("/course/123");
      cy.url().should("include", "/course/123");
    });

    it("should redirect faculty from student dashboard to unauthorized", () => {
      cy.visit("/student/dashboard");
      cy.url().should("include", "/unauthorized");
      cy.contains("Access Denied").should("be.visible");
    });

    it("should redirect faculty from student explore courses to unauthorized", () => {
      cy.visit("/student/explore-courses");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect faculty from admin dashboard to unauthorized", () => {
      cy.visit("/admin/dashboard");
      cy.url().should("include", "/unauthorized");
      cy.contains("Access Denied").should("be.visible");
    });

    it("should redirect faculty from admin users page to unauthorized", () => {
      cy.visit("/admin/users");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect faculty from admin courses page to unauthorized", () => {
      cy.visit("/admin/courses");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect root path to faculty dashboard", () => {
      cy.visit("/");
      cy.url().should("include", "/faculty/dashboard");
    });
  });

  describe("Admin Role Access Control", () => {
    beforeEach(() => {
      cy.loginAsAdmin();
    });

    it("should allow admin to access admin dashboard", () => {
      cy.visit("/admin/dashboard");
      cy.url().should("include", "/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should allow admin to access user management", () => {
      cy.visit("/admin/users");
      cy.url().should("include", "/admin/users");
    });

    it("should allow admin to access course management", () => {
      cy.visit("/admin/courses");
      cy.url().should("include", "/admin/courses");
    });

    it("should redirect admin from student dashboard to unauthorized", () => {
      cy.visit("/student/dashboard");
      cy.url().should("include", "/unauthorized");
      cy.contains("Access Denied").should("be.visible");
    });

    it("should redirect admin from student explore courses to unauthorized", () => {
      cy.visit("/student/explore-courses");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect admin from faculty dashboard to unauthorized", () => {
      cy.visit("/faculty/dashboard");
      cy.url().should("include", "/unauthorized");
      cy.contains("Access Denied").should("be.visible");
    });

    it("should redirect admin from faculty courses to unauthorized", () => {
      cy.visit("/faculty/courses");
      cy.url().should("include", "/unauthorized");
    });

    it("should redirect root path to admin dashboard", () => {
      cy.visit("/");
      cy.url().should("include", "/admin/dashboard");
    });
  });

  describe("Unauthorized Page", () => {
    beforeEach(() => {
      cy.loginAsStudent();
      cy.visit("/admin/dashboard");
    });

    it("should display unauthorized page with proper content", () => {
      cy.url().should("include", "/unauthorized");
      cy.contains("Access Denied").should("be.visible");
      cy.contains("You don't have permission").should("be.visible");
    });

    it("should have a back button on unauthorized page", () => {
      cy.url().should("include", "/unauthorized");
      cy.contains("button", "Go Back").should("be.visible");
    });

    it("should navigate back when clicking go back button", () => {
      cy.url().should("include", "/unauthorized");
      cy.contains("button", "Go Back").click();

      // Should navigate to previous page or dashboard
      cy.url().should("not.include", "/unauthorized");
    });
  });

  describe("Route Guarding with Redux State", () => {
    it("should protect routes when Redux state changes", () => {
      // Start as student
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.url().should("include", "/student/dashboard");

      // Clear auth (simulate logout)
      cy.logoutUser();

      // Try to access protected route
      cy.visit("/student/dashboard");
      cy.url().should("include", "/login");
    });

    it("should update accessible routes when role changes", () => {
      // Login as student
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.url().should("include", "/student/dashboard");

      // Change to admin (simulate role change)
      cy.logoutUser();
      cy.loginAsAdmin();

      // Should now access admin routes
      cy.visit("/admin/dashboard");
      cy.url().should("include", "/admin/dashboard");

      // Should not access student routes
      cy.visit("/student/dashboard");
      cy.url().should("include", "/unauthorized");
    });
  });

  describe("Navigation After Unauthorized Access", () => {
    it("should maintain correct navigation state after unauthorized access", () => {
      cy.loginAsStudent();

      // Try to access faculty page
      cy.visit("/faculty/dashboard");
      cy.url().should("include", "/unauthorized");

      // Navigate to valid student page
      cy.visit("/student/dashboard");
      cy.url().should("include", "/student/dashboard");
      cy.contains("Welcome").should("be.visible");
    });

    it("should allow navigation to allowed routes after unauthorized attempt", () => {
      cy.loginAsFaculty();

      // Try to access admin page
      cy.visit("/admin/users");
      cy.url().should("include", "/unauthorized");

      // Navigate to valid faculty page
      cy.visit("/faculty/dashboard");
      cy.url().should("include", "/faculty/dashboard");
      cy.contains("Faculty Dashboard").should("be.visible");
    });
  });

  describe("Authentication State Persistence", () => {
    it("should maintain authorization after page reload", () => {
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");
      cy.url().should("include", "/admin/dashboard");

      // Reload page
      cy.reload();

      // Should still be authorized
      cy.url().should("include", "/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should maintain role-based restrictions after reload", () => {
      cy.loginAsStudent();
      cy.visit("/faculty/dashboard");
      cy.url().should("include", "/unauthorized");

      // Reload page
      cy.reload();

      // Should still be unauthorized
      cy.url().should("include", "/unauthorized");
    });
  });

  describe("Multiple Tab/Window Behavior", () => {
    it("should maintain consistent auth state across navigations", () => {
      cy.loginAsStudent();

      // Open multiple routes in sequence
      cy.visit("/student/dashboard");
      cy.url().should("include", "/student/dashboard");

      cy.visit("/student/explore-courses");
      cy.url().should("include", "/student/explore-courses");

      cy.visit("/course/1");
      cy.url().should("include", "/course/1");

      // All should work without re-authentication
      cy.shouldBeLoggedIn();
    });
  });

  describe("Direct URL Access", () => {
    it("should handle direct URL access with authentication", () => {
      cy.loginAsStudent();

      // Directly access a deep route
      cy.visit("/course/456");
      cy.url().should("include", "/course/456");
    });

    it("should handle direct URL access without authentication", () => {
      // Directly access protected route without auth
      cy.visit("/student/dashboard");
      cy.url().should("include", "/login");
    });

    it("should handle direct unauthorized URL access", () => {
      cy.loginAsStudent();

      // Directly access admin route
      cy.visit("/admin/users");
      cy.url().should("include", "/unauthorized");
    });
  });
});
