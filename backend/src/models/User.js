const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please add a first name"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please add a last name"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [75, "Address cannot exceed 75 characters"],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [35, "City cannot exceed 35 characters"],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [25, "State cannot exceed 25 characters"],
    },
    zipcode: {
      type: String,
      trim: true,
      maxlength: [10, "Zipcode cannot exceed 10 characters"],
    },
    phone: {
      type: String,
      trim: true,
      match: [
        /^\d{3}-\d{3}-\d{4}$/,
        "Please provide a valid phone number in format xxx-xxx-xxxx",
      ],
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ["admin", "student", "faculty"],
      default: "student",
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

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
