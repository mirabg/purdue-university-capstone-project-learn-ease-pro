/**
 * Phase 1: Foundation - Authentication Flows
 * Tests login, registration, logout, and token persistence
 */

describe("Authentication Flows", () => {
  beforeEach(() => {
    cy.clearAppState();
  });

  describe("Login Page", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("should display login form with all elements", () => {
      cy.contains("h2", "Login").should("be.visible");
      cy.contains("Sign in to your account to continue").should("be.visible");

      // Form fields
      cy.get('input[name="email"]')
        .should("be.visible")
        .and("have.attr", "type", "email")
        .and("have.attr", "placeholder", "Enter your email")
        .and("have.attr", "required");

      cy.get('input[name="password"]')
        .should("be.visible")
        .and("have.attr", "type", "password")
        .and("have.attr", "placeholder", "Enter your password")
        .and("have.attr", "required");

      // Submit button
      cy.get('button[type="submit"]')
        .should("be.visible")
        .and("contain", "Sign In");

      // Register link
      cy.contains("Don't have an account?").should("be.visible");
      cy.get('a[href="/register"]')
        .should("be.visible")
        .and("contain", "Create an account");
    });

    it("should show validation errors for empty form", () => {
      cy.get('button[type="submit"]').click();

      // Browser native validation should prevent submission
      cy.get('input[name="email"]:invalid').should("exist");
      cy.get('input[name="password"]:invalid').should("exist");
    });

    it("should show validation error for invalid email format", () => {
      cy.get('input[name="email"]').type("invalid-email");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.get('input[name="email"]:invalid').should("exist");
    });

    it("should navigate to register page", () => {
      cy.get('a[href="/register"]').click();
      cy.url().should("include", "/register");
      cy.contains("h2", "Create Student Account").should("be.visible");
    });

    it("should redirect authenticated users to their dashboard", () => {
      // Login as student first
      cy.visit("/login");
      cy.get('input[name="email"]').type("john.smith@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // Wait for redirect to dashboard
      cy.url().should("include", "/student/dashboard", { timeout: 10000 });

      // Try to visit login page while authenticated
      cy.visit("/login");

      // Should redirect back to student dashboard
      cy.url().should("include", "/student/dashboard", { timeout: 5000 });

      // Also test register page
      cy.visit("/register");
      cy.url().should("include", "/student/dashboard", { timeout: 5000 });
    });
  });

  describe("Login Flow - Valid Credentials", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("should successfully login as admin and redirect to admin dashboard", () => {
      cy.get('input[name="email"]').type("admin@nowhere.com");
      cy.get('input[name="password"]').type("changeme");
      cy.get('button[type="submit"]').click();

      // Wait for redirect to admin dashboard
      cy.url().should("include", "/admin/dashboard", { timeout: 10000 });
      cy.shouldBeLoggedIn();
      cy.contains("Admin Dashboard", { timeout: 10000 }).should("be.visible");
    });

    it("should successfully login as faculty and redirect to faculty dashboard", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        body: {
          success: true,
          token: "mock-faculty-token",
          data: {
            id: "3",
            email: "faculty@example.com",
            role: "faculty",
            firstName: "Faculty",
            lastName: "User",
          },
        },
      }).as("loginApi");

      cy.get('input[name="email"]').type("faculty@example.com");
      cy.get('input[name="password"]').type("faculty123");
      cy.get('button[type="submit"]').click();

      cy.waitForApi("@loginApi");
      cy.url().should("include", "/faculty/dashboard");
      cy.shouldBeLoggedIn();
    });

    it("should successfully login as student and redirect to student dashboard", () => {
      cy.get('input[name="email"]').type("john.smith@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // Wait for redirect to student dashboard
      cy.url().should("include", "/student/dashboard", { timeout: 10000 });
      cy.shouldBeLoggedIn();
      cy.contains("Welcome", { timeout: 10000 }).should("be.visible");
    });

    it("should persist authentication after page reload", () => {
      cy.get('input[name="email"]').type("john.smith@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // Wait for redirect to student dashboard
      cy.url().should("include", "/student/dashboard", { timeout: 10000 });
      cy.contains("Welcome", { timeout: 10000 }).should("be.visible");

      // Reload page
      cy.reload();

      // Should still be on dashboard
      cy.url().should("include", "/student/dashboard");
      cy.shouldBeLoggedIn();
      cy.contains("Welcome").should("be.visible");
    });
  });

  describe("Login Flow - Invalid Credentials", () => {
    beforeEach(() => {
      cy.visit("/login");
    });

    it("should show error message for invalid credentials", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 401,
        body: {
          success: false,
          message: "Invalid email or password",
        },
      }).as("loginApi");

      cy.get('input[name="email"]').type("wrong@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      cy.wait("@loginApi");
      // Error message should appear in the UI
      cy.contains(/invalid|error|failed|incorrect/i, { timeout: 10000 }).should(
        "be.visible"
      );
      cy.shouldBeLoggedOut();
    });

    it("should show error message when user not found", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 404,
        body: {
          success: false,
          message: "User not found",
        },
      }).as("loginApi");

      cy.get('input[name="email"]').type("notfound@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.waitForApi("@loginApi", 404);
      cy.shouldShowError("User not found");
      cy.shouldBeLoggedOut();
    });

    it("should handle network errors gracefully", () => {
      cy.intercept("POST", "**/api/users/login", {
        forceNetworkError: true,
      }).as("loginApi");

      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // Should show generic error message
      cy.contains(/error|failed|problem/i).should("be.visible");
      cy.shouldBeLoggedOut();
    });
  });

  describe("Registration Page", () => {
    beforeEach(() => {
      cy.visit("/register");
    });

    it("should display registration form with all elements", () => {
      cy.contains("h2", "Create Student Account").should("be.visible");

      // Form fields
      cy.get('input[name="firstName"]')
        .should("be.visible")
        .and("have.attr", "required");

      cy.get('input[name="lastName"]')
        .should("be.visible")
        .and("have.attr", "required");

      cy.get('input[name="email"]')
        .should("be.visible")
        .and("have.attr", "type", "email")
        .and("have.attr", "required");

      cy.get('input[name="password"]')
        .should("be.visible")
        .and("have.attr", "type", "password")
        .and("have.attr", "required");

      // Submit button
      cy.get('button[type="submit"]')
        .should("be.visible")
        .and("contain", "Create Account");

      // Login link
      cy.contains("Already have an account?").should("be.visible");
      cy.get('a[href="/login"]').should("be.visible").and("contain", "Sign in");
    });

    it("should show validation errors for empty form", () => {
      cy.get('button[type="submit"]').click();

      // Browser native validation should prevent submission
      cy.get('input[name="firstName"]:invalid').should("exist");
      cy.get('input[name="lastName"]:invalid').should("exist");
      cy.get('input[name="email"]:invalid').should("exist");
      cy.get('input[name="password"]:invalid').should("exist");
    });

    it("should navigate to login page", () => {
      cy.get('a[href="/login"]').click();
      cy.url().should("include", "/login");
      cy.contains("h2", "Login").should("be.visible");
    });
  });

  describe("Registration Flow - Valid Data", () => {
    beforeEach(() => {
      cy.visit("/register");
    });

    it("should successfully register a new student", () => {
      // Generate unique email with timestamp to avoid duplicates
      const timestamp = Date.now();
      const email = `teststudent${timestamp}@example.com`;

      cy.get('input[name="firstName"]').type("Test");
      cy.get('input[name="lastName"]').type("Student");
      cy.get('input[name="email"]').type(email);
      cy.get('input[name="password"]').type("Test@123");
      cy.get('input[name="confirmPassword"]').type("Test@123");
      cy.get('button[type="submit"]').click();

      // Wait for redirect to student dashboard after successful registration
      cy.url().should("include", "/student/dashboard", { timeout: 10000 });
      cy.contains("Welcome", { timeout: 10000 }).should("be.visible");
    });
  });

  describe("Registration Flow - Invalid Data", () => {
    beforeEach(() => {
      cy.visit("/register");
    });

    it("should show error for duplicate email", () => {
      cy.intercept("POST", "**/api/users/register", {
        statusCode: 409,
        body: {
          success: false,
          message: "User already exists with this email",
        },
      }).as("registerApi");

      cy.get('input[name="firstName"]').type("Test");
      cy.get('input[name="lastName"]').type("User");
      cy.get('input[name="email"]').type("existing@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.waitForApi("@registerApi", 409);
      cy.shouldShowError("already exists");
    });

    it("should show error for weak password", () => {
      cy.get('input[name="firstName"]').type("Test");
      cy.get('input[name="lastName"]').type("User");
      cy.get('input[name="email"]').type("test@example.com");
      cy.get('input[name="password"]').type("123");
      cy.get('input[name="confirmPassword"]').type("123");
      cy.get('button[type="submit"]').click();

      // Should show client-side validation error
      cy.shouldShowError("Password must be at least 6 characters");
    });
  });

  describe("Logout Flow", () => {
    beforeEach(() => {
      // Login using real backend
      cy.visit("/login");
      cy.get('input[name="email"]').type("john.smith@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // Wait for dashboard to fully load
      cy.url().should("include", "/student/dashboard", { timeout: 15000 });
      cy.get("h1", { timeout: 15000 }).should("be.visible");
    });

    it("should successfully logout and redirect to login page", () => {
      cy.shouldBeLoggedIn();

      // Find and click logout button in header
      cy.contains("button", "Logout", { timeout: 10000 })
        .should("be.visible")
        .click();

      // Should redirect to login
      cy.url().should("include", "/login");
      cy.shouldBeLoggedOut();
    });

    it("should clear authentication state on logout", () => {
      cy.shouldBeLoggedIn();

      cy.contains("button", "Logout", { timeout: 10000 })
        .should("be.visible")
        .click();

      cy.url().should("include", "/login");
      cy.window().then((window) => {
        expect(window.localStorage.getItem("token")).to.be.null;
        expect(window.localStorage.getItem("user")).to.be.null;
      });
    });

    it("should prevent access to protected routes after logout", () => {
      cy.contains("button", "Logout", { timeout: 10000 })
        .should("be.visible")
        .click();
      cy.url().should("include", "/login");

      // Try to access student dashboard
      cy.visit("/student/dashboard");

      // Should redirect to login
      cy.url().should("include", "/login");
    });
  });

  describe("Token Expiration Handling", () => {
    it("should handle expired token gracefully", () => {
      // Set an expired token
      cy.window().then((window) => {
        window.localStorage.setItem("token", "expired-token");
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            id: "2",
            email: "student@example.com",
            role: "student",
          })
        );
      });

      // Mock 401 response for any API call
      cy.intercept("GET", "**/api/**", {
        statusCode: 401,
        body: {
          success: false,
          message: "Token expired",
        },
      }).as("apiCall");

      cy.visit("/student/dashboard");

      // Should redirect to login or show error
      cy.url().should("match", /\/(login|unauthorized)/);
    });
  });
});
