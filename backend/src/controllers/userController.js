const userService = require("../services/userService");
const { generateToken } = require("../config/jwt");

/**
 * @desc    Register new user
 * @route   POST /api/users/register
 * @access  Public
 */
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      address,
      city,
      state,
      zipcode,
      phone,
      role,
    } = req.body;

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (firstName, lastName, email, password)",
      });
    }

    const user = await userService.registerUser({
      firstName,
      lastName,
      email,
      password,
      address,
      city,
      state,
      zipcode,
      phone,
      role,
    });

    // Generate JWT token
    const token = generateToken(
      user._id.toString(),
      user.role,
      user.email,
      user.firstName
    );

    res.status(201).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await userService.authenticateUser(email, password);

    // Generate JWT token
    const token = generateToken(
      user._id.toString(),
      user.role,
      user.email,
      user.firstName
    );

    res.status(200).json({
      success: true,
      data: user,
      token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Public (should be protected in production)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Public (should be protected in production)
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Public (should be protected in production)
 * @note    Include __v in request body for optimistic locking
 */
exports.updateUser = async (req, res) => {
  try {
    // Extract version from request body if provided
    const { __v, ...updateData } = req.body;

    const user = await userService.updateUser(req.params.id, updateData, __v);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Public (should be protected in production)
 */
exports.deleteUser = async (req, res) => {
  try {
    const result = await userService.deleteUser(req.params.id);

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
