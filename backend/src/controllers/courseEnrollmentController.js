const courseEnrollmentService = require("../services/courseEnrollmentService");

/**
 * @desc    Create new enrollment
 * @route   POST /api/enrollments
 * @access  Private (Student or Admin)
 */
exports.createEnrollment = async (req, res) => {
  try {
    const { course, student, status, comments } = req.body;

    // Validate input
    if (!course || !student) {
      return res.status(400).json({
        success: false,
        message: "Please provide course and student",
      });
    }

    // Students can only enroll themselves
    if (req.user.role === "student" && req.user.id !== student) {
      return res.status(403).json({
        success: false,
        message: "Students can only enroll themselves",
      });
    }

    const enrollment = await courseEnrollmentService.createEnrollment({
      course,
      student,
      status,
      comments,
    });

    res.status(201).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all enrollments
 * @route   GET /api/enrollments
 * @access  Private
 */
exports.getAllEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 10, courseId, studentId, status } = req.query;

    // Students can only view their own enrollments
    let finalStudentId = studentId;
    if (req.user.role === "student") {
      finalStudentId = req.user.id;
    }

    const result = await courseEnrollmentService.getAllEnrollments(
      parseInt(page),
      parseInt(limit),
      courseId,
      finalStudentId,
      status
    );

    res.status(200).json({
      success: true,
      count: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.enrollments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get enrollment by ID
 * @route   GET /api/enrollments/:id
 * @access  Private
 */
exports.getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await courseEnrollmentService.getEnrollmentById(
      req.params.id
    );

    // Students can only view their own enrollments
    if (
      req.user.role === "student" &&
      enrollment.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get enrollments by course
 * @route   GET /api/enrollments/course/:courseId
 * @access  Private (Faculty/Admin)
 */
exports.getEnrollmentsByCourse = async (req, res) => {
  try {
    const { status } = req.query;
    const enrollments = await courseEnrollmentService.getEnrollmentsByCourse(
      req.params.courseId,
      status
    );

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get enrollments by student
 * @route   GET /api/enrollments/student/:studentId
 * @access  Private
 */
exports.getEnrollmentsByStudent = async (req, res) => {
  try {
    // Students can only view their own enrollments
    if (req.user.role === "student" && req.params.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const { status } = req.query;
    const enrollments = await courseEnrollmentService.getEnrollmentsByStudent(
      req.params.studentId,
      status
    );

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update enrollment
 * @route   PUT /api/enrollments/:id
 * @access  Private (Admin/Faculty)
 */
exports.updateEnrollment = async (req, res) => {
  try {
    const updateData = req.body;

    const enrollment = await courseEnrollmentService.updateEnrollment(
      req.params.id,
      updateData
    );

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update enrollment status
 * @route   PATCH /api/enrollments/:id/status
 * @access  Private (Admin/Faculty)
 */
exports.updateEnrollmentStatus = async (req, res) => {
  try {
    const { status, comments } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide status",
      });
    }

    const enrollment = await courseEnrollmentService.updateEnrollmentStatus(
      req.params.id,
      status,
      comments
    );

    res.status(200).json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete enrollment
 * @route   DELETE /api/enrollments/:id
 * @access  Private (Student can delete their own, Admin can delete any)
 */
exports.deleteEnrollment = async (req, res) => {
  try {
    // Get enrollment first to check ownership
    const enrollment = await courseEnrollmentService.getEnrollmentById(
      req.params.id
    );

    // Students can only delete their own enrollments
    if (
      req.user.role === "student" &&
      enrollment.student._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const result = await courseEnrollmentService.deleteEnrollment(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get enrollment statistics for a course
 * @route   GET /api/enrollments/course/:courseId/stats
 * @access  Private (Faculty/Admin)
 */
exports.getCourseEnrollmentStats = async (req, res) => {
  try {
    const stats = await courseEnrollmentService.getCourseEnrollmentStats(
      req.params.courseId
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get enrollment statistics for a student
 * @route   GET /api/enrollments/student/:studentId/stats
 * @access  Private
 */
exports.getStudentEnrollmentStats = async (req, res) => {
  try {
    // Students can only view their own stats
    if (req.user.role === "student" && req.params.studentId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const stats = await courseEnrollmentService.getStudentEnrollmentStats(
      req.params.studentId
    );

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get global enrollment statistics
 * @route   GET /api/enrollments/stats
 * @access  Private (Admin only)
 */
exports.getGlobalEnrollmentStats = async (req, res) => {
  try {
    const stats = await courseEnrollmentService.getGlobalEnrollmentStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
