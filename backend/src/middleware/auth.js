const { verifyToken } = require("../config/jwt");

/**
 * Authorization middleware to check if user can perform action on resource
 */

/**
 * Extract and verify JWT token from request
 */
const extractUser = (req) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return verifyToken(token);
};

/**
 * Check if user is admin or owns the resource
 * @param {String} resourceIdParam - The name of the route parameter containing the resource ID
 */
exports.authorizeAdminOrOwner = (resourceIdParam = "id") => {
  return (req, res, next) => {
    try {
      const user = extractUser(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required. Please provide a valid token.",
        });
      }

      const resourceId = req.params[resourceIdParam];

      // Admin can access any resource
      if (user.role === "admin") {
        req.user = user;
        return next();
      }

      // Non-admin users can only access their own resources
      if (user.id !== resourceId) {
        return res.status(403).json({
          success: false,
          message:
            "Access denied. You can only perform this action on your own account.",
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authorization error",
      });
    }
  };
};

/**
 * Check if user is admin only
 */
exports.requireAdmin = (req, res, next) => {
  try {
    const user = extractUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization error",
    });
  }
};

/**
 * Check if user is authenticated
 */
exports.requireAuth = (req, res, next) => {
  try {
    const user = extractUser(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid token.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};
