# Redux Toolkit Migration Guide

## Overview

This project has been successfully migrated to use Redux Toolkit for state management. Authentication state is now managed centrally through Redux, and RTK Query is set up for efficient API calls with automatic caching.

## What's Been Implemented

### 1. Core Redux Setup

- ✅ **Auth Slice** (`store/slices/authSlice.js`) - Manages user authentication state
- ✅ **Courses Slice** (`store/slices/coursesSlice.js`) - Manages courses data
- ✅ **Enrollments Slice** (`store/slices/enrollmentsSlice.js`) - Manages enrollment data
- ✅ **API Slice** (`store/apiSlice.js`) - RTK Query configuration with all API endpoints
- ✅ **Store Configuration** (`store/store.js`) - Configured with all reducers and middleware

### 2. Migrated Components

- ✅ **Header** - Uses Redux selectors for auth state
- ✅ **Login** - Uses RTK Query mutation and dispatches loginSuccess
- ✅ **Register** - Uses RTK Query mutation and dispatches loginSuccess
- ✅ **App.jsx** - Uses Redux selectors for route redirects
- ✅ **Route Guards** (AdminRoute, FacultyRoute, PrivateRoute) - Use Redux selectors

## How to Use Redux in Components

### Authentication State

```jsx
import { useSelector, useDispatch } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  logout,
} from "@/store/slices/authSlice";

function MyComponent() {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return <div>Welcome {user?.firstName}</div>;
}
```

### RTK Query for API Calls

#### Fetching Data

```jsx
import { useGetCoursesQuery } from "@/store/apiSlice";

function CoursesList() {
  const { data, isLoading, isError, error } = useGetCoursesQuery({
    page: 1,
    limit: 10,
    search: "",
  });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.courses.map((course) => (
        <div key={course._id}>{course.title}</div>
      ))}
    </div>
  );
}
```

#### Mutations (Create/Update/Delete)

```jsx
import { useCreateCourseMutation } from "@/store/apiSlice";

function CreateCourse() {
  const [createCourse, { isLoading }] = useCreateCourseMutation();

  const handleSubmit = async (courseData) => {
    try {
      const result = await createCourse(courseData).unwrap();
      console.log("Course created:", result);
    } catch (error) {
      console.error("Failed to create course:", error);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      Create
    </button>
  );
}
```

## Migration Path for Remaining Components

### Dashboard Components (Next Step)

#### Before (Current Pattern):

```jsx
function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await enrollmentService.getAllEnrollments(1, 1000);
      setEnrolledCourses(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return <div>...</div>;
}
```

#### After (Redux + RTK Query):

```jsx
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/authSlice";
import { useGetEnrollmentsQuery } from "@/store/apiSlice";

function StudentDashboard() {
  const user = useSelector(selectUser);
  const { data: enrollmentsData, isLoading } = useGetEnrollmentsQuery({
    page: 1,
    limit: 1000,
  });

  const enrolledCourses = enrollmentsData?.enrollments || [];

  return <div>...</div>;
}
```

**Benefits:**

- No manual loading states
- No useEffect for data fetching
- Automatic caching (refetch only when needed)
- Automatic refetch on window focus
- Error handling built-in

## Available RTK Query Hooks

### User Management

- `useGetUsersQuery({ page, limit, search })`
- `useGetUserByIdQuery(id)`
- `useCreateUserMutation()`
- `useUpdateUserMutation()`
- `useDeleteUserMutation()`

### Course Management

- `useGetCoursesQuery({ page, limit, search })`
- `useGetCourseByIdQuery(id)`
- `useCreateCourseMutation()`
- `useUpdateCourseMutation()`
- `useDeleteCourseMutation()`

### Enrollments

- `useGetEnrollmentsQuery({ page, limit, courseId, status })`
- `useCreateEnrollmentMutation()`
- `useUpdateEnrollmentMutation()`
- `useDeleteEnrollmentMutation()`

### Course Ratings/Feedback

- `useGetCourseFeedbackQuery(courseId)`
- `useCreateCourseFeedbackMutation()`
- `useUpdateCourseFeedbackMutation()`
- `useDeleteCourseFeedbackMutation()`

### Course Materials

- `useGetCourseMaterialsQuery(courseId)`
- `useUploadCourseMaterialMutation()`
- `useDeleteCourseMaterialMutation()`

### Discussion Posts

- `useGetPostsQuery({ courseId, page, limit })`
- `useCreatePostMutation()`
- `useUpdatePostMutation()`
- `useDeletePostMutation()`

## Tips for Migration

1. **Start with Read Operations**: Migrate GET requests first using query hooks
2. **Then Add Mutations**: Convert POST/PUT/DELETE to mutation hooks
3. **Remove Manual State**: Delete useState, useEffect, and loading state management
4. **Let RTK Query Handle Errors**: Use isError, error from hooks instead of try/catch
5. **Use Optimistic Updates**: For better UX, use RTK Query's optimistic update features

## Automatic Cache Invalidation

RTK Query automatically refetches data when:

- A mutation invalidates related tags
- Window regains focus (configurable)
- Component remounts (configurable)

Example: Creating a course automatically refetches the courses list.

## Next Steps

To complete the migration:

1. Migrate dashboard components (StudentDashboard, FacultyDashboard, AdminDashboard)
2. Migrate modal components to use RTK Query hooks
3. Remove direct usage of authService and api service in components
4. Consider adding Redux DevTools for debugging

## Rollback Strategy

If needed, the old authService is still available. You can temporarily use:

```jsx
import { authService } from "@services/authService";
```

However, this defeats the purpose of centralized state management.
