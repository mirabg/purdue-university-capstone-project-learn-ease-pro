const courseController = require("../src/controllers/courseController");
const courseService = require("../src/services/courseService");

jest.mock("../src/services/courseService");

describe("Course Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: "user123", role: "admin" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    jest.clearAllMocks();
  });

  describe("createCourse", () => {
    it("should create course successfully", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
      };

      const mockCourse = { _id: "course123", ...courseData, isActive: true };

      mockReq.body = courseData;
      courseService.createCourse.mockResolvedValue(mockCourse);

      await courseController.createCourse(mockReq, mockRes);

      expect(courseService.createCourse).toHaveBeenCalledWith({
        ...courseData,
        instructor: undefined,
        isActive: true,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse,
      });
    });

    it("should create course with instructor successfully", async () => {
      const courseData = {
        courseCode: "CS101",
        name: "Introduction to Computer Science",
        description: "A comprehensive introduction",
        instructor: "faculty123",
      };

      const mockCourse = { _id: "course123", ...courseData, isActive: true };

      mockReq.body = courseData;
      courseService.createCourse.mockResolvedValue(mockCourse);

      await courseController.createCourse(mockReq, mockRes);

      expect(courseService.createCourse).toHaveBeenCalledWith({
        ...courseData,
        isActive: true,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse,
      });
    });

    it("should return 400 for missing required fields", async () => {
      mockReq.body = { courseCode: "CS101" }; // Missing name and description

      await courseController.createCourse(mockReq, mockRes);

      expect(courseService.createCourse).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message:
          "Please provide all required fields (courseCode, name, description)",
      });
    });

    it("should handle service errors", async () => {
      mockReq.body = {
        courseCode: "CS101",
        name: "Test Course",
        description: "Test Description",
      };

      courseService.createCourse.mockRejectedValue(
        new Error("Course code already exists")
      );

      await courseController.createCourse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Course code already exists",
      });
    });
  });

  describe("getAllCourses", () => {
    it("should get all courses with pagination", async () => {
      const mockResult = {
        courses: [
          { _id: "1", courseCode: "CS101", name: "Course 1" },
          { _id: "2", courseCode: "CS102", name: "Course 2" },
        ],
        total: 20,
        page: 1,
        totalPages: 2,
      };

      mockReq.query = { page: "1", limit: "10", search: "" };
      courseService.getAllCourses.mockResolvedValue(mockResult);

      await courseController.getAllCourses(mockReq, mockRes);

      expect(courseService.getAllCourses).toHaveBeenCalledWith(1, 10, "");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 20,
        page: 1,
        totalPages: 2,
        data: mockResult.courses,
      });
    });

    it("should use default pagination values", async () => {
      const mockResult = {
        courses: [],
        total: 0,
        page: 1,
        totalPages: 0,
      };

      mockReq.query = {};
      courseService.getAllCourses.mockResolvedValue(mockResult);

      await courseController.getAllCourses(mockReq, mockRes);

      expect(courseService.getAllCourses).toHaveBeenCalledWith(1, 10, "");
    });

    it("should handle search query", async () => {
      const mockResult = {
        courses: [{ _id: "1", courseCode: "CS101", name: "Course 1" }],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      mockReq.query = { search: "CS101" };
      courseService.getAllCourses.mockResolvedValue(mockResult);

      await courseController.getAllCourses(mockReq, mockRes);

      expect(courseService.getAllCourses).toHaveBeenCalledWith(1, 10, "CS101");
    });
  });

  describe("getCourseById", () => {
    it("should get course by id without details", async () => {
      const mockCourse = {
        _id: "course123",
        courseCode: "CS101",
        name: "Course 1",
      };

      mockReq.params = { id: "course123" };
      mockReq.query = {};
      courseService.getCourseById.mockResolvedValue(mockCourse);

      await courseController.getCourseById(mockReq, mockRes);

      expect(courseService.getCourseById).toHaveBeenCalledWith(
        "course123",
        false
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse,
      });
    });

    it("should get course by id with details", async () => {
      const mockCourse = {
        _id: "course123",
        courseCode: "CS101",
        name: "Course 1",
        details: [{ _id: "detail1", title: "Week 1" }],
      };

      mockReq.params = { id: "course123" };
      mockReq.query = { includeDetails: "true" };
      courseService.getCourseById.mockResolvedValue(mockCourse);

      await courseController.getCourseById(mockReq, mockRes);

      expect(courseService.getCourseById).toHaveBeenCalledWith(
        "course123",
        true
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse,
      });
    });

    it("should return 404 for non-existent course", async () => {
      mockReq.params = { id: "nonexistent" };
      courseService.getCourseById.mockRejectedValue(
        new Error("Course not found")
      );

      await courseController.getCourseById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Course not found",
      });
    });
  });

  describe("updateCourse", () => {
    it("should update course successfully", async () => {
      const updateData = { name: "Updated Course Name" };
      const mockCourse = {
        _id: "course123",
        courseCode: "CS101",
        name: "Updated Course Name",
      };

      mockReq.params = { id: "course123" };
      mockReq.body = updateData;
      courseService.updateCourse.mockResolvedValue(mockCourse);

      await courseController.updateCourse(mockReq, mockRes);

      expect(courseService.updateCourse).toHaveBeenCalledWith(
        "course123",
        updateData,
        undefined
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse,
      });
    });

    it("should update course with version for optimistic locking", async () => {
      const updateData = { name: "Updated Course Name" };
      const mockCourse = {
        _id: "course123",
        courseCode: "CS101",
        name: "Updated Course Name",
        __v: 1,
      };

      mockReq.params = { id: "course123" };
      mockReq.body = { ...updateData, __v: 0 };
      courseService.updateCourse.mockResolvedValue(mockCourse);

      await courseController.updateCourse(mockReq, mockRes);

      expect(courseService.updateCourse).toHaveBeenCalledWith(
        "course123",
        updateData,
        0
      );
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCourse,
      });
    });

    it("should handle update errors", async () => {
      mockReq.params = { id: "course123" };
      mockReq.body = { name: "Updated Name" };
      courseService.updateCourse.mockRejectedValue(
        new Error("Course not found")
      );

      await courseController.updateCourse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Course not found",
      });
    });
  });

  describe("deleteCourse", () => {
    it("should delete course successfully", async () => {
      const mockResult = {
        message: "Course and all related details deleted successfully",
      };

      mockReq.params = { id: "course123" };
      courseService.deleteCourse.mockResolvedValue(mockResult);

      await courseController.deleteCourse(mockReq, mockRes);

      expect(courseService.deleteCourse).toHaveBeenCalledWith("course123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it("should handle delete errors", async () => {
      mockReq.params = { id: "course123" };
      courseService.deleteCourse.mockRejectedValue(
        new Error("Course not found")
      );

      await courseController.deleteCourse(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Course not found",
      });
    });
  });

  describe("addCourseDetail", () => {
    it("should add course detail successfully", async () => {
      const detailData = {
        title: "Week 1: Introduction",
        type: "document",
        url: "https://example.com/week1.pdf",
      };

      const mockDetail = {
        _id: "detail123",
        course: "course123",
        ...detailData,
        order: 0,
        isActive: true,
      };

      mockReq.params = { id: "course123" };
      mockReq.body = detailData;
      courseService.addCourseDetail.mockResolvedValue(mockDetail);

      await courseController.addCourseDetail(mockReq, mockRes);

      expect(courseService.addCourseDetail).toHaveBeenCalledWith({
        course: "course123",
        ...detailData,
        order: 0,
        isActive: true,
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDetail,
      });
    });

    it("should return 400 for missing required fields", async () => {
      mockReq.params = { id: "course123" };
      mockReq.body = { title: "Week 1" }; // Missing type and url

      await courseController.addCourseDetail(mockReq, mockRes);

      expect(courseService.addCourseDetail).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Please provide all required fields (title, type, url)",
      });
    });
  });

  describe("getCourseDetails", () => {
    it("should get all course details", async () => {
      const mockDetails = [
        { _id: "1", title: "Week 1", type: "document" },
        { _id: "2", title: "Week 2", type: "video" },
      ];

      mockReq.params = { id: "course123" };
      mockReq.query = {};
      courseService.getCourseDetails.mockResolvedValue(mockDetails);

      await courseController.getCourseDetails(mockReq, mockRes);

      expect(courseService.getCourseDetails).toHaveBeenCalledWith(
        "course123",
        undefined
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockDetails,
      });
    });

    it("should filter details by type", async () => {
      const mockDetails = [{ _id: "1", title: "Week 1", type: "document" }];

      mockReq.params = { id: "course123" };
      mockReq.query = { type: "document" };
      courseService.getCourseDetails.mockResolvedValue(mockDetails);

      await courseController.getCourseDetails(mockReq, mockRes);

      expect(courseService.getCourseDetails).toHaveBeenCalledWith(
        "course123",
        "document"
      );
    });
  });

  describe("updateCourseDetail", () => {
    it("should update course detail successfully", async () => {
      const updateData = { title: "Updated Title" };
      const mockDetail = {
        _id: "detail123",
        title: "Updated Title",
        type: "document",
      };

      mockReq.params = { detailId: "detail123" };
      mockReq.body = updateData;
      courseService.updateCourseDetail.mockResolvedValue(mockDetail);

      await courseController.updateCourseDetail(mockReq, mockRes);

      expect(courseService.updateCourseDetail).toHaveBeenCalledWith(
        "detail123",
        updateData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockDetail,
      });
    });
  });

  describe("deleteCourseDetail", () => {
    it("should delete course detail successfully", async () => {
      const mockResult = { message: "Course detail deleted successfully" };

      mockReq.params = { detailId: "detail123" };
      courseService.deleteCourseDetail.mockResolvedValue(mockResult);

      await courseController.deleteCourseDetail(mockReq, mockRes);

      expect(courseService.deleteCourseDetail).toHaveBeenCalledWith(
        "detail123"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });
  });

  describe("addOrUpdateFeedback", () => {
    it("should add feedback successfully", async () => {
      const feedbackData = {
        rating: 5,
        comment: "Great course!",
      };

      const mockFeedback = {
        _id: "feedback123",
        user: "user123",
        course: "course123",
        ...feedbackData,
      };

      mockReq.params = { id: "course123" };
      mockReq.body = feedbackData;
      mockReq.user = { id: "user123" };
      courseService.addOrUpdateFeedback.mockResolvedValue(mockFeedback);

      await courseController.addOrUpdateFeedback(mockReq, mockRes);

      expect(courseService.addOrUpdateFeedback).toHaveBeenCalledWith(
        "user123",
        "course123",
        feedbackData
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFeedback,
      });
    });

    it("should return 400 for missing rating", async () => {
      mockReq.params = { id: "course123" };
      mockReq.body = { comment: "Great course!" }; // Missing rating

      await courseController.addOrUpdateFeedback(mockReq, mockRes);

      expect(courseService.addOrUpdateFeedback).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Please provide a rating",
      });
    });

    it("should return 400 for invalid rating (too low)", async () => {
      mockReq.params = { id: "course123" };
      mockReq.body = { rating: 0, comment: "Bad" };

      await courseController.addOrUpdateFeedback(mockReq, mockRes);

      expect(courseService.addOrUpdateFeedback).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    });

    it("should return 400 for invalid rating (too high)", async () => {
      mockReq.params = { id: "course123" };
      mockReq.body = { rating: 6, comment: "Too good" };

      await courseController.addOrUpdateFeedback(mockReq, mockRes);

      expect(courseService.addOrUpdateFeedback).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getCourseFeedback", () => {
    it("should get course feedback with statistics", async () => {
      const mockResult = {
        feedback: [
          { _id: "1", rating: 5, comment: "Great!" },
          { _id: "2", rating: 4, comment: "Good!" },
        ],
        statistics: {
          averageRating: 4.5,
          totalFeedback: 2,
          ratingDistribution: { 5: 1, 4: 1 },
        },
      };

      mockReq.params = { id: "course123" };
      courseService.getCourseFeedback.mockResolvedValue(mockResult);

      await courseController.getCourseFeedback(mockReq, mockRes);

      expect(courseService.getCourseFeedback).toHaveBeenCalledWith("course123");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });
  });

  describe("getMyCourseFeedback", () => {
    it("should get user's own feedback for a course", async () => {
      const mockFeedback = {
        _id: "feedback123",
        user: "user123",
        course: "course123",
        rating: 5,
        comment: "Great!",
      };

      mockReq.params = { id: "course123" };
      mockReq.user = { id: "user123" };
      courseService.getUserCourseFeedback.mockResolvedValue(mockFeedback);

      await courseController.getMyCourseFeedback(mockReq, mockRes);

      expect(courseService.getUserCourseFeedback).toHaveBeenCalledWith(
        "user123",
        "course123"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFeedback,
      });
    });
  });

  describe("deleteFeedback", () => {
    it("should delete feedback successfully", async () => {
      const mockResult = { message: "Feedback deleted successfully" };

      mockReq.params = { feedbackId: "feedback123" };
      mockReq.user = { id: "user123", role: "student" };
      courseService.deleteFeedback.mockResolvedValue(mockResult);

      await courseController.deleteFeedback(mockReq, mockRes);

      expect(courseService.deleteFeedback).toHaveBeenCalledWith(
        "feedback123",
        "user123",
        "student"
      );
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it("should handle authorization errors", async () => {
      mockReq.params = { feedbackId: "feedback123" };
      mockReq.user = { id: "user123", role: "student" };
      courseService.deleteFeedback.mockRejectedValue(
        new Error("Not authorized to delete this feedback")
      );

      await courseController.deleteFeedback(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "Not authorized to delete this feedback",
      });
    });
  });
});
