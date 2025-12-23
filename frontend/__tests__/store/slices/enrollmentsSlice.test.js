import { describe, test, expect } from "vitest";
import enrollmentsReducer, {
  setEnrollmentsLoading,
  setEnrollmentsError,
  setEnrollments,
  addEnrollment,
  updateEnrollment,
  removeEnrollment,
  clearEnrollments,
  selectAllEnrollments,
  selectEnrollmentsLoading,
  selectEnrollmentsError,
  selectEnrollmentStats,
  selectEnrollmentsByCourseId,
} from "../../../src/store/slices/enrollmentsSlice";

describe("enrollmentsSlice", () => {
  const mockEnrollment1 = {
    id: "enrollment1",
    courseId: "course1",
    studentId: "student1",
    status: "accepted",
  };

  const mockEnrollment2 = {
    id: "enrollment2",
    courseId: "course2",
    studentId: "student2",
    status: "pending",
  };

  const mockEnrollment3 = {
    id: "enrollment3",
    courseId: "course1",
    studentId: "student3",
    status: "denied",
  };

  describe("initial state", () => {
    test("should have correct initial state", () => {
      const state = enrollmentsReducer(undefined, { type: "@@INIT" });

      expect(state).toEqual({
        enrollments: [],
        loading: false,
        error: null,
        stats: {
          total: 0,
          accepted: 0,
          pending: 0,
          denied: 0,
        },
      });
    });
  });

  describe("reducers", () => {
    describe("setEnrollmentsLoading", () => {
      test("should set loading to true", () => {
        const initialState = {
          enrollments: [],
          loading: false,
          error: null,
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          setEnrollmentsLoading(true)
        );

        expect(state.loading).toBe(true);
      });

      test("should set loading to false", () => {
        const initialState = {
          enrollments: [],
          loading: true,
          error: null,
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          setEnrollmentsLoading(false)
        );

        expect(state.loading).toBe(false);
      });
    });

    describe("setEnrollmentsError", () => {
      test("should set error and set loading to false", () => {
        const error = "Failed to fetch enrollments";
        const initialState = {
          enrollments: [],
          loading: true,
          error: null,
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          setEnrollmentsError(error)
        );

        expect(state.error).toBe(error);
        expect(state.loading).toBe(false);
      });

      test("should overwrite existing error", () => {
        const newError = "New error message";
        const initialState = {
          enrollments: [],
          loading: false,
          error: "Old error",
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          setEnrollmentsError(newError)
        );

        expect(state.error).toBe(newError);
      });
    });

    describe("setEnrollments", () => {
      test("should set enrollments and calculate stats", () => {
        const enrollments = [mockEnrollment1, mockEnrollment2, mockEnrollment3];
        const initialState = {
          enrollments: [],
          loading: true,
          error: "error",
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          setEnrollments(enrollments)
        );

        expect(state.enrollments).toEqual(enrollments);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.stats).toEqual({
          total: 3,
          accepted: 1,
          pending: 1,
          denied: 1,
        });
      });

      test("should calculate stats with multiple accepted", () => {
        const enrollments = [
          { ...mockEnrollment1, status: "accepted" },
          { ...mockEnrollment2, status: "accepted" },
          { ...mockEnrollment3, status: "accepted" },
        ];
        const initialState = {
          enrollments: [],
          loading: false,
          error: null,
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          setEnrollments(enrollments)
        );

        expect(state.stats).toEqual({
          total: 3,
          accepted: 3,
          pending: 0,
          denied: 0,
        });
      });

      test("should handle empty enrollments array", () => {
        const initialState = {
          enrollments: [mockEnrollment1],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 1, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(initialState, setEnrollments([]));

        expect(state.enrollments).toEqual([]);
        expect(state.stats).toEqual({
          total: 0,
          accepted: 0,
          pending: 0,
          denied: 0,
        });
      });
    });

    describe("addEnrollment", () => {
      test("should add enrollment and update stats", () => {
        const initialState = {
          enrollments: [],
          loading: false,
          error: null,
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          addEnrollment(mockEnrollment1)
        );

        expect(state.enrollments).toEqual([mockEnrollment1]);
        expect(state.stats.total).toBe(1);
        // addEnrollment only increments pending count, not accepted
        expect(state.stats.accepted).toBe(0);
      });

      test("should add pending enrollment and increment pending count", () => {
        const initialState = {
          enrollments: [mockEnrollment1],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 1, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          addEnrollment(mockEnrollment2)
        );

        expect(state.enrollments.length).toBe(2);
        expect(state.stats.total).toBe(2);
        expect(state.stats.pending).toBe(1);
      });

      test("should not increment pending for non-pending status", () => {
        const deniedEnrollment = { ...mockEnrollment3, status: "denied" };
        const initialState = {
          enrollments: [],
          loading: false,
          error: null,
          stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          addEnrollment(deniedEnrollment)
        );

        expect(state.stats.total).toBe(1);
        expect(state.stats.pending).toBe(0);
      });
    });

    describe("updateEnrollment", () => {
      test("should update enrollment and stats when status changes", () => {
        const updatedEnrollment = { ...mockEnrollment2, status: "accepted" };
        const initialState = {
          enrollments: [mockEnrollment1, mockEnrollment2],
          loading: false,
          error: null,
          stats: { total: 2, accepted: 1, pending: 1, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          updateEnrollment(updatedEnrollment)
        );

        expect(state.enrollments[1].status).toBe("accepted");
        expect(state.stats.accepted).toBe(2);
        expect(state.stats.pending).toBe(0);
      });

      test("should handle status change from accepted to denied", () => {
        const updatedEnrollment = { ...mockEnrollment1, status: "denied" };
        const initialState = {
          enrollments: [mockEnrollment1],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 1, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          updateEnrollment(updatedEnrollment)
        );

        expect(state.stats.accepted).toBe(0);
        expect(state.stats.denied).toBe(1);
      });

      test("should handle status change from denied to pending", () => {
        const updatedEnrollment = { ...mockEnrollment3, status: "pending" };
        const initialState = {
          enrollments: [mockEnrollment3],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 0, pending: 0, denied: 1 },
        };
        const state = enrollmentsReducer(
          initialState,
          updateEnrollment(updatedEnrollment)
        );

        expect(state.stats.denied).toBe(0);
        expect(state.stats.pending).toBe(1);
      });

      test("should not change stats if status remains the same", () => {
        const updatedEnrollment = { ...mockEnrollment1, courseId: "newCourse" };
        const initialState = {
          enrollments: [mockEnrollment1],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 1, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          updateEnrollment(updatedEnrollment)
        );

        expect(state.stats).toEqual({
          total: 1,
          accepted: 1,
          pending: 0,
          denied: 0,
        });
        expect(state.enrollments[0].courseId).toBe("newCourse");
      });

      test("should not modify state if enrollment not found", () => {
        const nonExistentEnrollment = { id: "nonexistent", status: "accepted" };
        const initialState = {
          enrollments: [mockEnrollment1],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 1, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          updateEnrollment(nonExistentEnrollment)
        );

        expect(state.enrollments).toEqual([mockEnrollment1]);
        expect(state.stats).toEqual({
          total: 1,
          accepted: 1,
          pending: 0,
          denied: 0,
        });
      });
    });

    describe("removeEnrollment", () => {
      test("should remove enrollment and update stats", () => {
        const initialState = {
          enrollments: [mockEnrollment1, mockEnrollment2],
          loading: false,
          error: null,
          stats: { total: 2, accepted: 1, pending: 1, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          removeEnrollment("enrollment1")
        );

        expect(state.enrollments).toEqual([mockEnrollment2]);
        expect(state.stats.total).toBe(1);
        expect(state.stats.accepted).toBe(0);
      });

      test("should decrement pending count when removing pending enrollment", () => {
        const initialState = {
          enrollments: [mockEnrollment2],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 0, pending: 1, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          removeEnrollment("enrollment2")
        );

        expect(state.enrollments).toEqual([]);
        expect(state.stats.pending).toBe(0);
      });

      test("should decrement denied count when removing denied enrollment", () => {
        const initialState = {
          enrollments: [mockEnrollment3],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 0, pending: 0, denied: 1 },
        };
        const state = enrollmentsReducer(
          initialState,
          removeEnrollment("enrollment3")
        );

        expect(state.enrollments).toEqual([]);
        expect(state.stats.denied).toBe(0);
      });

      test("should handle removing non-existent enrollment", () => {
        const initialState = {
          enrollments: [mockEnrollment1],
          loading: false,
          error: null,
          stats: { total: 1, accepted: 1, pending: 0, denied: 0 },
        };
        const state = enrollmentsReducer(
          initialState,
          removeEnrollment("nonexistent")
        );

        expect(state.enrollments).toEqual([mockEnrollment1]);
        expect(state.stats).toEqual({
          total: 1,
          accepted: 1,
          pending: 0,
          denied: 0,
        });
      });
    });

    describe("clearEnrollments", () => {
      test("should reset state to initial values", () => {
        const initialState = {
          enrollments: [mockEnrollment1, mockEnrollment2],
          loading: true,
          error: "Some error",
          stats: { total: 2, accepted: 1, pending: 1, denied: 0 },
        };
        const state = enrollmentsReducer(initialState, clearEnrollments());

        expect(state).toEqual({
          enrollments: [],
          loading: false,
          error: null,
          stats: {
            total: 0,
            accepted: 0,
            pending: 0,
            denied: 0,
          },
        });
      });
    });
  });

  describe("selectors", () => {
    const mockState = {
      enrollments: {
        enrollments: [mockEnrollment1, mockEnrollment2, mockEnrollment3],
        loading: true,
        error: "Test error",
        stats: {
          total: 3,
          accepted: 1,
          pending: 1,
          denied: 1,
        },
      },
    };

    describe("selectAllEnrollments", () => {
      test("should select all enrollments", () => {
        const enrollments = selectAllEnrollments(mockState);
        expect(enrollments).toEqual([
          mockEnrollment1,
          mockEnrollment2,
          mockEnrollment3,
        ]);
      });

      test("should return empty array when no enrollments", () => {
        const state = {
          enrollments: {
            enrollments: [],
            loading: false,
            error: null,
            stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
          },
        };
        const enrollments = selectAllEnrollments(state);
        expect(enrollments).toEqual([]);
      });
    });

    describe("selectEnrollmentsLoading", () => {
      test("should select loading state", () => {
        const loading = selectEnrollmentsLoading(mockState);
        expect(loading).toBe(true);
      });

      test("should return false when not loading", () => {
        const state = {
          enrollments: {
            enrollments: [],
            loading: false,
            error: null,
            stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
          },
        };
        const loading = selectEnrollmentsLoading(state);
        expect(loading).toBe(false);
      });
    });

    describe("selectEnrollmentsError", () => {
      test("should select error", () => {
        const error = selectEnrollmentsError(mockState);
        expect(error).toBe("Test error");
      });

      test("should return null when no error", () => {
        const state = {
          enrollments: {
            enrollments: [],
            loading: false,
            error: null,
            stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
          },
        };
        const error = selectEnrollmentsError(state);
        expect(error).toBeNull();
      });
    });

    describe("selectEnrollmentStats", () => {
      test("should select enrollment stats", () => {
        const stats = selectEnrollmentStats(mockState);
        expect(stats).toEqual({
          total: 3,
          accepted: 1,
          pending: 1,
          denied: 1,
        });
      });

      test("should return zero stats when no enrollments", () => {
        const state = {
          enrollments: {
            enrollments: [],
            loading: false,
            error: null,
            stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
          },
        };
        const stats = selectEnrollmentStats(state);
        expect(stats).toEqual({ total: 0, accepted: 0, pending: 0, denied: 0 });
      });
    });

    describe("selectEnrollmentsByCourseId", () => {
      test("should filter enrollments by course ID", () => {
        const enrollments = selectEnrollmentsByCourseId("course1")(mockState);
        expect(enrollments).toEqual([mockEnrollment1, mockEnrollment3]);
        expect(enrollments.length).toBe(2);
      });

      test("should return empty array for non-existent course", () => {
        const enrollments =
          selectEnrollmentsByCourseId("nonexistent")(mockState);
        expect(enrollments).toEqual([]);
      });

      test("should return empty array when no enrollments", () => {
        const state = {
          enrollments: {
            enrollments: [],
            loading: false,
            error: null,
            stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
          },
        };
        const enrollments = selectEnrollmentsByCourseId("course1")(state);
        expect(enrollments).toEqual([]);
      });
    });
  });

  describe("edge cases", () => {
    test("should handle setEnrollments with enrollments having unknown status", () => {
      const enrollments = [{ id: "1", status: "unknown" }];
      const initialState = {
        enrollments: [],
        loading: false,
        error: null,
        stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
      };
      const state = enrollmentsReducer(
        initialState,
        setEnrollments(enrollments)
      );

      expect(state.stats).toEqual({
        total: 1,
        accepted: 0,
        pending: 0,
        denied: 0,
      });
    });

    test("should handle addEnrollment with null status", () => {
      const enrollment = { id: "1", status: null };
      const initialState = {
        enrollments: [],
        loading: false,
        error: null,
        stats: { total: 0, accepted: 0, pending: 0, denied: 0 },
      };
      const state = enrollmentsReducer(initialState, addEnrollment(enrollment));

      expect(state.stats.total).toBe(1);
      expect(state.stats.pending).toBe(0);
    });

    test("should handle updateEnrollment with same status", () => {
      const updatedEnrollment = {
        ...mockEnrollment1,
        status: "accepted",
        name: "Updated",
      };
      const initialState = {
        enrollments: [mockEnrollment1],
        loading: false,
        error: null,
        stats: { total: 1, accepted: 1, pending: 0, denied: 0 },
      };
      const state = enrollmentsReducer(
        initialState,
        updateEnrollment(updatedEnrollment)
      );

      expect(state.enrollments[0].name).toBe("Updated");
      expect(state.stats).toEqual({
        total: 1,
        accepted: 1,
        pending: 0,
        denied: 0,
      });
    });
  });
});
