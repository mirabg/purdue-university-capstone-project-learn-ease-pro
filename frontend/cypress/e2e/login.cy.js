describe("Login Feature", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  describe("Login Page UI", () => {
    it("should display the login page with all required elements", () => {
      // Check page title
      cy.contains("h2", "Login").should("be.visible");
      cy.contains("Sign in to your account to continue").should("be.visible");

      // Check form fields
      cy.get('input[name="email"]')
        .should("be.visible")
        .and("have.attr", "type", "email");
      cy.get('input[name="password"]')
        .should("be.visible")
        .and("have.attr", "type", "password");

      // Check submit button
      cy.get('button[type="submit"]')
        .should("be.visible")
        .and("contain", "Sign In");

      // Check register link
      cy.contains("Don't have an account?").should("be.visible");
      cy.get('a[href="/register"]')
        .should("be.visible")
        .and("contain", "Create an account");
    });

    it("should display the logo", () => {
      cy.get('img[alt="Logo"]').should("be.visible");
    });

    it("should have proper input placeholders", () => {
      cy.get('input[name="email"]').should(
        "have.attr",
        "placeholder",
        "Enter your email"
      );
      cy.get('input[name="password"]').should(
        "have.attr",
        "placeholder",
        "Enter your password"
      );
    });

    it("should have required attributes on form fields", () => {
      cy.get('input[name="email"]').should("have.attr", "required");
      cy.get('input[name="password"]').should("have.attr", "required");
    });
  });

  describe("Form Validation", () => {
    it("should not submit form with empty fields", () => {
      cy.get('button[type="submit"]').click();

      // Form should not be submitted (URL should not change)
      cy.url().should("include", "/login");

      // HTML5 validation should prevent submission
      cy.get('input[name="email"]:invalid').should("exist");
    });

    it("should validate email format", () => {
      cy.get('input[name="email"]').type("invalid-email");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      // HTML5 validation should catch invalid email
      cy.get('input[name="email"]:invalid').should("exist");
      cy.url().should("include", "/login");
    });

    it("should allow typing in form fields", () => {
      const testEmail = "test@example.com";
      const testPassword = "password123";

      cy.get('input[name="email"]')
        .type(testEmail)
        .should("have.value", testEmail);
      cy.get('input[name="password"]')
        .type(testPassword)
        .should("have.value", testPassword);
    });

    it("should clear error message when user starts typing", () => {
      // Attempt login with wrong credentials
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 401,
        body: { message: "Invalid email or password" },
      }).as("loginFail");

      cy.get('input[name="email"]').type("wrong@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      cy.wait("@loginFail");
      cy.contains("Invalid email or password").should("be.visible");

      // Start typing in email field
      cy.get('input[name="email"]').clear().type("new@example.com");

      // Error should disappear
      cy.contains("Invalid email or password").should("not.exist");
    });
  });

  describe("Successful Login - Admin User", () => {
    beforeEach(() => {
      // Mock successful admin login
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        body: {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiZmlyc3ROYW1lIjoiQWRtaW4iLCJsYXN0TmFtZSI6IlVzZXIifQ.test",
          user: {
            id: "1",
            email: "admin@example.com",
            role: "admin",
            firstName: "Admin",
            lastName: "User",
          },
        },
      }).as("loginSuccess");
    });

    it("should successfully login admin user and redirect to admin dashboard", () => {
      cy.get('input[name="email"]').type("admin@example.com");
      cy.get('input[name="password"]').type("admin123");
      cy.get('button[type="submit"]').click();

      // Wait for API call
      cy.wait("@loginSuccess");

      // Check token is stored
      cy.shouldBeLoggedIn();

      // Should redirect to admin dashboard
      cy.url().should("include", "/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should display loading state during login", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        delay: 1000,
        body: {
          token: "test-token",
          user: {
            id: "1",
            email: "admin@example.com",
            role: "admin",
          },
        },
      }).as("slowLogin");

      cy.get('input[name="email"]').type("admin@example.com");
      cy.get('input[name="password"]').type("admin123");
      cy.get('button[type="submit"]').click();

      // Should show loading state
      cy.contains("Signing in...").should("be.visible");
      cy.get('button[type="submit"]').should("be.disabled");
    });

    it("should store authentication token in localStorage", () => {
      cy.get('input[name="email"]').type("admin@example.com");
      cy.get('input[name="password"]').type("admin123");
      cy.get('button[type="submit"]').click();

      cy.wait("@loginSuccess");

      cy.window().then((window) => {
        const token = window.localStorage.getItem("token");
        expect(token).to.exist;
        expect(token).to.be.a("string");
        expect(token.length).to.be.greaterThan(0);
      });
    });

    it("should display user info in header after login", () => {
      cy.get('input[name="email"]').type("admin@example.com");
      cy.get('input[name="password"]').type("admin123");
      cy.get('button[type="submit"]').click();

      cy.wait("@loginSuccess");
      cy.url().should("include", "/admin/dashboard");

      // Check header shows user info
      cy.contains("User:").should("be.visible");
      cy.contains("Admin User").should("be.visible");
      cy.contains("Role:").should("be.visible");
      cy.contains("Admin").should("be.visible");
      cy.contains("button", "Logout").should("be.visible");
    });
  });

  describe("Successful Login - Regular User", () => {
    it("should successfully login regular user and redirect to dashboard", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        body: {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImZpcnN0TmFtZSI6IlJlZ3VsYXIiLCJsYXN0TmFtZSI6IlVzZXIifQ.test",
          user: {
            id: "2",
            email: "user@example.com",
            role: "user",
            firstName: "Regular",
            lastName: "User",
          },
        },
      }).as("userLogin");

      cy.get('input[name="email"]').type("user@example.com");
      cy.get('input[name="password"]').type("user123");
      cy.get('button[type="submit"]').click();

      cy.wait("@userLogin");

      // Should redirect to regular dashboard
      cy.url().should("include", "/dashboard");
    });
  });

  describe("Failed Login Attempts", () => {
    it("should display error message for invalid credentials", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 401,
        body: {
          message: "Invalid email or password",
        },
      }).as("loginFail");

      cy.get('input[name="email"]').type("wrong@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      cy.wait("@loginFail");

      // Error message should be displayed
      cy.contains("Invalid email or password").should("be.visible");

      // Should remain on login page
      cy.url().should("include", "/login");

      // Token should not be stored
      cy.shouldBeLoggedOut();
    });

    it("should display error message for non-existent user", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 404,
        body: {
          message: "User not found",
        },
      }).as("loginNotFound");

      cy.get('input[name="email"]').type("nonexistent@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@loginNotFound");

      cy.contains("User not found").should("be.visible");
      cy.url().should("include", "/login");
    });

    it("should display generic error message for server errors", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 500,
        body: {
          error: "Internal server error",
        },
      }).as("serverError");

      cy.get('input[name="email"]').type("user@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@serverError");

      // Should display error message
      cy.get(".text-red-600").should("be.visible");
      cy.url().should("include", "/login");
    });

    it("should display error message for network failures", () => {
      cy.intercept("POST", "**/api/users/login", {
        forceNetworkError: true,
      }).as("networkError");

      cy.get('input[name="email"]').type("user@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@networkError");

      // Should display error message
      cy.get(".text-red-600").should("be.visible");
    });

    it("should not store token on failed login", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 401,
        body: { message: "Invalid credentials" },
      }).as("loginFail");

      cy.get('input[name="email"]').type("wrong@example.com");
      cy.get('input[name="password"]').type("wrongpassword");
      cy.get('button[type="submit"]').click();

      cy.wait("@loginFail");

      cy.window().then((window) => {
        const token = window.localStorage.getItem("token");
        expect(token).to.be.null;
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to register page when clicking register link", () => {
      cy.get('a[href="/register"]').click();
      cy.url().should("include", "/register");
    });

    it("should redirect to login page when accessing root URL", () => {
      cy.visit("/");
      cy.url().should("include", "/login");
    });

    it("should allow navigation back to login from register", () => {
      cy.get('a[href="/register"]').click();
      cy.go("back");
      cy.url().should("include", "/login");
    });
  });

  describe("Session Persistence", () => {
    it("should maintain login state after page reload", () => {
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        body: {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIn0.test",
          user: {
            id: "1",
            email: "admin@example.com",
            role: "admin",
          },
        },
      }).as("login");

      cy.get('input[name="email"]').type("admin@example.com");
      cy.get('input[name="password"]').type("admin123");
      cy.get('button[type="submit"]').click();

      cy.wait("@login");
      cy.url().should("include", "/admin/dashboard");

      // Reload page
      cy.reload();

      // Should still be on admin dashboard
      cy.url().should("include", "/admin/dashboard");
      cy.shouldBeLoggedIn();
    });
  });

  describe("Logout Functionality", () => {
    beforeEach(() => {
      // Login first
      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        body: {
          token:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIn0.test",
          user: {
            id: "1",
            email: "admin@example.com",
            role: "admin",
            firstName: "Admin",
          },
        },
      }).as("login");

      cy.get('input[name="email"]').type("admin@example.com");
      cy.get('input[name="password"]').type("admin123");
      cy.get('button[type="submit"]').click();
      cy.wait("@login");
    });

    it("should logout user and redirect to login page", () => {
      cy.contains("button", "Logout").click();

      // Should redirect to login
      cy.url().should("include", "/login");

      // Token should be removed
      cy.shouldBeLoggedOut();
    });

    it("should clear user data on logout", () => {
      cy.contains("button", "Logout").click();

      cy.url().should("include", "/login");

      // Header should not show user info
      cy.contains("User:").should("not.exist");
      cy.contains("Logout").should("not.exist");
    });

    it("should not be able to access protected routes after logout", () => {
      cy.contains("button", "Logout").click();

      // Try to access admin dashboard
      cy.visit("/admin/dashboard");

      // Should redirect to login
      cy.url().should("include", "/login");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for form inputs", () => {
      cy.get('label[for="email"]').should("contain", "Email Address");
      cy.get('label[for="password"]').should("contain", "Password");
    });

    it("should support keyboard navigation", () => {
      cy.get('input[name="email"]').focus();
      cy.focused().should("have.attr", "name", "email");

      cy.focused().tab();
      cy.focused().should("have.attr", "name", "password");

      cy.focused().tab();
      cy.focused().should("have.attr", "type", "submit");
    });

    it("should have proper autocomplete attributes", () => {
      cy.get('input[name="email"]').should(
        "have.attr",
        "autocomplete",
        "email"
      );
      cy.get('input[name="password"]').should(
        "have.attr",
        "autocomplete",
        "current-password"
      );
    });
  });

  describe("Responsive Design", () => {
    const viewports = [
      { device: "mobile", width: 375, height: 667 },
      { device: "tablet", width: 768, height: 1024 },
      { device: "desktop", width: 1280, height: 720 },
    ];

    viewports.forEach(({ device, width, height }) => {
      it(`should display correctly on ${device}`, () => {
        cy.viewport(width, height);
        cy.visit("/login");

        // Check essential elements are visible
        cy.contains("Login").should("be.visible");
        cy.get('input[name="email"]').should("be.visible");
        cy.get('input[name="password"]').should("be.visible");
        cy.get('button[type="submit"]').should("be.visible");
      });
    });
  });
});
