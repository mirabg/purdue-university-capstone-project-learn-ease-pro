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

/**
 * @desc    Update course material (metadata and optionally file)
 * @route   PUT /api/courses/materials/:detailId
 * @access  Admin/Faculty
 */
exports.updateCourseMaterial = async (req, res) => {
  try {
    const { title, type, description, order } = req.body;
    const { detailId } = req.params;

    // Get existing material
    const existingDetail = await courseService.getCourseDetailById(detailId);
    if (!existingDetail) {
      // Clean up uploaded file if exists
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        success: false,
        message: "Course material not found",
      });
    }

    // Prepare update data
    const updateData = {
      title: title || existingDetail.title,
      type: type || existingDetail.type,
      description:
        description !== undefined ? description : existingDetail.description,
      order: order !== undefined ? parseInt(order) : existingDetail.order,
    };

    // If new file is uploaded, replace the old one
    if (req.file) {
      // Delete old file if it exists and is a local upload
      if (existingDetail.url && existingDetail.url.startsWith("/uploads/")) {
        const oldFilePath = path.join(__dirname, "../..", existingDetail.url);
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath);
          } catch (error) {
            console.error("Error deleting old file:", error);
          }
        }
      }

      // Set new file URL
      const fileUrl = `/uploads/${path.basename(path.dirname(req.file.path))}/${
        req.file.filename
      }`;
      updateData.url = fileUrl;

      // Update type based on new file if not provided
      if (!type) {
        const mimeType = req.file.mimetype;
        if (mimeType.includes("video")) {
          updateData.type = "video";
        } else if (
          mimeType.includes("presentation") ||
          mimeType.includes("powerpoint") ||
          mimeType.includes("ppt")
        ) {
          updateData.type = "presentation";
        } else {
          updateData.type = "document";
        }
      }
    }

    // Update the material
    const updatedDetail = await courseService.updateCourseDetail(
      detailId,
      updateData
    );

    res.status(200).json({
      success: true,
      data: updatedDetail,
      message: "Course material updated successfully",
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
