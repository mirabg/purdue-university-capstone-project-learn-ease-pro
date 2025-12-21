require("dotenv").config();
const mongoose = require("mongoose");
const CourseFeedback = require("../models/CourseFeedback");
const CourseEnrollment = require("../models/CourseEnrollment");

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB\n");

    const totalFeedback = await CourseFeedback.countDocuments();
    console.log(`Total feedback entries: ${totalFeedback}`);

    // Check all feedback entries
    const feedbacks = await CourseFeedback.find();
    let missingEnrollments = 0;
    let hasEnrollments = 0;

    for (const feedback of feedbacks) {
      const enrollment = await CourseEnrollment.findOne({
        course: feedback.course,
        student: feedback.user,
        status: "accepted",
      });

      if (!enrollment) {
        missingEnrollments++;
        if (missingEnrollments <= 5) {
          console.log(
            `❌ Missing enrollment for feedback ${feedback._id}: course=${feedback.course}, user=${feedback.user}`
          );
        }
      } else {
        hasEnrollments++;
      }
    }

    console.log(`\n📊 Verification Results:`);
    console.log(`=======================`);
    console.log(`✅ Feedbacks with accepted enrollment: ${hasEnrollments}`);
    console.log(`❌ Feedbacks missing enrollment: ${missingEnrollments}`);

    if (missingEnrollments === 0) {
      console.log(
        `\n🎉 SUCCESS! All feedback entries have corresponding accepted enrollments!`
      );
    } else {
      console.log(
        `\n⚠️  WARNING: ${missingEnrollments} feedback entries are missing enrollments!`
      );
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

verify();
