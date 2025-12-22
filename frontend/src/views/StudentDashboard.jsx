import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@services/authService";
import { enrollmentService } from "@services/enrollmentService";
import { courseService } from "@services/courseService";
import api from "@services/api";
import CourseRating from "@components/CourseRating";
import CourseRatingsModal from "@components/CourseRatingsModal";
import AddEditRatingModal from "@components/AddEditRatingModal";
import CourseMaterialsModal from "@components/CourseMaterialsModal";
import ConfirmModal from "@components/ConfirmModal";
import Icon from "@components/Icon";

function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingsModalOpen, setRatingsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [addEditRatingModalOpen, setAddEditRatingModalOpen] = useState(false);
  const [selectedCourseForRating, setSelectedCourseForRating] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [userFeedbackMap, setUserFeedbackMap] = useState({});
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] =
    useState(null);
  const [confirmDeleteModalOpen, setConfirmDeleteModalOpen] = useState(false);
  const [courseToDeleteRating, setCourseToDeleteRating] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

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

      // Fetch user's enrollments (all of them - set high limit)
      const enrollmentsResponse = await enrollmentService.getAllEnrollments(
        1,
        1000
      );
      const enrollments = enrollmentsResponse.data || [];

      setEnrolledCourses(enrollments);

      // Fetch user feedback for all accepted courses
      const feedbackMap = {};
      const acceptedEnrollments = enrollments.filter(
        (e) => e.status?.toLowerCase() === "accepted"
      );

      await Promise.all(
        acceptedEnrollments.map(async (enrollment) => {
          try {
            const response = await courseService.getMyCourseFeedback(
              enrollment.course._id
            );
            if (response.success && response.data) {
              feedbackMap[enrollment.course._id] = response.data;
            }
          } catch (err) {
            // No feedback for this course, that's okay
          }
        })
      );

      setUserFeedbackMap(feedbackMap);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewRatings = (course) => {
    setSelectedCourse(course);
    setRatingsModalOpen(true);
  };

  const handleAddEditRating = async (course) => {
    // Get existing feedback from the map
    const feedback = userFeedbackMap[course._id] || null;
    setExistingFeedback(feedback);
    setSelectedCourseForRating(course);
    setAddEditRatingModalOpen(true);
  };

  const handleRatingSuccess = () => {
    // Reload the courses to reflect the updated rating
    loadData();
  };

  const handleDeleteRating = (courseId) => {
    setCourseToDeleteRating(courseId);
    setConfirmDeleteModalOpen(true);
    setDeleteError(null);
  };

  const confirmDeleteRating = async () => {
    if (!courseToDeleteRating) return;

    const feedback = userFeedbackMap[courseToDeleteRating];
    if (!feedback) return;

    try {
      await courseService.deleteCourseFeedback(feedback._id);
      // Reload data to reflect the deletion
      loadData();
      setCourseToDeleteRating(null);
      setDeleteError(null);
    } catch (err) {
      console.error("Error deleting rating:", err);
      setDeleteError(
        err.response?.data?.message ||
          "Failed to delete rating. Please try again."
      );
    }
  };

  const handleViewMaterials = (course) => {
    setSelectedCourseForMaterials(course);
    setIsMaterialsModalOpen(true);
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
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Icon name="book" className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">
                  My Courses
                </h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Total: {enrolledCourses.length}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Accepted:{" "}
                  {
                    enrolledCourses.filter(
                      (e) => e.status?.toLowerCase() === "accepted"
                    ).length
                  }
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending:{" "}
                  {
                    enrolledCourses.filter(
                      (e) => e.status?.toLowerCase() === "pending"
                    ).length
                  }
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Denied:{" "}
                  {
                    enrolledCourses.filter(
                      (e) => e.status?.toLowerCase() === "denied"
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {enrolledCourses.length === 0 ? (
              <div className="text-center py-12">
                <Icon name="book" className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No courses yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  You haven't enrolled in any courses yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((enrollment) => (
                  <div
                    key={enrollment._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <h3 className="font-semibold text-gray-900 mb-3">
                      {enrollment.course.name}
                    </h3>
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      {enrollment.course.courseCode}
                    </p>
                    {enrollment.course.instructor && (
                      <p className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Instructor:</span>{" "}
                        {enrollment.course.instructor.firstName}{" "}
                        {enrollment.course.instructor.lastName}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                      {enrollment.course.description}
                    </p>
                    {/* Rating Display */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        <CourseRating
                          averageRating={enrollment.course.averageRating}
                          ratingCount={enrollment.course.ratingCount}
                          size="sm"
                          clickable={true}
                          onClick={() => handleViewRatings(enrollment.course)}
                        />
                        {/* Show Rate this Course link if not rated */}
                        {!userFeedbackMap[enrollment.course._id] &&
                          enrollment.status?.toLowerCase() === "accepted" && (
                            <button
                              onClick={() =>
                                handleAddEditRating(enrollment.course)
                              }
                              className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                            >
                              Rate this Course
                            </button>
                          )}
                      </div>
                      {/* Show student's own rating if they've rated */}
                      {userFeedbackMap[enrollment.course._id] && (
                        <button
                          onClick={() => handleAddEditRating(enrollment.course)}
                          className="mt-2 p-2 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors cursor-pointer w-full text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-primary-900">
                                Your Rating:
                              </span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Icon
                                    key={star}
                                    name="star"
                                    className={`h-4 w-4 ${
                                      star <=
                                      userFeedbackMap[enrollment.course._id]
                                        .rating
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                                <span className="ml-1 text-sm font-semibold text-primary-900">
                                  (
                                  {
                                    userFeedbackMap[enrollment.course._id]
                                      .rating
                                  }
                                  )
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <img
                                src="/icons/edit.svg"
                                alt="Edit"
                                className="h-4 w-4 text-primary-600 hover:opacity-70 cursor-pointer"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRating(enrollment.course._id);
                                }}
                                className="hover:opacity-70"
                              >
                                <img
                                  src="/icons/delete.svg"
                                  alt="Delete"
                                  className="h-4 w-4 text-red-600"
                                />
                              </button>
                            </div>
                          </div>
                          {userFeedbackMap[enrollment.course._id].comment && (
                            <p className="text-xs text-primary-800 mt-1 line-clamp-2">
                              {userFeedbackMap[enrollment.course._id].comment}
                            </p>
                          )}
                        </button>
                      )}
                    </div>
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
                    <div className="mt-auto">
                      <div className="flex items-center gap-2 my-4">
                        <span className="text-xs font-medium text-gray-700">
                          Status:
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            enrollment.status
                          )}`}
                        >
                          {capitalizeStatus(enrollment.status)}
                        </span>
                      </div>
                      {/* Buttons for Accepted Courses */}
                      {enrollment.status?.toLowerCase() === "accepted" && (
                        <div className="space-y-2">
                          <button
                            onClick={() => {
                              console.log(
                                "Navigating to course:",
                                enrollment.course._id
                              );
                              console.log(
                                "Is authenticated:",
                                authService.isAuthenticated()
                              );
                              console.log(
                                "Current user:",
                                authService.getCurrentUser()
                              );
                              navigate(`/course/${enrollment.course._id}`);
                            }}
                            className="w-full inline-flex items-center justify-center px-3 py-2 border border-primary-600 text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                          >
                            <Icon name="chat" className="h-4 w-4 mr-2" />
                            Discussion Board
                          </button>
                          <button
                            onClick={() =>
                              handleViewMaterials(enrollment.course)
                            }
                            className="w-full inline-flex items-center justify-center px-3 py-2 border border-primary-600 text-sm font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
                          >
                            <Icon
                              name="download"
                              className="h-4 w-4 mr-2 text-primary-600"
                            />
                            Course Materials
                          </button>
                        </div>
                      )}
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
            <Icon
              name="search"
              className="mx-auto h-12 w-12 text-primary-600"
            />
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
              <Icon name="search" className="-ml-1 mr-3 h-5 w-5" />
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* Course Ratings Modal */}
      <CourseRatingsModal
        isOpen={ratingsModalOpen}
        onClose={() => setRatingsModalOpen(false)}
        course={selectedCourse}
      />

      {/* Add/Edit Rating Modal */}
      <AddEditRatingModal
        isOpen={addEditRatingModalOpen}
        onClose={() => {
          setAddEditRatingModalOpen(false);
          setSelectedCourseForRating(null);
          setExistingFeedback(null);
        }}
        course={selectedCourseForRating}
        existingFeedback={existingFeedback}
        onSuccess={handleRatingSuccess}
      />

      {/* Course Materials Modal */}
      <CourseMaterialsModal
        isOpen={isMaterialsModalOpen}
        onClose={() => {
          setIsMaterialsModalOpen(false);
          setSelectedCourseForMaterials(null);
        }}
        course={selectedCourseForMaterials}
        readOnly={true}
      />

      {/* Delete Rating Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteModalOpen}
        onClose={() => {
          setConfirmDeleteModalOpen(false);
          setCourseToDeleteRating(null);
          setDeleteError(null);
        }}
        onConfirm={confirmDeleteRating}
        title="Delete Rating"
        message="Are you sure you want to delete your rating? This action cannot be undone."
      />

      {/* Delete Error Message */}
      {deleteError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg z-50 max-w-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon name="error" className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-red-800">{deleteError}</p>
            </div>
            <button
              onClick={() => setDeleteError(null)}
              className="ml-3 flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <span className="sr-only">Dismiss</span>
              <Icon name="close" className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
