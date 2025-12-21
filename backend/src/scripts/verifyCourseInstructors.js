require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");

const verifyCourseInstructors = async () => {
  try {
    console.log("🔍 Verifying course instructors...\n");

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Count total courses
    const totalCourses = await Course.countDocuments();

    // Count courses with instructors
    const coursesWithInstructors = await Course.countDocuments({
      instructor: { $exists: true, $ne: null },
    });

    // Count courses without instructors
    const coursesWithoutInstructors = await Course.countDocuments({
      $or: [{ instructor: { $exists: false } }, { instructor: null }],
    });

    console.log("📊 Course Instructor Statistics:");
    console.log("=".repeat(60));
    console.log(`   Total Courses: ${totalCourses}`);
    console.log(`   Courses with Instructors: ${coursesWithInstructors}`);
    console.log(`   Courses without Instructors: ${coursesWithoutInstructors}`);
    console.log("=".repeat(60) + "\n");

    if (coursesWithoutInstructors === 0) {
      console.log("✅ SUCCESS: All courses have instructors assigned!\n");

      // Show a sample of courses with their instructors
      console.log("📚 Sample Courses:\n");
      const sampleCourses = await Course.find()
        .populate("instructor", "firstName lastName email role")
        .limit(5);

      sampleCourses.forEach((course, index) => {
        console.log(`${index + 1}. ${course.courseCode} - ${course.name}`);
        if (course.instructor) {
          console.log(
            `   Instructor: ${course.instructor.firstName} ${course.instructor.lastName}`
          );
          console.log(`   Email: ${course.instructor.email}`);
          console.log(`   Role: ${course.instructor.role}\n`);
        }
      });
    } else {
      console.log("⚠️  WARNING: Some courses still missing instructors!\n");

      const coursesWithoutInstr = await Course.find({
        $or: [{ instructor: { $exists: false } }, { instructor: null }],
      }).limit(10);

      console.log("Courses without instructors:");
      coursesWithoutInstr.forEach((course, index) => {
        console.log(`   ${index + 1}. ${course.courseCode} - ${course.name}`);
      });
    }

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Verification failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

verifyCourseInstructors();
