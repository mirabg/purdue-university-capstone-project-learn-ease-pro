describe("Registration Feature", () => {
  beforeEach(() => {
    cy.visit("/register");
  });

  describe("Registration Page UI", () => {
    it("should display the registration page with all required elements", () => {
      // Check page title
      cy.contains("h2", "Create Student Account").should("be.visible");
      cy.contains("Join us today").should("be.visible");

      // Check form fields
      cy.get('input[name="firstName"]').should("be.visible");
      cy.get('input[name="lastName"]').should("be.visible");
      cy.get('input[name="email"]').should("be.visible");
      cy.get('input[name="password"]').should("be.visible");
      cy.get('input[name="confirmPassword"]').should("be.visible");
      cy.get('input[name="phone"]').should("be.visible");
      cy.get('input[name="address"]').should("be.visible");
      cy.get('input[name="city"]').should("be.visible");
      cy.get('input[name="state"]').should("be.visible");
      cy.get('input[name="zipcode"]').should("be.visible");

      // Check submit button
      cy.get('button[type="submit"]')
        .should("be.visible")
        .and("contain", "Create Account");

      // Check login link
      cy.contains("Already have an account?").should("be.visible");
      cy.get('a[href="/login"]').should("be.visible");
    });

    it("should have proper input placeholders", () => {
      cy.get('input[name="firstName"]').should(
        "have.attr",
        "placeholder",
        "Enter your first name"
      );
      cy.get('input[name="lastName"]').should(
        "have.attr",
        "placeholder",
        "Enter your last name"
      );
      cy.get('input[name="email"]').should(
        "have.attr",
        "placeholder",
        "Enter your email"
      );
      cy.get('input[name="password"]').should(
        "have.attr",
        "placeholder",
        "Create a password"
      );
      cy.get('input[name="confirmPassword"]').should(
        "have.attr",
        "placeholder",
        "Confirm your password"
      );
    });

    it("should have required attributes on required form fields", () => {
      cy.get('input[name="firstName"]').should("have.attr", "required");
      cy.get('input[name="lastName"]').should("have.attr", "required");
      cy.get('input[name="email"]').should("have.attr", "required");
      cy.get('input[name="password"]').should("have.attr", "required");
      cy.get('input[name="confirmPassword"]').should("have.attr", "required");
    });
  });

  describe("Form Validation", () => {
    it("should not submit form with empty required fields", () => {
      cy.get('button[type="submit"]').click();

      // Form should not be submitted (URL should not change)
      cy.url().should("include", "/register");

      // HTML5 validation should prevent submission
      cy.get('input[name="firstName"]:invalid').should("exist");
    });

    it("should validate email format", () => {
      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("invalid-email");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      // HTML5 validation should catch invalid email
      cy.get('input[name="email"]:invalid').should("exist");
      cy.url().should("include", "/register");
    });

    it("should show error when passwords do not match", () => {
      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("john@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("different123");
      cy.get('button[type="submit"]').click();

      cy.contains("Passwords do not match").should("be.visible");
    });

    it("should show error when password is too short", () => {
      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("john@example.com");
      cy.get('input[name="password"]').type("pass");
      cy.get('input[name="confirmPassword"]').type("pass");
      cy.get('button[type="submit"]').click();

      cy.contains("Password must be at least 6 characters long").should(
        "be.visible"
      );
    });

    it("should format phone number automatically", () => {
      cy.get('input[name="phone"]').type("1234567890");
      cy.get('input[name="phone"]').should("have.value", "123-456-7890");
    });

    it("should limit phone number to 10 digits", () => {
      cy.get('input[name="phone"]').type("12345678901234");
      cy.get('input[name="phone"]').should("have.value", "123-456-7890");
    });

    it("should clear error message when user starts typing", () => {
      // Trigger an error
      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("john@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("different");
      cy.get('button[type="submit"]').click();

      cy.contains("Passwords do not match").should("be.visible");

      // Start typing in a field
      cy.get('input[name="confirmPassword"]').clear().type("password");

      // Error should disappear
      cy.contains("Passwords do not match").should("not.exist");
    });
  });

  describe("Successful Registration", () => {
    beforeEach(() => {
      // Mock successful registration
      cy.intercept("POST", "**/api/users/register", {
        statusCode: 201,
        body: {
          token: "test-token-123",
          user: {
            id: "1",
            email: "newuser@example.com",
            role: "student",
            firstName: "John",
            lastName: "Doe",
          },
        },
      }).as("registerSuccess");
    });

    it("should successfully register a new user with all fields", () => {
      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("newuser@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('input[name="phone"]').type("5551234567");
      cy.get('input[name="address"]').type("123 Main St");
      cy.get('input[name="city"]').type("New York");
      cy.get('input[name="state"]').type("NY");
      cy.get('input[name="zipcode"]').type("10001");
      cy.get('button[type="submit"]').click();

      cy.wait("@registerSuccess");

      // Should redirect to student dashboard
      cy.url().should("include", "/student/dashboard");
    });

    it("should successfully register with only required fields", () => {
      cy.get('input[name="firstName"]').type("Jane");
      cy.get('input[name="lastName"]').type("Smith");
      cy.get('input[name="email"]').type("jane@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@registerSuccess");

      cy.url().should("include", "/student/dashboard");
    });

    it("should display loading state during registration", () => {
      cy.intercept("POST", "**/api/users/register", {
        statusCode: 201,
        delay: 1000,
        body: {
          token: "test-token",
          user: {
            id: "1",
            email: "newuser@example.com",
            role: "student",
          },
        },
      }).as("slowRegister");

      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("newuser@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      // Should show loading state
      cy.contains("Creating account...").should("be.visible");
      cy.get('button[type="submit"]').should("be.disabled");
    });

    it("should store authentication token after registration", () => {
      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("newuser@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@registerSuccess");

      cy.window().then((window) => {
        const token = window.localStorage.getItem("token");
        expect(token).to.exist;
        expect(token).to.be.a("string");
      });
    });
  });

  describe("Failed Registration Attempts", () => {
    it("should display error message when email already exists", () => {
      cy.intercept("POST", "**/api/users/register", {
        statusCode: 400,
        body: {
          message: "Email already exists",
        },
      }).as("registerFail");

      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("existing@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@registerFail");

      cy.contains("Email already exists").should("be.visible");
      cy.url().should("include", "/register");
    });

    it("should display error message for server errors", () => {
      cy.intercept("POST", "**/api/users/register", {
        statusCode: 500,
        body: {
          error: "Internal server error",
        },
      }).as("serverError");

      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("newuser@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@serverError");

      cy.get(".text-red-600").should("be.visible");
    });

    it("should display error message for network failures", () => {
      cy.intercept("POST", "**/api/users/register", {
        forceNetworkError: true,
      }).as("networkError");

      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("newuser@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@networkError");

      cy.get(".text-red-600").should("be.visible");
    });

    it("should not store token on failed registration", () => {
      cy.intercept("POST", "**/api/users/register", {
        statusCode: 400,
        body: { message: "Registration failed" },
      }).as("registerFail");

      cy.get('input[name="firstName"]').type("John");
      cy.get('input[name="lastName"]').type("Doe");
      cy.get('input[name="email"]').type("newuser@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@registerFail");

      cy.window().then((window) => {
        const token = window.localStorage.getItem("token");
        expect(token).to.be.null;
      });
    });
  });

  describe("Navigation", () => {
    it("should navigate to login page when clicking login link", () => {
      cy.get('a[href="/login"]').click();
      cy.url().should("include", "/login");
    });

    it("should allow navigation back to register from login", () => {
      cy.get('a[href="/login"]').click();
      cy.go("back");
      cy.url().should("include", "/register");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for form inputs", () => {
      cy.get('label[for="firstName"]').should("contain", "First Name");
      cy.get('label[for="lastName"]').should("contain", "Last Name");
      cy.get('label[for="email"]').should("contain", "Email");
      cy.get('label[for="password"]').should("contain", "Password");
      cy.get('label[for="confirmPassword"]').should(
        "contain",
        "Confirm Password"
      );
    });

    it("should support keyboard navigation", () => {
      cy.get('input[name="firstName"]').focus();
      cy.focused().should("have.attr", "name", "firstName");

      cy.focused().tab();
      cy.focused().should("have.attr", "name", "lastName");

      cy.focused().tab();
      cy.focused().should("have.attr", "name", "email");
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
        "new-password"
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
        cy.visit("/register");

        cy.contains("Create Student Account").should("be.visible");
        cy.get('input[name="firstName"]').should("be.visible");
        cy.get('button[type="submit"]').should("be.visible");
      });
    });
  });
});
