// ***********************************************************
// This support file is loaded before all test files
// ***********************************************************

// Import commands.js
import "./commands";

// Prevent Cypress from failing tests on uncaught exceptions
Cypress.on("uncaught:exception", (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // for certain expected errors
  if (err.message.includes("ResizeObserver")) {
    return false;
  }
  return true;
});

// Add custom assertions
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();

  // Global intercept for user validation endpoint
  // Returns user from localStorage if available
  cy.intercept("GET", "**/api/users/me", (req) => {
    // Access localStorage synchronously through req
    const userStr = window.localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        req.reply({
          statusCode: 200,
          body: user,
        });
      } catch (e) {
        req.reply({
          statusCode: 401,
          body: { message: "Invalid user data" },
        });
      }
    } else {
      req.reply({
        statusCode: 401,
        body: { message: "Unauthorized" },
      });
    }
  });
});
