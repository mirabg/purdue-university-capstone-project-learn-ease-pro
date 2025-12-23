import { describe, test, expect, vi, beforeEach } from "vitest";
import { courseEnrollmentService } from "../../src/services/courseEnrollmentService";
import api from "../../src/services/api";

vi.mock("../../src/services/api");

describe("courseEnrollmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createEnrollment", () => {
    test("should create a new enrollment", async () => {
      const enrollmentData = {
        course: "course123",
        student: "student123",
        status: "pending",
        comments: "Looking forward to this course",
      };

      const mockResponse = {
        data: {
          id: "enrollment123",
          ...enrollmentData,
          createdAt: "2024-01-01",
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.createEnrollment(
        enrollmentData
      );

      expect(api.post).toHaveBeenCalledWith("/enrollments", enrollmentData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle enrollment creation error", async () => {
      api.post.mockRejectedValue(new Error("Already enrolled"));

      await expect(
        courseEnrollmentService.createEnrollment({ course: "course123" })
      ).rejects.toThrow("Already enrolled");
    });
  });

  describe("getAllEnrollments", () => {
    test("should fetch all enrollments with default parameters", async () => {
      const mockResponse = {
        data: {
          enrollments: [{ id: "1", status: "accepted" }],
          total: 1,
          page: 1,
          limit: 10,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.getAllEnrollments();

      expect(api.get).toHaveBeenCalledWith("/enrollments?page=1&limit=10");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch enrollments with pagination", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 50, page: 3, limit: 20 },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseEnrollmentService.getAllEnrollments(3, 20);

      expect(api.get).toHaveBeenCalledWith("/enrollments?page=3&limit=20");
    });

    test("should fetch enrollments with course filter", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 10 },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseEnrollmentService.getAllEnrollments(1, 10, "course123");

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments?page=1&limit=10&courseId=course123"
      );
    });

    test("should fetch enrollments with student filter", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 5 },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseEnrollmentService.getAllEnrollments(
        1,
        10,
        null,
        "student123"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments?page=1&limit=10&studentId=student123"
      );
    });

    test("should fetch enrollments with status filter", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 3 },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseEnrollmentService.getAllEnrollments(
        1,
        10,
        null,
        null,
        "pending"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments?page=1&limit=10&status=pending"
      );
    });

    test("should fetch enrollments with all filters", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 1 },
      };

      api.get.mockResolvedValue(mockResponse);

      await courseEnrollmentService.getAllEnrollments(
        2,
        15,
        "course123",
        "student123",
        "accepted"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments?page=2&limit=15&courseId=course123&studentId=student123&status=accepted"
      );
    });
  });

  describe("getEnrollmentById", () => {
    test("should fetch enrollment by ID", async () => {
      const mockResponse = {
        data: {
          id: "enrollment123",
          course: "course123",
          student: "student123",
          status: "accepted",
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.getEnrollmentById(
        "enrollment123"
      );

      expect(api.get).toHaveBeenCalledWith("/enrollments/enrollment123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle enrollment not found", async () => {
      api.get.mockRejectedValue(new Error("Enrollment not found"));

      await expect(
        courseEnrollmentService.getEnrollmentById("invalid")
      ).rejects.toThrow("Enrollment not found");
    });
  });

  describe("getEnrollmentsByCourse", () => {
    test("should fetch enrollments by course without status filter", async () => {
      const mockResponse = {
        data: [
          { id: "1", status: "accepted" },
          { id: "2", status: "pending" },
        ],
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.getEnrollmentsByCourse(
        "course123"
      );

      expect(api.get).toHaveBeenCalledWith("/enrollments/course/course123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch enrollments by course with status filter", async () => {
      const mockResponse = {
        data: [{ id: "1", status: "accepted" }],
      };

      api.get.mockResolvedValue(mockResponse);

      await courseEnrollmentService.getEnrollmentsByCourse(
        "course123",
        "accepted"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments/course/course123?status=accepted"
      );
    });
  });

  describe("getEnrollmentsByStudent", () => {
    test("should fetch enrollments by student without status filter", async () => {
      const mockResponse = {
        data: [
          { id: "1", course: "course123" },
          { id: "2", course: "course456" },
        ],
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.getEnrollmentsByStudent(
        "student123"
      );

      expect(api.get).toHaveBeenCalledWith("/enrollments/student/student123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch enrollments by student with status filter", async () => {
      const mockResponse = {
        data: [{ id: "1", status: "pending" }],
      };

      api.get.mockResolvedValue(mockResponse);

      await courseEnrollmentService.getEnrollmentsByStudent(
        "student123",
        "pending"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments/student/student123?status=pending"
      );
    });
  });

  describe("updateEnrollment", () => {
    test("should update an enrollment", async () => {
      const updateData = {
        status: "accepted",
        comments: "Welcome to the course!",
      };

      const mockResponse = {
        data: {
          id: "enrollment123",
          ...updateData,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.updateEnrollment(
        "enrollment123",
        updateData
      );

      expect(api.put).toHaveBeenCalledWith(
        "/enrollments/enrollment123",
        updateData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle update error", async () => {
      api.put.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        courseEnrollmentService.updateEnrollment("enrollment123", {})
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("updateEnrollmentStatus", () => {
    test("should update enrollment status with comments", async () => {
      const mockResponse = {
        data: {
          id: "enrollment123",
          status: "accepted",
          comments: "Approved",
        },
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.updateEnrollmentStatus(
        "enrollment123",
        "accepted",
        "Approved"
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/enrollments/enrollment123/status",
        {
          status: "accepted",
          comments: "Approved",
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should update enrollment status without comments", async () => {
      const mockResponse = {
        data: {
          id: "enrollment123",
          status: "denied",
          comments: null,
        },
      };

      api.patch.mockResolvedValue(mockResponse);

      await courseEnrollmentService.updateEnrollmentStatus(
        "enrollment123",
        "denied"
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/enrollments/enrollment123/status",
        {
          status: "denied",
          comments: null,
        }
      );
    });

    test("should handle status update error", async () => {
      api.patch.mockRejectedValue(new Error("Invalid status"));

      await expect(
        courseEnrollmentService.updateEnrollmentStatus(
          "enrollment123",
          "invalid-status"
        )
      ).rejects.toThrow("Invalid status");
    });
  });

  describe("deleteEnrollment", () => {
    test("should delete an enrollment", async () => {
      const mockResponse = {
        data: {
          message: "Enrollment deleted successfully",
        },
      };

      api.delete.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.deleteEnrollment(
        "enrollment123"
      );

      expect(api.delete).toHaveBeenCalledWith("/enrollments/enrollment123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle delete error", async () => {
      api.delete.mockRejectedValue(new Error("Enrollment not found"));

      await expect(
        courseEnrollmentService.deleteEnrollment("invalid")
      ).rejects.toThrow("Enrollment not found");
    });
  });

  describe("getCourseEnrollmentStats", () => {
    test("should fetch enrollment statistics for a course", async () => {
      const mockResponse = {
        data: {
          total: 50,
          accepted: 40,
          pending: 8,
          denied: 2,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.getCourseEnrollmentStats(
        "course123"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments/course/course123/stats"
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle stats fetch error", async () => {
      api.get.mockRejectedValue(new Error("Course not found"));

      await expect(
        courseEnrollmentService.getCourseEnrollmentStats("invalid")
      ).rejects.toThrow("Course not found");
    });
  });

  describe("getStudentEnrollmentStats", () => {
    test("should fetch enrollment statistics for a student", async () => {
      const mockResponse = {
        data: {
          total: 10,
          accepted: 8,
          pending: 2,
          denied: 0,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.getStudentEnrollmentStats(
        "student123"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments/student/student123/stats"
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("getGlobalEnrollmentStats", () => {
    test("should fetch global enrollment statistics", async () => {
      const mockResponse = {
        data: {
          total: 500,
          accepted: 400,
          pending: 80,
          denied: 20,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await courseEnrollmentService.getGlobalEnrollmentStats();

      expect(api.get).toHaveBeenCalledWith("/enrollments/stats");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle stats fetch error", async () => {
      api.get.mockRejectedValue(new Error("Unauthorized"));

      await expect(
        courseEnrollmentService.getGlobalEnrollmentStats()
      ).rejects.toThrow("Unauthorized");
    });
  });
});
