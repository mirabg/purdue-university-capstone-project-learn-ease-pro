require("dotenv").config();
const mongoose = require("mongoose");
const CourseFeedback = require("../models/CourseFeedback");
const CourseEnrollment = require("../models/CourseEnrollment");
const Course = require("../models/Course");
const User = require("../models/User");

/**
 * Seed course feedback and ratings
 * This script creates realistic rating data with varied feedback
 */

const seedCourseFeedback = async () => {
  try {
    console.log("🌱 Starting course feedback seeding process...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

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
    console.log(`✅ Found ${courses.length} courses`);

    // Get all accepted enrollments
    const enrollments = await CourseEnrollment.find({ status: "accepted" });
    console.log(`✅ Found ${enrollments.length} accepted enrollments\n`);

    // Clear existing feedback
    const existingCount = await CourseFeedback.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing feedback entries`);
      console.log("🗑️  Clearing existing feedback...");
      await CourseFeedback.deleteMany({});
      console.log("✅ Existing feedback cleared\n");
    }

    // Feedback templates by rating
    const feedbackTemplates = {
      5: [
        "Excellent course! The instructor was very knowledgeable and engaging.",
        "Outstanding content and great delivery. Highly recommended!",
        "Best course I've taken. Clear explanations and practical examples.",
        "Absolutely loved this course. The material was well-organized and easy to follow.",
        "Perfect! The instructor made complex topics easy to understand.",
        "Amazing course with great real-world applications.",
        "Top-notch quality. Every session was valuable and informative.",
        "Exceeded my expectations. Great instructor and course structure.",
        "Fantastic learning experience. Will definitely recommend to others.",
        "Brilliant course design and execution. 5 stars!",
      ],
      4: [
        "Great course overall. A few sections could be more detailed.",
        "Very good content. Would have liked more practical exercises.",
        "Solid course with good material. Instructor was helpful.",
        "Really enjoyed it. Minor pacing issues but overall excellent.",
        "Good course with clear explanations. Some topics could go deeper.",
        "Very informative and well-structured. Room for minor improvements.",
        "Learned a lot. The course met most of my expectations.",
        "Strong content delivery. Would benefit from more examples.",
        "Quality course. Some sections were a bit rushed.",
        "Enjoyed the course. Good balance of theory and practice.",
      ],
      3: [
        "Decent course but had some issues with pacing.",
        "Average experience. Some topics weren't explained well.",
        "It was okay. Could use better organization.",
        "Mixed feelings. Some parts were great, others not so much.",
        "Fair course. Expected more depth in certain areas.",
        "Neither great nor terrible. Has potential for improvement.",
        "Acceptable but could be better structured.",
        "Met basic expectations but nothing exceptional.",
        "Okay course. Would benefit from updated materials.",
        "Average learning experience. Some good points, some not.",
      ],
      2: [
        "Below expectations. Content was not well organized.",
        "Disappointed with the course structure and delivery.",
        "Needs significant improvement. Too many gaps in content.",
        "Not what I expected. Difficult to follow along.",
        "Poor organization and unclear explanations.",
        "Struggled to understand many concepts. Needs work.",
        "Course materials were outdated and hard to follow.",
        "Not satisfied. Expected much better quality.",
        "Difficult to stay engaged. Content needs revision.",
        "Below average. Many topics were unclear.",
      ],
      1: [
        "Very poor course. Would not recommend.",
        "Terrible experience. Complete waste of time.",
        "Extremely disappointed. Nothing met expectations.",
        "Worst course I've taken. Needs complete overhaul.",
        "Absolutely frustrated with the quality.",
        "Cannot recommend this course to anyone.",
        "Major issues with content and delivery.",
        "Regret enrolling. Very poor execution.",
        "Unacceptable quality. Needs serious improvements.",
        "Failed to deliver on any promises. Avoid.",
      ],
    };

    // Rating distribution: 50% 5-star, 25% 4-star, 15% 3-star, 7% 2-star, 3% 1-star
    const ratingWeights = [
      { rating: 5, weight: 0.5 },
      { rating: 4, weight: 0.25 },
      { rating: 3, weight: 0.15 },
      { rating: 2, weight: 0.07 },
      { rating: 1, weight: 0.03 },
    ];

    // Helper function to get random rating based on weights
    const getRandomRating = () => {
      const random = Math.random();
      let cumulative = 0;
      for (const { rating, weight } of ratingWeights) {
        cumulative += weight;
        if (random <= cumulative) {
          return rating;
        }
      }
      return 5;
    };

    // Helper function to get random comment for rating
    const getRandomComment = (rating) => {
      const templates = feedbackTemplates[rating];
      // 20% chance of no comment
      if (Math.random() < 0.2) {
        return undefined;
      }
      return templates[Math.floor(Math.random() * templates.length)];
    };

    let createdCount = 0;
    let skippedCount = 0;
    let enrollmentsCreated = 0;

    const minRatingsPerCourse = Math.min(10, students.length);

    if (students.length < 10) {
      console.log(
        `⚠️  Warning: Only ${students.length} students available. Each course will get up to ${students.length} ratings.`
      );
      console.log(
        `   To get 10+ ratings per course, run seedUsers.js to add more students.\n`
      );
    }

    console.log(
      `📊 Ensuring at least ${minRatingsPerCourse} ratings per course\n`
    );
    console.log("Creating feedback entries...\n");

    // Track which students have rated which courses
    const existingFeedback = new Map();

    // Helper function to ensure enrollment exists with accepted status
    const ensureEnrollment = async (courseId, studentId) => {
      const existing = await CourseEnrollment.findOne({
        course: courseId,
        student: studentId,
      });

      if (!existing) {
        // Create new accepted enrollment
        await CourseEnrollment.create({
          course: courseId,
          student: studentId,
          status: "accepted",
          comment: "Auto-enrolled for seeding feedback",
        });
        enrollmentsCreated++;
        return true;
      } else if (existing.status !== "accepted") {
        // Update to accepted status
        existing.status = "accepted";
        existing.comment = "Updated to accepted for seeding feedback";
        await existing.save();
        enrollmentsCreated++;
        return true;
      }
      return false;
    };

    // First, add feedback from enrolled students (60-80% rate)
    const feedbackRate = 0.6 + Math.random() * 0.2;

    for (const enrollment of enrollments) {
      if (Math.random() > feedbackRate) {
        skippedCount++;
        continue;
      }

      try {
        const rating = getRandomRating();
        const comment = getRandomComment(rating);

        const feedback = new CourseFeedback({
          course: enrollment.course,
          user: enrollment.student,
          rating: rating,
          comment: comment,
        });

        await feedback.save();

        const key = `${enrollment.course}-${enrollment.student}`;
        existingFeedback.set(key, true);

        createdCount++;

        if (createdCount % 50 === 0) {
          console.log(`✅ Created ${createdCount} feedback entries...`);
        }
      } catch (error) {
        if (error.code === 11000) {
          skippedCount++;
        } else {
          console.error(`Error creating feedback: ${error.message}`);
        }
      }
    }

    console.log(
      `\n✅ Created ${createdCount} feedback entries from enrollments`
    );
    console.log(
      `📊 Now ensuring each course has at least ${minRatingsPerCourse} ratings...\n`
    );

    // Now ensure each course has at least minRatingsPerCourse ratings
    for (const course of courses) {
      const currentRatingsCount = await CourseFeedback.countDocuments({
        course: course._id,
      });

      if (currentRatingsCount >= minRatingsPerCourse) {
        continue;
      }

      const neededRatings = minRatingsPerCourse - currentRatingsCount;
      console.log(
        `Course "${course.name}": Adding ${neededRatings} more ratings (has ${currentRatingsCount})`
      );

      // Shuffle students to get random selection
      const shuffledStudents = [...students].sort(() => Math.random() - 0.5);

      let addedForCourse = 0;
      for (const student of shuffledStudents) {
        if (addedForCourse >= neededRatings) break;

        const key = `${course._id}-${student._id}`;
        if (existingFeedback.has(key)) {
          continue; // Skip if already rated
        }

        try {
          // Ensure student has accepted enrollment before creating feedback
          await ensureEnrollment(course._id, student._id);

          const rating = getRandomRating();
          const comment = getRandomComment(rating);

          const feedback = new CourseFeedback({
            course: course._id,
            user: student._id,
            rating: rating,
            comment: comment,
          });

          await feedback.save();
          existingFeedback.set(key, true);
          createdCount++;
          addedForCourse++;
        } catch (error) {
          if (error.code !== 11000) {
            console.error(`Error creating feedback: ${error.message}`);
          }
        }
      }
    }

    console.log("\n📊 Seeding Summary:");
    console.log("==================");
    console.log(`Total courses: ${courses.length}`);
    console.log(`Total feedback entries created: ${createdCount}`);
    console.log(`Enrollments created/updated: ${enrollmentsCreated}`);

    // Calculate rating statistics
    const ratingStats = await CourseFeedback.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    console.log("\n⭐ Rating Distribution:");
    console.log("=====================");
    ratingStats.forEach((stat) => {
      const percentage = ((stat.count / createdCount) * 100).toFixed(1);
      const stars = "⭐".repeat(stat._id);
      console.log(`${stars} (${stat._id}): ${stat.count} (${percentage}%)`);
    });

    // Calculate average rating per course
    const courseStats = await CourseFeedback.aggregate([
      {
        $group: {
          _id: "$course",
          avgRating: { $avg: "$rating" },
          totalFeedback: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
    ]);

    console.log("\n🏆 Top 5 Rated Courses:");
    console.log("======================");
    for (const stat of courseStats) {
      const course = await Course.findById(stat._id).select("name");
      if (course) {
        console.log(
          `${course.name}: ${stat.avgRating.toFixed(2)} ⭐ (${
            stat.totalFeedback
          } reviews)`
        );
      }
    }

    console.log("\n✅ Course feedback seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding course feedback:", error);
    process.exit(1);
  }
};

// Run the seeding function
seedCourseFeedback();
