import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "./slices/authSlice";

/**
 * Base query with auth token injection
 */
const baseQuery = fetchBaseQuery({
  baseUrl: "/api",
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state or localStorage
    const token = getState().auth.token || localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Base query with re-authentication logic
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If unauthorized, logout and redirect
  if (result.error && result.error.status === 401) {
    api.dispatch(logout());

    // Only redirect if not already on login page
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  }

  return result;
};

/**
 * RTK Query API slice
 * Define endpoints for API calls with automatic caching and refetching
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Course", "Enrollment", "Rating", "Post", "Material"],
  endpoints: (builder) => ({
    // Auth endpoints
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

    // User endpoints
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/users?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["User"],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    createUser: builder.mutation({
      query: (userData) => ({
        url: "/users",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: userData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    // Course endpoints
    getCourses: builder.query({
      query: ({ page = 1, limit = 10, search = "" }) =>
        `/courses?page=${page}&limit=${limit}&search=${search}`,
      providesTags: ["Course"],
    }),
    getCourseById: builder.query({
      query: (id) => `/courses/${id}`,
      providesTags: (result, error, id) => [{ type: "Course", id }],
    }),
    createCourse: builder.mutation({
      query: (courseData) => ({
        url: "/courses",
        method: "POST",
        body: courseData,
      }),
      invalidatesTags: ["Course"],
    }),
    updateCourse: builder.mutation({
      query: ({ id, ...courseData }) => ({
        url: `/courses/${id}`,
        method: "PUT",
        body: courseData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Course", id },
        "Course",
      ],
    }),
    deleteCourse: builder.mutation({
      query: (id) => ({
        url: `/courses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Course"],
    }),

    // Enrollment endpoints
    getEnrollments: builder.query({
      query: ({ page = 1, limit = 100, courseId, status }) => {
        let url = `/enrollments?page=${page}&limit=${limit}`;
        if (courseId) url += `&courseId=${courseId}`;
        if (status) url += `&status=${status}`;
        return url;
      },
      providesTags: ["Enrollment"],
    }),
    createEnrollment: builder.mutation({
      query: (enrollmentData) => ({
        url: "/enrollments",
        method: "POST",
        body: enrollmentData,
      }),
      invalidatesTags: ["Enrollment"],
    }),
    updateEnrollment: builder.mutation({
      query: ({ id, ...enrollmentData }) => ({
        url: `/enrollments/${id}`,
        method: "PUT",
        body: enrollmentData,
      }),
      invalidatesTags: ["Enrollment"],
    }),
    deleteEnrollment: builder.mutation({
      query: (id) => ({
        url: `/enrollments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Enrollment"],
    }),
    getEnrollmentsByCourse: builder.query({
      query: ({ courseId, status }) => {
        let url = `/enrollments/course/${courseId}`;
        if (status) url += `?status=${status}`;
        return url;
      },
      providesTags: (result, error, { courseId }) => [
        { type: "Enrollment", id: courseId },
        "Enrollment",
      ],
    }),
    getCourseEnrollmentStats: builder.query({
      query: (courseId) => `/enrollments/course/${courseId}/stats`,
      providesTags: (result, error, courseId) => [
        { type: "Enrollment", id: `${courseId}-stats` },
      ],
    }),
    updateEnrollmentStatus: builder.mutation({
      query: ({ enrollmentId, status, comments }) => ({
        url: `/enrollments/${enrollmentId}/status`,
        method: "PATCH",
        body: { status, comments },
      }),
      invalidatesTags: (result, error, { enrollmentId }) => [
        "Enrollment",
        { type: "Enrollment", id: enrollmentId },
      ],
    }),

    // Course Rating/Feedback endpoints
    getCourseFeedback: builder.query({
      query: (courseId) => `/courses/${courseId}/feedback`,
      providesTags: (result, error, courseId) => [
        { type: "Rating", id: courseId },
      ],
    }),
    createCourseFeedback: builder.mutation({
      query: ({ courseId, ...feedbackData }) => ({
        url: `/courses/${courseId}/feedback`,
        method: "POST",
        body: feedbackData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Rating", id: courseId },
        "Rating",
      ],
    }),
    updateCourseFeedback: builder.mutation({
      query: ({ courseId, feedbackId, ...feedbackData }) => ({
        url: `/courses/${courseId}/feedback/${feedbackId}`,
        method: "PUT",
        body: feedbackData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Rating", id: courseId },
        "Rating",
      ],
    }),
    deleteCourseFeedback: builder.mutation({
      query: ({ courseId, feedbackId }) => ({
        url: `/courses/${courseId}/feedback/${feedbackId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Rating", id: courseId },
        "Rating",
      ],
    }),

    // Course Materials endpoints
    getCourseMaterials: builder.query({
      query: (courseId) => `/courses/${courseId}/materials`,
      providesTags: (result, error, courseId) => [
        { type: "Material", id: courseId },
      ],
    }),
    uploadCourseMaterial: builder.mutation({
      query: ({ courseId, formData }) => ({
        url: `/courses/${courseId}/materials`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Material", id: courseId },
      ],
    }),
    deleteCourseMaterial: builder.mutation({
      query: ({ courseId, materialId }) => ({
        url: `/courses/${courseId}/materials/${materialId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Material", id: courseId },
      ],
    }),

    // Discussion/Post endpoints
    getPosts: builder.query({
      query: ({ courseId, page = 1, limit = 10 }) =>
        `/courses/${courseId}/posts?page=${page}&limit=${limit}`,
      providesTags: (result, error, { courseId }) => [
        { type: "Post", id: courseId },
      ],
    }),
    createPost: builder.mutation({
      query: ({ courseId, ...postData }) => ({
        url: `/courses/${courseId}/posts`,
        method: "POST",
        body: postData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Post", id: courseId },
      ],
    }),
    updatePost: builder.mutation({
      query: ({ courseId, postId, ...postData }) => ({
        url: `/courses/${courseId}/posts/${postId}`,
        method: "PUT",
        body: postData,
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Post", id: courseId },
      ],
    }),
    deletePost: builder.mutation({
      query: ({ courseId, postId }) => ({
        url: `/courses/${courseId}/posts/${postId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { courseId }) => [
        { type: "Post", id: courseId },
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Auth
  useLoginMutation,
  useRegisterMutation,
  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  // Courses
  useGetCoursesQuery,
  useGetCourseByIdQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useDeleteCourseMutation,
  // Enrollments
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  useDeleteEnrollmentMutation,
  useGetEnrollmentsByCourseQuery,
  useGetCourseEnrollmentStatsQuery,
  useUpdateEnrollmentStatusMutation,
  // Ratings
  useGetCourseFeedbackQuery,
  useCreateCourseFeedbackMutation,
  useUpdateCourseFeedbackMutation,
  useDeleteCourseFeedbackMutation,
  // Materials
  useGetCourseMaterialsQuery,
  useUploadCourseMaterialMutation,
  useDeleteCourseMaterialMutation,
  // Posts
  useGetPostsQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = apiSlice;
