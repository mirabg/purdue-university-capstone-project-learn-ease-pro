const coursePostService = require("../services/coursePostService");

/**
 * @desc    Create a new post for a course
 * @route   POST /api/courses/:courseId/posts
 * @access  Private (all authenticated users)
 */
exports.createPost = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Please provide title and content",
      });
    }

    const post = await coursePostService.createPost({
      course: courseId,
      user: userId,
      title,
      content,
    });

    res.status(201).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all posts for a course
 * @route   GET /api/courses/:courseId/posts
 * @access  Private
 */
exports.getPostsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await coursePostService.getPostsByCourse(courseId, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get a single post by ID
 * @route   GET /api/posts/:id
 * @access  Private
 */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await coursePostService.getPostById(id);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update a post
 * @route   PUT /api/posts/:id
 * @access  Private (owner or faculty)
 */
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const post = await coursePostService.updatePost(id, userId, userRole, {
      title,
      content,
    });

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 * @access  Private (owner or faculty)
 */
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await coursePostService.deletePost(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Toggle pin status of a post
 * @route   PATCH /api/posts/:id/pin
 * @access  Private (faculty only)
 */
exports.togglePinPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;

    const post = await coursePostService.togglePinPost(id, userRole);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Create a reply to a post
 * @route   POST /api/posts/:postId/replies
 * @access  Private (all authenticated users)
 */
exports.createReply = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: "Please provide content",
      });
    }

    const reply = await coursePostService.createReply({
      post: postId,
      user: userId,
      content,
    });

    res.status(201).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all replies for a post
 * @route   GET /api/posts/:postId/replies
 * @access  Private
 */
exports.getRepliesByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const result = await coursePostService.getRepliesByPost(postId, {
      page,
      limit,
    });

    res.status(200).json({
      success: true,
      data: result.replies,
      pagination: {
        total: result.total,
        page: result.page,
        pages: result.pages,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update a reply
 * @route   PUT /api/replies/:id
 * @access  Private (owner or faculty)
 */
exports.updateReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const reply = await coursePostService.updateReply(id, userId, userRole, {
      content,
    });

    res.status(200).json({
      success: true,
      data: reply,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete a reply
 * @route   DELETE /api/replies/:id
 * @access  Private (owner or faculty)
 */
exports.deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    await coursePostService.deleteReply(id, userId, userRole);

    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
