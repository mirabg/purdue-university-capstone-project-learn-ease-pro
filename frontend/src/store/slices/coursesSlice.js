import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCoursesLoading: (state, action) => {
      state.loading = action.payload;
    },
    setCoursesError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCourses: (state, action) => {
      state.courses = action.payload;
      state.loading = false;
      state.error = null;
    },
    setCurrentCourse: (state, action) => {
      state.currentCourse = action.payload;
    },
    addCourse: (state, action) => {
      state.courses.push(action.payload);
    },
    updateCourse: (state, action) => {
      const index = state.courses.findIndex(
        (course) => course.id === action.payload.id
      );
      if (index !== -1) {
        state.courses[index] = action.payload;
      }
      if (state.currentCourse?.id === action.payload.id) {
        state.currentCourse = action.payload;
      }
    },
    removeCourse: (state, action) => {
      state.courses = state.courses.filter(
        (course) => course.id !== action.payload
      );
      if (state.currentCourse?.id === action.payload) {
        state.currentCourse = null;
      }
    },
    clearCourses: (state) => {
      state.courses = [];
      state.currentCourse = null;
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setCoursesLoading,
  setCoursesError,
  setCourses,
  setCurrentCourse,
  addCourse,
  updateCourse,
  removeCourse,
  clearCourses,
} = coursesSlice.actions;

// Selectors
export const selectAllCourses = (state) => state.courses.courses;
export const selectCurrentCourse = (state) => state.courses.currentCourse;
export const selectCoursesLoading = (state) => state.courses.loading;
export const selectCoursesError = (state) => state.courses.error;

export default coursesSlice.reducer;
