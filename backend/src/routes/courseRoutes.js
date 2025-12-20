const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const uploadController = require("../controllers/uploadController");
const upload = require("../middleware/upload");
const { requireAuth, requireAdmin } = require("../middleware/auth");

// Helper middleware to check if user is admin or faculty
const requireAdminOrFaculty = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "faculty") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin or Faculty role required.",
    });
  }
};

// Course CRUD operations
router.post(
  "/",
  requireAuth,
  requireAdminOrFaculty,
  courseController.createCourse
);
router.get("/", requireAuth, courseController.getAllCourses);
router.get("/:id", requireAuth, courseController.getCourseById);
router.put(
  "/:id",
  requireAuth,
  requireAdminOrFaculty,
  courseController.updateCourse
);
router.delete("/:id", requireAuth, requireAdmin, courseController.deleteCourse);

// File upload for course materials
router.post(
  "/:id/upload",
  requireAuth,
  requireAdminOrFaculty,
  upload.single("file"),
  uploadController.uploadCourseMaterial
);

// Course details operations
router.post(
  "/:id/details",
  requireAuth,
  requireAdminOrFaculty,
  courseController.addCourseDetail
);
router.get("/:id/details", requireAuth, courseController.getCourseDetails);
router.put(
  "/details/:detailId",
  requireAuth,
  requireAdminOrFaculty,
  courseController.updateCourseDetail
);
router.delete(
  "/details/:detailId",
  requireAuth,
  requireAdminOrFaculty,
  courseController.deleteCourseDetail
);
router.delete(
  "/materials/:detailId",
  requireAuth,
  requireAdminOrFaculty,
  uploadController.deleteCourseMaterial
);

// Course feedback operations
router.post("/:id/feedback", requireAuth, courseController.addOrUpdateFeedback);
router.get("/:id/feedback", requireAuth, courseController.getCourseFeedback);
router.get(
  "/:id/feedback/my",
  requireAuth,
  courseController.getMyCourseFeedback
);
router.delete(
  "/feedback/:feedbackId",
  requireAuth,
  courseController.deleteFeedback
);

module.exports = router;
