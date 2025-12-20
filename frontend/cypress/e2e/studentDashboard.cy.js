describe("Student Dashboard", () => {
  beforeEach(() => {
    // Login as student before each test
    cy.loginAsStudent();
    cy.visit("/student/dashboard");
  });

  describe("Dashboard UI", () => {
    it("should display personalized welcome message", () => {
      cy.contains("Welcome").should("be.visible");
      cy.contains("Here's what's happening with your learning journey").should(
        "be.visible"
      );
    });

    it("should display student statistics cards", () => {
      cy.contains("Enrolled Courses").should("be.visible");
      cy.contains("Completed Courses").should("be.visible");
      cy.contains("In Progress").should("be.visible");
    });

    it("should show initial enrollment count as 0", () => {
      cy.contains("Enrolled Courses")
        .parent()
        .parent()
        .within(() => {
          cy.contains("0").should("be.visible");
        });
    });

    it("should show initial completed count as 0", () => {
      cy.contains("Completed Courses")
        .parent()
        .parent()
        .within(() => {
          cy.contains("0").should("be.visible");
        });
    });
  });

  describe("Statistics Display", () => {
    it("should show enrolled courses statistic with icon", () => {
      cy.contains("Enrolled Courses")
        .parent()
        .parent()
        .within(() => {
          cy.get("svg").should("exist");
        });
    });

    it("should show completed courses statistic with icon", () => {
      cy.contains("Completed Courses")
        .parent()
        .parent()
        .within(() => {
          cy.get("svg").should("exist");
        });
    });

    it("should show in progress statistic with icon", () => {
      cy.contains("In Progress")
        .parent()
        .parent()
        .within(() => {
          cy.get("svg").should("exist");
        });
    });
  });

  describe("User Information Display", () => {
    it("should display student user info in header", () => {
      cy.contains("User:").should("be.visible");
      cy.contains("Role:").should("be.visible");
    });

    it("should show student role", () => {
      cy.contains("Student").should("be.visible");
    });

    it("should display user's first name in welcome message", () => {
      cy.window().then((window) => {
        const user = JSON.parse(window.localStorage.getItem("user"));
        if (user && user.firstName) {
          cy.contains(`Welcome, ${user.firstName}!`).should("be.visible");
        }
      });
    });
  });

  describe("Authentication", () => {
    it("should be accessible to authenticated students", () => {
      cy.shouldBeLoggedIn();

      cy.window().then((window) => {
        const token = window.localStorage.getItem("token");
        expect(token).to.exist;
      });
    });

    it("should display logout button", () => {
      cy.contains("button", "Logout").should("be.visible");
    });
  });

  describe("Navigation", () => {
    it("should stay on student dashboard after page reload", () => {
      cy.reload();
      cy.url().should("include", "/student/dashboard");
      cy.contains("Welcome").should("be.visible");
    });

    it("should logout and redirect to login page", () => {
      cy.contains("button", "Logout").click();
      cy.url().should("include", "/login");
      cy.shouldBeLoggedOut();
    });

    it("should redirect to login page when accessing without authentication", () => {
      cy.window().then((window) => {
        window.localStorage.removeItem("token");
      });

      cy.visit("/student/dashboard");
      cy.url().should("match", /\/login|\/$/);
    });
  });

  describe("Course Section", () => {
    it("should display my courses section", () => {
      cy.contains("My Courses").should("be.visible");
    });

    it("should show placeholder text when no courses enrolled", () => {
      cy.contains("You haven't enrolled in any courses yet").should(
        "be.visible"
      );
    });

    it("should display explore courses button", () => {
      cy.contains("Explore Courses").should("be.visible");
    });
  });

  describe("Recent Activity Section", () => {
    it("should display recent activity section", () => {
      cy.contains("Recent Activity").should("be.visible");
    });

    it("should show message when no recent activity", () => {
      cy.contains("No recent activity").should("be.visible");
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

        cy.contains("Welcome").should("be.visible");
        cy.contains("Enrolled Courses").should("be.visible");
      });
    });
  });

  describe("Session Management", () => {
    it("should maintain session after browser refresh", () => {
      cy.reload();
      cy.url().should("include", "/student/dashboard");
      cy.shouldBeLoggedIn();
    });

    it("should clear session on logout", () => {
      cy.contains("button", "Logout").click();

      cy.window().then((window) => {
        expect(window.localStorage.getItem("token")).to.be.null;
      });
    });

    it("should persist user data in localStorage", () => {
      cy.window().then((window) => {
        const user = window.localStorage.getItem("user");
        expect(user).to.exist;
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

    it("should have proper grid layout for statistics", () => {
      cy.get(".grid").should("exist");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing user data gracefully", () => {
      cy.window().then((window) => {
        window.localStorage.removeItem("user");
      });

      cy.reload();

      // Should still render the page or handle gracefully
      cy.get("body").should("exist");
    });

    it("should handle expired token", () => {
      cy.window().then((window) => {
        window.localStorage.setItem("token", "expired-token");
      });

      cy.intercept("GET", "**/api/**", {
        statusCode: 401,
        body: { message: "Unauthorized" },
      });

      cy.reload();

      // Should redirect to login
      cy.url().should("match", /\/login/);
    });
  });
});

describe("Student Dashboard - Access After Registration", () => {
  it("should redirect to student dashboard after successful registration", () => {
    cy.visit("/register");

    cy.intercept("POST", "**/api/users/register", {
      statusCode: 201,
      body: {
        token: "new-user-token",
        user: {
          id: "new-user",
          email: "newstudent@example.com",
          role: "student",
          firstName: "New",
          lastName: "Student",
        },
      },
    }).as("register");

    cy.get('input[name="firstName"]').type("New");
    cy.get('input[name="lastName"]').type("Student");
    cy.get('input[name="email"]').type("newstudent@example.com");
    cy.get('input[name="password"]').type("password123");
    cy.get('input[name="confirmPassword"]').type("password123");
    cy.get('button[type="submit"]').click();

    cy.wait("@register");

    cy.url().should("include", "/student/dashboard");
    cy.contains("Welcome, New!").should("be.visible");
  });
});
