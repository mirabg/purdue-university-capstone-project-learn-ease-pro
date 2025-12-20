const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, "Please add a course code"],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Course code cannot exceed 20 characters"],
    },
    name: {
      type: String,
      required: [true, "Please add a course name"],
      trim: true,
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a course description"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
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

// Index for search optimization
courseSchema.index({ courseCode: 1, name: 1 });

module.exports = mongoose.model("Course", courseSchema);
