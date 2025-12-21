import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { courseService } from "@services/courseService";
import { authService } from "@services/authService";
import { enrollmentService } from "@services/enrollmentService";
import CourseModal from "@components/CourseModal";
import CourseMaterialsModal from "@components/CourseMaterialsModal";
import EnrollmentManagementModal from "@components/EnrollmentManagementModal";

function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [materialsCourse, setMaterialsCourse] = useState(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [enrollmentCourse, setEnrollmentCourse] = useState(null);
  const [enrollmentStats, setEnrollmentStats] = useState({});
  const itemsPerPage = 10;
  const navigate = useNavigate();

  // Get current user
  const currentUser = authService.getCurrentUser();
  const isFaculty = currentUser?.role === "faculty";
  const isAdmin = currentUser?.role === "admin";

  // Get dashboard URL based on user role
  const getDashboardUrl = () => {
    const user = authService.getCurrentUser();
    if (user?.role === "admin") {
      return "/admin/dashboard";
    } else if (user?.role === "faculty") {
      return "/faculty/dashboard";
    }
    return "/student/dashboard";
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchQuery]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.getAllCourses(
        currentPage,
        itemsPerPage,
        searchQuery
      );

      console.log("API Response:", response);

      if (response.success) {
        setCourses(response.data);
        setTotalPages(response.totalPages);
        setTotalCourses(response.count);
        console.log("Total Courses Updated:", response.count);

        // Fetch enrollment stats for each course
        if ((isFaculty || isAdmin) && response.data.length > 0) {
          fetchEnrollmentStats(response.data);
        }
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollmentStats = async (coursesData) => {
    try {
      const statsPromises = coursesData.map((course) =>
        enrollmentService
          .getCourseEnrollmentStats(course._id)
          .then((res) => ({ courseId: course._id, stats: res.data }))
          .catch(() => ({ courseId: course._id, stats: null }))
      );

      const results = await Promise.all(statsPromises);
      const statsMap = {};
      results.forEach((result) => {
        if (result.stats) {
          statsMap[result.courseId] = result.stats;
        }
      });

      setEnrollmentStats(statsMap);
    } catch (err) {
      console.error("Error fetching enrollment stats:", err);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleManageMaterials = (course) => {
    setMaterialsCourse(course);
    setIsMaterialsModalOpen(true);
  };

  const handleManageEnrollments = (course) => {
    setEnrollmentCourse(course);
    setIsEnrollmentModalOpen(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (deleteConfirmId !== courseId) {
      setDeleteConfirmId(courseId);
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      setDeleteConfirmId(null);
      fetchCourses(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete course");
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setIsModalOpen(false);
    setSelectedCourse(null);
    if (shouldRefresh) {
      fetchCourses();
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(getDashboardUrl())}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Course Management
            </h1>
            {!isFaculty && (
              <button
                onClick={handleCreateCourse}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Course
              </button>
            )}
          </div>
        </div>

        {/* Search and filters */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search courses
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search by course code or name..."
                  type="search"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {courses.length} of {totalCourses} courses
            </span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Courses table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                {searchQuery
                  ? "No courses found matching your search"
                  : "No courses yet"}
              </p>
              {!searchQuery && !isFaculty && (
                <button
                  onClick={handleCreateCourse}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create your first course
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Course Code
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      {(isFaculty || isAdmin) && (
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Enrollments
                        </th>
                      )}
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {course.courseCode}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {course.name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">
                            {course.description}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              course.isActive
                            )}`}
                          >
                            {course.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {(isFaculty || isAdmin) && (
                          <td className="px-6 py-4 whitespace-nowrap">
                            {enrollmentStats[course._id] ? (
                              <div className="text-xs space-y-1">
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    {enrollmentStats[course._id].total} Total
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                    {enrollmentStats[course._id].pending}{" "}
                                    Pending
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                    {enrollmentStats[course._id].accepted}{" "}
                                    Accepted
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                    {enrollmentStats[course._id].denied} Denied
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {(isFaculty || isAdmin) && (
                            <button
                              onClick={() => handleManageEnrollments(course)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              Enrollments
                            </button>
                          )}
                          <button
                            onClick={() => handleManageMaterials(course)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Materials
                          </button>
                          {!isFaculty && (
                            <>
                              <button
                                onClick={() => handleEditCourse(course)}
                                className="text-primary-600 hover:text-primary-900 mr-4"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCourse(course._id)}
                                className={`${
                                  deleteConfirmId === course._id
                                    ? "text-red-700 font-bold"
                                    : "text-red-600 hover:text-red-900"
                                }`}
                              >
                                {deleteConfirmId === course._id
                                  ? "Confirm Delete?"
                                  : "Delete"}
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                        Page <span className="font-medium">{currentPage}</span>{" "}
                        of <span className="font-medium">{totalPages}</span>
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
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        {[...Array(totalPages)].map((_, idx) => (
                          <button
                            key={idx + 1}
                            onClick={() => handlePageChange(idx + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === idx + 1
                                ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {idx + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Course Modal */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        course={selectedCourse}
      />

      {/* Course Materials Modal */}
      <CourseMaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => setIsMaterialsModalOpen(false)}
        course={materialsCourse}
      />

      {/* Enrollment Management Modal */}
      <EnrollmentManagementModal
        isOpen={isEnrollmentModalOpen}
        onClose={() => {
          setIsEnrollmentModalOpen(false);
          // Refresh enrollment stats when modal closes
          if (enrollmentCourse) {
            fetchCourses();
          }
        }}
        course={enrollmentCourse}
      />
    </div>
  );
}

export default CourseManagement;
