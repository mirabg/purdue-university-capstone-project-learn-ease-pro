const path = require("path");
const fs = require("fs");
const courseService = require("../services/courseService");

/**
 * @desc    Upload course material file
 * @route   POST /api/courses/:id/upload
 * @access  Admin/Faculty
 */
exports.uploadCourseMaterial = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const { title, type, description, order } = req.body;
    const courseId = req.params.id;

    // Verify course exists
    const course = await courseService.getCourseById(courseId);
    if (!course) {
      // Delete uploaded file if course doesn't exist
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Determine material type based on file mimetype if not provided
    let materialType = type;
    if (!materialType) {
      const mimeType = req.file.mimetype;
      if (mimeType.includes("video")) {
        materialType = "video";
      } else if (
        mimeType.includes("presentation") ||
        mimeType.includes("powerpoint") ||
        mimeType.includes("ppt")
      ) {
        materialType = "presentation";
      } else {
        materialType = "document";
      }
    }

    // Create course detail with file URL
    const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${
      req.file.filename
    }`;

    const detail = await courseService.addCourseDetail({
      course: courseId,
      title: title || req.file.originalname,
      type: materialType,
      url: fileUrl,
      description: description || "",
      order: order ? parseInt(order) : 0,
      isActive: true,
    });

    res.status(201).json({
      success: true,
      data: detail,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: fileUrl,
      },
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError);
      }
    }

    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @desc    Delete course material and associated file
 * @route   DELETE /api/courses/materials/:detailId
 * @access  Admin/Faculty
 */
exports.deleteCourseMaterial = async (req, res) => {
  try {
    const detail = await courseService.getCourseDetailById(req.params.detailId);

    if (!detail) {
      return res.status(404).json({
        success: false,
        message: "Course material not found",
      });
    }

    // Check if URL is a local file path
    if (detail.url && detail.url.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../..", detail.url);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (error) {
          console.error("Error deleting file:", error);
        }
      }
    }

    // Delete the course detail
    await courseService.deleteCourseDetail(req.params.detailId);

    res.status(200).json({
      success: true,
      message: "Course material deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
