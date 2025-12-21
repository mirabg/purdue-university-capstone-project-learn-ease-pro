const express = require("express");
const router = express.Router();
const coursePostController = require("../controllers/coursePostController");
const { requireAuth } = require("../middleware/auth");

// Helper middleware to check if user is faculty
const requireFaculty = (req, res, next) => {
  if (req.user.role === "faculty") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Faculty role required.",
    });
  }
};

// Posts routes for a specific course
router.post(
  "/courses/:courseId/posts",
  requireAuth,
  coursePostController.createPost
);
router.get(
  "/courses/:courseId/posts",
  requireAuth,
  coursePostController.getPostsByCourse
);

// Individual post routes
router.get("/posts/:id", requireAuth, coursePostController.getPostById);
router.put("/posts/:id", requireAuth, coursePostController.updatePost);
router.delete("/posts/:id", requireAuth, coursePostController.deletePost);
router.patch(
  "/posts/:id/pin",
  requireAuth,
  requireFaculty,
  coursePostController.togglePinPost
);

// Reply routes
router.post(
  "/posts/:postId/replies",
  requireAuth,
  coursePostController.createReply
);
router.get(
  "/posts/:postId/replies",
  requireAuth,
  coursePostController.getRepliesByPost
);
router.put("/replies/:id", requireAuth, coursePostController.updateReply);
router.delete("/replies/:id", requireAuth, coursePostController.deleteReply);

module.exports = router;
