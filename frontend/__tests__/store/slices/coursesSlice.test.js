import { describe, test, expect, beforeEach } from "vitest";
import coursesReducer, {
  setCoursesLoading,
  setCoursesError,
  setCourses,
  setCurrentCourse,
  addCourse,
  updateCourse,
  removeCourse,
  clearCourses,
  selectAllCourses,
  selectCurrentCourse,
  selectCoursesLoading,
  selectCoursesError,
} from "../../../src/store/slices/coursesSlice";

describe("coursesSlice", () => {
  const mockCourse1 = {
    id: "course1",
    title: "Introduction to React",
    description: "Learn React basics",
    instructor: "instructor1",
  };

  const mockCourse2 = {
    id: "course2",
    title: "Advanced JavaScript",
    description: "Deep dive into JS",
    instructor: "instructor2",
  };

  describe("initial state", () => {
    test("should have correct initial state", () => {
      const state = coursesReducer(undefined, { type: "@@INIT" });

      expect(state).toEqual({
        courses: [],
        currentCourse: null,
        loading: false,
        error: null,
      });
    });
  });

  describe("reducers", () => {
    describe("setCoursesLoading", () => {
      test("should set loading to true", () => {
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: false, error: null },
          setCoursesLoading(true)
        );

        expect(state.loading).toBe(true);
      });

      test("should set loading to false", () => {
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: true, error: null },
          setCoursesLoading(false)
        );

        expect(state.loading).toBe(false);
      });
    });

    describe("setCoursesError", () => {
      test("should set error and set loading to false", () => {
        const error = "Failed to fetch courses";
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: true, error: null },
          setCoursesError(error)
        );

        expect(state.error).toBe(error);
        expect(state.loading).toBe(false);
      });

      test("should overwrite existing error", () => {
        const newError = "New error message";
        const state = coursesReducer(
          {
            courses: [],
            currentCourse: null,
            loading: false,
            error: "Old error",
          },
          setCoursesError(newError)
        );

        expect(state.error).toBe(newError);
      });

      test("should set null error", () => {
        const state = coursesReducer(
          {
            courses: [],
            currentCourse: null,
            loading: false,
            error: "Some error",
          },
          setCoursesError(null)
        );

        expect(state.error).toBeNull();
      });
    });

    describe("setCourses", () => {
      test("should set courses array", () => {
        const courses = [mockCourse1, mockCourse2];
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: true, error: "error" },
          setCourses(courses)
        );

        expect(state.courses).toEqual(courses);
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
      });

      test("should replace existing courses", () => {
        const newCourses = [mockCourse1];
        const state = coursesReducer(
          {
            courses: [mockCourse2],
            currentCourse: null,
            loading: false,
            error: null,
          },
          setCourses(newCourses)
        );

        expect(state.courses).toEqual(newCourses);
        expect(state.courses.length).toBe(1);
      });

      test("should set empty courses array", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1],
            currentCourse: null,
            loading: false,
            error: null,
          },
          setCourses([])
        );

        expect(state.courses).toEqual([]);
      });
    });

    describe("setCurrentCourse", () => {
      test("should set current course", () => {
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: false, error: null },
          setCurrentCourse(mockCourse1)
        );

        expect(state.currentCourse).toEqual(mockCourse1);
      });

      test("should replace existing current course", () => {
        const state = coursesReducer(
          {
            courses: [],
            currentCourse: mockCourse1,
            loading: false,
            error: null,
          },
          setCurrentCourse(mockCourse2)
        );

        expect(state.currentCourse).toEqual(mockCourse2);
      });

      test("should set current course to null", () => {
        const state = coursesReducer(
          {
            courses: [],
            currentCourse: mockCourse1,
            loading: false,
            error: null,
          },
          setCurrentCourse(null)
        );

        expect(state.currentCourse).toBeNull();
      });
    });

    describe("addCourse", () => {
      test("should add course to empty array", () => {
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: false, error: null },
          addCourse(mockCourse1)
        );

        expect(state.courses).toEqual([mockCourse1]);
        expect(state.courses.length).toBe(1);
      });

      test("should add course to existing courses", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1],
            currentCourse: null,
            loading: false,
            error: null,
          },
          addCourse(mockCourse2)
        );

        expect(state.courses).toEqual([mockCourse1, mockCourse2]);
        expect(state.courses.length).toBe(2);
      });

      test("should not prevent duplicate courses", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1],
            currentCourse: null,
            loading: false,
            error: null,
          },
          addCourse(mockCourse1)
        );

        expect(state.courses.length).toBe(2);
        expect(state.courses[0]).toEqual(mockCourse1);
        expect(state.courses[1]).toEqual(mockCourse1);
      });
    });

    describe("updateCourse", () => {
      test("should update course in courses array", () => {
        const updatedCourse = { ...mockCourse1, title: "Updated Title" };
        const state = coursesReducer(
          {
            courses: [mockCourse1, mockCourse2],
            currentCourse: null,
            loading: false,
            error: null,
          },
          updateCourse(updatedCourse)
        );

        expect(state.courses[0]).toEqual(updatedCourse);
        expect(state.courses[0].title).toBe("Updated Title");
        expect(state.courses[1]).toEqual(mockCourse2);
      });

      test("should update current course if it matches", () => {
        const updatedCourse = { ...mockCourse1, title: "Updated Title" };
        const state = coursesReducer(
          {
            courses: [mockCourse1],
            currentCourse: mockCourse1,
            loading: false,
            error: null,
          },
          updateCourse(updatedCourse)
        );

        expect(state.currentCourse).toEqual(updatedCourse);
        expect(state.currentCourse.title).toBe("Updated Title");
      });

      test("should not update current course if it doesn't match", () => {
        const updatedCourse = { ...mockCourse1, title: "Updated Title" };
        const state = coursesReducer(
          {
            courses: [mockCourse1],
            currentCourse: mockCourse2,
            loading: false,
            error: null,
          },
          updateCourse(updatedCourse)
        );

        expect(state.currentCourse).toEqual(mockCourse2);
      });

      test("should not modify state if course not found", () => {
        const nonExistentCourse = { id: "nonexistent", title: "Not Found" };
        const initialState = {
          courses: [mockCourse1],
          currentCourse: null,
          loading: false,
          error: null,
        };
        const state = coursesReducer(
          initialState,
          updateCourse(nonExistentCourse)
        );

        expect(state.courses).toEqual([mockCourse1]);
      });
    });

    describe("removeCourse", () => {
      test("should remove course from courses array", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1, mockCourse2],
            currentCourse: null,
            loading: false,
            error: null,
          },
          removeCourse("course1")
        );

        expect(state.courses).toEqual([mockCourse2]);
        expect(state.courses.length).toBe(1);
      });

      test("should clear current course if it matches removed course", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1],
            currentCourse: mockCourse1,
            loading: false,
            error: null,
          },
          removeCourse("course1")
        );

        expect(state.courses).toEqual([]);
        expect(state.currentCourse).toBeNull();
      });

      test("should not clear current course if it doesn't match", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1, mockCourse2],
            currentCourse: mockCourse2,
            loading: false,
            error: null,
          },
          removeCourse("course1")
        );

        expect(state.courses).toEqual([mockCourse2]);
        expect(state.currentCourse).toEqual(mockCourse2);
      });

      test("should handle removing non-existent course", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1],
            currentCourse: null,
            loading: false,
            error: null,
          },
          removeCourse("nonexistent")
        );

        expect(state.courses).toEqual([mockCourse1]);
      });

      test("should handle removing from empty courses array", () => {
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: false, error: null },
          removeCourse("course1")
        );

        expect(state.courses).toEqual([]);
      });
    });

    describe("clearCourses", () => {
      test("should reset state to initial values", () => {
        const state = coursesReducer(
          {
            courses: [mockCourse1, mockCourse2],
            currentCourse: mockCourse1,
            loading: true,
            error: "Some error",
          },
          clearCourses()
        );

        expect(state).toEqual({
          courses: [],
          currentCourse: null,
          loading: false,
          error: null,
        });
      });

      test("should work when already cleared", () => {
        const state = coursesReducer(
          { courses: [], currentCourse: null, loading: false, error: null },
          clearCourses()
        );

        expect(state).toEqual({
          courses: [],
          currentCourse: null,
          loading: false,
          error: null,
        });
      });
    });
  });

  describe("selectors", () => {
    const mockState = {
      courses: {
        courses: [mockCourse1, mockCourse2],
        currentCourse: mockCourse1,
        loading: true,
        error: "Test error",
      },
    };

    describe("selectAllCourses", () => {
      test("should select all courses", () => {
        const courses = selectAllCourses(mockState);
        expect(courses).toEqual([mockCourse1, mockCourse2]);
      });

      test("should return empty array when no courses", () => {
        const state = {
          courses: {
            courses: [],
            currentCourse: null,
            loading: false,
            error: null,
          },
        };
        const courses = selectAllCourses(state);
        expect(courses).toEqual([]);
      });
    });

    describe("selectCurrentCourse", () => {
      test("should select current course", () => {
        const course = selectCurrentCourse(mockState);
        expect(course).toEqual(mockCourse1);
      });

      test("should return null when no current course", () => {
        const state = {
          courses: {
            courses: [],
            currentCourse: null,
            loading: false,
            error: null,
          },
        };
        const course = selectCurrentCourse(state);
        expect(course).toBeNull();
      });
    });

    describe("selectCoursesLoading", () => {
      test("should select loading state", () => {
        const loading = selectCoursesLoading(mockState);
        expect(loading).toBe(true);
      });

      test("should return false when not loading", () => {
        const state = {
          courses: {
            courses: [],
            currentCourse: null,
            loading: false,
            error: null,
          },
        };
        const loading = selectCoursesLoading(state);
        expect(loading).toBe(false);
      });
    });

    describe("selectCoursesError", () => {
      test("should select error", () => {
        const error = selectCoursesError(mockState);
        expect(error).toBe("Test error");
      });

      test("should return null when no error", () => {
        const state = {
          courses: {
            courses: [],
            currentCourse: null,
            loading: false,
            error: null,
          },
        };
        const error = selectCoursesError(state);
        expect(error).toBeNull();
      });
    });
  });

  describe("edge cases", () => {
    test("should handle setCourses with null", () => {
      const state = coursesReducer(
        {
          courses: [mockCourse1],
          currentCourse: null,
          loading: false,
          error: null,
        },
        setCourses(null)
      );

      expect(state.courses).toBeNull();
    });

    test("should handle addCourse with null course", () => {
      const state = coursesReducer(
        {
          courses: [mockCourse1],
          currentCourse: null,
          loading: false,
          error: null,
        },
        addCourse(null)
      );

      expect(state.courses).toEqual([mockCourse1, null]);
    });

    test("should handle updateCourse with partial data", () => {
      const partialUpdate = { id: "course1", title: "Only Title Updated" };
      const state = coursesReducer(
        {
          courses: [mockCourse1],
          currentCourse: null,
          loading: false,
          error: null,
        },
        updateCourse(partialUpdate)
      );

      expect(state.courses[0]).toEqual(partialUpdate);
    });
  });
});
