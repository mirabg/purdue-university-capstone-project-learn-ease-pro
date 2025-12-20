describe("Application Navigation", () => {
  describe("Public Routes Navigation", () => {
    it("should navigate from login to register", () => {
      cy.visit("/login");
      cy.get('a[href="/register"]').click();
      cy.url().should("include", "/register");
      cy.contains("Create Student Account").should("be.visible");
    });

    it("should navigate from register to login", () => {
      cy.visit("/register");
      cy.get('a[href="/login"]').click();
      cy.url().should("include", "/login");
      cy.contains("Login").should("be.visible");
    });

    it("should redirect root path to login", () => {
      cy.visit("/");
      cy.url().should("include", "/login");
    });

    it("should handle direct navigation to login", () => {
      cy.visit("/login");
      cy.url().should("include", "/login");
      cy.contains("Login").should("be.visible");
    });

    it("should handle direct navigation to register", () => {
      cy.visit("/register");
      cy.url().should("include", "/register");
      cy.contains("Create Student Account").should("be.visible");
    });
  });

  describe("Protected Routes Navigation", () => {
    it("should redirect to login when accessing protected routes without authentication", () => {
      cy.shouldBeLoggedOut();

      cy.visit("/student/dashboard");
      cy.url().should("match", /\/(login|$)/);
    });

    it("should redirect to unauthorized when non-admin accesses admin routes", () => {
      cy.loginAsStudent();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/unauthorized");
    });

    it("should allow admin to access admin dashboard", () => {
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should allow student to access student dashboard", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.url().should("include", "/student/dashboard");
      cy.contains("Welcome").should("be.visible");
    });
  });

  describe("Header Navigation", () => {
    it("should display logo and title in header", () => {
      cy.visit("/login");
      cy.get("header").within(() => {
        cy.get('img[alt="Logo"]').should("be.visible");
      });
    });

    it("should show logout button when logged in", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.get("header").within(() => {
        cy.contains("button", "Logout").should("be.visible");
      });
    });

    it("should not show logout button when not logged in", () => {
      cy.visit("/login");

      cy.get("header").within(() => {
        cy.contains("button", "Logout").should("not.exist");
      });
    });

    it("should display user information in header when logged in", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.get("header").within(() => {
        cy.contains("User:").should("be.visible");
        cy.contains("Role:").should("be.visible");
      });
    });
  });

  describe("Footer Navigation", () => {
    it("should display footer on all pages", () => {
      cy.visit("/login");
      cy.get("footer").should("be.visible");

      cy.visit("/register");
      cy.get("footer").should("be.visible");
    });

    it("should display footer with copyright information", () => {
      cy.visit("/login");
      cy.get("footer").within(() => {
        cy.contains("© 2025").should("be.visible");
      });
    });

    it("should display footer on authenticated pages", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.get("footer").should("be.visible");
    });
  });

  describe("Browser Navigation", () => {
    it("should support browser back button", () => {
      cy.visit("/login");
      cy.get('a[href="/register"]').click();
      cy.url().should("include", "/register");

      cy.go("back");
      cy.url().should("include", "/login");
    });

    it("should support browser forward button", () => {
      cy.visit("/login");
      cy.get('a[href="/register"]').click();
      cy.go("back");
      cy.url().should("include", "/login");

      cy.go("forward");
      cy.url().should("include", "/register");
    });

    it("should maintain state after browser back navigation", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.go("back");
      cy.go("forward");

      cy.url().should("include", "/student/dashboard");
      cy.shouldBeLoggedIn();
    });
  });

  describe("Deep Linking", () => {
    it("should handle direct URL access to student dashboard when authenticated", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.url().should("include", "/student/dashboard");
      cy.contains("Welcome").should("be.visible");
    });

    it("should handle direct URL access to admin dashboard when authenticated as admin", () => {
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should redirect to login when directly accessing protected route without auth", () => {
      cy.shouldBeLoggedOut();
      cy.visit("/student/dashboard");

      cy.url().should("match", /\/(login|$)/);
    });
  });

  describe("Post-Login Navigation", () => {
    it("should redirect admin to admin dashboard after login", () => {
      cy.visit("/login");

      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        body: {
          token: "admin-token",
          user: {
            id: "1",
            email: "admin@example.com",
            role: "admin",
            firstName: "Admin",
            lastName: "User",
          },
        },
      }).as("adminLogin");

      cy.get('input[name="email"]').type("admin@example.com");
      cy.get('input[name="password"]').type("admin123");
      cy.get('button[type="submit"]').click();

      cy.wait("@adminLogin");

      cy.url().should("include", "/admin/dashboard");
    });

    it("should redirect regular user to dashboard after login", () => {
      cy.visit("/login");

      cy.intercept("POST", "**/api/users/login", {
        statusCode: 200,
        body: {
          token: "user-token",
          user: {
            id: "2",
            email: "student@example.com",
            role: "user",
            firstName: "Student",
            lastName: "User",
          },
        },
      }).as("userLogin");

      cy.get('input[name="email"]').type("student@example.com");
      cy.get('input[name="password"]').type("student123");
      cy.get('button[type="submit"]').click();

      cy.wait("@userLogin");

      cy.url().should("include", "/dashboard");
    });

    it("should redirect to student dashboard after successful registration", () => {
      cy.visit("/register");

      cy.intercept("POST", "**/api/users/register", {
        statusCode: 201,
        body: {
          token: "new-user-token",
          user: {
            id: "3",
            email: "newuser@example.com",
            role: "student",
            firstName: "New",
            lastName: "User",
          },
        },
      }).as("register");

      cy.get('input[name="firstName"]').type("New");
      cy.get('input[name="lastName"]').type("User");
      cy.get('input[name="email"]').type("newuser@example.com");
      cy.get('input[name="password"]').type("password123");
      cy.get('input[name="confirmPassword"]').type("password123");
      cy.get('button[type="submit"]').click();

      cy.wait("@register");

      cy.url().should("include", "/student/dashboard");
    });
  });

  describe("Logout Navigation", () => {
    it("should redirect to login after logout from student dashboard", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.contains("button", "Logout").click();

      cy.url().should("include", "/login");
      cy.shouldBeLoggedOut();
    });

    it("should redirect to login after logout from admin dashboard", () => {
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");

      cy.contains("button", "Logout").click();

      cy.url().should("include", "/login");
      cy.shouldBeLoggedOut();
    });

    it("should prevent access to protected routes after logout", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");

      cy.contains("button", "Logout").click();
      cy.url().should("include", "/login");

      cy.visit("/student/dashboard");
      cy.url().should("match", /\/(login|$)/);
    });
  });

  describe("Invalid Routes", () => {
    it("should handle navigation to non-existent routes", () => {
      cy.visit("/non-existent-page", { failOnStatusCode: false });

      // Should redirect to login or show 404 (depends on implementation)
      cy.url().should("match", /\/(login|404|$)/);
    });
  });

  describe("Session Persistence Across Navigation", () => {
    it("should maintain authentication across page navigations", () => {
      cy.loginAsStudent();
      cy.visit("/student/dashboard");
      cy.shouldBeLoggedIn();

      cy.visit("/");
      cy.shouldBeLoggedIn();
    });

    it("should maintain user role across navigation", () => {
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");

      cy.window().then((window) => {
        const user = JSON.parse(window.localStorage.getItem("user"));
        expect(user.role).to.equal("admin");
      });

      cy.visit("/");

      cy.window().then((window) => {
        const user = JSON.parse(window.localStorage.getItem("user"));
        expect(user.role).to.equal("admin");
      });
    });
  });
});
