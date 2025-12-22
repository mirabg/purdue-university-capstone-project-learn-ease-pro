const mongoose = require("mongoose");
const CourseFeedback = require("../models/CourseFeedback");
const User = require("../models/User");
require("dotenv").config();

/**
 * Script to remove course ratings that are not mapped to a valid user
 */
async function cleanupOrphanedRatings() {
  try {
    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/learneasepro"
    );
    console.log("Connected to MongoDB");

    // Get all feedback records
    const allFeedback = await CourseFeedback.find({});
    console.log(`Found ${allFeedback.length} total feedback records`);

    let orphanedCount = 0;
    const orphanedIds = [];

    // Check each feedback record
    for (const feedback of allFeedback) {
      // Check if user exists
      const userExists = await User.findById(feedback.user);

      if (!userExists) {
        console.log(
          `Found orphaned rating: ${feedback._id} (user: ${feedback.user})`
        );
        orphanedIds.push(feedback._id);
        orphanedCount++;
      }
    }

    console.log(`\nFound ${orphanedCount} orphaned ratings`);

    if (orphanedCount > 0) {
      // Delete orphaned ratings
      const result = await CourseFeedback.deleteMany({
        _id: { $in: orphanedIds },
      });

      console.log(`\nDeleted ${result.deletedCount} orphaned ratings`);
    } else {
      console.log("\nNo orphaned ratings found. Database is clean!");
    }

    // Close connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error cleaning up orphaned ratings:", error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupOrphanedRatings();
