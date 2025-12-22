import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/authSlice";
import { useGetCourseByIdQuery } from "@/store/apiSlice";
import ChatBoard from "@components/ChatBoard";
import CourseRating from "@components/CourseRating";
import CourseRatingsModal from "@components/CourseRatingsModal";
import Icon from "@components/Icon";

function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [ratingsModalOpen, setRatingsModalOpen] = useState(false);

  const currentUser = useSelector(selectUser);

  // RTK Query hook for course details
  const {
    data: courseData,
    isLoading: loading,
    error: queryError,
  } = useGetCourseByIdQuery(courseId);

  const course = courseData?.data;
  const error = queryError
    ? queryError.status === 401
      ? "Authentication failed. Please log in again."
      : queryError.data?.message || "Failed to load course details"
    : null;

  const handleBack = () => {
    if (currentUser?.role === "student") {
      navigate("/student/dashboard");
    } else if (currentUser?.role === "faculty") {
      navigate("/faculty/courses");
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <img
            src="/icons/error.svg"
            alt=""
            className="mx-auto h-12 w-12 text-red-500"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {error || "Course not found"}
          </h3>
          <div className="mt-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Icon name="arrow-back" className="-ml-1 mr-2 h-5 w-5" />
            Back to Dashboard
          </button>
        </div>

        {/* Course Header */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                    {course.courseCode}
                  </span>
                  {course.credits && (
                    <span className="text-sm text-gray-600">
                      {course.credits}{" "}
                      {course.credits === 1 ? "credit" : "credits"}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  {course.name}
                </h1>
                {course.instructor && (
                  <p className="text-base text-gray-600 mb-2">
                    <span className="font-medium">Instructor:</span>{" "}
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                )}
                {course.description && (
                  <p className="text-gray-700 mb-4">{course.description}</p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-4">
                  <CourseRating
                    averageRating={course.averageRating}
                    ratingCount={course.ratingCount}
                    size="md"
                    clickable={true}
                    onClick={() => setRatingsModalOpen(true)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Course Info */}
          {(course.semester || course.year || course.department) && (
            <div className="px-6 py-4 bg-gray-50">
              <div className="flex flex-wrap gap-4 text-sm">
                {course.semester && (
                  <div>
                    <span className="font-medium text-gray-700">Semester:</span>{" "}
                    <span className="text-gray-600">{course.semester}</span>
                  </div>
                )}
                {course.year && (
                  <div>
                    <span className="font-medium text-gray-700">Year:</span>{" "}
                    <span className="text-gray-600">{course.year}</span>
                  </div>
                )}
                {course.department && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Department:
                    </span>{" "}
                    <span className="text-gray-600">{course.department}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Discussion Board */}
        <div className="bg-white rounded-lg shadow p-6">
          <ChatBoard courseId={courseId} courseInstructor={course.instructor} />
        </div>
      </div>

      {/* Course Ratings Modal */}
      <CourseRatingsModal
        isOpen={ratingsModalOpen}
        onClose={() => setRatingsModalOpen(false)}
        course={course}
      />
    </div>
  );
}

export default CourseDetail;
