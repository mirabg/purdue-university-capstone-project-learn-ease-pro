const jwt = require("jsonwebtoken");

/**
 * Generate JWT token for user
 */
const generateToken = (userId, role, email, firstName) => {
  return jwt.sign(
    { id: userId, role: role, email: email, firstName: firstName },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
};

/**
 * Verify JWT token and extract user data
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
