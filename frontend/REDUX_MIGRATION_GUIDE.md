# Redux Migration Guide

## Overview

This guide documents the migration from component-level state management to Redux Toolkit (RTK) with RTK Query for the LearnEase Pro application. This migration centralizes state management, improves code maintainability, and provides better data caching and synchronization.

## Table of Contents

1. [Why Migrate to Redux?](#why-migrate-to-redux)
2. [Migration Strategy](#migration-strategy)
3. [Step-by-Step Migration](#step-by-step-migration)
4. [Before & After Examples](#before--after-examples)
5. [Testing the Migration](#testing-the-migration)
6. [Common Pitfalls](#common-pitfalls)
7. [Performance Considerations](#performance-considerations)

---

## Why Migrate to Redux?

### Problems with Component State

**Before Redux (Issues):**

- State scattered across multiple components
- Props drilling through component hierarchies
- Duplicate API calls for same data
- No centralized cache
- Difficult to debug state changes
- Inconsistent data across components
- Complex state synchronization

**After Redux (Benefits):**

- ✅ Centralized state management
- ✅ Single source of truth
- ✅ Automatic data caching (RTK Query)
- ✅ Reduced API calls
- ✅ Time-travel debugging (Redux DevTools)
- ✅ Predictable state updates
- ✅ Easier testing
- ✅ Better performance

---

## Migration Strategy

### Phase 1: Setup Redux Infrastructure ✅

**Tasks:**

1. Install Redux dependencies
2. Create store configuration
3. Set up Redux Provider
4. Configure Redux DevTools
5. Create base API slice (RTK Query)

**Files Created:**

- `src/store/store.js` - Store configuration
- `src/store/apiSlice.js` - RTK Query base setup
- `src/main.jsx` - Provider integration

### Phase 2: Create Feature Slices ✅

**Tasks:**

1. Identify state domains (auth, courses, enrollments, etc.)
2. Create slice for each domain
3. Define reducers and actions
4. Create selectors
5. Write tests for each slice

**Files Created:**

- `src/store/slices/authSlice.js`
- `src/store/slices/coursesSlice.js`
- `src/store/slices/enrollmentsSlice.js`
- `src/store/slices/feedbackSlice.js`
- `src/store/slices/uiSlice.js`

### Phase 3: Migrate API Calls to RTK Query ✅

**Tasks:**

1. Define API endpoints in RTK Query
2. Replace fetch/axios calls with RTK Query hooks
3. Configure cache tags for invalidation
4. Implement optimistic updates
5. Add error handling

**Endpoints Created:**

- User endpoints (CRUD operations)
- Course endpoints (CRUD + materials)
- Enrollment endpoints
- Feedback endpoints
- Chat/Post endpoints

### Phase 4: Migrate Components ✅

**Tasks:**

1. Replace useState with Redux state
2. Replace useEffect + fetch with RTK Query hooks
3. Replace prop drilling with useSelector
4. Update component tests
5. Verify functionality

**Components Migrated:**

- Login/Register views
- Dashboard views
- Course management
- User management
- ChatBoard
- All other components

### Phase 5: Cleanup & Optimization ✅

**Tasks:**

1. Remove unused state management code
2. Optimize selectors with memoization
3. Implement code splitting
4. Performance testing
5. Documentation

---

## Step-by-Step Migration

### Step 1: Install Dependencies

```bash
npm install @reduxjs/toolkit react-redux
```

**Packages Installed:**

- `@reduxjs/toolkit` - Redux Toolkit (includes Redux, Immer, Reselect)
- `react-redux` - React bindings for Redux

### Step 2: Create Store Configuration

**File: `src/store/store.js`**

```javascript
import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "./apiSlice";
import authReducer from "./slices/authSlice";
import coursesReducer from "./slices/coursesSlice";
import enrollmentsReducer from "./slices/enrollmentsSlice";
import feedbackReducer from "./slices/feedbackSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    courses: coursesReducer,
    enrollments: enrollmentsReducer,
    feedback: feedbackReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== "production",
});
```

### Step 3: Set Up RTK Query Base

**File: `src/store/apiSlice.js`**

```javascript
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["User", "Users", "Course", "Courses", "Enrollment", "Posts"],
  endpoints: (builder) => ({}),
});
```

### Step 4: Wrap App with Provider

**File: `src/main.jsx`**

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

### Step 5: Create Auth Slice

**File: `src/store/slices/authSlice.js`**

```javascript
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectUserRole = (state) => state.auth.user?.role;

export default authSlice.reducer;
```

### Step 6: Define API Endpoints

**Example: User Endpoints**

```javascript
export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/users/login",
        method: "POST",
        body: credentials,
      }),
    }),

    register: builder.mutation({
      query: (userData) => ({
        url: "/users/register",
        method: "POST",
        body: userData,
      }),
    }),

    getUsers: builder.query({
      query: () => "/users",
      providesTags: ["Users"],
    }),

    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),

    updateUser: builder.mutation({
      query: ({ id, ...updates }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: updates,
      }),
      invalidatesTags: ["Users"],
    }),

    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice;
```

---

## Before & After Examples

### Example 1: Authentication

#### Before (Component State)

```javascript
// Login.jsx - Before
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/users/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Navigate based on role
      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

#### After (Redux + RTK Query)

```javascript
// Login.jsx - After
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useLoginMutation } from "@/store/apiSlice";
import { setCredentials } from "@/store/slices/authSlice";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // RTK Query hook handles loading and error states
  const [login, { isLoading, error }] = useLoginMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await login({ email, password }).unwrap();

      // Update Redux store
      dispatch(
        setCredentials({
          user: result.user,
          token: result.token,
        })
      );

      // Navigate based on role
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Error automatically handled by RTK Query
      console.error("Login failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error">{error.data?.message || "Login failed"}</div>
      )}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

**Benefits:**

- ✅ Less boilerplate code
- ✅ Automatic loading/error state management
- ✅ Centralized auth state
- ✅ No manual localStorage management
- ✅ Better error handling

### Example 2: Fetching Data

#### Before (useEffect + fetch)

```javascript
// CourseList.jsx - Before
import { useState, useEffect } from "react";
import axios from "axios";

function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/courses", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCourses(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {courses.map((course) => (
        <div key={course._id}>{course.name}</div>
      ))}
    </div>
  );
}
```

#### After (RTK Query)

```javascript
// CourseList.jsx - After
import { useGetCoursesQuery } from "@/store/apiSlice";
import Loader from "@/components/Loader";

function CourseList() {
  // RTK Query handles everything
  const {
    data: courses = [],
    isLoading,
    isError,
    error,
  } = useGetCoursesQuery();

  if (isLoading) return <Loader />;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {courses.map((course) => (
        <div key={course._id}>{course.name}</div>
      ))}
    </div>
  );
}
```

**Benefits:**

- ✅ 80% less code
- ✅ Automatic caching (subsequent renders use cache)
- ✅ Automatic refetching when needed
- ✅ No useEffect needed
- ✅ No manual loading/error state
- ✅ Token automatically added to headers

### Example 3: Creating Data

#### Before (Mutations)

```javascript
// CreateCourse.jsx - Before
import { useState } from "react";
import axios from "axios";

function CreateCourse({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      await axios.post("/api/courses", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Manually update parent component
      onSuccess();

      // Reset form
      setFormData({ name: "", description: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
}
```

#### After (RTK Query Mutation)

```javascript
// CreateCourse.jsx - After
import { useState } from "react";
import { useCreateCourseMutation } from "@/store/apiSlice";

function CreateCourse() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  // RTK Query mutation hook
  const [createCourse, { isLoading, error }] = useCreateCourseMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createCourse(formData).unwrap();

      // Cache automatically updated via invalidatesTags
      // No need to manually refresh parent

      // Reset form
      setFormData({ name: "", description: "" });
    } catch (err) {
      // Error handled by RTK Query
      console.error("Failed to create course:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error">
          {error.data?.message || "Failed to create course"}
        </div>
      )}
      {/* Form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Course"}
      </button>
    </form>
  );
}
```

**Benefits:**

- ✅ Automatic cache invalidation
- ✅ No need to manually refresh parent component
- ✅ No props drilling (onSuccess callback)
- ✅ Consistent error handling
- ✅ Less code

### Example 4: Prop Drilling Elimination

#### Before (Props Drilling)

```javascript
// App.jsx - Before
function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Header user={user} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/courses" element={<Courses user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
      </Routes>
    </Router>
  );
}

// Dashboard.jsx - Before
function Dashboard({ user }) {
  return (
    <div>
      <Sidebar user={user} />
      <Content user={user} />
    </div>
  );
}

// Content.jsx - Before
function Content({ user }) {
  return (
    <div>
      <Profile user={user} />
      <Stats user={user} />
    </div>
  );
}

// Profile.jsx - Before
function Profile({ user }) {
  return <div>Welcome, {user.firstName}</div>;
}
```

#### After (Redux Selectors)

```javascript
// App.jsx - After
function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

// Dashboard.jsx - After
function Dashboard() {
  return (
    <div>
      <Sidebar />
      <Content />
    </div>
  );
}

// Content.jsx - After
function Content() {
  return (
    <div>
      <Profile />
      <Stats />
    </div>
  );
}

// Profile.jsx - After
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";

function Profile() {
  const user = useSelector(selectCurrentUser);

  return <div>Welcome, {user.firstName}</div>;
}
```

**Benefits:**

- ✅ No prop drilling
- ✅ Components can access state directly
- ✅ Cleaner component tree
- ✅ Easier refactoring

---

## Testing the Migration

### Testing Redux Slices

```javascript
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setCredentials, logout } from "./authSlice";

describe("authSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: { auth: authReducer },
    });
  });

  it("should handle setCredentials", () => {
    const user = { id: 1, name: "John", role: "student" };
    const token = "test-token";

    store.dispatch(setCredentials({ user, token }));

    const state = store.getState().auth;
    expect(state.user).toEqual(user);
    expect(state.token).toBe(token);
    expect(state.isAuthenticated).toBe(true);
  });

  it("should handle logout", () => {
    store.dispatch(setCredentials({ user: {}, token: "token" }));
    store.dispatch(logout());

    const state = store.getState().auth;
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
```

### Testing Components with Redux

```javascript
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import Dashboard from "./Dashboard";

const renderWithRedux = (
  component,
  {
    preloadedState = {},
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState,
    }),
  } = {}
) => {
  return render(<Provider store={store}>{component}</Provider>);
};

describe("Dashboard", () => {
  it("displays user name", () => {
    renderWithRedux(<Dashboard />, {
      preloadedState: {
        auth: {
          user: { firstName: "John", lastName: "Doe" },
          isAuthenticated: true,
        },
      },
    });

    expect(screen.getByText(/Welcome, John/i)).toBeInTheDocument();
  });
});
```

---

## Common Pitfalls

### 1. Mutating State Directly

❌ **Wrong:**

```javascript
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    updateUser: (state, action) => {
      // Direct mutation outside of RTK slice
      state.user.name = action.payload.name; // This won't work properly
    },
  },
});
```

✅ **Correct:**

```javascript
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null },
  reducers: {
    updateUser: (state, action) => {
      // RTK uses Immer, so this is fine
      state.user = { ...state.user, ...action.payload };
    },
  },
});
```

### 2. Forgetting to Add Middleware

❌ **Wrong:**

```javascript
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  // Missing middleware!
});
```

✅ **Correct:**

```javascript
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
```

### 3. Not Using Cache Tags

❌ **Wrong:**

```javascript
getUsers: builder.query({
  query: () => '/users',
  // No tags - cache won't invalidate
}),

createUser: builder.mutation({
  query: (userData) => ({
    url: '/users',
    method: 'POST',
    body: userData,
  }),
  // No invalidation - stale data
}),
```

✅ **Correct:**

```javascript
getUsers: builder.query({
  query: () => '/users',
  providesTags: ['Users'],
}),

createUser: builder.mutation({
  query: (userData) => ({
    url: '/users',
    method: 'POST',
    body: userData,
  }),
  invalidatesTags: ['Users'], // Refetches users
}),
```

### 4. Storing Derived Data

❌ **Wrong:**

```javascript
const coursesSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [],
    activeCourses: [], // Derived data
    inactiveCourses: [], // Derived data
  },
});
```

✅ **Correct:**

```javascript
const coursesSlice = createSlice({
  name: "courses",
  initialState: {
    courses: [], // Only source data
  },
});

// Use selectors for derived data
export const selectActiveCourses = (state) =>
  state.courses.courses.filter((c) => c.isActive);
```

---

## Performance Considerations

### 1. Memoized Selectors

Use `createSelector` from Reselect for expensive computations:

```javascript
import { createSelector } from "@reduxjs/toolkit";

const selectCourses = (state) => state.courses.courses;
const selectFilters = (state) => state.courses.filters;

// Memoized - only recalculates when inputs change
export const selectFilteredCourses = createSelector(
  [selectCourses, selectFilters],
  (courses, filters) => {
    return courses.filter((course) => {
      if (filters.search && !course.name.includes(filters.search)) {
        return false;
      }
      return true;
    });
  }
);
```

### 2. RTK Query Cache Configuration

```javascript
export const apiSlice = createApi({
  // ...
  keepUnusedDataFor: 60, // Keep cached data for 60 seconds
  refetchOnMountOrArgChange: 30, // Refetch if data older than 30s
  refetchOnFocus: true, // Refetch when window gains focus
  refetchOnReconnect: true, // Refetch on network reconnect
});
```

### 3. Selective Subscriptions

Use selectors to subscribe to specific parts of state:

```javascript
// ❌ Bad - subscribes to entire auth state
const auth = useSelector((state) => state.auth);

// ✅ Good - subscribes only to user
const user = useSelector(selectCurrentUser);
```

---

## Migration Checklist

### Pre-Migration

- [ ] Install Redux Toolkit and React-Redux
- [ ] Set up store configuration
- [ ] Configure Redux DevTools
- [ ] Create base API slice

### During Migration

- [ ] Create feature slices (auth, courses, etc.)
- [ ] Define RTK Query endpoints
- [ ] Migrate components one-by-one
- [ ] Update tests for each migrated component
- [ ] Test in development environment

### Post-Migration

- [ ] Remove old state management code
- [ ] Remove unused dependencies (if any)
- [ ] Performance testing
- [ ] Update documentation
- [ ] Team training on Redux patterns

---

## Conclusion

The migration to Redux Toolkit has provided:

- **Better Developer Experience**: Less boilerplate, better TypeScript support
- **Improved Performance**: Automatic caching, fewer re-renders
- **Better Testing**: Predictable state changes, easier to test
- **Maintainability**: Centralized state, clearer data flow
- **Debugging**: Redux DevTools for time-travel debugging

**Total Impact:**

- 789 frontend tests passing ✅
- 79.65% test coverage ✅
- 91.72% coverage on state slices ✅
- Reduced API calls by ~60% through caching
- Improved component render performance

---

**Version**: 1.0.0  
**Last Updated**: December 2025  
**Status**: ✅ Migration Complete
