const mongoose = require("mongoose");
const CourseDetail = require("../src/models/CourseDetail");
const Course = require("../src/models/Course");

describe("CourseDetail Model", () => {
  let testCourse;

  beforeEach(async () => {
    testCourse = await Course.create({
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
    });
  });

  describe("Schema Validation", () => {
    it("should create a valid course detail with all required fields", async () => {
      const detailData = {
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
        description: "Introduction to basic concepts",
      };

      const courseDetail = new CourseDetail(detailData);
      const savedDetail = await courseDetail.save();

      expect(savedDetail._id).toBeDefined();
      expect(savedDetail.course.toString()).toBe(testCourse._id.toString());
      expect(savedDetail.title).toBe("Week 1: Introduction");
      expect(savedDetail.type).toBe("document");
      expect(savedDetail.url).toBe("https://example.com/week1.pdf");
      expect(savedDetail.description).toBe("Introduction to basic concepts");
      expect(savedDetail.order).toBe(0);
      expect(savedDetail.createdAt).toBeDefined();
      expect(savedDetail.updatedAt).toBeDefined();
    });

    it("should fail without required course reference", async () => {
      const courseDetail = new CourseDetail({
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
        description: "Introduction to basic concepts",
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should fail without required title", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        type: "document",
        url: "https://example.com/week1.pdf",
        description: "Introduction to basic concepts",
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should fail without required type", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        url: "https://example.com/week1.pdf",
        description: "Introduction to basic concepts",
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should fail without required url", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        description: "Introduction to basic concepts",
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should allow creation without description", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const savedDetail = await courseDetail.save();
      expect(savedDetail._id).toBeDefined();
      expect(savedDetail.description).toBeUndefined();
    });

    it("should validate type enum values", async () => {
      const validTypes = ["document", "video", "presentation", "other"];

      for (const type of validTypes) {
        const courseDetail = new CourseDetail({
          course: testCourse._id,
          title: `Test ${type}`,
          type: type,
          url: `https://example.com/${type}`,
        });

        const savedDetail = await courseDetail.save();
        expect(savedDetail.type).toBe(type);
      }
    });

    it("should fail with invalid type enum value", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "invalid-type",
        url: "https://example.com/week1.pdf",
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should have default order value of 0", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const savedDetail = await courseDetail.save();
      expect(savedDetail.order).toBe(0);
    });

    it("should allow setting custom order value", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
        order: 5,
      });

      const savedDetail = await courseDetail.save();
      expect(savedDetail.order).toBe(5);
    });

    it("should trim whitespace from title and url", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "  Week 1: Introduction  ",
        type: "document",
        url: "  https://example.com/week1.pdf  ",
      });

      const savedDetail = await courseDetail.save();
      expect(savedDetail.title).toBe("Week 1: Introduction");
      expect(savedDetail.url).toBe("https://example.com/week1.pdf");
    });

    it("should enforce maximum length for title", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "A".repeat(201),
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should enforce maximum length for url", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/" + "A".repeat(1000),
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should enforce maximum length for description", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
        description: "A".repeat(1001),
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should fail with invalid course ObjectId", async () => {
      const courseDetail = new CourseDetail({
        course: "invalid-id",
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      await expect(courseDetail.save()).rejects.toThrow();
    });

    it("should create timestamps automatically", async () => {
      const courseDetail = new CourseDetail({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const savedDetail = await courseDetail.save();
      expect(savedDetail.createdAt).toBeInstanceOf(Date);
      expect(savedDetail.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt timestamp on modification", async () => {
      const courseDetail = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const originalUpdatedAt = courseDetail.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      courseDetail.title = "Updated Title";
      const updatedDetail = await courseDetail.save();

      expect(updatedDetail.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Course Reference", () => {
    it("should populate course reference", async () => {
      const courseDetail = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const populated = await CourseDetail.findById(courseDetail._id).populate(
        "course"
      );

      expect(populated.course.courseCode).toBe("CS101");
      expect(populated.course.name).toBe("Introduction to Computer Science");
    });

    it("should allow multiple details for same course", async () => {
      const detail1 = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
        order: 1,
      });

      const detail2 = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 2: Advanced Topics",
        type: "video",
        url: "https://example.com/week2.mp4",
        order: 2,
      });

      expect(detail1._id).toBeDefined();
      expect(detail2._id).toBeDefined();
      expect(detail1.course.toString()).toBe(detail2.course.toString());
    });
  });

  describe("Ordering", () => {
    it("should maintain order when querying by course", async () => {
      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 3",
        type: "document",
        url: "https://example.com/week3.pdf",
        order: 3,
      });

      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
        order: 1,
      });

      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 2",
        type: "document",
        url: "https://example.com/week2.pdf",
        order: 2,
      });

      const details = await CourseDetail.find({ course: testCourse._id }).sort({
        order: 1,
      });

      expect(details).toHaveLength(3);
      expect(details[0].title).toBe("Week 1");
      expect(details[1].title).toBe("Week 2");
      expect(details[2].title).toBe("Week 3");
    });
  });
});
