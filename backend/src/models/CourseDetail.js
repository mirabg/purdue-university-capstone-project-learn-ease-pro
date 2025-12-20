const mongoose = require("mongoose");

const courseDetailSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: ["document", "video", "presentation", "other"],
      required: [true, "Please specify the content type"],
    },
    url: {
      type: String,
      required: [true, "Please add a URL or file path"],
      trim: true,
      maxlength: [1000, "URL cannot exceed 1000 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    order: {
      type: Number,
      default: 0,
      min: [0, "Order must be a positive number"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
courseDetailSchema.index({ course: 1, order: 1 });
courseDetailSchema.index({ course: 1, type: 1 });

module.exports = mongoose.model("CourseDetail", courseDetailSchema);
