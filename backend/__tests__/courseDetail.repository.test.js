const courseDetailRepository = require("../src/repositories/courseDetailRepository");
const CourseDetail = require("../src/models/CourseDetail");
const Course = require("../src/models/Course");

describe("CourseDetailRepository", () => {
  let testCourse;

  beforeEach(async () => {
    testCourse = await Course.create({
      courseCode: "CS101",
      name: "Introduction to Computer Science",
      description: "A comprehensive introduction",
    });
  });

  describe("create", () => {
    it("should create a new course detail", async () => {
      const detailData = {
        course: testCourse._id,
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      };

      const detail = await courseDetailRepository.create(detailData);

      expect(detail._id).toBeDefined();
      expect(detail.title).toBe("Week 1: Introduction");
      expect(detail.type).toBe("document");
    });

    it("should throw error for invalid data", async () => {
      const detailData = {
        course: testCourse._id,
        title: "Week 1",
        // Missing required type field
      };

      await expect(courseDetailRepository.create(detailData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find detail by id", async () => {
      const created = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const found = await courseDetailRepository.findById(created._id);

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.course).toBeDefined();
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const found = await courseDetailRepository.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe("findByCourse", () => {
    beforeEach(async () => {
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
        type: "video",
        url: "https://example.com/week2.mp4",
        order: 2,
      });
    });

    it("should find all details for a course", async () => {
      const details = await courseDetailRepository.findByCourse(testCourse._id);

      expect(details).toHaveLength(2);
      expect(details[0].order).toBe(1);
      expect(details[1].order).toBe(2);
    });

    it("should find details with filter", async () => {
      const details = await courseDetailRepository.findByCourse(
        testCourse._id,
        { type: "document" }
      );

      expect(details).toHaveLength(1);
      expect(details[0].type).toBe("document");
    });
  });

  describe("findByType", () => {
    beforeEach(async () => {
      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1 Doc",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1 Video",
        type: "video",
        url: "https://example.com/week1.mp4",
      });
    });

    it("should find details by type", async () => {
      const details = await courseDetailRepository.findByType(
        testCourse._id,
        "document"
      );

      expect(details).toHaveLength(1);
      expect(details[0].type).toBe("document");
    });
  });

  describe("update", () => {
    it("should update detail by id", async () => {
      const detail = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const updated = await courseDetailRepository.update(detail._id, {
        title: "Week 1 Updated",
      });

      expect(updated.title).toBe("Week 1 Updated");
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const updated = await courseDetailRepository.update(fakeId, {
        title: "Updated",
      });

      expect(updated).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete detail by id", async () => {
      const detail = await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      const deleted = await courseDetailRepository.delete(detail._id);

      expect(deleted).toBeDefined();
      expect(deleted._id.toString()).toBe(detail._id.toString());

      const found = await CourseDetail.findById(detail._id);
      expect(found).toBeNull();
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const deleted = await courseDetailRepository.delete(fakeId);

      expect(deleted).toBeNull();
    });
  });

  describe("deleteByCourse", () => {
    beforeEach(async () => {
      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 2",
        type: "video",
        url: "https://example.com/week2.mp4",
      });
    });

    it("should delete all details for a course", async () => {
      const result = await courseDetailRepository.deleteByCourse(
        testCourse._id
      );

      expect(result.deletedCount).toBe(2);

      const details = await CourseDetail.find({ course: testCourse._id });
      expect(details).toHaveLength(0);
    });
  });

  describe("findAll", () => {
    beforeEach(async () => {
      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 2",
        type: "video",
        url: "https://example.com/week2.mp4",
      });
    });

    it("should find all course details", async () => {
      const details = await courseDetailRepository.findAll();

      expect(details).toHaveLength(2);
    });

    it("should find details with filter", async () => {
      const details = await courseDetailRepository.findAll({ type: "video" });

      expect(details).toHaveLength(1);
      expect(details[0].type).toBe("video");
    });
  });

  describe("count", () => {
    beforeEach(async () => {
      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      });

      await CourseDetail.create({
        course: testCourse._id,
        title: "Week 2",
        type: "video",
        url: "https://example.com/week2.mp4",
      });
    });

    it("should count all details", async () => {
      const count = await courseDetailRepository.count();

      expect(count).toBe(2);
    });

    it("should count details with filter", async () => {
      const count = await courseDetailRepository.count({ type: "document" });

      expect(count).toBe(1);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors in create", async () => {
      jest
        .spyOn(CourseDetail, "create")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(
        courseDetailRepository.create({
          course: testCourse._id,
          title: "Test",
          type: "document",
          url: "https://test.com",
        })
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in findById", async () => {
      jest.spyOn(CourseDetail, "findById").mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(courseDetailRepository.findById("123")).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in findByCourse", async () => {
      jest.spyOn(CourseDetail, "find").mockReturnValueOnce({
        sort: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(
        courseDetailRepository.findByCourse(testCourse._id)
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in findByType", async () => {
      jest.spyOn(CourseDetail, "find").mockReturnValueOnce({
        sort: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(
        courseDetailRepository.findByType(testCourse._id, "document")
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in findAll", async () => {
      jest.spyOn(CourseDetail, "find").mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          sort: jest.fn().mockRejectedValueOnce(new Error("Database error")),
        }),
      });

      await expect(courseDetailRepository.findAll()).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in count", async () => {
      jest
        .spyOn(CourseDetail, "countDocuments")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(courseDetailRepository.count()).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in update", async () => {
      jest.spyOn(CourseDetail, "findByIdAndUpdate").mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(
        courseDetailRepository.update("123", { title: "New" })
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in delete", async () => {
      jest
        .spyOn(CourseDetail, "findByIdAndDelete")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(courseDetailRepository.delete("123")).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in deleteByCourse", async () => {
      jest
        .spyOn(CourseDetail, "deleteMany")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(
        courseDetailRepository.deleteByCourse(testCourse._id)
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });
  });
});
