require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      email: "admin@nowhere.com",
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      firstName: "Admin",
      lastName: "User",
      email: "admin@nowhere.com",
      password: "changeme",
      role: "admin",
      isActive: true,
    });

    console.log("Admin user created successfully:");
    console.log({
      id: adminUser._id,
      email: adminUser.email,
      role: adminUser.role,
    });
    console.log("\nDefault credentials:");
    console.log("Email: admin@nowhere.com");
    console.log("Password: changeme");
    console.log("\n⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
    process.exit(1);
  }
};

seedAdmin();
