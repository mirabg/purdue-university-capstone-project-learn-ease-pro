const courseRepository = require("../repositories/courseRepository");
const courseDetailRepository = require("../repositories/courseDetailRepository");
const courseFeedbackRepository = require("../repositories/courseFeedbackRepository");

class CourseService {
  /**
   * Create a new course
   */
  async createCourse(courseData) {
    try {
      // Check if course code already exists
      const existingCourse = await courseRepository.findByCourseCode(
        courseData.courseCode
      );
      if (existingCourse) {
        throw new Error("Course code already exists");
      }

      const course = await courseRepository.create(courseData);
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get course by ID with details
   */
  async getCourseById(id, includeDetails = false) {
    try {
      const course = await courseRepository.findById(id);
      if (!course) {
        throw new Error("Course not found");
      }

      if (includeDetails) {
        const details = await courseDetailRepository.findByCourse(id);
        return {
          ...course.toObject(),
          details,
        };
      }

      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all courses with pagination and search
   */
  async getAllCourses(page = 1, limit = 10, search = "") {
    try {
      const skip = (page - 1) * limit;

      // Build search filter
      let filter = {};
      if (search) {
        filter = {
          $or: [
            { courseCode: { $regex: search, $options: "i" } },
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
          ],
        };
      }

      const courses = await courseRepository.findWithPagination(
        filter,
        skip,
        limit
      );
      const total = await courseRepository.count(filter);

      return {
        courses,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course
   */
  async updateCourse(id, updateData, version) {
    try {
      // Don't allow course code to be updated to an existing one
      if (updateData.courseCode) {
        const existingCourse = await courseRepository.findByCourseCode(
          updateData.courseCode
        );
        if (existingCourse && existingCourse._id.toString() !== id) {
          throw new Error("Course code already exists");
        }
      }

      // Use optimistic locking if version is provided
      let course;
      if (version !== undefined) {
        course = await courseRepository.updateWithVersion(
          id,
          version,
          updateData
        );
        if (!course) {
          throw new Error(
            "Course not found or has been modified by another process. Please refresh and try again."
          );
        }
      } else {
        course = await courseRepository.update(id, updateData);
        if (!course) {
          throw new Error("Course not found");
        }
      }

      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete course and all its details
   */
  async deleteCourse(id) {
    try {
      const course = await courseRepository.findById(id);
      if (!course) {
        throw new Error("Course not found");
      }

      // Delete all course details first
      await courseDetailRepository.deleteByCourse(id);

      // Then delete the course
      await courseRepository.delete(id);

      return { message: "Course and all related details deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add detail to course
   */
  async addCourseDetail(detailData) {
    try {
      // Verify course exists
      const course = await courseRepository.findById(detailData.course);
      if (!course) {
        throw new Error("Course not found");
      }

      const detail = await courseDetailRepository.create(detailData);
      return detail;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get course details
   */
  async getCourseDetails(courseId, type = null) {
    try {
      // Verify course exists
      const course = await courseRepository.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      let details;
      if (type) {
        details = await courseDetailRepository.findByType(courseId, type);
      } else {
        details = await courseDetailRepository.findByCourse(courseId);
      }

      return details;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course detail
   */
  async updateCourseDetail(id, updateData) {
    try {
      const detail = await courseDetailRepository.update(id, updateData);
      if (!detail) {
        throw new Error("Course detail not found");
      }
      return detail;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete course detail
   */
  async deleteCourseDetail(id) {
    try {
      const detail = await courseDetailRepository.delete(id);
      if (!detail) {
        throw new Error("Course detail not found");
      }
      return { message: "Course detail deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add or update course feedback
   */
  async addOrUpdateFeedback(userId, courseId, feedbackData) {
    try {
      // Verify course exists
      const course = await courseRepository.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      const feedback = await courseFeedbackRepository.createOrUpdate({
        user: userId,
        course: courseId,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
      });

      return feedback;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get course feedback
   */
  async getCourseFeedback(courseId) {
    try {
      // Verify course exists
      const course = await courseRepository.findById(courseId);
      if (!course) {
        throw new Error("Course not found");
      }

      const feedback = await courseFeedbackRepository.findByCourse(courseId);
      const stats = await courseFeedbackRepository.getAverageRating(courseId);
      const distribution = await courseFeedbackRepository.getRatingDistribution(
        courseId
      );

      return {
        feedback,
        statistics: {
          averageRating: stats.averageRating || 0,
          totalFeedback: stats.totalFeedback || 0,
          ratingDistribution: distribution,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's feedback for a course
   */
  async getUserCourseFeedback(userId, courseId) {
    try {
      const feedback = await courseFeedbackRepository.findByUserAndCourse(
        userId,
        courseId
      );
      return feedback;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete course feedback
   */
  async deleteFeedback(feedbackId, userId, userRole) {
    try {
      const feedback = await courseFeedbackRepository.findById(feedbackId);
      if (!feedback) {
        throw new Error("Feedback not found");
      }

      // Only allow deletion by the feedback owner or admin
      if (feedback.user._id.toString() !== userId && userRole !== "admin") {
        throw new Error("Not authorized to delete this feedback");
      }

      await courseFeedbackRepository.delete(feedbackId);
      return { message: "Feedback deleted successfully" };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CourseService();
