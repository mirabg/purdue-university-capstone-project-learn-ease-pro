import { createSlice } from "@reduxjs/toolkit";

/**
 * Helper function to decode JWT token
 */
const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(window.atob(base64));
    return payload;
  } catch (error) {
    return null;
  }
};

/**
 * Initialize auth state from localStorage
 */
const loadAuthState = () => {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      // If parsing fails, try to decode from token
      user = decodeToken(token);
    }
  } else if (token) {
    user = decodeToken(token);
  }

  return {
    user,
    token,
    isAuthenticated: !!token,
  };
};

const initialState = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      // Persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Update localStorage
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) => state.auth.user?.role === "admin";
export const selectIsFaculty = (state) => state.auth.user?.role === "faculty";
export const selectIsStudent = (state) => state.auth.user?.role === "student";

export default authSlice.reducer;
