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
});
