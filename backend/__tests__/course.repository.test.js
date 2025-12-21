const courseRepository = require("../src/repositories/courseRepository");
const Course = require("../src/models/Course");
const User = require("../src/models/User");

describe("CourseRepository", () => {
  let facultyUser;

  beforeEach(async () => {
    facultyUser = await User.create({
      firstName: "John",
      lastName: "Doe",
      email: "faculty@test.com",
      password: "password123",
      role: "faculty",
    });
  });

  describe("create", () => {
    it("should create a new course", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      };

      const course = await courseRepository.create(courseData);

      expect(course._id).toBeDefined();
      expect(course.courseCode).toBe("CS101");
      expect(course.name).toBe("Introduction to Computer Science");
      expect(course.description).toBe("A comprehensive introduction");
    });

    it("should throw error for duplicate course code", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      };

      await courseRepository.create(courseData);

      await expect(courseRepository.create(courseData)).rejects.toThrow();
    });

    it("should throw error for invalid data", async () => {
      const courseData = {
        courseCode: "CS101",
        // missing required name field
        description: "A comprehensive introduction",
      };

      await expect(courseRepository.create(courseData)).rejects.toThrow();
    });
  });

  describe("findById", () => {
    it("should find course by id", async () => {
      const created = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const found = await courseRepository.findById(created._id);

      expect(found).toBeDefined();
      expect(found._id.toString()).toBe(created._id.toString());
      expect(found.courseCode).toBe("CS101");
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const found = await courseRepository.findById(fakeId);

      expect(found).toBeNull();
    });
  });

  describe("findByCourseCode", () => {
    it("should find course by course code", async () => {
      await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const found = await courseRepository.findByCourseCode("CS101");

      expect(found).toBeDefined();
      expect(found.courseCode).toBe("CS101");
    });

    it("should find course by course code case-insensitively", async () => {
      await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const found = await courseRepository.findByCourseCode("cs101");

      expect(found).toBeDefined();
      expect(found.courseCode).toBe("CS101");
    });

    it("should return null for non-existent course code", async () => {
      const found = await courseRepository.findByCourseCode("NONEXISTENT");

      expect(found).toBeNull();
    });
  });

  describe("findAll", () => {
    beforeEach(async () => {
      await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      await Course.create({
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn data structures",
        instructor: facultyUser._id,
      });

      await Course.create({
        courseCode: "CS103",
        name: "Algorithms",
        description: "Learn algorithms",
        isActive: false,
        instructor: facultyUser._id,
      });
    });

    it("should find all courses", async () => {
      const courses = await courseRepository.findAll();

      expect(courses).toHaveLength(3);
    });

    it("should find courses with filter", async () => {
      const courses = await courseRepository.findAll({ isActive: true });

      expect(courses).toHaveLength(2);
    });

    it("should return courses sorted by courseCode ascending", async () => {
      const courses = await courseRepository.findAll();

      // CS101 was created first, so should be first when sorted by courseCode
      expect(courses[0].courseCode).toBe("CS101");
    });
  });

  describe("findWithPagination", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 15; i++) {
        await Course.create({
          courseCode: `CS${100 + i}`,
          name: `Course ${i}`,
          description: `Description ${i}`,
          instructor: facultyUser._id,
        });
      }
    });

    it("should return paginated courses", async () => {
      const courses = await courseRepository.findWithPagination({}, 0, 10);

      expect(courses).toHaveLength(10);
    });

    it("should return second page of courses", async () => {
      const page1 = await courseRepository.findWithPagination({}, 0, 10);
      const page2 = await courseRepository.findWithPagination({}, 10, 10);

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(5);
      expect(page1[0]._id.toString()).not.toBe(page2[0]._id.toString());
    });

    it("should apply filter with pagination", async () => {
      await Course.updateMany({ courseCode: /CS10[1-5]/ }, { isActive: false });

      const courses = await courseRepository.findWithPagination(
        { isActive: true },
        0,
        20
      );

      expect(courses.length).toBeLessThan(15);
      courses.forEach((course) => {
        expect(course.isActive).toBe(true);
      });
    });
  });

  describe("count", () => {
    beforeEach(async () => {
      await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      await Course.create({
        courseCode: "CS102",
        name: "Data Structures",
        description: "Learn data structures",
        instructor: facultyUser._id,
      });

      await Course.create({
        courseCode: "CS103",
        name: "Algorithms",
        description: "Learn algorithms",
        isActive: false,
        instructor: facultyUser._id,
      });
    });

    it("should count all courses", async () => {
      const count = await courseRepository.count();

      expect(count).toBe(3);
    });

    it("should count courses with filter", async () => {
      const count = await courseRepository.count({ isActive: true });

      expect(count).toBe(2);
    });
  });

  describe("update", () => {
    it("should update course by id", async () => {
      const course = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const updated = await courseRepository.update(course._id, {
        name: "Updated Course Name",
      });

      expect(updated.name).toBe("Updated Course Name");
      expect(updated.courseCode).toBe("CS101");
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const updated = await courseRepository.update(fakeId, {
        name: "Updated Name",
      });

      expect(updated).toBeNull();
    });

    it("should run validators on update", async () => {
      const course = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      await expect(
        courseRepository.update(course._id, {
          courseCode: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("updateWithVersion", () => {
    it("should update course with correct version", async () => {
      const course = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const updated = await courseRepository.updateWithVersion(
        course._id,
        course.__v,
        {
          name: "Updated Course Name",
        }
      );

      expect(updated).toBeDefined();
      expect(updated.name).toBe("Updated Course Name");
      expect(updated.__v).toBe(course.__v + 1);
    });

    it("should return null for incorrect version", async () => {
      const course = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const updated = await courseRepository.updateWithVersion(
        course._id,
        999,
        {
          name: "Updated Course Name",
        }
      );

      expect(updated).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete course by id", async () => {
      const course = await Course.create({
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: facultyUser._id,
      });

      const deleted = await courseRepository.delete(course._id);

      expect(deleted).toBeDefined();
      expect(deleted._id.toString()).toBe(course._id.toString());

      const found = await Course.findById(course._id);
      expect(found).toBeNull();
    });

    it("should return null for non-existent id", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const deleted = await courseRepository.delete(fakeId);

      expect(deleted).toBeNull();
    });
  });

  describe("Error Handling", () => {
    it("should handle errors in create", async () => {
      jest
        .spyOn(Course, "create")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(
        courseRepository.create({
          courseCode: "TEST101",
          name: "Test Course",
          description: "Test Description",
        })
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in findById", async () => {
      jest.spyOn(Course, "findById").mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(courseRepository.findById("123")).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in findByCourseCode", async () => {
      jest
        .spyOn(Course, "findOne")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(courseRepository.findByCourseCode("TEST")).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in findAll", async () => {
      jest.spyOn(Course, "find").mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          sort: jest.fn().mockRejectedValueOnce(new Error("Database error")),
        }),
      });

      await expect(courseRepository.findAll()).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in findWithPagination", async () => {
      jest.spyOn(Course, "find").mockReturnValueOnce({
        populate: jest.fn().mockReturnValueOnce({
          skip: jest.fn().mockReturnValueOnce({
            limit: jest.fn().mockReturnValueOnce({
              sort: jest
                .fn()
                .mockRejectedValueOnce(new Error("Database error")),
            }),
          }),
        }),
      });

      await expect(courseRepository.findWithPagination()).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });

    it("should handle errors in count", async () => {
      jest
        .spyOn(Course, "countDocuments")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(courseRepository.count()).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in update", async () => {
      jest.spyOn(Course, "findByIdAndUpdate").mockReturnValueOnce({
        populate: jest.fn().mockRejectedValueOnce(new Error("Database error")),
      });

      await expect(
        courseRepository.update("123", { name: "Test" })
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in updateWithVersion", async () => {
      jest
        .spyOn(Course, "findOneAndUpdate")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(
        courseRepository.updateWithVersion("123", { name: "Test" }, 0)
      ).rejects.toThrow("Database error");

      jest.restoreAllMocks();
    });

    it("should handle errors in delete", async () => {
      jest
        .spyOn(Course, "findByIdAndDelete")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(courseRepository.delete("123")).rejects.toThrow(
        "Database error"
      );

      jest.restoreAllMocks();
    });
  });
});
