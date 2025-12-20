import api from "./api";

/**
 * Course Service
 * Handles course-related API operations
 */
export const courseService = {
  /**
   * Get all courses with pagination and search
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} search - Search query
   * @returns {Promise} List of courses with pagination info
   */
  getAllCourses: async (page = 1, limit = 10, search = "") => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (search) {
      params.append("search", search);
    }

    const response = await api.get(`/courses?${params.toString()}`);
    return response.data;
  },

  /**
   * Get course by ID
   * @param {string} id - Course ID
   * @param {boolean} includeDetails - Whether to include course details
   * @returns {Promise} Course data
   */
  getCourseById: async (id, includeDetails = false) => {
    const params = includeDetails ? "?includeDetails=true" : "";
    const response = await api.get(`/courses/${id}${params}`);
    return response.data;
  },

  /**
   * Create new course
   * @param {Object} courseData - Course data
   * @returns {Promise} Created course data
   */
  createCourse: async (courseData) => {
    const response = await api.post("/courses", courseData);
    return response.data;
  },

  /**
   * Update course
   * @param {string} id - Course ID
   * @param {Object} courseData - Updated course data
   * @returns {Promise} Updated course data
   */
  updateCourse: async (id, courseData) => {
    const response = await api.put(`/courses/${id}`, courseData);
    return response.data;
  },

  /**
   * Delete course
   * @param {string} id - Course ID
   * @returns {Promise} Deletion confirmation
   */
  deleteCourse: async (id) => {
    const response = await api.delete(`/courses/${id}`);
    return response.data;
  },
};

export default courseService;
