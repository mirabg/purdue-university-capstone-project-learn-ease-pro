describe("Unauthorized Access Page", () => {
  beforeEach(() => {
    cy.visit("/unauthorized");
  });

  describe("Unauthorized Page UI", () => {
    it("should display the unauthorized page", () => {
      cy.contains("Unauthorized Access").should("be.visible");
    });

    it("should display appropriate error message", () => {
      cy.contains("You do not have permission to access this page").should(
        "be.visible"
      );
    });

    it("should display go back button", () => {
      cy.contains("button", "Go Back").should("be.visible");
    });

    it("should display home/dashboard link", () => {
      cy.contains("Go to Dashboard").should("be.visible");
    });

    it("should show 403 or lock icon", () => {
      cy.get("svg").should("exist");
    });
  });

  describe("Navigation from Unauthorized Page", () => {
    it("should go back to previous page when clicking go back", () => {
      cy.visit("/login");
      cy.visit("/unauthorized");

      cy.contains("button", "Go Back").click();

      cy.url().should("include", "/login");
    });

    it("should navigate to dashboard when clicking dashboard link", () => {
      cy.contains("Go to Dashboard").click();

      // Should navigate to appropriate dashboard or login
      cy.url().should("match", /\/(login|student\/dashboard|dashboard)/);
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
        cy.reload();

        cy.contains("Unauthorized Access").should("be.visible");
        cy.contains("button", "Go Back").should("be.visible");
      });
    });
  });

  describe("Layout and Styling", () => {
    it("should have centered content", () => {
      cy.get(".flex.items-center.justify-center").should("exist");
    });

    it("should have proper background styling", () => {
      cy.get(".min-h-screen").should("exist");
    });
  });
});

describe("Unauthorized Access - Admin Routes", () => {
  describe("Regular User Attempting Admin Access", () => {
    it("should redirect student user to unauthorized page when accessing admin dashboard", () => {
      cy.loginAsStudent();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/unauthorized");
      cy.contains("Unauthorized Access").should("be.visible");
    });

    it("should show appropriate error message for unauthorized admin access", () => {
      cy.loginAsStudent();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/unauthorized");
      cy.contains("You do not have permission to access this page").should(
        "be.visible"
      );
    });
  });

  describe("Unauthenticated User Attempting Admin Access", () => {
    it("should redirect unauthenticated user attempting admin access", () => {
      cy.shouldBeLoggedOut();
      cy.visit("/admin/dashboard");

      // Should be redirected to login or unauthorized
      cy.url().should("match", /\/(login|unauthorized)/);
    });

    it("should prevent access to admin routes without token", () => {
      cy.window().then((window) => {
        window.localStorage.removeItem("token");
      });

      cy.visit("/admin/dashboard");

      cy.url().should("not.include", "/admin/dashboard");
    });
  });

  describe("Token Manipulation Attempts", () => {
    it("should redirect to unauthorized with invalid token", () => {
      cy.window().then((window) => {
        window.localStorage.setItem("token", "invalid-token");
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            role: "student",
            email: "student@example.com",
          })
        );
      });

      cy.visit("/admin/dashboard");

      cy.url().should("match", /\/(unauthorized|login)/);
    });

    it("should redirect to unauthorized when role is not admin", () => {
      cy.window().then((window) => {
        window.localStorage.setItem("token", "valid-token");
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            role: "student",
            email: "student@example.com",
            firstName: "Student",
            lastName: "User",
          })
        );
      });

      cy.visit("/admin/dashboard");

      cy.url().should("include", "/unauthorized");
    });
  });

  describe("Recovery from Unauthorized Access", () => {
    it("should allow user to go back and login as admin", () => {
      cy.loginAsStudent();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/unauthorized");

      // Logout and login as admin
      cy.contains("button", "Logout").click();
      cy.loginAsAdmin();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should redirect to appropriate dashboard when clicking go to dashboard", () => {
      cy.loginAsStudent();
      cy.visit("/admin/dashboard");

      cy.url().should("include", "/unauthorized");

      cy.contains("Go to Dashboard").click();

      // Should go to student dashboard or home
      cy.url().should("match", /\/(student\/dashboard|dashboard|login)/);
    });
  });
});
