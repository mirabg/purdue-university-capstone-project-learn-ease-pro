const Course = require("../models/Course");

class CourseRepository {
  /**
   * Create a new course
   */
  async create(courseData) {
    try {
      const course = await Course.create(courseData);
      // Populate instructor after creation
      if (course.instructor) {
        await course.populate("instructor", "firstName lastName email");
      }
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find course by ID
   */
  async findById(id) {
    try {
      const course = await Course.findById(id).populate(
        "instructor",
        "firstName lastName email"
      );
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find course by course code
   */
  async findByCourseCode(courseCode) {
    try {
      const course = await Course.findOne({
        courseCode: courseCode.toUpperCase(),
      });
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all courses
   */
  async findAll(filter = {}) {
    try {
      const courses = await Course.find(filter)
        .populate("instructor", "firstName lastName email")
        .sort({ courseCode: 1 });
      return courses;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find courses with pagination
   */
  async findWithPagination(filter = {}, skip = 0, limit = 10) {
    try {
      const courses = await Course.find(filter)
        .populate("instructor", "firstName lastName email")
        .skip(skip)
        .limit(limit)
        .sort({ courseCode: 1 });
      return courses;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count courses matching filter
   */
  async count(filter = {}) {
    try {
      const count = await Course.countDocuments(filter);
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course by ID
   */
  async update(id, updateData) {
    try {
      const course = await Course.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate("instructor", "firstName lastName email");
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update course by ID with optimistic locking
   */
  async updateWithVersion(id, version, updateData) {
    try {
      const course = await Course.findOneAndUpdate(
        { _id: id, __v: version },
        { $set: updateData, $inc: { __v: 1 } },
        {
          new: true,
          runValidators: true,
        }
      );
      return course;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete course by ID
   */
  async delete(id) {
    try {
      const course = await Course.findByIdAndDelete(id);
      return course;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CourseRepository();
