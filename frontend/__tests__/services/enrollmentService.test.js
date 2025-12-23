import { describe, test, expect, vi, beforeEach } from "vitest";
import { enrollmentService } from "../../src/services/enrollmentService";
import api from "../../src/services/api";

vi.mock("../../src/services/api");

describe("enrollmentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEnrollmentsByCourse", () => {
    test("should fetch enrollments by course without status filter", async () => {
      const mockResponse = {
        data: [
          { id: "1", student: "student1", status: "accepted" },
          { id: "2", student: "student2", status: "pending" },
        ],
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await enrollmentService.getEnrollmentsByCourse(
        "course123"
      );

      expect(api.get).toHaveBeenCalledWith("/enrollments/course/course123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch enrollments by course with status filter", async () => {
      const mockResponse = {
        data: [{ id: "1", student: "student1", status: "accepted" }],
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await enrollmentService.getEnrollmentsByCourse(
        "course123",
        "accepted"
      );

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments/course/course123?status=accepted"
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle empty status correctly", async () => {
      const mockResponse = {
        data: [],
      };

      api.get.mockResolvedValue(mockResponse);

      await enrollmentService.getEnrollmentsByCourse("course123", null);

      expect(api.get).toHaveBeenCalledWith("/enrollments/course/course123");
    });

    test("should handle fetch error", async () => {
      api.get.mockRejectedValue(new Error("Course not found"));

      await expect(
        enrollmentService.getEnrollmentsByCourse("invalid")
      ).rejects.toThrow("Course not found");
    });
  });

  describe("getCourseEnrollmentStats", () => {
    test("should fetch enrollment statistics for a course", async () => {
      const mockResponse = {
        data: {
          total: 50,
          accepted: 45,
          pending: 3,
          denied: 2,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await enrollmentService.getCourseEnrollmentStats(
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
        enrollmentService.getCourseEnrollmentStats("invalid")
      ).rejects.toThrow("Course not found");
    });
  });

  describe("updateEnrollmentStatus", () => {
    test("should update enrollment status with comments", async () => {
      const mockResponse = {
        data: {
          id: "enrollment123",
          status: "accepted",
          comments: "Welcome!",
        },
      };

      api.patch.mockResolvedValue(mockResponse);

      const result = await enrollmentService.updateEnrollmentStatus(
        "enrollment123",
        "accepted",
        "Welcome!"
      );

      expect(api.patch).toHaveBeenCalledWith(
        "/enrollments/enrollment123/status",
        {
          status: "accepted",
          comments: "Welcome!",
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    test("should update enrollment status without comments", async () => {
      const mockResponse = {
        data: {
          id: "enrollment123",
          status: "denied",
          comments: "",
        },
      };

      api.patch.mockResolvedValue(mockResponse);

      await enrollmentService.updateEnrollmentStatus("enrollment123", "denied");

      expect(api.patch).toHaveBeenCalledWith(
        "/enrollments/enrollment123/status",
        {
          status: "denied",
          comments: "",
        }
      );
    });

    test("should handle status update error", async () => {
      api.patch.mockRejectedValue(new Error("Invalid status"));

      await expect(
        enrollmentService.updateEnrollmentStatus(
          "enrollment123",
          "invalid-status"
        )
      ).rejects.toThrow("Invalid status");
    });
  });

  describe("updateEnrollment", () => {
    test("should update an enrollment", async () => {
      const updateData = {
        status: "accepted",
        comments: "Approved for enrollment",
      };

      const mockResponse = {
        data: {
          id: "enrollment123",
          ...updateData,
        },
      };

      api.put.mockResolvedValue(mockResponse);

      const result = await enrollmentService.updateEnrollment(
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
        enrollmentService.updateEnrollment("enrollment123", {})
      ).rejects.toThrow("Unauthorized");
    });
  });

  describe("getAllEnrollments", () => {
    test("should fetch all enrollments with default parameters", async () => {
      const mockResponse = {
        data: {
          enrollments: [{ id: "1" }, { id: "2" }],
          total: 2,
          page: 1,
          limit: 10,
        },
      };

      api.get.mockResolvedValue(mockResponse);

      const result = await enrollmentService.getAllEnrollments();

      expect(api.get).toHaveBeenCalledWith("/enrollments?page=1&limit=10");
      expect(result).toEqual(mockResponse.data);
    });

    test("should fetch enrollments with custom pagination", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 100 },
      };

      api.get.mockResolvedValue(mockResponse);

      await enrollmentService.getAllEnrollments(5, 25);

      expect(api.get).toHaveBeenCalledWith("/enrollments?page=5&limit=25");
    });

    test("should fetch enrollments with courseId filter", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 10 },
      };

      api.get.mockResolvedValue(mockResponse);

      await enrollmentService.getAllEnrollments(1, 10, "course123");

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments?page=1&limit=10&courseId=course123"
      );
    });

    test("should fetch enrollments with studentId filter", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 5 },
      };

      api.get.mockResolvedValue(mockResponse);

      await enrollmentService.getAllEnrollments(1, 10, null, "student123");

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments?page=1&limit=10&studentId=student123"
      );
    });

    test("should fetch enrollments with status filter", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 3 },
      };

      api.get.mockResolvedValue(mockResponse);

      await enrollmentService.getAllEnrollments(1, 10, null, null, "pending");

      expect(api.get).toHaveBeenCalledWith(
        "/enrollments?page=1&limit=10&status=pending"
      );
    });

    test("should fetch enrollments with all filters", async () => {
      const mockResponse = {
        data: { enrollments: [], total: 1 },
      };

      api.get.mockResolvedValue(mockResponse);

      await enrollmentService.getAllEnrollments(
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

    test("should handle fetch error", async () => {
      api.get.mockRejectedValue(new Error("Server error"));

      await expect(enrollmentService.getAllEnrollments()).rejects.toThrow(
        "Server error"
      );
    });
  });

  describe("createEnrollment", () => {
    test("should create a new enrollment", async () => {
      const enrollmentData = {
        course: "course123",
        student: "student123",
        status: "pending",
      };

      const mockResponse = {
        data: {
          id: "newenrollment123",
          ...enrollmentData,
          createdAt: "2024-01-01",
        },
      };

      api.post.mockResolvedValue(mockResponse);

      const result = await enrollmentService.createEnrollment(enrollmentData);

      expect(api.post).toHaveBeenCalledWith("/enrollments", enrollmentData);
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle enrollment creation error", async () => {
      api.post.mockRejectedValue(new Error("Already enrolled"));

      await expect(
        enrollmentService.createEnrollment({ course: "course123" })
      ).rejects.toThrow("Already enrolled");
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

      const result = await enrollmentService.deleteEnrollment("enrollment123");

      expect(api.delete).toHaveBeenCalledWith("/enrollments/enrollment123");
      expect(result).toEqual(mockResponse.data);
    });

    test("should handle delete error", async () => {
      api.delete.mockRejectedValue(new Error("Enrollment not found"));

      await expect(
        enrollmentService.deleteEnrollment("invalid")
      ).rejects.toThrow("Enrollment not found");
    });
  });
});
