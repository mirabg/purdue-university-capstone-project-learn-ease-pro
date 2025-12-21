const CoursePostReply = require("../models/CoursePostReply");

class CoursePostReplyRepository {
  /**
   * Create a new reply
   */
  async create(replyData) {
    try {
      const reply = await CoursePostReply.create(replyData);
      await reply.populate("user", "firstName lastName email role");
      return reply;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find reply by ID
   */
  async findById(id) {
    try {
      const reply = await CoursePostReply.findOne({
        _id: id,
        isDeleted: false,
      }).populate("user", "firstName lastName email role");
      return reply;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all replies for a post
   */
  async findByPost(postId, options = {}) {
    try {
      const { page = 1, limit = 50, sortBy = "createdAt" } = options;
      const skip = (page - 1) * limit;

      const replies = await CoursePostReply.find({
        post: postId,
        isDeleted: false,
      })
        .populate("user", "firstName lastName email role")
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const total = await CoursePostReply.countDocuments({
        post: postId,
        isDeleted: false,
      });

      return {
        replies,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a reply
   */
  async update(id, updateData) {
    try {
      const reply = await CoursePostReply.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("user", "firstName lastName email role");
      return reply;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Soft delete a reply
   */
  async delete(id) {
    try {
      const reply = await CoursePostReply.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
      return reply;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count replies for a post
   */
  async countByPost(postId) {
    try {
      const count = await CoursePostReply.countDocuments({
        post: postId,
        isDeleted: false,
      });
      return count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CoursePostReplyRepository();
