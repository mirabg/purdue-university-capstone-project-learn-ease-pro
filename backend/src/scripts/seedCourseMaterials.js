require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const CourseDetail = require("../models/CourseDetail");

// Sample materials for different course types
const getMaterialsForCourse = (course) => {
  const courseCode = course.courseCode;
  const baseMaterials = [
    {
      title: `${courseCode} Syllabus`,
      type: "document",
      url: `/uploads/documents/sample-syllabus.pdf`,
      description:
        "Course syllabus with schedule, grading policy, and requirements",
      order: 1,
      isActive: true,
    },
    {
      title: `${courseCode} Lecture Notes - Week 1`,
      type: "document",
      url: `/uploads/documents/sample-lecture-notes.txt`,
      description: "Introduction and overview lecture notes",
      order: 2,
      isActive: true,
    },
    {
      title: `${courseCode} Introduction Video`,
      type: "video",
      url: `/uploads/videos/sample-intro-video.txt`,
      description: "Welcome video introducing the course and professor",
      order: 3,
      isActive: true,
    },
  ];

  // Add course-specific materials based on type
  if (courseCode.startsWith("CS")) {
    baseMaterials.push(
      {
        title: "Programming Assignment 1",
        type: "document",
        url: `/uploads/documents/sample-assignment.txt`,
        description: "First programming assignment with starter code",
        order: 4,
        isActive: true,
      },
      {
        title: "Code Examples Repository",
        type: "other",
        url: `/uploads/other/sample-code-repository.txt`,
        description: "GitHub repository with course code examples",
        order: 5,
        isActive: true,
      },
      {
        title: "Algorithm Visualization Demo",
        type: "video",
        url: `/uploads/videos/sample-demo-video.txt`,
        description: "Interactive demonstration of key algorithms",
        order: 6,
        isActive: true,
      }
    );
  } else if (courseCode.startsWith("MATH")) {
    baseMaterials.push(
      {
        title: "Problem Set 1",
        type: "document",
        url: `/uploads/documents/sample-assignment.txt`,
        description: "Practice problems for chapter 1",
        order: 4,
        isActive: true,
      },
      {
        title: "Worked Examples",
        type: "video",
        url: `/uploads/videos/sample-demo-video.txt`,
        description: "Step-by-step solutions to sample problems",
        order: 5,
        isActive: true,
      },
      {
        title: "Formula Sheet",
        type: "document",
        url: `/uploads/documents/sample-lecture-notes.txt`,
        description: "Reference sheet with important formulas",
        order: 6,
        isActive: true,
      }
    );
  } else if (courseCode.startsWith("ENG")) {
    baseMaterials.push(
      {
        title: "Writing Guide",
        type: "document",
        url: `/uploads/documents/sample-lecture-notes.txt`,
        description: "Style guide and formatting requirements",
        order: 4,
        isActive: true,
      },
      {
        title: "Essay Examples",
        type: "document",
        url: `/uploads/documents/sample-assignment.txt`,
        description: "Sample essays with annotations",
        order: 5,
        isActive: true,
      },
      {
        title: "Grammar Workshop Recording",
        type: "video",
        url: `/uploads/videos/sample-demo-video.txt`,
        description: "Recorded workshop on common grammar issues",
        order: 6,
        isActive: true,
      }
    );
  } else if (
    ["PHYS", "CHEM", "BIO"].some((prefix) => courseCode.startsWith(prefix))
  ) {
    baseMaterials.push(
      {
        title: "Lab Manual",
        type: "document",
        url: `/uploads/documents/sample-lecture-notes.txt`,
        description: "Laboratory procedures and safety guidelines",
        order: 4,
        isActive: true,
      },
      {
        title: "Experiment 1 Demo",
        type: "video",
        url: `/uploads/videos/sample-demo-video.txt`,
        description: "Video demonstration of first lab experiment",
        order: 5,
        isActive: true,
      },
      {
        title: "Lab Report Template",
        type: "document",
        url: `/uploads/documents/sample-assignment.txt`,
        description: "Template for submitting lab reports",
        order: 6,
        isActive: true,
      }
    );
  } else if (
    courseCode.startsWith("ECE") ||
    courseCode.startsWith("ME") ||
    courseCode.startsWith("CE")
  ) {
    baseMaterials.push(
      {
        title: "Design Project Guidelines",
        type: "document",
        url: `/uploads/documents/sample-assignment.txt`,
        description: "Semester project requirements and milestones",
        order: 4,
        isActive: true,
      },
      {
        title: "CAD Tutorial",
        type: "video",
        url: `/uploads/videos/sample-demo-video.txt`,
        description: "Software tutorial for design tools",
        order: 5,
        isActive: true,
      },
      {
        title: "Technical Specifications",
        type: "document",
        url: `/uploads/documents/sample-lecture-notes.txt`,
        description: "Industry standards and specifications reference",
        order: 6,
        isActive: true,
      }
    );
  } else if (
    ["MGMT", "ECON", "FIN", "ACCT"].some((prefix) =>
      courseCode.startsWith(prefix)
    )
  ) {
    baseMaterials.push(
      {
        title: "Case Study 1",
        type: "document",
        url: `/uploads/documents/sample-assignment.txt`,
        description: "Business case study for analysis",
        order: 4,
        isActive: true,
      },
      {
        title: "Industry Guest Lecture",
        type: "video",
        url: `/uploads/videos/sample-demo-video.txt`,
        description: "Recorded lecture from industry professional",
        order: 5,
        isActive: true,
      },
      {
        title: "Financial Analysis Template",
        type: "document",
        url: `/uploads/documents/sample-assignment.txt`,
        description: "Excel template for financial calculations",
        order: 6,
        isActive: true,
      }
    );
  }

  // Add midterm and final materials
  baseMaterials.push(
    {
      title: "Midterm Study Guide",
      type: "document",
      url: `/uploads/documents/sample-study-guide.txt`,
      description: "Topics and sample questions for midterm exam",
      order: 7,
      isActive: true,
    },
    {
      title: "Review Session Recording",
      type: "video",
      url: `/uploads/videos/sample-review-video.txt`,
      description: "Recorded midterm review session",
      order: 8,
      isActive: true,
    },
    {
      title: "Final Exam Information",
      type: "document",
      url: `/uploads/documents/sample-study-guide.txt`,
      description: "Final exam date, location, and format details",
      order: 9,
      isActive: true,
    }
  );

  return baseMaterials;
};

const seedCourseMaterials = async () => {
  try {
    console.log("🌱 Starting course materials seeding process...\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Get all courses
    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses in database\n`);

    if (courses.length === 0) {
      console.log("⚠️  No courses found. Please run seedCourses.js first.");
      process.exit(0);
    }

    let createdCount = 0;
    let skippedCourses = 0;

    for (const course of courses) {
      // Check if materials already exist for this course
      const existingMaterials = await CourseDetail.findOne({
        course: course._id,
      });

      if (existingMaterials) {
        console.log(
          `⏭️  Skipped: ${course.courseCode} (materials already exist)`
        );
        skippedCourses++;
        continue;
      }

      // Get materials for this course
      const materials = getMaterialsForCourse(course);

      // Create all materials for this course
      for (const materialData of materials) {
        await CourseDetail.create({
          ...materialData,
          course: course._id,
        });
        createdCount++;
      }

      console.log(
        `✅ Created ${materials.length} materials for: ${course.courseCode} - ${course.name}`
      );
    }

    console.log("\n" + "=".repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   Courses processed: ${courses.length}`);
    console.log(
      `   Courses with new materials: ${courses.length - skippedCourses}`
    );
    console.log(`   Courses skipped: ${skippedCourses}`);
    console.log(`   Total materials created: ${createdCount}`);
    console.log("=".repeat(60));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding course materials:", error.message);
    process.exit(1);
  }
};

seedCourseMaterials();
