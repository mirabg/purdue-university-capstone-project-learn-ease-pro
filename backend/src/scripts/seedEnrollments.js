require("dotenv").config();
const mongoose = require("mongoose");
const CourseEnrollment = require("../models/CourseEnrollment");
const Course = require("../models/Course");
const User = require("../models/User");

/**
 * Seed course enrollment records
 * This script creates realistic enrollment data with various statuses
 */

const seedEnrollments = async () => {
  try {
    console.log("🌱 Starting course enrollment seeding process...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all students
    const students = await User.find({ role: "student", isActive: true });
    if (students.length === 0) {
      console.error("❌ No students found. Please run seedUsers.js first.");
      process.exit(1);
    }
    console.log(`✅ Found ${students.length} students`);

    // Get all courses
    const courses = await Course.find({});
    if (courses.length === 0) {
      console.error("❌ No courses found. Please run seedCourses.js first.");
      process.exit(1);
    }
    console.log(`✅ Found ${courses.length} courses\n`);

    // Clear existing enrollments
    const existingCount = await CourseEnrollment.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing enrollments`);
      console.log("🗑️  Clearing existing enrollments...");
      await CourseEnrollment.deleteMany({});
      console.log("✅ Existing enrollments cleared\n");
    }

    let createdCount = 0;
    let skippedCount = 0;

    // Status distribution: 70% accepted, 20% pending, 10% denied
    const statusWeights = [
      { status: "accepted", weight: 0.7 },
      { status: "pending", weight: 0.2 },
      { status: "denied", weight: 0.1 },
    ];

    const comments = {
      accepted: [
        "Welcome to the course!",
        "Enrollment approved",
        "Looking forward to having you in class",
        "Prerequisites verified and approved",
        null,
      ],
      pending: [
        "Awaiting prerequisite verification",
        "Pending instructor approval",
        "Waiting for course capacity confirmation",
        null,
      ],
      denied: [
        "Prerequisites not met",
        "Course is full",
        "Does not meet program requirements",
        "Please contact advisor",
      ],
    };

    // Helper function to get random status based on weights
    const getRandomStatus = () => {
      const random = Math.random();
      let cumulative = 0;
      for (const { status, weight } of statusWeights) {
        cumulative += weight;
        if (random <= cumulative) {
          return status;
        }
      }
      return "accepted";
    };

    // Helper function to get random comment for status
    const getRandomComment = (status) => {
      const statusComments = comments[status];
      return statusComments[Math.floor(Math.random() * statusComments.length)];
    };

    // Each student enrolls in 3-8 courses
    for (const student of students) {
      const enrollmentCount = Math.floor(Math.random() * 6) + 3; // 3 to 8 courses

      // Shuffle courses to get random selection
      const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
      const selectedCourses = shuffledCourses.slice(0, enrollmentCount);

      for (const course of selectedCourses) {
        try {
          const status = getRandomStatus();
          const comment = getRandomComment(status);

          await CourseEnrollment.create({
            course: course._id,
            student: student._id,
            status,
            comments: comment,
          });

          console.log(
            `✅ Created: ${student.firstName} ${student.lastName} → ${course.courseCode} (${status})`
          );
          createdCount++;
        } catch (error) {
          console.log(
            `⏭️  Skipped: ${student.firstName} ${student.lastName} → ${course.courseCode} (${error.message})`
          );
          skippedCount++;
        }
      }
    }

    // Get statistics
    const totalEnrollments = await CourseEnrollment.countDocuments();
    const acceptedCount = await CourseEnrollment.countDocuments({
      status: "accepted",
    });
    const pendingCount = await CourseEnrollment.countDocuments({
      status: "pending",
    });
    const deniedCount = await CourseEnrollment.countDocuments({
      status: "denied",
    });

    console.log("\n" + "=".repeat(60));
    console.log("📊 Enrollment Summary:");
    console.log(`   Created: ${createdCount} enrollments`);
    console.log(`   Skipped: ${skippedCount} enrollments`);
    console.log(`   Total: ${totalEnrollments} enrollments in database`);
    console.log("\n📊 Status Distribution:");
    console.log(
      `   Accepted: ${acceptedCount} (${(
        (acceptedCount / totalEnrollments) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `   Pending:  ${pendingCount} (${(
        (pendingCount / totalEnrollments) *
        100
      ).toFixed(1)}%)`
    );
    console.log(
      `   Denied:   ${deniedCount} (${(
        (deniedCount / totalEnrollments) *
        100
      ).toFixed(1)}%)`
    );
    console.log("=".repeat(60));

    // Show per-student breakdown
    console.log("\n📊 Enrollments per Student:");
    for (const student of students) {
      const count = await CourseEnrollment.countDocuments({
        student: student._id,
      });
      const accepted = await CourseEnrollment.countDocuments({
        student: student._id,
        status: "accepted",
      });
      console.log(
        `   ${student.firstName} ${student.lastName}: ${count} total (${accepted} accepted)`
      );
    }
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding enrollments:", error.message);
    console.error(error);
    process.exit(1);
  }
};

seedEnrollments();
