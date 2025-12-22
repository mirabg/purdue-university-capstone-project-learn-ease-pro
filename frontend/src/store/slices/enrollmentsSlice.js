import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  enrollments: [],
  loading: false,
  error: null,
  stats: {
    total: 0,
    accepted: 0,
    pending: 0,
    denied: 0,
  },
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    setEnrollmentsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setEnrollmentsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setEnrollments: (state, action) => {
      state.enrollments = action.payload;
      state.loading = false;
      state.error = null;

      // Calculate stats
      state.stats = {
        total: action.payload.length,
        accepted: action.payload.filter((e) => e.status === "accepted").length,
        pending: action.payload.filter((e) => e.status === "pending").length,
        denied: action.payload.filter((e) => e.status === "denied").length,
      };
    },
    addEnrollment: (state, action) => {
      state.enrollments.push(action.payload);
      state.stats.total += 1;
      if (action.payload.status === "pending") state.stats.pending += 1;
    },
    updateEnrollment: (state, action) => {
      const index = state.enrollments.findIndex(
        (enrollment) => enrollment.id === action.payload.id
      );
      if (index !== -1) {
        const oldStatus = state.enrollments[index].status;
        const newStatus = action.payload.status;

        // Update stats
        if (oldStatus !== newStatus) {
          if (oldStatus === "accepted") state.stats.accepted -= 1;
          if (oldStatus === "pending") state.stats.pending -= 1;
          if (oldStatus === "denied") state.stats.denied -= 1;

          if (newStatus === "accepted") state.stats.accepted += 1;
          if (newStatus === "pending") state.stats.pending += 1;
          if (newStatus === "denied") state.stats.denied += 1;
        }

        state.enrollments[index] = action.payload;
      }
    },
    removeEnrollment: (state, action) => {
      const enrollment = state.enrollments.find((e) => e.id === action.payload);
      if (enrollment) {
        state.stats.total -= 1;
        if (enrollment.status === "accepted") state.stats.accepted -= 1;
        if (enrollment.status === "pending") state.stats.pending -= 1;
        if (enrollment.status === "denied") state.stats.denied -= 1;
      }
      state.enrollments = state.enrollments.filter(
        (enrollment) => enrollment.id !== action.payload
      );
    },
    clearEnrollments: (state) => {
      state.enrollments = [];
      state.loading = false;
      state.error = null;
      state.stats = {
        total: 0,
        accepted: 0,
        pending: 0,
        denied: 0,
      };
    },
  },
});

export const {
  setEnrollmentsLoading,
  setEnrollmentsError,
  setEnrollments,
  addEnrollment,
  updateEnrollment,
  removeEnrollment,
  clearEnrollments,
} = enrollmentsSlice.actions;

// Selectors
export const selectAllEnrollments = (state) => state.enrollments.enrollments;
export const selectEnrollmentsLoading = (state) => state.enrollments.loading;
export const selectEnrollmentsError = (state) => state.enrollments.error;
export const selectEnrollmentStats = (state) => state.enrollments.stats;
export const selectEnrollmentsByCourseId = (courseId) => (state) =>
  state.enrollments.enrollments.filter((e) => e.courseId === courseId);

export default enrollmentsSlice.reducer;
