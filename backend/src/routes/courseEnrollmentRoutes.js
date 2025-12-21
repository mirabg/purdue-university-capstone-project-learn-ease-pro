const express = require("express");
const router = express.Router();
const courseEnrollmentController = require("../controllers/courseEnrollmentController");
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

// Enrollment CRUD operations
router.post("/", requireAuth, courseEnrollmentController.createEnrollment);
router.get("/", requireAuth, courseEnrollmentController.getAllEnrollments);
router.get("/:id", requireAuth, courseEnrollmentController.getEnrollmentById);
router.put(
  "/:id",
  requireAuth,
  requireAdminOrFaculty,
  courseEnrollmentController.updateEnrollment
);
router.patch(
  "/:id/status",
  requireAuth,
  requireAdminOrFaculty,
  courseEnrollmentController.updateEnrollmentStatus
);
router.delete("/:id", requireAuth, courseEnrollmentController.deleteEnrollment);

// Get enrollments by course (faculty/admin only)
router.get(
  "/course/:courseId",
  requireAuth,
  requireAdminOrFaculty,
  courseEnrollmentController.getEnrollmentsByCourse
);

// Get enrollments by student
router.get(
  "/student/:studentId",
  requireAuth,
  courseEnrollmentController.getEnrollmentsByStudent
);

// Get enrollment statistics
router.get(
  "/course/:courseId/stats",
  requireAuth,
  requireAdminOrFaculty,
  courseEnrollmentController.getCourseEnrollmentStats
);

router.get(
  "/student/:studentId/stats",
  requireAuth,
  courseEnrollmentController.getStudentEnrollmentStats
);

module.exports = router;
