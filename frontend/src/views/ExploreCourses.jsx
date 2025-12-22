import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/authSlice";
import {
  useGetCoursesQuery,
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
} from "@/store/apiSlice";
import CourseRating from "@components/CourseRating";
import CourseRatingsModal from "@components/CourseRatingsModal";
import Icon from "@components/Icon";

function ExploreCourses() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [enrolling, setEnrolling] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Pagination and search states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  // Ratings modal states
  const [ratingsModalOpen, setRatingsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // RTK Query hooks
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useGetCoursesQuery({
    page: currentPage,
    limit: coursesPerPage,
    search: searchQuery,
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } =
    useGetEnrollmentsQuery({
      page: 1,
      limit: 1000,
    });

  const [createEnrollment] = useCreateEnrollmentMutation();

  const availableCourses = coursesData?.data || [];
  const totalPages = coursesData?.totalPages || 1;
  const totalCourses = coursesData?.count || 0;
  const enrolledCourses = enrollmentsData?.enrollments || [];
  const loading = coursesLoading || enrollmentsLoading;
  const error = coursesError;

  // Filter out already enrolled courses
  const enrolledCourseIds = enrolledCourses
    .filter((e) => e.course && e.course._id)
    .map((e) => e.course._id);

  const filteredCourses = availableCourses.filter(
    (course) => !enrolledCourseIds.includes(course._id)
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      setEnrolling(courseId);
      setSuccessMessage(null);

      await createEnrollment({
        course: courseId,
        student: user.id,
        status: "pending",
      }).unwrap();

      setSuccessMessage(
        "Successfully enrolled! Your request is pending approval."
      );

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error enrolling:", err);
      alert(
        err.data?.message ||
          "Failed to enroll in course. You may already be enrolled."
      );
    } finally {
      setEnrolling(null);
    }
  };

  const handleViewRatings = (course) => {
    setSelectedCourse(course);
    setRatingsModalOpen(true);
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100">
                  <Icon
                    name="book"
                    className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Explore Courses
                </h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                  Browse and enroll in available courses
                  {totalCourses > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {totalCourses} {totalCourses === 1 ? "course" : "courses"}{" "}
                      available
                    </span>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 w-full sm:w-auto"
            >
              <Icon name="arrow-back" className="-ml-1 mr-2 h-5 w-5" />
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Available Courses Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">
                Available Courses
              </h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name="search" className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
          <div className="p-6">
            {availableCourses.length === 0 ? (
              <div className="text-center py-12">
                <Icon
                  name="file-document"
                  className="mx-auto h-12 w-12 text-gray-400"
                />
                <p className="mt-2 text-sm text-gray-500">
                  You're enrolled in all available courses!
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View - hidden on mobile */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Instructor
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                          Description
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCourses.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-primary-600">
                            {course.courseCode}
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">
                            <div className="max-w-xs">{course.name}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {course.instructor
                              ? `${course.instructor.firstName} ${course.instructor.lastName}`
                              : "-"}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <CourseRating
                              averageRating={course.averageRating}
                              ratingCount={course.ratingCount}
                              size="sm"
                              clickable={true}
                              onClick={() => handleViewRatings(course)}
                            />
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            <div className="max-w-md">{course.description}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                            <button
                              onClick={() => handleEnroll(course._id)}
                              disabled={enrolling === course._id}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {enrolling === course._id ? (
                                <>
                                  <img
                                    src="/icons/spinner.svg"
                                    alt=""
                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  />
                                  Enrolling...
                                </>
                              ) : (
                                <>
                                  <img
                                    src="/icons/plus-white.svg"
                                    alt=""
                                    className="-ml-1 mr-2 h-4 w-4"
                                  />
                                  Enroll
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View - hidden on desktop */}
                <div className="lg:hidden space-y-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-primary-600">
                              {course.courseCode}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-gray-900 mb-2">
                            {course.name}
                          </h3>
                        </div>
                      </div>

                      {course.instructor && (
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Instructor:</span>{" "}
                          {course.instructor.firstName}{" "}
                          {course.instructor.lastName}
                        </p>
                      )}

                      <div className="mb-3">
                        <CourseRating
                          averageRating={course.averageRating}
                          ratingCount={course.ratingCount}
                          size="sm"
                          clickable={true}
                          onClick={() => handleViewRatings(course)}
                        />
                      </div>

                      <p className="text-sm text-gray-500 mb-4">
                        {course.description}
                      </p>

                      <button
                        onClick={() => handleEnroll(course._id)}
                        disabled={enrolling === course._id}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {enrolling === course._id ? (
                          <>
                            <img
                              src="/icons/spinner.svg"
                              alt=""
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            />
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <img
                              src="/icons/plus-white.svg"
                              alt=""
                              className="-ml-1 mr-2 h-4 w-4"
                            />
                            Enroll
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Pagination Controls */}
            {availableCourses.length > 0 && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page{" "}
                      <span className="font-medium">{currentPage}</span> of{" "}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <Icon name="chevron-left" className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === page
                                ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <Icon name="chevron-right" className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Ratings Modal */}
      <CourseRatingsModal
        isOpen={ratingsModalOpen}
        onClose={() => setRatingsModalOpen(false)}
        course={selectedCourse}
      />
    </div>
  );
}

export default ExploreCourses;
