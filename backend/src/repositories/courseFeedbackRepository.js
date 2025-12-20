const CourseFeedback = require("../models/CourseFeedback");

class CourseFeedbackRepository {
  /**
   * Create or update feedback
   */
  async createOrUpdate(feedbackData) {
    try {
      // Use findOneAndUpdate with upsert to create or update
      const feedback = await CourseFeedback.findOneAndUpdate(
        {
          course: feedbackData.course,
          user: feedbackData.user,
        },
        feedbackData,
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).populate("user", "firstName lastName email");
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find feedback by ID
   */
  async findById(id) {
    try {
      const feedback = await CourseFeedback.findById(id)
        .populate("course", "courseCode name")
        .populate("user", "firstName lastName email");
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all feedback for a course
   */
  async findByCourse(courseId, filter = {}) {
    try {
      const feedback = await CourseFeedback.find({
        course: courseId,
        ...filter,
      })
        .populate("user", "firstName lastName email")
        .sort({ createdAt: -1 });
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find feedback by user and course
   */
  async findByUserAndCourse(userId, courseId) {
    try {
      const feedback = await CourseFeedback.findOne({
        user: userId,
        course: courseId,
      })
        .populate("course", "courseCode name")
        .populate("user", "firstName lastName email");
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get average rating for a course
   */
  async getAverageRating(courseId) {
    try {
      const mongoose = require("mongoose");
      const result = await CourseFeedback.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
          $group: {
            _id: "$course",
            averageRating: { $avg: "$rating" },
            totalFeedback: { $sum: 1 },
          },
        },
      ]);
      return result[0] || { averageRating: 0, totalFeedback: 0 };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get rating distribution for a course
   */
  async getRatingDistribution(courseId) {
    try {
      const mongoose = require("mongoose");
      const result = await CourseFeedback.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(courseId) } },
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]);
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count feedback for a course
   */
  async count(filter = {}) {
    try {
      const count = await CourseFeedback.countDocuments(filter);
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete feedback by ID
   */
  async delete(id) {
    try {
      const feedback = await CourseFeedback.findByIdAndDelete(id);
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete all feedback for a course
   */
  async deleteByCourse(courseId) {
    try {
      const result = await CourseFeedback.deleteMany({ course: courseId });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CourseFeedbackRepository();
