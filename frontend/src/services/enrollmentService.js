import api from "./api";

/**
 * Enrollment Service
 * Handles enrollment-related API operations
 */
export const enrollmentService = {
  /**
   * Get enrollments by course
   * @param {string} courseId - Course ID
   * @param {string} status - Filter by status (optional)
   * @returns {Promise} List of enrollments
   */
  getEnrollmentsByCourse: async (courseId, status = null) => {
    const params = new URLSearchParams();
    if (status) {
      params.append("status", status);
    }
    const queryString = params.toString();
    const url = `/enrollments/course/${courseId}${
      queryString ? `?${queryString}` : ""
    }`;
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get enrollment statistics for a course
   * @param {string} courseId - Course ID
   * @returns {Promise} Enrollment statistics
   */
  getCourseEnrollmentStats: async (courseId) => {
    const response = await api.get(`/enrollments/course/${courseId}/stats`);
    return response.data;
  },

  /**
   * Update enrollment status
   * @param {string} enrollmentId - Enrollment ID
   * @param {string} status - New status (pending, accepted, denied)
   * @param {string} comments - Optional comments
   * @returns {Promise} Updated enrollment
   */
  updateEnrollmentStatus: async (enrollmentId, status, comments = "") => {
    const response = await api.patch(`/enrollments/${enrollmentId}/status`, {
      status,
      comments,
    });
    return response.data;
  },

  /**
   * Update enrollment
   * @param {string} enrollmentId - Enrollment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise} Updated enrollment
   */
  updateEnrollment: async (enrollmentId, updateData) => {
    const response = await api.put(`/enrollments/${enrollmentId}`, updateData);
    return response.data;
  },

  /**
   * Get all enrollments with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} courseId - Filter by course (optional)
   * @param {string} studentId - Filter by student (optional)
   * @param {string} status - Filter by status (optional)
   * @returns {Promise} List of enrollments with pagination info
   */
  getAllEnrollments: async (
    page = 1,
    limit = 10,
    courseId = null,
    studentId = null,
    status = null
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (courseId) params.append("courseId", courseId);
    if (studentId) params.append("studentId", studentId);
    if (status) params.append("status", status);

    const response = await api.get(`/enrollments?${params.toString()}`);
    return response.data;
  },

  /**
   * Create new enrollment
   * @param {Object} enrollmentData - Enrollment data
   * @returns {Promise} Created enrollment
   */
  createEnrollment: async (enrollmentData) => {
    const response = await api.post("/enrollments", enrollmentData);
    return response.data;
  },

  /**
   * Delete enrollment
   * @param {string} enrollmentId - Enrollment ID
   * @returns {Promise} Deletion confirmation
   */
  deleteEnrollment: async (enrollmentId) => {
    const response = await api.delete(`/enrollments/${enrollmentId}`);
    return response.data;
  },
};

export default enrollmentService;
