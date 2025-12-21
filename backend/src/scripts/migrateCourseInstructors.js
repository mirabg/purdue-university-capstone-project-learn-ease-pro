require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const User = require("../models/User");

const migrateCourseInstructors = async () => {
  try {
    console.log("🔄 Starting course instructor migration...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all faculty members
    const facultyMembers = await User.find({ role: "faculty", isActive: true });

    if (facultyMembers.length === 0) {
      console.error(
        "❌ No faculty members found. Please ensure faculty users exist in the database."
      );
      process.exit(1);
    }

    console.log(`✅ Found ${facultyMembers.length} faculty members:`);
    facultyMembers.forEach((faculty) => {
      console.log(
        `   - ${faculty.firstName} ${faculty.lastName} (${faculty.email})`
      );
    });
    console.log();

    // Find all courses without an instructor
    const coursesWithoutInstructor = await Course.find({
      $or: [{ instructor: { $exists: false } }, { instructor: null }],
    });

    if (coursesWithoutInstructor.length === 0) {
      console.log("✅ All courses already have instructors assigned!");
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(
      `📚 Found ${coursesWithoutInstructor.length} courses without instructors\n`
    );

    let updatedCount = 0;

    // Assign instructors to courses in rotation
    for (let i = 0; i < coursesWithoutInstructor.length; i++) {
      const course = coursesWithoutInstructor[i];
      const instructor = facultyMembers[i % facultyMembers.length];

      // Update the course with an instructor
      // Using updateOne to bypass pre-save hooks since we're fixing existing data
      await Course.updateOne(
        { _id: course._id },
        { $set: { instructor: instructor._id } }
      );

      console.log(`✅ Updated: ${course.courseCode} - ${course.name}`);
      console.log(
        `   Assigned to: ${instructor.firstName} ${instructor.lastName}\n`
      );

      updatedCount++;
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Migration complete!`);
    console.log(`   Courses updated: ${updatedCount}`);
    console.log(`   Faculty members used: ${facultyMembers.length}`);
    console.log("=".repeat(60) + "\n");

    // Verify all courses now have instructors
    const remainingCoursesWithoutInstructor = await Course.find({
      $or: [{ instructor: { $exists: false } }, { instructor: null }],
    });

    if (remainingCoursesWithoutInstructor.length > 0) {
      console.warn(
        `⚠️  Warning: ${remainingCoursesWithoutInstructor.length} courses still without instructors`
      );
    } else {
      console.log("✅ Verification passed: All courses now have instructors!");
    }

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the migration
migrateCourseInstructors();
