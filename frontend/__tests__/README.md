# Frontend Test Suite

This directory contains comprehensive unit tests for the LearnEasePro frontend application.

## Test Framework

- **Vitest**: Modern, fast test runner with native ES module support
- **React Testing Library**: For testing React components
- **jsdom**: DOM environment for testing

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test:coverage

# Run tests with UI
npm test:ui
```

## Test Structure

### Services Tests

- **authService.test.js**: Authentication service tests including login, logout, JWT token handling, and role verification
- **userService.test.js**: User management API service tests

### Utils Tests

- **validators.test.js**: Input validation functions (email, phone, password, required fields)
- **formatters.test.js**: Data formatting utilities (date, time, string manipulation)

### Component Tests

- **AdminRoute.test.jsx**: Protected route component for admin-only pages
- **Header.test.jsx**: Application header with user info and logout functionality
- **Footer.test.jsx**: Application footer component

### View Tests

- **Login.test.jsx**: Login page with form validation, error handling, and navigation
- **AdminDashboard.test.jsx**: Admin dashboard view
- **Unauthorized.test.jsx**: Unauthorized access page

## Test Coverage

The test suite covers:

- ✅ Service layer (authentication, user management)
- ✅ Utility functions (validators, formatters)
- ✅ React components (routing, layout)
- ✅ Views (pages and user interactions)

## Key Features Tested

1. **Authentication Flow**

   - User login and logout
   - JWT token storage and retrieval
   - Role-based access control

2. **Component Rendering**

   - Conditional rendering based on auth state
   - Form handling and validation
   - Navigation and routing

3. **Error Handling**

   - API error responses
   - Form validation errors
   - Authentication failures

4. **User Interactions**
   - Form submissions
   - Button clicks
   - Navigation events

## Writing New Tests

When adding new features, follow these patterns:

1. **Services**: Mock API calls using `vi.mock()`
2. **Components**: Use `render()` from React Testing Library
3. **User Events**: Use `fireEvent` or `userEvent` for interactions
4. **Async Operations**: Use `waitFor()` for async state changes

Example:

```javascript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

describe("MyComponent", () => {
  it("should render correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
```

## Configuration

Test configuration is in:

- `vitest.config.js`: Vitest configuration
- `__tests__/setup.js`: Global test setup and mocks
