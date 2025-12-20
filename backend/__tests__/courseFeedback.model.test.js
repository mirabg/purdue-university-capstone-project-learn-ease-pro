const mongoose = require("mongoose");
const CourseFeedback = require("../src/models/CourseFeedback");
const Course = require("../src/models/Course");
const User = require("../src/models/User");

describe("CourseFeedback Model", () => {
  let testCourse;
  let testUser;

  beforeEach(async () => {
    testCourse = await Course.create({
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
    });

    testUser = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@test.com",
      password: "Password123!",
      phone: "555-555-5555",
      role: "student",
    });
  });

  describe("Schema Validation", () => {
    it("should create a valid course feedback with all required fields", async () => {
      const feedbackData = {
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Excellent course! Very informative.",
      };

      const feedback = new CourseFeedback(feedbackData);
      const savedFeedback = await feedback.save();

      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.course.toString()).toBe(testCourse._id.toString());
      expect(savedFeedback.user.toString()).toBe(testUser._id.toString());
      expect(savedFeedback.rating).toBe(5);
      expect(savedFeedback.comment).toBe("Excellent course! Very informative.");
      expect(savedFeedback.createdAt).toBeDefined();
      expect(savedFeedback.updatedAt).toBeDefined();
    });

    it("should fail without required course reference", async () => {
      const feedback = new CourseFeedback({
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should fail without required user reference", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        rating: 5,
        comment: "Great course!",
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should fail without required rating", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        comment: "Great course!",
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should allow creation without comment", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        rating: 4,
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback._id).toBeDefined();
      expect(savedFeedback.comment).toBeUndefined();
    });

    it("should enforce minimum rating of 1", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        rating: 0,
        comment: "Poor course",
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should enforce maximum rating of 5", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        rating: 6,
        comment: "Beyond excellent",
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should accept all valid ratings from 1 to 5", async () => {
      for (let rating = 1; rating <= 5; rating++) {
        const user = await User.create({
          firstName: "Test",
          lastName: `User${rating}`,
          email: `test${rating}@test.com`,
          password: "Password123!",
          phone: "555-555-5555",
          role: "student",
        });

        const feedback = new CourseFeedback({
          course: testCourse._id,
          user: user._id,
          rating: rating,
          comment: `Rating ${rating} stars`,
        });

        const savedFeedback = await feedback.save();
        expect(savedFeedback.rating).toBe(rating);
      }
    });

    it("should enforce maximum length for comment", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "A".repeat(1001),
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should trim whitespace from comment", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "  Great course!  ",
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.comment).toBe("Great course!");
    });

    it("should fail with invalid course ObjectId", async () => {
      const feedback = new CourseFeedback({
        course: "invalid-id",
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should fail with invalid user ObjectId", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: "invalid-id",
        rating: 5,
        comment: "Great course!",
      });

      await expect(feedback.save()).rejects.toThrow();
    });

    it("should create timestamps automatically", async () => {
      const feedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      const savedFeedback = await feedback.save();
      expect(savedFeedback.createdAt).toBeInstanceOf(Date);
      expect(savedFeedback.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt timestamp on modification", async () => {
      const feedback = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 4,
        comment: "Good course",
      });

      const originalUpdatedAt = feedback.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      feedback.rating = 5;
      feedback.comment = "Excellent course!";
      const updatedFeedback = await feedback.save();

      expect(updatedFeedback.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Unique Constraint", () => {
    it("should prevent duplicate feedback from same user for same course", async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      const duplicateFeedback = new CourseFeedback({
        course: testCourse._id,
        user: testUser._id,
        rating: 4,
        comment: "Actually, it's good",
      });

      await expect(duplicateFeedback.save()).rejects.toThrow();
    });

    it("should allow same user to provide feedback for different courses", async () => {
      const course2 = await Course.create({
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn data structures",
      });

      const feedback1 = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      const feedback2 = await CourseFeedback.create({
        course: course2._id,
        user: testUser._id,
        rating: 4,
        comment: "Good course!",
      });

      expect(feedback1._id).toBeDefined();
      expect(feedback2._id).toBeDefined();
    });

    it("should allow different users to provide feedback for same course", async () => {
      const user2 = await User.create({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@test.com",
        password: "Password123!",
        phone: "555-555-5556",
        role: "student",
      });

      const feedback1 = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      const feedback2 = await CourseFeedback.create({
        course: testCourse._id,
        user: user2._id,
        rating: 4,
        comment: "Good course!",
      });

      expect(feedback1._id).toBeDefined();
      expect(feedback2._id).toBeDefined();
    });
  });

  describe("Population", () => {
    it("should populate course reference", async () => {
      const feedback = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      const populated = await CourseFeedback.findById(feedback._id).populate(
        "course"
      );

      expect(populated.course.courseCode).toBe("CS101");
      expect(populated.course.name).toBe("Introduction to Computer Science");
    });

    it("should populate user reference", async () => {
      const feedback = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      const populated = await CourseFeedback.findById(feedback._id).populate(
        "user"
      );

      expect(populated.user.firstName).toBe("John");
      expect(populated.user.lastName).toBe("Doe");
      expect(populated.user.email).toBe("john.doe@test.com");
    });

    it("should populate both course and user references", async () => {
      const feedback = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great course!",
      });

      const populated = await CourseFeedback.findById(feedback._id)
        .populate("course")
        .populate("user");

      expect(populated.course.courseCode).toBe("CS101");
      expect(populated.user.firstName).toBe("John");
    });
  });

  describe("Querying", () => {
    it("should find feedback by course", async () => {
      const user2 = await User.create({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@test.com",
        password: "Password123!",
        phone: "555-555-5556",
        role: "student",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great!",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: user2._id,
        rating: 4,
        comment: "Good!",
      });

      const feedback = await CourseFeedback.find({ course: testCourse._id });
      expect(feedback).toHaveLength(2);
    });

    it("should find feedback by user", async () => {
      const course2 = await Course.create({
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn data structures",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great!",
      });

      await CourseFeedback.create({
        course: course2._id,
        user: testUser._id,
        rating: 4,
        comment: "Good!",
      });

      const feedback = await CourseFeedback.find({ user: testUser._id });
      expect(feedback).toHaveLength(2);
    });

    it("should find feedback by rating", async () => {
      const user2 = await User.create({
        firstName: "Jane",
        lastName: "Smith",
        email: "jane.smith@test.com",
        password: "Password123!",
        phone: "555-555-5556",
        role: "student",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser._id,
        rating: 5,
        comment: "Great!",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: user2._id,
        rating: 4,
        comment: "Good!",
      });

      const fiveStarFeedback = await CourseFeedback.find({ rating: 5 });
      expect(fiveStarFeedback).toHaveLength(1);
      expect(fiveStarFeedback[0].comment).toBe("Great!");
    });
  });
});
