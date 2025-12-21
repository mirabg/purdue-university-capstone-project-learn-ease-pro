const courseEnrollmentRepository = require("../repositories/courseEnrollmentRepository");
const courseRepository = require("../repositories/courseRepository");
const userRepository = require("../repositories/userRepository");

class CourseEnrollmentService {
  /**
   * Create a new course enrollment
   */
  async createEnrollment(enrollmentData) {
    try {
      const { course, student, status, comments } = enrollmentData;

      // Validate course exists
      const courseExists = await courseRepository.findById(course);
      if (!courseExists) {
        throw new Error("Course not found");
      }

      // Validate student exists and has student role
      const studentExists = await userRepository.findById(student);
      if (!studentExists) {
        throw new Error("Student not found");
      }
      if (studentExists.role !== "student") {
        throw new Error("User must have student role to enroll");
      }

      // Check if enrollment already exists
      const existingEnrollment =
        await courseEnrollmentRepository.findByCourseAndStudent(
          course,
          student
        );
      if (existingEnrollment) {
        throw new Error("Student is already enrolled in this course");
      }

      // Create enrollment
      const enrollment = await courseEnrollmentRepository.create({
        course,
        student,
        status: status || "pending",
        comments,
      });

      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrollment by ID
   */
  async getEnrollmentById(id) {
    try {
      const enrollment = await courseEnrollmentRepository.findById(id);
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }
      return enrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all enrollments with pagination and filters
   */
  async getAllEnrollments(
    page = 1,
    limit = 10,
    courseId = null,
    studentId = null,
    status = null
  ) {
    try {
      const skip = (page - 1) * limit;

      // Build filter
      let filter = {};
      if (courseId) {
        filter.course = courseId;
      }
      if (studentId) {
        filter.student = studentId;
      }
      if (status) {
        filter.status = status;
      }

      const enrollments = await courseEnrollmentRepository.findWithPagination(
        filter,
        skip,
        limit
      );
      const total = await courseEnrollmentRepository.count(filter);

      return {
        enrollments,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrollments by course
   */
  async getEnrollmentsByCourse(courseId, status = null) {
    try {
      // Validate course exists
      const courseExists = await courseRepository.findById(courseId);
      if (!courseExists) {
        throw new Error("Course not found");
      }

      const enrollments = await courseEnrollmentRepository.findByCourse(
        courseId,
        status
      );
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrollments by student
   */
  async getEnrollmentsByStudent(studentId, status = null) {
    try {
      // Validate student exists
      const studentExists = await userRepository.findById(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const enrollments = await courseEnrollmentRepository.findByStudent(
        studentId,
        status
      );
      return enrollments;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update enrollment status
   */
  async updateEnrollmentStatus(id, status, comments) {
    try {
      // Validate status
      if (!["pending", "accepted", "denied"].includes(status)) {
        throw new Error(
          "Invalid status. Must be 'pending', 'accepted', or 'denied'"
        );
      }

      const enrollment = await courseEnrollmentRepository.findById(id);
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      // Update enrollment
      const updatedEnrollment = await courseEnrollmentRepository.update(id, {
        status,
        comments,
      });

      return updatedEnrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update enrollment
   */
  async updateEnrollment(id, updateData) {
    try {
      const enrollment = await courseEnrollmentRepository.findById(id);
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      // Validate status if provided
      if (
        updateData.status &&
        !["pending", "accepted", "denied"].includes(updateData.status)
      ) {
        throw new Error(
          "Invalid status. Must be 'pending', 'accepted', or 'denied'"
        );
      }

      // If changing course or student, check for duplicates
      if (updateData.course || updateData.student) {
        const courseId = updateData.course || enrollment.course._id;
        const studentId = updateData.student || enrollment.student._id;

        const existingEnrollment =
          await courseEnrollmentRepository.findByCourseAndStudent(
            courseId,
            studentId
          );

        if (existingEnrollment && existingEnrollment._id.toString() !== id) {
          throw new Error("Student is already enrolled in this course");
        }
      }

      const updatedEnrollment = await courseEnrollmentRepository.update(
        id,
        updateData
      );
      return updatedEnrollment;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete enrollment
   */
  async deleteEnrollment(id) {
    try {
      const enrollment = await courseEnrollmentRepository.findById(id);
      if (!enrollment) {
        throw new Error("Enrollment not found");
      }

      await courseEnrollmentRepository.delete(id);
      return { message: "Enrollment deleted successfully" };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrollment statistics for a course
   */
  async getCourseEnrollmentStats(courseId) {
    try {
      const courseExists = await courseRepository.findById(courseId);
      if (!courseExists) {
        throw new Error("Course not found");
      }

      const total = await courseEnrollmentRepository.countByCourse(courseId);
      const pending = await courseEnrollmentRepository.countByCourse(
        courseId,
        "pending"
      );
      const accepted = await courseEnrollmentRepository.countByCourse(
        courseId,
        "accepted"
      );
      const denied = await courseEnrollmentRepository.countByCourse(
        courseId,
        "denied"
      );

      return {
        courseId,
        total,
        pending,
        accepted,
        denied,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enrollment statistics for a student
   */
  async getStudentEnrollmentStats(studentId) {
    try {
      const studentExists = await userRepository.findById(studentId);
      if (!studentExists) {
        throw new Error("Student not found");
      }

      const total = await courseEnrollmentRepository.countByStudent(studentId);
      const pending = await courseEnrollmentRepository.countByStudent(
        studentId,
        "pending"
      );
      const accepted = await courseEnrollmentRepository.countByStudent(
        studentId,
        "accepted"
      );
      const denied = await courseEnrollmentRepository.countByStudent(
        studentId,
        "denied"
      );

      return {
        studentId,
        total,
        pending,
        accepted,
        denied,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new CourseEnrollmentService();
