import api from "./api";

/**
 * Course Post Service
 * Handles course discussion board API operations
 */
export const coursePostService = {
  /**
   * Get posts for a course
   * @param {string} courseId - Course ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} List of posts
   */
  getPostsByCourse: async (courseId, page = 1, limit = 10) => {
    const response = await api.get(
      `/posts/courses/${courseId}/posts?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Get a single post by ID
   * @param {string} postId - Post ID
   * @returns {Promise} Post details
   */
  getPostById: async (postId) => {
    const response = await api.get(`/posts/posts/${postId}`);
    return response.data;
  },

  /**
   * Create a new post
   * @param {Object} postData - Post data (course, title, content)
   * @returns {Promise} Created post
   */
  createPost: async (postData) => {
    const response = await api.post(
      `/posts/courses/${postData.course}/posts`,
      postData
    );
    return response.data;
  },

  /**
   * Update a post
   * @param {string} postId - Post ID
   * @param {Object} updateData - Data to update (title, content)
   * @returns {Promise} Updated post
   */
  updatePost: async (postId, updateData) => {
    const response = await api.put(`/posts/posts/${postId}`, updateData);
    return response.data;
  },

  /**
   * Delete a post
   * @param {string} postId - Post ID
   * @returns {Promise} Deletion confirmation
   */
  deletePost: async (postId) => {
    const response = await api.delete(`/posts/posts/${postId}`);
    return response.data;
  },

  /**
   * Toggle pin status of a post (Faculty only)
   * @param {string} postId - Post ID
   * @returns {Promise} Updated post
   */
  togglePinPost: async (postId) => {
    const response = await api.patch(`/posts/posts/${postId}/pin`);
    return response.data;
  },

  /**
   * Get replies for a post
   * @param {string} postId - Post ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise} List of replies
   */
  getRepliesByPost: async (postId, page = 1, limit = 20) => {
    const response = await api.get(
      `/posts/posts/${postId}/replies?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Create a reply to a post
   * @param {string} postId - Post ID
   * @param {Object} replyData - Reply data (content)
   * @returns {Promise} Created reply
   */
  createReply: async (postId, replyData) => {
    const response = await api.post(
      `/posts/posts/${postId}/replies`,
      replyData
    );
    return response.data;
  },

  /**
   * Update a reply
   * @param {string} postId - Post ID
   * @param {string} replyId - Reply ID
   * @param {Object} updateData - Data to update (content)
   * @returns {Promise} Updated reply
   */
  updateReply: async (replyId, updateData) => {
    const response = await api.put(`/posts/replies/${replyId}`, updateData);
    return response.data;
  },

  /**
   * Delete a reply
   * @param {string} postId - Post ID
   * @param {string} replyId - Reply ID
   * @returns {Promise} Deletion confirmation
   */
  deleteReply: async (replyId) => {
    const response = await api.delete(`/posts/replies/${replyId}`);
    return response.data;
  },
};

export default coursePostService;
