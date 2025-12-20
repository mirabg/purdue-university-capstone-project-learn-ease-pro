describe("Admin Dashboard", () => {
  beforeEach(() => {
    // Login as admin before each test
    cy.loginAsAdmin();
    cy.visit("/admin/dashboard");
  });

  describe("Dashboard UI", () => {
    it("should display the admin dashboard title", () => {
      cy.contains("h1", "Admin Dashboard").should("be.visible");
    });

    it("should display statistics cards", () => {
      cy.contains("Total Users").should("be.visible");
      cy.contains("Total Courses").should("be.visible");
      cy.contains("Active Enrollments").should("be.visible");
    });

    it("should display the management section", () => {
      cy.contains("h2", "Management").should("be.visible");
    });

    it("should display quick action buttons", () => {
      cy.contains("button", "Manage Users").should("be.visible");
      cy.contains("button", "Manage Courses").should("be.visible");
    });
  });

  describe("Statistics Display", () => {
    it("should show user statistics with icons", () => {
      cy.contains("dt", "Total Users")
        .closest(".bg-white")
        .within(() => {
          cy.get("svg").should("exist");
        });
    });

    it("should show course statistics with icons", () => {
      cy.contains("dt", "Total Courses")
        .closest(".bg-white")
        .within(() => {
          cy.get("svg").should("exist");
        });
    });

    it("should show enrollment statistics with icons", () => {
      cy.contains("dt", "Active Enrollments")
        .closest(".bg-white")
        .within(() => {
          cy.get("svg").should("exist");
        });
    });
  });

  describe("Authentication and Authorization", () => {
    it("should be accessible only to admin users", () => {
      cy.shouldBeLoggedIn();

      cy.window().then((window) => {
        const token = window.localStorage.getItem("token");
        expect(token).to.exist;
      });
    });

    it("should display admin user info in header", () => {
      cy.contains("Admin").should("be.visible");
      cy.contains("Admin").should("be.visible");
    });
  });

  describe("Navigation", () => {
    it("should stay on admin dashboard after page reload", () => {
      cy.reload();
      cy.url().should("include", "/admin/dashboard");
      cy.contains("Admin Dashboard").should("be.visible");
    });

    it("should logout and redirect to login page", () => {
      cy.contains("button", "Logout").click();
      cy.url().should("include", "/login");
      cy.shouldBeLoggedOut();
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

        cy.contains("Admin Dashboard").should("be.visible");
        cy.contains("Total Users").should("be.visible");
      });
    });
  });

  describe("Quick Actions", () => {
    it("should display manage users button", () => {
      cy.contains("button", "Manage Users").should("be.visible");
    });

    it("should display manage courses button", () => {
      cy.contains("button", "Manage Courses").should("be.visible");
    });

    it("should display management section title", () => {
      cy.contains("h2", "Management").should("be.visible");
    });
  });

  describe("Error Handling", () => {
    it("should handle unauthorized access gracefully", () => {
      // Clear token to simulate unauthorized access
      cy.window().then((window) => {
        window.localStorage.removeItem("token");
      });

      cy.visit("/admin/dashboard");

      // Should redirect to unauthorized or login page
      cy.url().should("match", /\/(login|unauthorized)/);
    });
  });

  describe("Session Management", () => {
    it("should maintain session after browser refresh", () => {
      cy.reload();
      cy.url().should("include", "/admin/dashboard");
      cy.shouldBeLoggedIn();
    });

    it("should clear session on logout", () => {
      cy.contains("button", "Logout").click();

      cy.window().then((window) => {
        expect(window.localStorage.getItem("token")).to.be.null;
      });
    });
  });

  describe("Layout and Styling", () => {
    it("should have proper background styling", () => {
      cy.get(".bg-gray-50").should("exist");
    });

    it("should use card-based layout for statistics", () => {
      cy.get(".bg-white.rounded-lg.shadow").should("have.length.at.least", 3);
    });

    it("should have proper spacing and padding", () => {
      cy.get(".max-w-7xl").should("exist");
      cy.get(".mx-auto").should("exist");
    });
  });
});

describe("Admin Dashboard - Access Control", () => {
  describe("Non-Admin User Access", () => {
    it("should redirect regular user to unauthorized page", () => {
      // Login as regular user
      cy.loginAsStudent();
      cy.visit("/admin/dashboard");

      // Should be redirected to unauthorized page
      cy.url().should("include", "/unauthorized");
      cy.contains("Unauthorized").should("be.visible");
    });
  });

  describe("Unauthenticated User Access", () => {
    it("should redirect unauthenticated user to login page", () => {
      cy.visit("/admin/dashboard");

      // Should be redirected to login or unauthorized
      cy.url().should("match", /\/(login|unauthorized)/);
    });

    it("should not allow access without valid token", () => {
      cy.window().then((window) => {
        window.localStorage.removeItem("token");
      });

      cy.visit("/admin/dashboard");
      cy.url().should("not.include", "/admin/dashboard");
    });
  });
});
