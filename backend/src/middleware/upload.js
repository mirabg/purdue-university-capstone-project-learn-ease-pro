const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create subdirectories for different file types
    let subDir = "other";
    const mimeType = file.mimetype.split("/")[0];

    if (mimeType === "video") {
      subDir = "videos";
    } else if (mimeType === "image" || file.mimetype.includes("pdf")) {
      subDir = "documents";
    } else if (
      file.mimetype.includes("presentation") ||
      file.mimetype.includes("powerpoint") ||
      file.mimetype.includes("ppt")
    ) {
      subDir = "presentations";
    }

    const dir = path.join(uploadsDir, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, nameWithoutExt + "-" + uniqueSuffix + ext);
  },
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedMimes = [
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    // Presentations
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    // Spreadsheets
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-msvideo",
    "video/x-ms-wmv",
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    // Archives
    "application/zip",
    "application/x-rar-compressed",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `File type not allowed. Allowed types: PDF, Word, PowerPoint, Excel, Videos (MP4, MOV, AVI), Images (JPEG, PNG, GIF), ZIP`
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
  },
});

module.exports = upload;
