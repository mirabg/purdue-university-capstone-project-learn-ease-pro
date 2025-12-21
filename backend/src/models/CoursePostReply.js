const mongoose = require("mongoose");

const coursePostReplySchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CoursePost",
      required: [true, "Post reference is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    content: {
      type: String,
      required: [true, "Please add reply content"],
      trim: true,
      maxlength: [2000, "Reply content cannot exceed 2000 characters"],
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
coursePostReplySchema.index({ post: 1, createdAt: 1 });
coursePostReplySchema.index({ user: 1 });

module.exports = mongoose.model("CoursePostReply", coursePostReplySchema);
