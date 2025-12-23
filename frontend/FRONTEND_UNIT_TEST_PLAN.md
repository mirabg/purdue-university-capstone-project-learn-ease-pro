# Frontend Unit Test Plan

## Overview

This document outlines the comprehensive unit testing strategy for the LearnEase Pro frontend application. Our testing approach combines unit tests (Vitest + React Testing Library) with E2E tests (Cypress) to ensure robust code coverage and reliable functionality.

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Tools & Setup](#testing-tools--setup)
3. [What to Test](#what-to-test)
4. [What NOT to Test](#what-not-to-test)
5. [Test Organization](#test-organization)
6. [Testing Patterns](#testing-patterns)
7. [Mock Strategies](#mock-strategies)
8. [Coverage Goals](#coverage-goals)
9. [Best Practices](#best-practices)
10. [Examples](#examples)

---

## Testing Philosophy

### Core Principles

1. **Test Behavior, Not Implementation**

   - Focus on what users see and do
   - Avoid testing internal component state
   - Test from the user's perspective

2. **Maintain High Coverage on Critical Paths**

   - 90%+ coverage on Redux slices and services
   - 70%+ coverage on UI components
   - 100% coverage on utility functions

3. **Confidence Over Quantity**

   - Tests should prevent regressions
   - Tests should be maintainable
   - Tests should run fast

4. **Hybrid Testing Strategy**
   - Unit tests for logic and isolated components
   - E2E tests for user workflows
   - Integration tests for API interactions

---

## Testing Tools & Setup

### Primary Tools

```json
{
  "vitest": "^4.0.16",
  "@testing-library/react": "^16.1.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/user-event": "^14.5.2",
  "cypress": "^13.16.1",
  "jsdom": "^25.0.1"
}
```

### Configuration

**File: `vitest.config.js`**

```javascript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./__tests__/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["node_modules/", "__tests__/", "*.config.js", "src/main.jsx"],
      thresholds: {
        lines: 60,
        statements: 60,
        branches: 60,
        functions: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**File: `__tests__/setup.js`**

```javascript
import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Mock environment variables
vi.mock("import.meta", () => ({
  env: {
    VITE_API_URL: "http://localhost:5000/api",
  },
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
```

---

## What to Test

### 1. Components

#### ✅ User Interactions

```javascript
it("should call onSubmit when form is submitted", async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();

  render(<LoginForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText(/email/i), "test@example.com");
  await user.type(screen.getByLabelText(/password/i), "password");
  await user.click(screen.getByRole("button", { name: /login/i }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: "test@example.com",
    password: "password",
  });
});
```

#### ✅ Conditional Rendering

```javascript
it("should show error message when error prop is provided", () => {
  render(<Alert error="Something went wrong" />);
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

it("should not show error message when error prop is null", () => {
  render(<Alert error={null} />);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
```

#### ✅ Dynamic Content

```javascript
it("should display user name when provided", () => {
  const user = { firstName: "John", lastName: "Doe" };
  render(<UserProfile user={user} />);
  expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
});
```

#### ✅ Accessibility

```javascript
it("should be accessible", async () => {
  const { container } = render(<Button>Click me</Button>);

  // Check for proper ARIA labels
  expect(screen.getByRole("button")).toHaveAttribute("aria-label");

  // Check keyboard navigation
  const button = screen.getByRole("button");
  button.focus();
  expect(button).toHaveFocus();
});
```

### 2. Redux Slices

#### ✅ Reducers

```javascript
describe("authSlice reducers", () => {
  it("should handle setCredentials", () => {
    const initialState = { user: null, token: null };
    const user = { id: 1, name: "John" };
    const token = "test-token";

    const state = authReducer(initialState, setCredentials({ user, token }));

    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });
});
```

#### ✅ Selectors

```javascript
describe("authSlice selectors", () => {
  it("should select current user", () => {
    const state = {
      auth: {
        user: { id: 1, name: "John" },
        token: "token",
      },
    };

    expect(selectCurrentUser(state)).toEqual({ id: 1, name: "John" });
  });
});
```

#### ✅ Async Thunks

```javascript
describe("async thunks", () => {
  it("should handle fetchUser fulfilled", () => {
    const user = { id: 1, name: "John" };
    const state = authReducer(initialState, fetchUser.fulfilled(user, "", {}));

    expect(state.user).toEqual(user);
    expect(state.loading).toBe(false);
  });
});
```

### 3. Services

#### ✅ API Calls

```javascript
describe("UserService", () => {
  it("should fetch users", async () => {
    const mockUsers = [{ id: 1, name: "John" }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    });

    const users = await UserService.getUsers();

    expect(users).toEqual(mockUsers);
    expect(fetch).toHaveBeenCalledWith("/api/users", expect.any(Object));
  });
});
```

#### ✅ Error Handling

```javascript
it("should throw error when API call fails", async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

  await expect(UserService.getUsers()).rejects.toThrow("Network error");
});
```

### 4. Utilities

#### ✅ Pure Functions

```javascript
describe("formatDate", () => {
  it("should format date correctly", () => {
    const date = new Date("2025-01-15");
    expect(formatDate(date)).toBe("January 15, 2025");
  });

  it("should handle invalid dates", () => {
    expect(formatDate(null)).toBe("Invalid Date");
  });
});
```

#### ✅ Edge Cases

```javascript
describe("calculateGrade", () => {
  it("should return A for 90-100", () => {
    expect(calculateGrade(95)).toBe("A");
  });

  it("should handle boundary values", () => {
    expect(calculateGrade(90)).toBe("A");
    expect(calculateGrade(89.99)).toBe("B");
  });

  it("should handle invalid scores", () => {
    expect(calculateGrade(-1)).toBe("Invalid");
    expect(calculateGrade(101)).toBe("Invalid");
  });
});
```

### 5. Custom Hooks

#### ✅ Hook Behavior

```javascript
import { renderHook, act } from "@testing-library/react";

describe("useAuth", () => {
  it("should return current user", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should update user on login", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.login({ email: "test@test.com", password: "pass" });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

---

## What NOT to Test

### ❌ Third-Party Libraries

**Don't test React Router:**

```javascript
// ❌ Bad - testing react-router-dom
it("should navigate to home", () => {
  const navigate = useNavigate();
  navigate("/home");
  expect(navigate).toHaveBeenCalledWith("/home");
});

// ✅ Good - test the outcome
it("should show home page after login", () => {
  render(<App />, { route: "/login" });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
  expect(screen.getByText(/Welcome Home/i)).toBeInTheDocument();
});
```

### ❌ Implementation Details

**Don't test state variables:**

```javascript
// ❌ Bad - testing internal state
it("should update count state", () => {
  const { result } = renderHook(() => useState(0));
  act(() => result.current[1](1));
  expect(result.current[0]).toBe(1);
});

// ✅ Good - test behavior
it("should display incremented count", () => {
  render(<Counter />);
  fireEvent.click(screen.getByRole("button", { name: /increment/i }));
  expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
});
```

### ❌ External APIs

**Don't make real API calls:**

```javascript
// ❌ Bad - real API call
it("should fetch users", async () => {
  const users = await fetch("http://localhost:5000/api/users");
  expect(users).toBeDefined();
});

// ✅ Good - mock the API
it("should fetch users", async () => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ id: 1, name: "John" }],
  });

  const users = await UserService.getUsers();
  expect(users).toHaveLength(1);
});
```

### ❌ CSS and Styling

**Don't test styles:**

```javascript
// ❌ Bad - testing CSS
it("should have blue background", () => {
  render(<Button />);
  expect(screen.getByRole("button")).toHaveStyle("background-color: blue");
});

// ✅ Good - test CSS classes if needed
it("should apply primary class", () => {
  render(<Button variant="primary" />);
  expect(screen.getByRole("button")).toHaveClass("btn-primary");
});
```

### ❌ Framework Internals

**Don't test React/Redux:**

```javascript
// ❌ Bad - testing Redux itself
it("should update store", () => {
  const store = createStore(reducer);
  store.dispatch(action);
  expect(store.getState()).toBeDefined();
});

// ✅ Good - test your reducer logic
it("should handle setUser action", () => {
  const state = authReducer(initialState, setUser(user));
  expect(state.user).toEqual(user);
});
```

---

## Test Organization

### Directory Structure

```
frontend/
  __tests__/
    setup.js                 # Global test setup
    services/
      authService.test.js    # Service tests
      courseService.test.js
    store/
      authSlice.test.js      # Redux slice tests
      coursesSlice.test.js
      enrollmentsSlice.test.js
      feedbackSlice.test.js
      uiSlice.test.js
    utils/
      formatters.test.js     # Utility tests
      validators.test.js
  src/
    components/
      Button/
        Button.jsx
        Button.test.jsx        # Component tests colocated
      Modal/
        Modal.jsx
        Modal.test.jsx
    views/
      Dashboard/
        Dashboard.jsx
        Dashboard.test.jsx
```

### File Naming Conventions

- **Unit Tests**: `ComponentName.test.jsx` or `functionName.test.js`
- **Integration Tests**: `featureName.integration.test.js`
- **E2E Tests**: `userFlow.cy.js` (Cypress)

---

## Testing Patterns

### Pattern 1: Component Testing Template

```javascript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import ComponentName from "./ComponentName";

// Helper function for rendering with Redux
const renderWithRedux = (
  component,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        /* your reducers */
      },
      preloadedState,
    }),
  } = {}
) => {
  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe("ComponentName", () => {
  describe("Rendering", () => {
    it("should render without errors", () => {
      render(<ComponentName />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should display correct title", () => {
      render(<ComponentName title="Test" />);
      expect(screen.getByText(/test/i)).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle button click", async () => {
      const onClick = vi.fn();
      const user = userEvent.setup();

      render(<ComponentName onClick={onClick} />);
      await user.click(screen.getByRole("button"));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Redux Integration", () => {
    it("should dispatch action on submit", async () => {
      const { store } = renderWithRedux(<ComponentName />);
      const user = userEvent.setup();

      await user.click(screen.getByRole("button", { name: /submit/i }));

      expect(store.getState().someSlice.someValue).toBe(expected);
    });
  });

  describe("Error Handling", () => {
    it("should display error message", () => {
      render(<ComponentName error="Something went wrong" />);
      expect(screen.getByRole("alert")).toHaveTextContent(
        /something went wrong/i
      );
    });
  });
});
```

### Pattern 2: Redux Slice Testing Template

```javascript
import { configureStore } from "@reduxjs/toolkit";
import sliceReducer, { action1, action2, selectSomething } from "./sliceName";

describe("sliceName", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { sliceName: sliceReducer },
    });
  });

  describe("actions", () => {
    it("should handle action1", () => {
      store.dispatch(action1(payload));
      const state = store.getState().sliceName;
      expect(state.someProperty).toBe(expectedValue);
    });
  });

  describe("selectors", () => {
    it("should select something", () => {
      const state = {
        sliceName: { someProperty: "value" },
      };
      expect(selectSomething(state)).toBe("value");
    });
  });
});
```

### Pattern 3: RTK Query Testing Template

```javascript
import { renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice, useGetUsersQuery } from "./apiSlice";

const createWrapper = () => {
  const store = configureStore({
    reducer: {
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });

  return ({ children }) => <Provider store={store}>{children}</Provider>;
};

describe("RTK Query hooks", () => {
  it("should fetch users successfully", async () => {
    const { result } = renderHook(() => useGetUsersQuery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data.length).toBeGreaterThan(0);
  });
});
```

---

## Mock Strategies

### 1. Mocking API Calls

```javascript
// Global mock
global.fetch = vi.fn();

beforeEach(() => {
  fetch.mockReset();
});

it("should fetch data", async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ data: "test" }),
  });

  const result = await apiCall();
  expect(result.data).toBe("test");
});
```

### 2. Mocking Redux Store

```javascript
import { configureStore } from "@reduxjs/toolkit";

const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: { id: 1, name: "Test User" },
      isAuthenticated: true,
    }),
  },
});

render(
  <Provider store={mockStore}>
    <Component />
  </Provider>
);
```

### 3. Mocking React Router

```javascript
import { BrowserRouter } from "react-router-dom";

const renderWithRouter = (component, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);

  return render(component, { wrapper: BrowserRouter });
};
```

### 4. Mocking Modules

```javascript
// Mock entire module
vi.mock("@/services/authService", () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getUser: vi.fn(),
}));

// Mock specific export
vi.mock("@/utils/formatters", () => ({
  formatDate: vi.fn(() => "January 1, 2025"),
}));
```

### 5. Mocking Local Storage

```javascript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

beforeEach(() => {
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
});
```

---

## Coverage Goals

### Overall Targets

| Category         | Target | Current | Status      |
| ---------------- | ------ | ------- | ----------- |
| **Overall**      | 60%    | 79.65%  | ✅ Exceeded |
| **Components**   | 70%    | 73.51%  | ✅ Met      |
| **Services**     | 90%    | 100%    | ✅ Exceeded |
| **Store/Slices** | 90%    | 91.72%  | ✅ Met      |
| **Utils**        | 90%    | 100%    | ✅ Exceeded |
| **Views**        | 70%    | 94.33%  | ✅ Exceeded |

### Coverage by File Type

```
Statement Coverage:
├── Components: 73.51%
├── Services: 100%
├── Store: 91.72%
├── Utils: 100%
└── Views: 94.33%

Branch Coverage:
├── Components: 70.12%
├── Services: 100%
├── Store: 88.46%
├── Utils: 95.00%
└── Views: 91.67%
```

### Rationale for Targets

**Why 60% Overall?**

- Hybrid strategy: Unit tests + E2E tests (Cypress)
- E2E tests cover complex user workflows
- Focus coverage on critical business logic
- 100% coverage often tests framework code

**Why 90% for Services/Store?**

- Core business logic must be reliable
- Pure functions are easy to test
- High impact on application stability
- Redux state is predictable and testable

**Why 70% for Components?**

- Visual components covered by E2E tests
- Focus on user interactions, not rendering
- Avoid testing implementation details
- Balance between coverage and maintainability

---

## Best Practices

### 1. Arrange-Act-Assert (AAA) Pattern

```javascript
it("should update user profile", async () => {
  // Arrange
  const user = { id: 1, name: "John" };
  const updates = { name: "Jane" };
  const onUpdate = vi.fn();

  // Act
  render(<UserProfile user={user} onUpdate={onUpdate} />);
  await userEvent.type(screen.getByLabelText(/name/i), "Jane");
  await userEvent.click(screen.getByRole("button", { name: /save/i }));

  // Assert
  expect(onUpdate).toHaveBeenCalledWith({ ...user, ...updates });
});
```

### 2. Use Descriptive Test Names

```javascript
// ❌ Bad
it("works", () => {
  /* ... */
});
it("test1", () => {
  /* ... */
});

// ✅ Good
it("should display error message when email is invalid", () => {
  /* ... */
});
it("should disable submit button while form is submitting", () => {
  /* ... */
});
```

### 3. Test One Thing at a Time

```javascript
// ❌ Bad - testing multiple behaviors
it("should handle form", () => {
  render(<Form />);
  expect(screen.getByRole("form")).toBeInTheDocument();
  fireEvent.submit(screen.getByRole("form"));
  expect(onSubmit).toHaveBeenCalled();
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
});

// ✅ Good - separate tests
it("should render form", () => {
  render(<Form />);
  expect(screen.getByRole("form")).toBeInTheDocument();
});

it("should call onSubmit when submitted", () => {
  render(<Form onSubmit={onSubmit} />);
  fireEvent.submit(screen.getByRole("form"));
  expect(onSubmit).toHaveBeenCalled();
});

it("should hide form after successful submit", () => {
  render(<Form />);
  fireEvent.submit(screen.getByRole("form"));
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
});
```

### 4. Avoid Testing Implementation Details

```javascript
// ❌ Bad - testing internal state
it("should set loading to true", () => {
  const { result } = renderHook(() => useData());
  expect(result.current.loading).toBe(true);
});

// ✅ Good - testing user-visible behavior
it("should show loading spinner while fetching", () => {
  render(<DataComponent />);
  expect(screen.getByRole("status", { name: /loading/i })).toBeInTheDocument();
});
```

### 5. Use Testing Library Queries Properly

**Query Priority:**

1. `getByRole` - Most accessible
2. `getByLabelText` - Good for forms
3. `getByPlaceholderText` - For inputs
4. `getByText` - For non-interactive elements
5. `getByTestId` - Last resort

```javascript
// ✅ Best
screen.getByRole("button", { name: /submit/i });

// ✅ Good
screen.getByLabelText(/email/i);

// ⚠️ Okay
screen.getByPlaceholderText(/enter email/i);

// ⚠️ Acceptable
screen.getByText(/welcome back/i);

// ❌ Last resort
screen.getByTestId("submit-button");
```

### 6. Clean Up After Tests

```javascript
afterEach(() => {
  cleanup(); // React Testing Library
  vi.clearAllMocks(); // Vitest
  localStorage.clear();
});
```

### 7. Use Realistic Test Data

```javascript
// ❌ Bad - minimal test data
const user = { id: 1, name: "A" };

// ✅ Good - realistic test data
const user = {
  id: 1,
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  role: "student",
  createdAt: "2025-01-01T00:00:00Z",
};
```

---

## Examples

### Example 1: Testing Form Component

```javascript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("should render email and password fields", () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  it("should update input values when typing", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, "test@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("test@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  it("should call onSubmit with form values", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
    });
  });

  it("should show validation errors", async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    await user.click(screen.getByRole("button", { name: /login/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should disable submit button while submitting", async () => {
    const user = userEvent.setup();
    const slowSubmit = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 1000))
      );

    render(<LoginForm onSubmit={slowSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");

    const submitButton = screen.getByRole("button", { name: /login/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
```

### Example 2: Testing Component with Redux

```javascript
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userEvent from "@testing-library/user-event";
import authReducer from "@/store/slices/authSlice";
import Dashboard from "./Dashboard";

const renderWithStore = (component, { preloadedState = {} } = {}) => {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

  return {
    ...render(<Provider store={store}>{component}</Provider>),
    store,
  };
};

describe("Dashboard", () => {
  it("should display user name", () => {
    renderWithStore(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: "John", lastName: "Doe" },
          isAuthenticated: true,
        },
      },
    });

    expect(screen.getByText(/Welcome, John Doe/i)).toBeInTheDocument();
  });

  it("should redirect to login if not authenticated", () => {
    renderWithStore(<Dashboard />, {
      preloadedState: {
        auth: { user: null, isAuthenticated: false },
      },
    });

    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });
});
```

### Example 3: Testing Async Operations

```javascript
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import UserList from "./UserList";

describe("UserList", () => {
  it("should display loading state", () => {
    render(<UserList />);
    expect(
      screen.getByRole("status", { name: /loading/i })
    ).toBeInTheDocument();
  });

  it("should display users after fetching", async () => {
    const mockUsers = [
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Smith" },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockUsers,
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    });
  });

  it("should display error message on fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load users/i)).toBeInTheDocument();
    });
  });
});
```

---

## Running Tests

### Command Line

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for specific file
npm test -- UserProfile.test.jsx

# Run tests matching pattern
npm test -- --grep="authentication"
```

### Coverage Report

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Frontend Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: npm ci
        working-directory: ./frontend

      - name: Run tests
        run: npm run test:coverage
        working-directory: ./frontend

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
```

---

## Conclusion

This test plan provides a comprehensive framework for frontend testing. Key takeaways:

- **Test behavior, not implementation**
- **Focus on user interactions**
- **Maintain high coverage on critical code**
- **Use hybrid strategy (unit + E2E)**
- **Keep tests fast and maintainable**

**Current Status:**

- ✅ 789 tests passing
- ✅ 79.65% overall coverage
- ✅ All critical paths tested
- ✅ Production ready

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Total Tests**: 789 passing
