const coursePostRepository = require("../repositories/coursePostRepository");
const coursePostReplyRepository = require("../repositories/coursePostReplyRepository");
const courseRepository = require("../repositories/courseRepository");

class CoursePostService {
  /**
   * Create a new post
   */
  async createPost(postData) {
    try {
      // Verify course exists
      const course = await courseRepository.findById(postData.course);
      if (!course) {
        throw new Error("Course not found");
      }

      const post = await coursePostRepository.create(postData);
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get post by ID
   */
  async getPostById(id) {
    try {
      const post = await coursePostRepository.findById(id);
      if (!post) {
        throw new Error("Post not found");
      }
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all posts for a course
   */
  async getPostsByCourse(courseId, options = {}) {
    try {
      // Verify course exists
      const course = await courseRepository.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      const result = await coursePostRepository.findByCourse(courseId, options);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a post
   */
  async updatePost(id, userId, userRole, updateData) {
    try {
      const post = await coursePostRepository.findById(id);
      if (!post) {
        throw new Error("Post not found");
      }

      // Check permissions: owner or faculty can edit
      if (post.user._id.toString() !== userId && userRole !== "faculty") {
        throw new Error("Not authorized to update this post");
      }

      // Only allow updating title and content
      const allowedUpdates = {
        title: updateData.title,
        content: updateData.content,
      };

      const updatedPost = await coursePostRepository.update(id, allowedUpdates);
      return updatedPost;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a post
   */
  async deletePost(id, userId, userRole) {
    try {
      const post = await coursePostRepository.findById(id);
      if (!post) {
        throw new Error("Post not found");
      }

      // Check permissions: owner or faculty can delete
      if (post.user._id.toString() !== userId && userRole !== "faculty") {
        throw new Error("Not authorized to delete this post");
      }

      await coursePostRepository.delete(id);
      return { message: "Post deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle pin status (faculty only)
   */
  async togglePinPost(id, userRole) {
    try {
      if (userRole !== "faculty") {
        throw new Error("Only faculty can pin/unpin posts");
      }

      const post = await coursePostRepository.findById(id);
      if (!post) {
        throw new Error("Post not found");
      }

      const updatedPost = await coursePostRepository.togglePin(id);
      return updatedPost;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a reply to a post
   */
  async createReply(replyData) {
    try {
      // Verify post exists
      const post = await coursePostRepository.findById(replyData.post);
      if (!post) {
        throw new Error("Post not found");
      }

      const reply = await coursePostReplyRepository.create(replyData);
      return reply;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all replies for a post
   */
  async getRepliesByPost(postId, options = {}) {
    try {
      // Verify post exists
      const post = await coursePostRepository.findById(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      const result = await coursePostReplyRepository.findByPost(
        postId,
        options
      );
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a reply
   */
  async updateReply(id, userId, userRole, updateData) {
    try {
      const reply = await coursePostReplyRepository.findById(id);
      if (!reply) {
        throw new Error("Reply not found");
      }

      // Check permissions: owner or faculty can edit
      if (reply.user._id.toString() !== userId && userRole !== "faculty") {
        throw new Error("Not authorized to update this reply");
      }

      // Only allow updating content
      const allowedUpdates = {
        content: updateData.content,
      };

      const updatedReply = await coursePostReplyRepository.update(
        id,
        allowedUpdates
      );
      return updatedReply;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a reply
   */
  async deleteReply(id, userId, userRole) {
    try {
      const reply = await coursePostReplyRepository.findById(id);
      if (!reply) {
        throw new Error("Reply not found");
      }

      // Check permissions: owner or faculty can delete
      if (reply.user._id.toString() !== userId && userRole !== "faculty") {
        throw new Error("Not authorized to delete this reply");
      }

      await coursePostReplyRepository.delete(id);
      return { message: "Reply deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CoursePostService();
