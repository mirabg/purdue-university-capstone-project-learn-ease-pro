// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

// Import cypress-plugin-tab for keyboard navigation testing
import "cypress-plugin-tab";

// ==============================================
// Authentication Commands
// ==============================================

/**
 * Login via API and properly set up Redux state
 * @example cy.loginViaApi('admin@example.com', 'admin123')
 */
Cypress.Commands.add("loginViaApi", (email, password) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/users/login`,
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property("token");
    expect(response.body).to.have.property("user");

    const { token, user } = response.body;

    // Set localStorage - Redux will hydrate from this
    cy.window().then((window) => {
      window.localStorage.setItem("token", token);
      window.localStorage.setItem("user", JSON.stringify(user));
    });

    return cy.wrap({ token, user });
  });
});

/**
 * Login via UI form
 * @example cy.loginViaUI('student@example.com', 'student123')
 */
Cypress.Commands.add("loginViaUI", (email, password) => {
  cy.visit("/login");
  cy.get('input[name="email"]').clear().type(email);
  cy.get('input[name="password"]').clear().type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * Login as admin user (direct state manipulation for testing)
 * @example cy.loginAsAdmin()
 */
Cypress.Commands.add("loginAsAdmin", () => {
  const adminToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiZmlyc3ROYW1lIjoiQWRtaW4iLCJsYXN0TmFtZSI6IlVzZXIifQ.dGVzdA";
  const adminUser = {
    id: "1",
    email: "admin@example.com",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
  };

  // Mock admin dashboard APIs
  cy.intercept("GET", "**/api/users/stats", {
    statusCode: 200,
    body: {
      success: true,
      data: { totalUsers: 0, totalStudents: 0, totalFaculty: 0 },
    },
  });
  cy.intercept("GET", "**/api/courses/stats", {
    statusCode: 200,
    body: { success: true, data: { totalCourses: 0, totalEnrollments: 0 } },
  });

  cy.window().then((window) => {
    window.localStorage.setItem("token", adminToken);
    window.localStorage.setItem("user", JSON.stringify(adminUser));
  });
});

/**
 * Login as faculty user (direct state manipulation for testing)
 * @example cy.loginAsFaculty()
 */
Cypress.Commands.add("loginAsFaculty", () => {
  const facultyToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjMiLCJlbWFpbCI6ImZhY3VsdHlAZXhhbXBsZS5jb20iLCJyb2xlIjoiZmFjdWx0eSIsImZpcnN0TmFtZSI6IkZhY3VsdHkiLCJsYXN0TmFtZSI6IlVzZXIifQ.dGVzdA";
  const facultyUser = {
    id: "3",
    email: "faculty@example.com",
    role: "faculty",
    firstName: "Faculty",
    lastName: "User",
  };

  // Mock faculty dashboard APIs
  cy.intercept("GET", "**/api/courses?faculty=*", {
    statusCode: 200,
    body: { success: true, data: [] },
  });

  cy.window().then((window) => {
    window.localStorage.setItem("token", facultyToken);
    window.localStorage.setItem("user", JSON.stringify(facultyUser));
  });
});

/**
 * Login as student user (direct state manipulation for testing)
 * @example cy.loginAsStudent()
 */
Cypress.Commands.add("loginAsStudent", () => {
  const studentToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImZpcnN0TmFtZSI6IlN0dWRlbnQiLCJsYXN0TmFtZSI6IlVzZXIifQ.dGVzdA";
  const studentUser = {
    id: "2",
    email: "student@example.com",
    role: "student",
    firstName: "Student",
    lastName: "User",
  };

  // Mock student dashboard APIs
  cy.intercept("GET", "**/api/users/*/enrollments*", {
    statusCode: 200,
    body: { success: true, data: [] },
  });

  cy.window().then((window) => {
    window.localStorage.setItem("token", studentToken);
    window.localStorage.setItem("user", JSON.stringify(studentUser));
  });
});

/**
 * Logout user and clear state
 * @example cy.logoutUser()
 */
Cypress.Commands.add("logoutUser", () => {
  cy.window().then((window) => {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user");
  });
});

/**
 * Check if user is logged in
 */
Cypress.Commands.add("shouldBeLoggedIn", () => {
  cy.window().then((window) => {
    expect(window.localStorage.getItem("token")).to.exist;
    expect(window.localStorage.getItem("user")).to.exist;
  });
});

/**
 * Check if user is logged out
 */
Cypress.Commands.add("shouldBeLoggedOut", () => {
  cy.window().then((window) => {
    expect(window.localStorage.getItem("token")).to.not.exist;
    expect(window.localStorage.getItem("user")).to.not.exist;
  });
});

// ==============================================
// Redux Store Commands
// ==============================================

/**
 * Get Redux store state
 * @example cy.getReduxState().its('auth.user.role').should('eq', 'admin')
 */
Cypress.Commands.add("getReduxState", () => {
  return cy.window().its("store").invoke("getState");
});

/**
 * Dispatch Redux action
 * @example cy.dispatchReduxAction({ type: 'auth/logout' })
 */
Cypress.Commands.add("dispatchReduxAction", (action) => {
  return cy.window().its("store").invoke("dispatch", action);
});

// ==============================================
// API Intercept & Mock Commands
// ==============================================

/**
 * Setup common API route intercepts
 * @example cy.setupApiMocks()
 */
Cypress.Commands.add("setupApiMocks", () => {
  // Mock user login
  cy.intercept("POST", "**/api/users/login", {
    statusCode: 200,
    body: {
      success: true,
      token: "mock-jwt-token",
      user: {
        id: "1",
        email: "test@example.com",
        role: "student",
        firstName: "Test",
        lastName: "User",
      },
    },
  }).as("loginApi");

  // Mock user registration
  cy.intercept("POST", "**/api/users/register", {
    statusCode: 201,
    body: {
      success: true,
      message: "User registered successfully",
    },
  }).as("registerApi");

  // Mock courses list
  cy.intercept("GET", "**/api/courses*", {
    statusCode: 200,
    body: {
      success: true,
      data: [],
    },
  }).as("coursesApi");

  // Mock user stats
  cy.intercept("GET", "**/api/users/stats", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        totalUsers: 0,
        totalCourses: 0,
        totalEnrollments: 0,
      },
    },
  }).as("statsApi");
});

/**
 * Wait for API response
 * @example cy.waitForApi('@loginApi', 200)
 */
Cypress.Commands.add("waitForApi", (alias, statusCode = 200) => {
  cy.wait(alias).its("response.statusCode").should("eq", statusCode);
});

// ==============================================
// Utility Commands
// ==============================================

/**
 * Clear all application state
 * @example cy.clearAppState()
 */
Cypress.Commands.add("clearAppState", () => {
  cy.clearLocalStorage();
  cy.clearCookies();
});

/**
 * Check for error message display
 * @example cy.shouldShowError('Invalid credentials')
 */
Cypress.Commands.add("shouldShowError", (message) => {
  cy.contains(message).should("be.visible");
});

/**
 * Check for success message display
 * @example cy.shouldShowSuccess('Login successful')
 */
Cypress.Commands.add("shouldShowSuccess", (message) => {
  cy.contains(message).should("be.visible");
});
