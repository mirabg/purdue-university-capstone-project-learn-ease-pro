const CoursePost = require("../models/CoursePost");
const CoursePostReply = require("../models/CoursePostReply");

class CoursePostRepository {
  /**
   * Create a new post
   */
  async create(postData) {
    try {
      const post = await CoursePost.create(postData);
      await post.populate("user", "firstName lastName email role");
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find post by ID
   */
  async findById(id) {
    try {
      const post = await CoursePost.findOne({ _id: id, isDeleted: false })
        .populate("user", "firstName lastName email role")
        .populate("course", "courseCode name");
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all posts for a course
   */
  async findByCourse(courseId, options = {}) {
    try {
      const { page = 1, limit = 20, sortBy = "-isPinned -createdAt" } = options;
      const skip = (page - 1) * limit;

      const posts = await CoursePost.find({
        course: courseId,
        isDeleted: false,
      })
        .populate("user", "firstName lastName email role")
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

      const total = await CoursePost.countDocuments({
        course: courseId,
        isDeleted: false,
      });

      return {
        posts,
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a post
   */
  async update(id, updateData) {
    try {
      const post = await CoursePost.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("user", "firstName lastName email role");
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Soft delete a post
   */
  async delete(id) {
    try {
      const post = await CoursePost.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
      return post;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle pin status
   */
  async togglePin(id) {
    try {
      const post = await CoursePost.findById(id);
      if (!post) return null;
      post.isPinned = !post.isPinned;
      await post.save();
      await post.populate("user", "firstName lastName email role");
      return post;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CoursePostRepository();
