import { describe, test, expect, vi, beforeEach } from "vitest";
import { courseService } from "../../src/services/courseService";
import api from "../../src/services/api";

vi.mock("../../src/services/api");

describe("courseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllCourses", () => {
    test("should fetch all courses with default pagination", async () => {
      const mockResponse = {
        data: {
          courses: [{ id: "1", title: "Course 1" }],
          total: 1,
          page: 1,
          limit: 10,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseService.getAllCourses();

      expect(api.get).toHaveBeenCalledWith("/courses?page=1&limit=10");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch courses with custom pagination", async () => {
      const mockResponse = {
        data: {
          courses: [],
          total: 50,
          page: 2,
          limit: 20,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseService.getAllCourses(2, 20);

      expect(api.get).toHaveBeenCalledWith("/courses?page=2&limit=20");
    });

    test("should fetch courses with search query", async () => {
      const mockResponse = {
        data: {
          courses: [{ id: "1", title: "JavaScript" }],
          total: 1,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseService.getAllCourses(1, 10, "JavaScript");

      expect(api.get).toHaveBeenCalledWith(
        "/courses?page=1&limit=10&search=JavaScript"
      );
    });

    test("should handle API error", async () => {
      api.get.mockRejectedValue(new Error("Network error"));

      await expect(courseService.getAllCourses()).rejects.toThrow(
        "Network error"
      );
    });
  });

  describe("getCourseById", () => {
    test("should fetch course by ID without details", async () => {
      const mockResponse = {
        data: {
          id: "course123",
          title: "Test Course",
          description: "Test Description",
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseService.getCourseById("course123");

      expect(api.get).toHaveBeenCalledWith("/courses/course123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch course by ID with details", async () => {
      const mockResponse = {
        data: {
          id: "course123",
          title: "Test Course",
          details: { syllabus: "..." },
        },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseService.getCourseById("course123", true);

      expect(api.get).toHaveBeenCalledWith(
        "/courses/course123?includeDetails=true"
      );
    });

    test("should handle course not found error", async () => {
      api.get.mockRejectedValue(new Error("Course not found"));

      await expect(courseService.getCourseById("invalid")).rejects.toThrow(
        "Course not found"
      );
    });
  });

  describe("createCourse", () => {
    test("should create a new course", async () => {
      const courseData = {
        title: "New Course",
        description: "Course Description",
        instructor: "instructor123",
      };

      const mockResponse = {
        data: {
          id: "newcourse123",
          ...courseData,
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await courseService.createCourse(courseData);

      expect(api.post).toHaveBeenCalledWith("/courses", courseData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle validation error", async () => {
      api.post.mockRejectedValue(new Error("Title is required"));

      await expect(courseService.createCourse({})).rejects.toThrow(
        "Title is required"
      );
    });
  });

  describe("updateCourse", () => {
    test("should update a course", async () => {
      const courseData = {
        title: "Updated Course",
        description: "Updated Description",
      };

      const mockResponse = {
        data: {
          id: "course123",
          ...courseData,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await courseService.updateCourse("course123", courseData);

      expect(api.put).toHaveBeenCalledWith("/courses/course123", courseData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle update error", async () => {
      api.put.mockRejectedValue(new Error("Unauthorized"));

      await expect(courseService.updateCourse("course123", {})).rejects.toThrow(
        "Unauthorized"
      );
    });
  });

  describe("deleteCourse", () => {
    test("should delete a course", async () => {
      const mockResponse = {
        data: {
          message: "Course deleted successfully",
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await courseService.deleteCourse("course123");

      expect(api.delete).toHaveBeenCalledWith("/courses/course123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle delete error", async () => {
      api.delete.mockRejectedValue(new Error("Course not found"));

      await expect(courseService.deleteCourse("invalid")).rejects.toThrow(
        "Course not found"
      );
    });
  });

  describe("addOrUpdateFeedback", () => {
    test("should add feedback with rating and comment", async () => {
      const mockResponse = {
        data: {
          id: "feedback123",
          rating: 5,
          comment: "Great course!",
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await courseService.addOrUpdateFeedback(
        "course123",
        5,
        "Great course!"
      );

      expect(api.post).toHaveBeenCalledWith("/courses/course123/feedback", {
        rating: 5,
        comment: "Great course!",
      });
      expect(result).toEqual(mockResponse.data);
    });

    test("should add feedback with rating only", async () => {
      const mockResponse = {
        data: {
          id: "feedback123",
          rating: 4,
          comment: "",
        },
      };

      api.post.mockResolvedValue(mockResponse);

      await courseService.addOrUpdateFeedback("course123", 4);

      expect(api.post).toHaveBeenCalledWith("/courses/course123/feedback", {
        rating: 4,
        comment: "",
      });
    });

    test("should handle feedback error", async () => {
      api.post.mockRejectedValue(new Error("Invalid rating"));

      await expect(
        courseService.addOrUpdateFeedback("course123", 6)
      ).rejects.toThrow("Invalid rating");
    });
  });

  describe("getMyCourseFeedback", () => {
    test("should fetch user's feedback for a course", async () => {
      const mockResponse = {
        data: {
          id: "feedback123",
          rating: 5,
          comment: "Excellent",
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseService.getMyCourseFeedback("course123");

      expect(api.get).toHaveBeenCalledWith("/courses/course123/feedback/my");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle no feedback found", async () => {
      api.get.mockRejectedValue(new Error("No feedback found"));

      await expect(
        courseService.getMyCourseFeedback("course123")
      ).rejects.toThrow("No feedback found");
    });
  });

  describe("deleteCourseFeedback", () => {
    test("should delete feedback", async () => {
      const mockResponse = {
        data: {
          message: "Feedback deleted successfully",
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await courseService.deleteCourseFeedback("feedback123");

      expect(api.delete).toHaveBeenCalledWith("/courses/feedback/feedback123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle delete feedback error", async () => {
      api.delete.mockRejectedValue(new Error("Feedback not found"));

      await expect(
        courseService.deleteCourseFeedback("invalid")
      ).rejects.toThrow("Feedback not found");
    });
  });
});
