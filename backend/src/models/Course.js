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
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add an instructor"],
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

// Pre-save validation for instructor
courseSchema.pre("save", async function (next) {
  if (this.instructor && this.isModified("instructor")) {
    const User = mongoose.model("User");
    const user = await User.findById(this.instructor);
    if (!user) {
      return next(new Error("Instructor user does not exist"));
    }
    if (user.role !== "faculty") {
      return next(new Error("Instructor must be a user with faculty role"));
    }
  }
  next();
});

// Pre-update validation for instructor
courseSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const instructor = update.instructor || update.$set?.instructor;

  if (instructor) {
    const User = mongoose.model("User");
    const user = await User.findById(instructor);
    if (!user) {
      return next(new Error("Instructor user does not exist"));
    }
    if (user.role !== "faculty") {
      return next(new Error("Instructor must be a user with faculty role"));
    }
  }
  next();
});

// Index for search optimization
courseSchema.index({ courseCode: 1, name: 1 });
courseSchema.index({ instructor: 1 });

module.exports = mongoose.model("Course", courseSchema);
