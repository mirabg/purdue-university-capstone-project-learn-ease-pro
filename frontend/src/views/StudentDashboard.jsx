import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@services/authService";
import { enrollmentService } from "@services/enrollmentService";
import api from "@services/api";

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get status badge styling based on enrollment status
  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case "accepted":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Capitalize first letter of status
  const capitalizeStatus = (status) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  useEffect(() => {
    // Get current user info
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Verify token is valid by making a lightweight API call
    // If token is expired (401), this will trigger redirect to login via interceptor
    // If endpoint doesn't exist (404) or other errors, just log and continue
    api.get("/users/me").catch((error) => {
      if (error.response?.status === 401) {
        // 401 is handled by the interceptor which redirects to login
        return;
      }
      // For other errors (404, 500, etc.), just log - user is still valid
      console.debug("User validation skipped:", error.message);
    });

    // Load courses and enrollments
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Fetch user's enrollments
      const enrollmentsResponse = await enrollmentService.getAllEnrollments();
      const enrollments = enrollmentsResponse.data || [];

      setEnrolledCourses(enrollments);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's what's happening with your learning journey
          </p>
        </div>

        {/* My Courses Section */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-primary-600"
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
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  My Courses
                </h2>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {enrolledCourses.length}{" "}
                {enrolledCourses.length === 1 ? "Course" : "Courses"}
              </span>
            </div>
          </div>
          <div className="p-6">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
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
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No courses yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't enrolled in any courses yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {enrollment.course.name}
                    </h3>
                    <p className="text-sm font-medium text-primary-600 mb-2">
                      {enrollment.course.courseCode}
                    </p>
                    {enrollment.course.instructor && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Instructor:</span>{" "}
                        {enrollment.course.instructor.firstName}{" "}
                        {enrollment.course.instructor.lastName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                      {enrollment.course.description}
                    </p>
                    {enrollment.status?.toLowerCase() === "denied" &&
                      enrollment.comments && (
                        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs font-medium text-red-800 mb-1">
                            Denial Reason:
                          </p>
                          <p className="text-xs text-red-700">
                            {enrollment.comments}
                          </p>
                        </div>
                      )}
                    <div className="mt-auto flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                          enrollment.status
                        )}`}
                      >
                        {capitalizeStatus(enrollment.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Explore Courses Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 text-center">
            <svg
              className="mx-auto h-12 w-12 text-primary-600"
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
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Discover New Courses
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Browse our catalog of courses and enroll in subjects that interest
              you
            </p>
            <button
              onClick={() => navigate("/student/explore-courses")}
              className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
            >
              <svg
                className="-ml-1 mr-3 h-5 w-5"
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
              Explore Courses
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
