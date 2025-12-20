# Cypress E2E Tests

This directory contains end-to-end tests for the LearnEasePro application using Cypress.

## Setup

Cypress has been installed and configured for E2E testing of the login feature.

## Running Tests

### Interactive Mode (Cypress Test Runner)

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run with dev server (starts app automatically)
npm run e2e
```

### Headless Mode (CI/CD)

```bash
# Run all tests headlessly
npm run cypress:run

# Run with dev server
npm run e2e:ci
```

### Run Specific Test

```bash
npx cypress run --spec "cypress/e2e/login.cy.js"
```

## Test Structure

### Login Feature Tests (`login.cy.js`)

The login test suite includes comprehensive coverage:

#### 1. **Login Page UI** (5 tests)

- Display of all required elements
- Logo visibility
- Input placeholders
- Required field attributes

#### 2. **Form Validation** (4 tests)

- Empty field validation
- Email format validation
- Input field functionality
- Error message clearing

#### 3. **Successful Login - Admin User** (4 tests)

- Admin login and redirect to dashboard
- Loading state display
- Token storage in localStorage
- User info display in header

#### 4. **Successful Login - Regular User** (1 test)

- Regular user login and redirect

#### 5. **Failed Login Attempts** (6 tests)

- Invalid credentials error
- Non-existent user error
- Server error handling
- Network failure handling
- Token storage prevention on failure

#### 6. **Navigation** (3 tests)

- Register page navigation
- Root URL redirect
- Back navigation

#### 7. **Session Persistence** (1 test)

- Login state after page reload

#### 8. **Logout Functionality** (3 tests)

- Logout and redirect
- User data clearing
- Protected route access prevention

#### 9. **Accessibility** (3 tests)

- Form labels
- Keyboard navigation
- Autocomplete attributes

#### 10. **Responsive Design** (3 tests)

- Mobile viewport (375x667)
- Tablet viewport (768x1024)
- Desktop viewport (1280x720)

**Total: 36 E2E tests for login feature**

## Custom Commands

Custom Cypress commands are available in `cypress/support/commands.js`:

- `cy.loginByApi(email, password)` - Login via API call
- `cy.loginByUI(email, password)` - Login via UI
- `cy.shouldBeLoggedIn()` - Assert user is logged in
- `cy.shouldBeLoggedOut()` - Assert user is logged out
- `cy.waitForApiResponse(alias, statusCode)` - Wait for API response

## Test Data

Test data fixtures are stored in `cypress/fixtures/users.json`:

- Admin user credentials
- Regular user credentials
- Invalid credentials

## Configuration

Cypress configuration is in `cypress.config.js`:

- Base URL: `http://localhost:5173`
- API URL: `http://localhost:3000/api`
- Viewport: 1280x720
- Command timeout: 10000ms

## Best Practices

1. **Use data-testid for stable selectors**
2. **Mock API responses** for predictable tests
3. **Clean state before each test** (localStorage, cookies)
4. **Test user journeys**, not implementation
5. **Keep tests independent** and isolated

## CI/CD Integration

For continuous integration, use:

```bash
npm run e2e:ci
```

This command:

1. Starts the dev server
2. Waits for server to be ready
3. Runs all tests headlessly
4. Exits with appropriate status code

## Screenshots and Videos

- Screenshots: Taken on test failure (enabled)
- Videos: Disabled by default (can be enabled in config)

## Debugging

To debug failing tests:

1. Run in interactive mode: `npm run cypress:open`
2. Use Chrome DevTools
3. Check Cypress command log
4. Review screenshots in `cypress/screenshots/`

## Example Test

```javascript
it("should login successfully", () => {
  cy.visit("/login");
  cy.get('input[name="email"]').type("admin@example.com");
  cy.get('input[name="password"]').type("admin123");
  cy.get('button[type="submit"]').click();
  cy.url().should("include", "/admin/dashboard");
});
```

## Additional Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Custom Commands](https://docs.cypress.io/api/cypress-api/custom-commands)
