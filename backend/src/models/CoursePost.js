const mongoose = require("mongoose");

const coursePostSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    title: {
      type: String,
      required: [true, "Please add a post title"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Please add post content"],
      trim: true,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
coursePostSchema.index({ course: 1, createdAt: -1 });
coursePostSchema.index({ course: 1, isPinned: -1, createdAt: -1 });
coursePostSchema.index({ user: 1 });

module.exports = mongoose.model("CoursePost", coursePostSchema);
