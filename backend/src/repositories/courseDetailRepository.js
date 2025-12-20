const CourseDetail = require("../models/CourseDetail");

class CourseDetailRepository {
  /**
   * Create a new course detail
   */
  async create(detailData) {
    try {
      const detail = await CourseDetail.create(detailData);
      return detail;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find course detail by ID
   */
  async findById(id) {
    try {
      const detail = await CourseDetail.findById(id).populate("course");
      return detail;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all course details for a specific course
   */
  async findByCourse(courseId, filter = {}) {
    try {
      const details = await CourseDetail.find({
        course: courseId,
        ...filter,
      }).sort({ order: 1, createdAt: -1 });
      return details;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find course details by type
   */
  async findByType(courseId, type) {
    try {
      const details = await CourseDetail.find({
        course: courseId,
        type: type,
      }).sort({ order: 1, createdAt: -1 });
      return details;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all course details
   */
  async findAll(filter = {}) {
    try {
      const details = await CourseDetail.find(filter)
        .populate("course")
        .sort({ createdAt: -1 });
      return details;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count course details matching filter
   */
  async count(filter = {}) {
    try {
      const count = await CourseDetail.countDocuments(filter);
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course detail by ID
   */
  async update(id, updateData) {
    try {
      const detail = await CourseDetail.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("course");
      return detail;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete course detail by ID
   */
  async delete(id) {
    try {
      const detail = await CourseDetail.findByIdAndDelete(id);
      return detail;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete all details for a course
   */
  async deleteByCourse(courseId) {
    try {
      const result = await CourseDetail.deleteMany({ course: courseId });
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CourseDetailRepository();
