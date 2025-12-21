require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");

const redistributeCourses = async () => {
  try {
    console.log("🔄 Starting course redistribution process...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all faculty members
    const facultyMembers = await User.find({ role: "faculty", isActive: true });

    if (facultyMembers.length === 0) {
      console.error(
        "❌ No faculty members found. Please run seedUsers.js first."
      );
      process.exit(1);
    }

    console.log(`✅ Found ${facultyMembers.length} faculty members`);

    // Get all courses
    const courses = await Course.find({});
    console.log(`✅ Found ${courses.length} courses\n`);

    if (courses.length === 0) {
      console.log("⚠️  No courses found to redistribute.");
      process.exit(0);
    }

    // Calculate max courses per faculty
    const maxCoursesPerFaculty = Math.ceil(
      courses.length / facultyMembers.length
    );
    console.log(
      `📊 Target: Maximum ${maxCoursesPerFaculty} courses per faculty member\n`
    );

    let updatedCount = 0;

    // Redistribute courses evenly among faculty
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const newInstructor = facultyMembers[i % facultyMembers.length];

      // Update only if instructor has changed
      if (course.instructor.toString() !== newInstructor._id.toString()) {
        course.instructor = newInstructor._id;
        await course.save();

        console.log(
          `✅ Updated: ${course.courseCode} - ${course.name} → ${newInstructor.firstName} ${newInstructor.lastName}`
        );
        updatedCount++;
      } else {
        console.log(
          `⏭️  Unchanged: ${course.courseCode} - ${course.name} (${newInstructor.firstName} ${newInstructor.lastName})`
        );
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log(`📊 Redistribution Summary:`);
    console.log(`   Updated: ${updatedCount} courses`);
    console.log(`   Unchanged: ${courses.length - updatedCount} courses`);
    console.log(`   Total: ${courses.length} courses processed`);
    console.log("=".repeat(50));

    // Show distribution per faculty
    console.log("\n📊 Course Distribution per Faculty:");
    for (const faculty of facultyMembers) {
      const courseCount = await Course.countDocuments({
        instructor: faculty._id,
      });
      console.log(
        `   ${faculty.firstName} ${faculty.lastName}: ${courseCount} courses`
      );
    }
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error redistributing courses:", error.message);
    console.error(error);
    process.exit(1);
  }
};

redistributeCourses();
