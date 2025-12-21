const CourseEnrollment = require("../models/CourseEnrollment");

class CourseEnrollmentRepository {
  /**
   * Create a new course enrollment
   */
  async create(enrollmentData) {
    try {
      const enrollment = await CourseEnrollment.create(enrollmentData);
      // Populate course and student after creation
      await enrollment.populate([
        {
          path: "course",
          select: "courseCode name description instructor",
          populate: {
            path: "instructor",
            select: "firstName lastName email",
          },
        },
        {
          path: "student",
          select: "firstName lastName email",
        },
      ]);
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find enrollment by ID
   */
  async findById(id) {
    try {
      const enrollment = await CourseEnrollment.findById(id).populate([
        {
          path: "course",
          select: "courseCode name description instructor",
          populate: {
            path: "instructor",
            select: "firstName lastName email",
          },
        },
        {
          path: "student",
          select: "firstName lastName email",
        },
      ]);
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find enrollment by course and student
   */
  async findByCourseAndStudent(courseId, studentId) {
    try {
      const enrollment = await CourseEnrollment.findOne({
        course: courseId,
        student: studentId,
      }).populate([
        {
          path: "course",
          select: "courseCode name description instructor",
        },
        {
          path: "student",
          select: "firstName lastName email",
        },
      ]);
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find all enrollments with filter
   */
  async findAll(filter = {}) {
    try {
      const enrollments = await CourseEnrollment.find(filter)
        .populate([
          {
            path: "course",
            select: "courseCode name description instructor",
            populate: {
              path: "instructor",
              select: "firstName lastName email",
            },
          },
          {
            path: "student",
            select: "firstName lastName email",
          },
        ])
        .sort({ createdAt: -1 });
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find enrollments with pagination
   */
  async findWithPagination(filter = {}, skip = 0, limit = 10) {
    try {
      const enrollments = await CourseEnrollment.find(filter)
        .populate([
          {
            path: "course",
            select: "courseCode name description instructor",
            populate: {
              path: "instructor",
              select: "firstName lastName email",
            },
          },
          {
            path: "student",
            select: "firstName lastName email",
          },
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find enrollments by course
   */
  async findByCourse(courseId, status = null) {
    try {
      const filter = { course: courseId };
      if (status) {
        filter.status = status;
      }
      const enrollments = await CourseEnrollment.find(filter)
        .populate("student", "firstName lastName email")
        .sort({ createdAt: -1 });
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Find enrollments by student
   */
  async findByStudent(studentId, status = null) {
    try {
      const filter = { student: studentId };
      if (status) {
        filter.status = status;
      }
      const enrollments = await CourseEnrollment.find(filter)
        .populate({
          path: "course",
          select: "courseCode name description instructor isActive",
          populate: {
            path: "instructor",
            select: "firstName lastName email",
          },
        })
        .sort({ createdAt: -1 });
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update enrollment
   */
  async update(id, updateData) {
    try {
      const enrollment = await CourseEnrollment.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      ).populate([
        {
          path: "course",
          select: "courseCode name description instructor",
          populate: {
            path: "instructor",
            select: "firstName lastName email",
          },
        },
        {
          path: "student",
          select: "firstName lastName email",
        },
      ]);
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete enrollment
   */
  async delete(id) {
    try {
      const enrollment = await CourseEnrollment.findByIdAndDelete(id);
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count enrollments
   */
  async count(filter = {}) {
    try {
      const count = await CourseEnrollment.countDocuments(filter);
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count enrollments by course
   */
  async countByCourse(courseId, status = null) {
    try {
      const filter = { course: courseId };
      if (status) {
        filter.status = status;
      }
      const count = await CourseEnrollment.countDocuments(filter);
      return count;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Count enrollments by student
   */
  async countByStudent(studentId, status = null) {
    try {
      const filter = { student: studentId };
      if (status) {
        filter.status = status;
      }
      const count = await CourseEnrollment.countDocuments(filter);
      return count;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CourseEnrollmentRepository();
