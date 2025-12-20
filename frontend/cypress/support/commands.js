// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

// Import cypress-plugin-tab for keyboard navigation testing
import "cypress-plugin-tab";

/**
 * Custom command to login via API
 * @example cy.loginByApi('admin@example.com', 'admin123')
 */
Cypress.Commands.add("loginByApi", (email, password) => {
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/users/login`,
    body: {
      email,
      password,
    },
  }).then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body).to.have.property("token");
    window.localStorage.setItem("token", response.body.token);
  });
});

/**
 * Custom command to login via UI
 * @example cy.loginByUI('admin@example.com', 'admin123')
 */
Cypress.Commands.add("loginByUI", (email, password) => {
  cy.visit("/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

/**
 * Custom command to check if user is logged in
 */
Cypress.Commands.add("shouldBeLoggedIn", () => {
  cy.window().its("localStorage.token").should("exist");
});

/**
 * Custom command to check if user is logged out
 */
Cypress.Commands.add("shouldBeLoggedOut", () => {
  cy.window().its("localStorage.token").should("not.exist");
});

/**
 * Custom command to wait for API response
 */
Cypress.Commands.add("waitForApiResponse", (alias, statusCode = 200) => {
  cy.wait(alias).its("response.statusCode").should("eq", statusCode);
});

/**
 * Custom command to login as admin user
 * @example cy.loginAsAdmin()
 */
Cypress.Commands.add("loginAsAdmin", () => {
  const adminToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIiwiZmlyc3ROYW1lIjoiQWRtaW4iLCJsYXN0TmFtZSI6IlVzZXIifQ.test";
  const adminUser = {
    id: "1",
    email: "admin@example.com",
    role: "admin",
    firstName: "Admin",
    lastName: "User",
  };

  cy.window().then((window) => {
    window.localStorage.setItem("token", adminToken);
    window.localStorage.setItem("user", JSON.stringify(adminUser));
  });
});

/**
 * Custom command to login as student user
 * @example cy.loginAsStudent()
 */
Cypress.Commands.add("loginAsStudent", () => {
  const studentToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIiLCJlbWFpbCI6InN0dWRlbnRAZXhhbXBsZS5jb20iLCJyb2xlIjoic3R1ZGVudCIsImZpcnN0TmFtZSI6IlN0dWRlbnQiLCJsYXN0TmFtZSI6IlVzZXIifQ.test";
  const studentUser = {
    id: "2",
    email: "student@example.com",
    role: "student",
    firstName: "Student",
    lastName: "User",
  };

  cy.window().then((window) => {
    window.localStorage.setItem("token", studentToken);
    window.localStorage.setItem("user", JSON.stringify(studentUser));
  });
});
