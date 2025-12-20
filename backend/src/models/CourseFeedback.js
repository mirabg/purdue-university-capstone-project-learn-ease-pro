const mongoose = require("mongoose");

const courseFeedbackSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, "Please provide a rating"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Index to ensure one feedback per user per course
courseFeedbackSchema.index({ course: 1, user: 1 }, { unique: true });

// Index for efficient queries
courseFeedbackSchema.index({ course: 1, rating: -1 });

module.exports = mongoose.model("CourseFeedback", courseFeedbackSchema);
