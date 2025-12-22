import api from "./api";

/**
 * Course Enrollment Service
 * Handles course enrollment-related API operations
 */
export const courseEnrollmentService = {
  /**
   * Create new enrollment
   * @param {Object} enrollmentData - Enrollment data (course, student, status, comments)
   * @returns {Promise} Created enrollment data
   */
  createEnrollment: async (enrollmentData) => {
    const response = await api.post("/enrollments", enrollmentData);
    return response.data;
  },

  /**
   * Get all enrollments with pagination and filters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @param {string} courseId - Filter by course ID
   * @param {string} studentId - Filter by student ID
   * @param {string} status - Filter by status (pending, accepted, denied)
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

    if (courseId) {
      params.append("courseId", courseId);
    }
    if (studentId) {
      params.append("studentId", studentId);
    }
    if (status) {
      params.append("status", status);
    }

    const response = await api.get(`/enrollments?${params.toString()}`);
    return response.data;
  },

  /**
   * Get enrollment by ID
   * @param {string} id - Enrollment ID
   * @returns {Promise} Enrollment data
   */
  getEnrollmentById: async (id) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  /**
   * Get enrollments by course
   * @param {string} courseId - Course ID
   * @param {string} status - Filter by status (optional)
   * @returns {Promise} List of enrollments for the course
   */
  getEnrollmentsByCourse: async (courseId, status = null) => {
    const params = status ? `?status=${status}` : "";
    const response = await api.get(`/enrollments/course/${courseId}${params}`);
    return response.data;
  },

  /**
   * Get enrollments by student
   * @param {string} studentId - Student ID
   * @param {string} status - Filter by status (optional)
   * @returns {Promise} List of enrollments for the student
   */
  getEnrollmentsByStudent: async (studentId, status = null) => {
    const params = status ? `?status=${status}` : "";
    const response = await api.get(
      `/enrollments/student/${studentId}${params}`
    );
    return response.data;
  },

  /**
   * Update enrollment
   * @param {string} id - Enrollment ID
   * @param {Object} enrollmentData - Updated enrollment data
   * @returns {Promise} Updated enrollment data
   */
  updateEnrollment: async (id, enrollmentData) => {
    const response = await api.put(`/enrollments/${id}`, enrollmentData);
    return response.data;
  },

  /**
   * Update enrollment status
   * @param {string} id - Enrollment ID
   * @param {string} status - New status (pending, accepted, denied)
   * @param {string} comments - Status comments (optional)
   * @returns {Promise} Updated enrollment data
   */
  updateEnrollmentStatus: async (id, status, comments = null) => {
    const response = await api.patch(`/enrollments/${id}/status`, {
      status,
      comments,
    });
    return response.data;
  },

  /**
   * Delete enrollment
   * @param {string} id - Enrollment ID
   * @returns {Promise} Deletion confirmation
   */
  deleteEnrollment: async (id) => {
    const response = await api.delete(`/enrollments/${id}`);
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
   * Get enrollment statistics for a student
   * @param {string} studentId - Student ID
   * @returns {Promise} Enrollment statistics
   */
  getStudentEnrollmentStats: async (studentId) => {
    const response = await api.get(`/enrollments/student/${studentId}/stats`);
    return response.data;
  },

  /**
   * Get global enrollment statistics (all enrollments)
   * @returns {Promise} Global enrollment statistics
   */
  getGlobalEnrollmentStats: async () => {
    const response = await api.get(`/enrollments/stats`);
    return response.data;
  },
};

export default courseEnrollmentService;
