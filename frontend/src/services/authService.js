import api from "./api";

/**
 * Auth Service
 * Handles user authentication operations
 */
export const authService = {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} User data and token
   */
  login: async (credentials) => {
    const response = await api.post("/users/login", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise} User data and token
   */
  register: async (userData) => {
    const response = await api.post("/users/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Get current user from token
   * @returns {Object|null} User data from token
   */
  getCurrentUser: () => {
    // Try to get user from localStorage first
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        // If parsing fails, fall through to token decode
      }
    }

    // Fall back to decoding token
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      // Decode JWT token (basic decode, not validation)
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const payload = JSON.parse(window.atob(base64));
      return payload;
    } catch (error) {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  /**
   * Check if current user is an admin
   * @returns {boolean}
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user && user.role === "admin";
  },
};

export default authService;
