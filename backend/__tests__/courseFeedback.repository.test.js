const courseFeedbackRepository = require("../src/repositories/courseFeedbackRepository");
const CourseFeedback = require("../src/models/CourseFeedback");
const Course = require("../src/models/Course");
const User = require("../src/models/User");

describe("CourseFeedbackRepository", () => {
  let testCourse;
  let testUser1;
  let testUser2;
  let facultyUser;

  beforeEach(async () => {
    facultyUser = await User.create({
      firstName: "Faculty",
      lastName: "Member",
      email: "faculty@test.com",
      password: "Password123!",
      phone: "555-555-5557",
      role: "faculty",
    });

    testCourse = await Course.create({
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
      instructor: facultyUser._id,
    });

    testUser1 = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "john@test.com",
      password: "Password123!",
      phone: "555-555-5555",
      role: "student",
    });

    testUser2 = await User.create({
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@test.com",
      password: "Password123!",
      phone: "555-555-5556",
      role: "student",
    });
  });

  describe("createOrUpdate", () => {
    it("should create new feedback", async () => {
      const feedbackData = {
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
        comment: "Great course!",
      };

      const feedback = await courseFeedbackRepository.createOrUpdate(
        feedbackData
      );

      expect(feedback._id).toBeDefined();
      expect(feedback.rating).toBe(5);
      expect(feedback.comment).toBe("Great course!");
    });

    it("should update existing feedback", async () => {
      // Create initial feedback
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 3,
        comment: "Initial feedback",
      });

      // Update feedback
      const feedbackData = {
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
        comment: "Updated feedback",
      };

      const feedback = await courseFeedbackRepository.createOrUpdate(
        feedbackData
      );

      expect(feedback.rating).toBe(5);
      expect(feedback.comment).toBe("Updated feedback");

      // Verify only one feedback exists
      const allFeedback = await CourseFeedback.find({
        course: testCourse._id,
        user: testUser1._id,
      });
      expect(allFeedback).toHaveLength(1);
    });
  });

  describe("findById", () => {
    it("should find feedback by id", async () => {
      const created = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
        comment: "Great!",
      });

      const found = await courseFeedbackRepository.findById(created._id);

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.user).toBeDefined();
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const found = await courseFeedbackRepository.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe("findByCourse", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
        comment: "Great!",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser2._id,
        rating: 4,
        comment: "Good!",
      });
    });

    it("should find all feedback for a course", async () => {
      const feedback = await courseFeedbackRepository.findByCourse(
        testCourse._id
      );

      expect(feedback).toHaveLength(2);
    });
  });

  describe("findByUserAndCourse", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
        comment: "Great!",
      });
    });

    it("should find feedback by user and course", async () => {
      const feedback = await courseFeedbackRepository.findByUserAndCourse(
        testUser1._id,
        testCourse._id
      );

      expect(feedback).toBeDefined();
      expect(feedback.rating).toBe(5);
    });

    it("should return null if no feedback exists", async () => {
      const feedback = await courseFeedbackRepository.findByUserAndCourse(
        testUser2._id,
        testCourse._id
      );

      expect(feedback).toBeNull();
    });
  });

  describe("getAverageRating", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser2._id,
        rating: 3,
      });
    });

    it("should calculate average rating", async () => {
      const result = await courseFeedbackRepository.getAverageRating(
        testCourse._id
      );

      expect(result.averageRating).toBe(4);
      expect(result.totalFeedback).toBe(2);
    });

    it("should return zeros for course with no feedback", async () => {
      const anotherCourse = await Course.create({
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn data structures",
        instructor: facultyUser._id,
      });

      const result = await courseFeedbackRepository.getAverageRating(
        anotherCourse._id
      );

      expect(result.averageRating).toBe(0);
      expect(result.totalFeedback).toBe(0);
    });
  });

  describe("getRatingDistribution", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser2._id,
        rating: 5,
      });

      const user3 = await User.create({
        firstName: "Bob",
        lastName: "Johnson",
        email: "bob@test.com",
        password: "Password123!",
        phone: "555-555-5557",
        role: "student",
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: user3._id,
        rating: 4,
      });
    });

    it("should return rating distribution", async () => {
      const distribution = await courseFeedbackRepository.getRatingDistribution(
        testCourse._id
      );

      expect(distribution).toBeInstanceOf(Array);
      expect(distribution.length).toBeGreaterThan(0);

      // Find ratings
      const rating5 = distribution.find((r) => r._id === 5);
      const rating4 = distribution.find((r) => r._id === 4);

      expect(rating5.count).toBe(2);
      expect(rating4.count).toBe(1);
    });
  });

  describe("count", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser2._id,
        rating: 4,
      });
    });

    it("should count feedback for a course", async () => {
      const count = await courseFeedbackRepository.count({
        course: testCourse._id,
      });

      expect(count).toBe(2);
    });

    it("should return 0 for course with no feedback", async () => {
      const anotherCourse = await Course.create({
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn data structures",
        instructor: facultyUser._id,
      });

      const count = await courseFeedbackRepository.count({
        course: anotherCourse._id,
      });

      expect(count).toBe(0);
    });
  });

  describe("delete", () => {
    it("should delete feedback by id", async () => {
      const feedback = await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
        comment: "Great!",
      });

      const deleted = await courseFeedbackRepository.delete(feedback._id);

      expect(deleted).toBeDefined();
      expect(deleted._id.toString()).toBe(feedback._id.toString());

      const found = await CourseFeedback.findById(feedback._id);
      expect(found).toBeNull();
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const deleted = await courseFeedbackRepository.delete(fakeId);

      expect(deleted).toBeNull();
    });
  });

  describe("deleteByCourse", () => {
    beforeEach(async () => {
      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser1._id,
        rating: 5,
      });

      await CourseFeedback.create({
        course: testCourse._id,
        user: testUser2._id,
        rating: 4,
      });
    });

    it("should delete all feedback for a course", async () => {
      const result = await courseFeedbackRepository.deleteByCourse(
        testCourse._id
      );

      expect(result.deletedCount).toBe(2);

      const feedback = await CourseFeedback.find({ course: testCourse._id });
      expect(feedback).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors in createOrUpdate", async () => {
      jest.spyOn(CourseFeedback, "findOneAndUpdate").mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(
        courseFeedbackRepository.createOrUpdate({
          course: testCourse._id,
          user: testUser1._id,
          rating: 5,
        })
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in findById", async () => {
      jest.spyOn(CourseFeedback, "findById").mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest
            .fn()
            .mockRejectedValueOnce(new Error("Database error")),
        }),
      });

      await expect(courseFeedbackRepository.findById("123")).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in findByCourse", async () => {
      jest.spyOn(CourseFeedback, "find").mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          sort: jest.fn().mockRejectedValueOnce(new Error("Database error")),
        }),
      });

      await expect(
        courseFeedbackRepository.findByCourse(testCourse._id)
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in findByUserAndCourse", async () => {
      jest.spyOn(CourseFeedback, "findOne").mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          populate: jest
            .fn()
            .mockRejectedValueOnce(new Error("Database error")),
        }),
      });

      await expect(
        courseFeedbackRepository.findByUserAndCourse(
          testUser1._id,
          testCourse._id
        )
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in getAverageRating", async () => {
      jest
        .spyOn(CourseFeedback, "aggregate")
        .mockRejectedValueOnce(new Error("Database error"));

      const result = await courseFeedbackRepository.getAverageRating(
        testCourse._id
      );

      // Should return default values instead of throwing
      expect(result).toEqual({ averageRating: 0, totalFeedback: 0 });

      jest.restoreAllMocks();
    });

    it("should handle errors in getRatingDistribution", async () => {
      jest
        .spyOn(CourseFeedback, "aggregate")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(
        courseFeedbackRepository.getRatingDistribution(testCourse._id)
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in count", async () => {
      jest
        .spyOn(CourseFeedback, "countDocuments")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(
        courseFeedbackRepository.count({ course: testCourse._id })
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in delete", async () => {
      jest
        .spyOn(CourseFeedback, "findByIdAndDelete")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(courseFeedbackRepository.delete("123")).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in deleteByCourse", async () => {
      jest
        .spyOn(CourseFeedback, "deleteMany")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(
        courseFeedbackRepository.deleteByCourse(testCourse._id)
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });
  });
});
