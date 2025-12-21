const Course = require("../src/models/Course");
const User = require("../src/models/User");

describe("Course Model", () => {
  let facultyUser;

  beforeEach(async () => {
    // Create a faculty user for testing before each test
    facultyUser = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "faculty@test.com",
      password: "password123",
      role: "faculty",
    });
  });

  describe("Schema Validation", () => {
    it("should create a valid course with all required fields", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description:
          "A comprehensive introduction to computer science fundamentals",
        instructor: facultyUser._id,
      };

      const course = new Course(courseData);
      const savedCourse = await course.save();

      expect(savedCourse._id).toBeDefined();
      expect(savedCourse.courseCode).toBe("CS101");
      expect(savedCourse.name).toBe("Introduction to Computer Science");
      expect(savedCourse.description).toBe(
        "A comprehensive introduction to computer science fundamentals"
      );
      expect(savedCourse.isActive).toBe(true);
      expect(savedCourse.createdAt).toBeDefined();
      expect(savedCourse.updatedAt).toBeDefined();
    });

    it("should uppercase the course code", async () => {
      const course = new Course({
        courseCode: "cs101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const savedCourse = await course.save();
      expect(savedCourse.courseCode).toBe("CS101");
    });

    it("should fail without required courseCode", async () => {
      const course = new Course({
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should fail without required name", async () => {
      const course = new Course({
        courseCode: "CS101",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should fail without required description", async () => {
      const course = new Course({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        instructor: facultyUser._id,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should fail with duplicate course code", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      };

      await Course.create(courseData);

      const duplicateCourse = new Course(courseData);
      await expect(duplicateCourse.save()).rejects.toThrow();
    });

    it("should trim whitespace from fields", async () => {
      const course = new Course({
        courseCode: "  CS101  ",
        name: "  Introduction to Computer Science  ",
        description: "  A comprehensive introduction  ",
        instructor: facultyUser._id,
      });

      const savedCourse = await course.save();
      expect(savedCourse.courseCode).toBe("CS101");
      expect(savedCourse.name).toBe("Introduction to Computer Science");
      expect(savedCourse.description).toBe("A comprehensive introduction");
    });

    it("should enforce maximum length for courseCode", async () => {
      const course = new Course({
        courseCode: "A".repeat(21),
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should enforce maximum length for name", async () => {
      const course = new Course({
        courseCode: "CS101",
        name: "A".repeat(101),
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should enforce maximum length for description", async () => {
      const course = new Course({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A".repeat(1001),
        instructor: facultyUser._id,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should have default isActive value of true", async () => {
      const course = new Course({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const savedCourse = await course.save();
      expect(savedCourse.isActive).toBe(true);
    });

    it("should allow setting isActive to false", async () => {
      const course = new Course({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        isActive: false,
        instructor: facultyUser._id,
      });

      const savedCourse = await course.save();
      expect(savedCourse.isActive).toBe(false);
    });

    it("should create timestamps automatically", async () => {
      const course = new Course({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const savedCourse = await course.save();
      expect(savedCourse.createdAt).toBeInstanceOf(Date);
      expect(savedCourse.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt timestamp on modification", async () => {
      const course = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const originalUpdatedAt = course.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      course.name = "Updated Course Name";
      const updatedCourse = await course.save();

      expect(updatedCourse.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Course Code Case Sensitivity", () => {
    it("should treat lowercase and uppercase course codes as the same", async () => {
      await Course.create({
        courseCode: "cs101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const duplicateCourse = new Course({
        courseCode: "CS101",
        name: "Different Course",
        description: "Different description",
        instructor: facultyUser._id,
      });

      await expect(duplicateCourse.save()).rejects.toThrow();
    });
  });

  describe("Instance Methods", () => {
    it("should convert to object correctly", async () => {
      const course = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const courseObject = course.toObject();
      expect(courseObject).toHaveProperty("_id");
      expect(courseObject).toHaveProperty("courseCode");
      expect(courseObject).toHaveProperty("name");
      expect(courseObject).toHaveProperty("description");
      expect(courseObject).toHaveProperty("isActive");
      expect(courseObject).toHaveProperty("createdAt");
      expect(courseObject).toHaveProperty("updatedAt");
    });
  });

  describe("Instructor Field", () => {
    it("should create course with a valid faculty instructor", async () => {
      const course = await Course.create({
        courseCode: "CS201",
        name: "Data Structures",
        description: "Learn about data structures",
        instructor: facultyUser._id,
      });

      expect(course.instructor).toBeDefined();
      expect(course.instructor.toString()).toBe(facultyUser._id.toString());
    });

    it("should fail without required instructor", async () => {
      const course = new Course({
        courseCode: "CS202",
        name: "Algorithms",
        description: "Learn about algorithms",
      });

      await expect(course.save()).rejects.toThrow("Please add an instructor");
    });

    it("should fail when instructor is not a faculty member", async () => {
      const studentUser = await User.create({
        firstName: "Jane",
        lastName: "Smith",
        email: "student@test.com",
        password: "password123",
        role: "student",
      });

      const course = new Course({
        courseCode: "CS203",
        name: "Operating Systems",
        description: "Learn about operating systems",
        instructor: studentUser._id,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should fail when instructor does not exist", async () => {
      const mongoose = require("mongoose");
      const fakeId = new mongoose.Types.ObjectId();

      const course = new Course({
        courseCode: "CS204",
        name: "Networks",
        description: "Learn about networks",
        instructor: fakeId,
      });

      await expect(course.save()).rejects.toThrow();
    });

    it("should populate instructor information", async () => {
      const course = await Course.create({
        courseCode: "CS205",
        name: "Database Systems",
        description: "Learn about databases",
        instructor: facultyUser._id,
      });

      const populatedCourse = await Course.findById(course._id).populate(
        "instructor",
        "firstName lastName email"
      );

      expect(populatedCourse.instructor).toBeDefined();
      expect(populatedCourse.instructor.firstName).toBe("John");
      expect(populatedCourse.instructor.lastName).toBe("Doe");
      expect(populatedCourse.instructor.email).toBe("faculty@test.com");
    });
  });
});
