const courseService = require("../services/courseService");

/**
 * @desc    Create new course
 * @route   POST /api/courses
 * @access  Admin/Faculty
 */
exports.createCourse = async (req, res) => {
  try {
    const { courseCode, name, description, isActive, instructor } = req.body;

    // Validate input
    if (!courseCode || !name || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (courseCode, name, description)",
      });
    }

    const course = await courseService.createCourse({
      courseCode,
      name,
      description,
      instructor: instructor || undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all courses
 * @route   GET /api/courses
 * @access  Private
 */
exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const result = await courseService.getAllCourses(
      parseInt(page),
      parseInt(limit),
      search
    );

    res.status(200).json({
      success: true,
      count: result.total,
      page: result.page,
      totalPages: result.totalPages,
      data: result.courses,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get course by ID
 * @route   GET /api/courses/:id
 * @access  Private
 */
exports.getCourseById = async (req, res) => {
  try {
    const { includeDetails } = req.query;
    const course = await courseService.getCourseById(
      req.params.id,
      includeDetails === "true"
    );

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update course
 * @route   PUT /api/courses/:id
 * @access  Admin/Faculty
 */
exports.updateCourse = async (req, res) => {
  try {
    const { __v, ...updateData } = req.body;

    const course = await courseService.updateCourse(
      req.params.id,
      updateData,
      __v
    );

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete course
 * @route   DELETE /api/courses/:id
 * @access  Admin
 */
exports.deleteCourse = async (req, res) => {
  try {
    const result = await courseService.deleteCourse(req.params.id);

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
 * @desc    Add course detail
 * @route   POST /api/courses/:id/details
 * @access  Admin/Faculty
 */
exports.addCourseDetail = async (req, res) => {
  try {
    const { title, type, url, description, order, isActive } = req.body;

    // Validate input
    if (!title || !type || !url) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (title, type, url)",
      });
    }

    const detail = await courseService.addCourseDetail({
      course: req.params.id,
      title,
      type,
      url,
      description,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get course details
 * @route   GET /api/courses/:id/details
 * @access  Private
 */
exports.getCourseDetails = async (req, res) => {
  try {
    const { type } = req.query;
    const details = await courseService.getCourseDetails(req.params.id, type);

    res.status(200).json({
      success: true,
      count: details.length,
      data: details,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update course detail
 * @route   PUT /api/courses/details/:detailId
 * @access  Admin/Faculty
 */
exports.updateCourseDetail = async (req, res) => {
  try {
    const detail = await courseService.updateCourseDetail(
      req.params.detailId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: detail,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete course detail
 * @route   DELETE /api/courses/details/:detailId
 * @access  Admin/Faculty
 */
exports.deleteCourseDetail = async (req, res) => {
  try {
    const result = await courseService.deleteCourseDetail(req.params.detailId);

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
 * @desc    Add or update course feedback
 * @route   POST /api/courses/:id/feedback
 * @access  Private (Students)
 */
exports.addOrUpdateFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate input
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: "Please provide a rating",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const feedback = await courseService.addOrUpdateFeedback(
      req.user.id,
      req.params.id,
      { rating, comment }
    );

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get course feedback
 * @route   GET /api/courses/:id/feedback
 * @access  Private
 */
exports.getCourseFeedback = async (req, res) => {
  try {
    const result = await courseService.getCourseFeedback(req.params.id);

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
 * @desc    Get user's feedback for a course
 * @route   GET /api/courses/:id/feedback/my
 * @access  Private
 */
exports.getMyCourseFeedback = async (req, res) => {
  try {
    const feedback = await courseService.getUserCourseFeedback(
      req.user.id,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete course feedback
 * @route   DELETE /api/courses/feedback/:feedbackId
 * @access  Private (Owner or Admin)
 */
exports.deleteFeedback = async (req, res) => {
  try {
    const result = await courseService.deleteFeedback(
      req.params.feedbackId,
      req.user.id,
      req.user.role
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
