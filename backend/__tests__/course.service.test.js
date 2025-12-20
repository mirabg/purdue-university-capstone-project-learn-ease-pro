const courseService = require("../src/services/courseService");
const courseRepository = require("../src/repositories/courseRepository");
const courseDetailRepository = require("../src/repositories/courseDetailRepository");
const courseFeedbackRepository = require("../src/repositories/courseFeedbackRepository");

jest.mock("../src/repositories/courseRepository");
jest.mock("../src/repositories/courseDetailRepository");
jest.mock("../src/repositories/courseFeedbackRepository");

describe("CourseService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createCourse", () => {
    it("should create a new course", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
      };

      courseRepository.findByCourseCode.mockResolvedValue(null);
      courseRepository.create.mockResolvedValue({
        _id: "123",
        ...courseData,
      });

      const result = await courseService.createCourse(courseData);

      expect(courseRepository.findByCourseCode).toHaveBeenCalledWith("CS101");
      expect(courseRepository.create).toHaveBeenCalledWith(courseData);
      expect(result.courseCode).toBe("CS101");
    });

    it("should throw error for duplicate course code", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
      };

      courseRepository.findByCourseCode.mockResolvedValue({
        _id: "123",
        courseCode: "CS101",
        name: "Existing Course",
      });

      await expect(courseService.createCourse(courseData)).rejects.toThrow(
        "Course code already exists"
      );
      expect(courseRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getCourseById", () => {
    it("should get course by id without details", async () => {
      const mockCourse = {
        _id: "123",
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        toObject: jest.fn().mockReturnValue({
          _id: "123",
          courseCode: "CS101",
          name: "Introduction to Computer Science",
        }),
      };

      courseRepository.findById.mockResolvedValue(mockCourse);

      const result = await courseService.getCourseById("123", false);

      expect(courseRepository.findById).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockCourse);
      expect(courseDetailRepository.findByCourse).not.toHaveBeenCalled();
    });

    it("should get course by id with details", async () => {
      const mockCourse = {
        _id: "123",
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        toObject: jest.fn().mockReturnValue({
          _id: "123",
          courseCode: "CS101",
          name: "Introduction to Computer Science",
        }),
      };

      const mockDetails = [
        { _id: "detail1", title: "Week 1", type: "document" },
        { _id: "detail2", title: "Week 2", type: "video" },
      ];

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseDetailRepository.findByCourse.mockResolvedValue(mockDetails);

      const result = await courseService.getCourseById("123", true);

      expect(courseRepository.findById).toHaveBeenCalledWith("123");
      expect(courseDetailRepository.findByCourse).toHaveBeenCalledWith("123");
      expect(result.details).toEqual(mockDetails);
    });

    it("should throw error for non-existent course", async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(courseService.getCourseById("123")).rejects.toThrow(
        "Course not found"
      );
    });
  });

  describe("getAllCourses", () => {
    it("should get all courses with pagination", async () => {
      const mockCourses = [
        { _id: "1", courseCode: "CS101", name: "Course 1" },
        { _id: "2", courseCode: "CS102", name: "Course 2" },
      ];

      courseRepository.findWithPagination.mockResolvedValue(mockCourses);
      courseRepository.count.mockResolvedValue(20);

      const result = await courseService.getAllCourses(1, 10);

      expect(courseRepository.findWithPagination).toHaveBeenCalledWith(
        {},
        0,
        10
      );
      expect(courseRepository.count).toHaveBeenCalledWith({});
      expect(result.courses).toEqual(mockCourses);
      expect(result.total).toBe(20);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(2);
    });

    it("should get courses with search filter", async () => {
      const mockCourses = [{ _id: "1", courseCode: "CS101", name: "Course 1" }];

      courseRepository.findWithPagination.mockResolvedValue(mockCourses);
      courseRepository.count.mockResolvedValue(1);

      const result = await courseService.getAllCourses(1, 10, "CS101");

      const expectedFilter = {
        $or: [
          { courseCode: { $regex: "CS101", $options: "i" } },
          { name: { $regex: "CS101", $options: "i" } },
          { description: { $regex: "CS101", $options: "i" } },
        ],
      };

      expect(courseRepository.findWithPagination).toHaveBeenCalledWith(
        expectedFilter,
        0,
        10
      );
      expect(result.courses).toEqual(mockCourses);
      expect(result.total).toBe(1);
    });
  });

  describe("updateCourse", () => {
    it("should update course without version", async () => {
      const updateData = { name: "Updated Course Name" };
      const mockCourse = {
        _id: "123",
        courseCode: "CS101",
        name: "Updated Course Name",
      };

      courseRepository.update.mockResolvedValue(mockCourse);

      const result = await courseService.updateCourse("123", updateData);

      expect(courseRepository.update).toHaveBeenCalledWith("123", updateData);
      expect(result).toEqual(mockCourse);
    });

    it("should update course with version (optimistic locking)", async () => {
      const updateData = { name: "Updated Course Name" };
      const mockCourse = {
        _id: "123",
        courseCode: "CS101",
        name: "Updated Course Name",
        __v: 1,
      };

      courseRepository.updateWithVersion.mockResolvedValue(mockCourse);

      const result = await courseService.updateCourse("123", updateData, 0);

      expect(courseRepository.updateWithVersion).toHaveBeenCalledWith(
        "123",
        0,
        updateData
      );
      expect(result).toEqual(mockCourse);
    });

    it("should throw error for incorrect version", async () => {
      const updateData = { name: "Updated Course Name" };

      courseRepository.updateWithVersion.mockResolvedValue(null);

      await expect(
        courseService.updateCourse("123", updateData, 0)
      ).rejects.toThrow(
        "Course not found or has been modified by another process"
      );
    });

    it("should throw error when updating to duplicate course code", async () => {
      const updateData = { courseCode: "CS102" };

      courseRepository.findByCourseCode.mockResolvedValue({
        _id: "456",
        courseCode: "CS102",
      });

      await expect(
        courseService.updateCourse("123", updateData)
      ).rejects.toThrow("Course code already exists");
    });

    it("should allow updating same course's own course code", async () => {
      const updateData = { courseCode: "CS101", name: "Updated Name" };
      const mockCourse = {
        _id: "123",
        courseCode: "CS101",
      };

      courseRepository.findByCourseCode.mockResolvedValue(mockCourse);
      courseRepository.update.mockResolvedValue(mockCourse);

      const result = await courseService.updateCourse("123", updateData);

      expect(result).toEqual(mockCourse);
    });

    it("should throw error when course not found during update", async () => {
      const updateData = { name: "Updated Name" };

      courseRepository.update.mockResolvedValue(null);

      await expect(
        courseService.updateCourse("123", updateData)
      ).rejects.toThrow("Course not found");
    });
  });

  describe("deleteCourse", () => {
    it("should delete course and its details", async () => {
      const mockCourse = {
        _id: "123",
        courseCode: "CS101",
        name: "Course to Delete",
      };

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseDetailRepository.deleteByCourse.mockResolvedValue({
        deletedCount: 2,
      });
      courseRepository.delete.mockResolvedValue(mockCourse);

      const result = await courseService.deleteCourse("123");

      expect(courseRepository.findById).toHaveBeenCalledWith("123");
      expect(courseDetailRepository.deleteByCourse).toHaveBeenCalledWith("123");
      expect(courseRepository.delete).toHaveBeenCalledWith("123");
      expect(result.message).toBe(
        "Course and all related details deleted successfully"
      );
    });

    it("should throw error for non-existent course", async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(courseService.deleteCourse("123")).rejects.toThrow(
        "Course not found"
      );
      expect(courseDetailRepository.deleteByCourse).not.toHaveBeenCalled();
      expect(courseRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("addCourseDetail", () => {
    it("should add detail to course", async () => {
      const detailData = {
        course: "123",
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      };

      const mockCourse = { _id: "123", courseCode: "CS101" };
      const mockDetail = { _id: "detail1", ...detailData };

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseDetailRepository.create.mockResolvedValue(mockDetail);

      const result = await courseService.addCourseDetail(detailData);

      expect(courseRepository.findById).toHaveBeenCalledWith("123");
      expect(courseDetailRepository.create).toHaveBeenCalledWith(detailData);
      expect(result).toEqual(mockDetail);
    });

    it("should throw error for non-existent course", async () => {
      const detailData = {
        course: "123",
        title: "Week 1",
        type: "document",
        url: "https://example.com/week1.pdf",
      };

      courseRepository.findById.mockResolvedValue(null);

      await expect(courseService.addCourseDetail(detailData)).rejects.toThrow(
        "Course not found"
      );
      expect(courseDetailRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("getCourseDetails", () => {
    it("should get all course details", async () => {
      const mockCourse = { _id: "123", courseCode: "CS101" };
      const mockDetails = [
        { _id: "1", title: "Week 1", type: "document" },
        { _id: "2", title: "Week 2", type: "video" },
      ];

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseDetailRepository.findByCourse.mockResolvedValue(mockDetails);

      const result = await courseService.getCourseDetails("123");

      expect(courseRepository.findById).toHaveBeenCalledWith("123");
      expect(courseDetailRepository.findByCourse).toHaveBeenCalledWith("123");
      expect(result).toEqual(mockDetails);
    });

    it("should get course details by type", async () => {
      const mockCourse = { _id: "123", courseCode: "CS101" };
      const mockDetails = [{ _id: "1", title: "Week 1", type: "document" }];

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseDetailRepository.findByType.mockResolvedValue(mockDetails);

      const result = await courseService.getCourseDetails("123", "document");

      expect(courseRepository.findById).toHaveBeenCalledWith("123");
      expect(courseDetailRepository.findByType).toHaveBeenCalledWith(
        "123",
        "document"
      );
      expect(result).toEqual(mockDetails);
    });

    it("should throw error when course not found", async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(courseService.getCourseDetails("999")).rejects.toThrow(
        "Course not found"
      );

      expect(courseDetailRepository.findByCourse).not.toHaveBeenCalled();
      expect(courseDetailRepository.findByType).not.toHaveBeenCalled();
    });
  });

  describe("updateCourseDetail", () => {
    it("should update course detail", async () => {
      const updateData = { title: "Updated Title" };
      const mockDetail = {
        _id: "detail1",
        title: "Updated Title",
        type: "document",
      };

      courseDetailRepository.update.mockResolvedValue(mockDetail);

      const result = await courseService.updateCourseDetail(
        "detail1",
        updateData
      );

      expect(courseDetailRepository.update).toHaveBeenCalledWith(
        "detail1",
        updateData
      );
      expect(result).toEqual(mockDetail);
    });

    it("should throw error for non-existent detail", async () => {
      courseDetailRepository.update.mockResolvedValue(null);

      await expect(
        courseService.updateCourseDetail("detail1", { title: "Updated" })
      ).rejects.toThrow("Course detail not found");
    });
  });

  describe("deleteCourseDetail", () => {
    it("should delete course detail", async () => {
      const mockDetail = { _id: "detail1", title: "Week 1" };

      courseDetailRepository.delete.mockResolvedValue(mockDetail);

      const result = await courseService.deleteCourseDetail("detail1");

      expect(courseDetailRepository.delete).toHaveBeenCalledWith("detail1");
      expect(result.message).toBe("Course detail deleted successfully");
    });

    it("should throw error for non-existent detail", async () => {
      courseDetailRepository.delete.mockResolvedValue(null);

      await expect(courseService.deleteCourseDetail("detail1")).rejects.toThrow(
        "Course detail not found"
      );
    });
  });

  describe("addOrUpdateFeedback", () => {
    it("should add or update feedback", async () => {
      const feedbackData = {
        rating: 5,
        comment: "Great course!",
      };

      const mockCourse = { _id: "course1", courseCode: "CS101" };
      const mockFeedback = {
        _id: "feedback1",
        user: "user1",
        course: "course1",
        ...feedbackData,
      };

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseFeedbackRepository.createOrUpdate.mockResolvedValue(mockFeedback);

      const result = await courseService.addOrUpdateFeedback(
        "user1",
        "course1",
        feedbackData
      );

      expect(courseRepository.findById).toHaveBeenCalledWith("course1");
      expect(courseFeedbackRepository.createOrUpdate).toHaveBeenCalledWith({
        user: "user1",
        course: "course1",
        rating: 5,
        comment: "Great course!",
      });
      expect(result).toEqual(mockFeedback);
    });

    it("should throw error for non-existent course", async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(
        courseService.addOrUpdateFeedback("user1", "course1", { rating: 5 })
      ).rejects.toThrow("Course not found");
    });
  });

  describe("getCourseFeedback", () => {
    it("should get course feedback with statistics", async () => {
      const mockCourse = { _id: "course1", courseCode: "CS101" };
      const mockFeedback = [
        { _id: "1", rating: 5, comment: "Great!" },
        { _id: "2", rating: 4, comment: "Good!" },
      ];
      const mockStats = { averageRating: 4.5, totalFeedback: 2 };
      const mockDistribution = { 5: 1, 4: 1 };

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseFeedbackRepository.findByCourse.mockResolvedValue(mockFeedback);
      courseFeedbackRepository.getAverageRating.mockResolvedValue(mockStats);
      courseFeedbackRepository.getRatingDistribution.mockResolvedValue(
        mockDistribution
      );

      const result = await courseService.getCourseFeedback("course1");

      expect(result.feedback).toEqual(mockFeedback);
      expect(result.statistics.averageRating).toBe(4.5);
      expect(result.statistics.totalFeedback).toBe(2);
      expect(result.statistics.ratingDistribution).toEqual(mockDistribution);
    });

    it("should return zero stats when no feedback exists", async () => {
      const mockCourse = { _id: "course1", courseCode: "CS101" };

      courseRepository.findById.mockResolvedValue(mockCourse);
      courseFeedbackRepository.findByCourse.mockResolvedValue([]);
      courseFeedbackRepository.getAverageRating.mockResolvedValue({});
      courseFeedbackRepository.getRatingDistribution.mockResolvedValue({});

      const result = await courseService.getCourseFeedback("course1");

      expect(result.statistics.averageRating).toBe(0);
      expect(result.statistics.totalFeedback).toBe(0);
    });

    it("should throw error when course not found", async () => {
      courseRepository.findById.mockResolvedValue(null);

      await expect(courseService.getCourseFeedback("999")).rejects.toThrow(
        "Course not found"
      );

      expect(courseFeedbackRepository.findByCourse).not.toHaveBeenCalled();
      expect(courseFeedbackRepository.getAverageRating).not.toHaveBeenCalled();
    });
  });

  describe("getUserCourseFeedback", () => {
    it("should get user's feedback for a course", async () => {
      const mockFeedback = {
        _id: "feedback1",
        user: "user1",
        course: "course1",
        rating: 5,
      };

      courseFeedbackRepository.findByUserAndCourse.mockResolvedValue(
        mockFeedback
      );

      const result = await courseService.getUserCourseFeedback(
        "user1",
        "course1"
      );

      expect(courseFeedbackRepository.findByUserAndCourse).toHaveBeenCalledWith(
        "user1",
        "course1"
      );
      expect(result).toEqual(mockFeedback);
    });
  });

  describe("deleteFeedback", () => {
    it("should allow user to delete their own feedback", async () => {
      const mockFeedback = {
        _id: "feedback1",
        user: { _id: "user1" },
        course: "course1",
        rating: 5,
      };

      courseFeedbackRepository.findById.mockResolvedValue(mockFeedback);
      courseFeedbackRepository.delete.mockResolvedValue(mockFeedback);

      const result = await courseService.deleteFeedback(
        "feedback1",
        "user1",
        "student"
      );

      expect(courseFeedbackRepository.findById).toHaveBeenCalledWith(
        "feedback1"
      );
      expect(courseFeedbackRepository.delete).toHaveBeenCalledWith("feedback1");
      expect(result.message).toBe("Feedback deleted successfully");
    });

    it("should allow admin to delete any feedback", async () => {
      const mockFeedback = {
        _id: "feedback1",
        user: { _id: "user1" },
        course: "course1",
        rating: 5,
      };

      courseFeedbackRepository.findById.mockResolvedValue(mockFeedback);
      courseFeedbackRepository.delete.mockResolvedValue(mockFeedback);

      const result = await courseService.deleteFeedback(
        "feedback1",
        "user2",
        "admin"
      );

      expect(result.message).toBe("Feedback deleted successfully");
    });

    it("should throw error when non-admin tries to delete other's feedback", async () => {
      const mockFeedback = {
        _id: "feedback1",
        user: { _id: "user1" },
        course: "course1",
        rating: 5,
      };

      courseFeedbackRepository.findById.mockResolvedValue(mockFeedback);

      await expect(
        courseService.deleteFeedback("feedback1", "user2", "student")
      ).rejects.toThrow("Not authorized to delete this feedback");
      expect(courseFeedbackRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error for non-existent feedback", async () => {
      courseFeedbackRepository.findById.mockResolvedValue(null);

      await expect(
        courseService.deleteFeedback("feedback1", "user1", "student")
      ).rejects.toThrow("Feedback not found");
    });
  });
});
