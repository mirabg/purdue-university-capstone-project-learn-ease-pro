const mongoose = require("mongoose");

const courseEnrollmentSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Please add a course"],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a student"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "denied"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      required: [true, "Please add a status"],
    },
    comments: {
      type: String,
      trim: true,
      maxlength: [500, "Comments cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save validation for student role
courseEnrollmentSchema.pre("save", async function (next) {
  if (this.student && this.isModified("student")) {
    const User = mongoose.model("User");
    const user = await User.findById(this.student);
    if (!user) {
      return next(new Error("Student user does not exist"));
    }
    if (user.role !== "student") {
      return next(new Error("Enrollment must be for a user with student role"));
    }
  }
  next();
});

// Pre-update validation for student role
courseEnrollmentSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  const student = update.student || update.$set?.student;

  if (student) {
    const User = mongoose.model("User");
    const user = await User.findById(student);
    if (!user) {
      return next(new Error("Student user does not exist"));
    }
    if (user.role !== "student") {
      return next(new Error("Enrollment must be for a user with student role"));
    }
  }
  next();
});

// Compound index to prevent duplicate enrollments
courseEnrollmentSchema.index({ course: 1, student: 1 }, { unique: true });

// Index for querying enrollments by course
courseEnrollmentSchema.index({ course: 1, status: 1 });

// Index for querying enrollments by student
courseEnrollmentSchema.index({ student: 1, status: 1 });

module.exports = mongoose.model("CourseEnrollment", courseEnrollmentSchema);
