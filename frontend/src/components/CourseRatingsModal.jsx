import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "@services/api";

function CourseRatingsModal({ isOpen, onClose, course }) {
  const [feedback, setFeedback] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && course) {
      fetchCourseFeedback();
    }
  }, [isOpen, course]);

  const fetchCourseFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/courses/${course._id}/feedback`);
      if (response.data.success) {
        setFeedback(response.data.data.feedback || []);
        setStatistics(response.data.data.statistics || null);
      }
    } catch (err) {
      console.error("Error fetching course feedback:", err);
      setError("Failed to load ratings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRatingDistributionPercentage = (rating) => {
    if (!statistics?.ratingDistribution || statistics.totalFeedback === 0) {
      return 0;
    }
    const dist = statistics.ratingDistribution.find((d) => d._id === rating);
    return dist ? Math.round((dist.count / statistics.totalFeedback) * 100) : 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Course Ratings & Reviews
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {course?.courseCode} - {course?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-red-400"
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
                <p className="mt-4 text-gray-600">{error}</p>
              </div>
            ) : (
              <>
                {/* Statistics Section */}
                {statistics && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      {/* Overall Rating */}
                      <div className="text-center">
                        <div className="text-5xl font-bold text-gray-900">
                          {statistics.averageRating.toFixed(1)}
                        </div>
                        <div className="mt-2">
                          {renderStars(Math.round(statistics.averageRating))}
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          {statistics.totalFeedback}{" "}
                          {statistics.totalFeedback === 1
                            ? "rating"
                            : "ratings"}
                        </div>
                      </div>

                      {/* Rating Distribution */}
                      <div className="flex-1 max-w-md">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          const percentage =
                            getRatingDistributionPercentage(rating);
                          return (
                            <div
                              key={rating}
                              className="flex items-center gap-2 mb-2"
                            >
                              <span className="text-sm text-gray-600 w-8">
                                {rating}★
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-yellow-400 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-gray-600 w-10 text-right">
                                {percentage}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Student Reviews
                  </h4>
                  {feedback.length === 0 ? (
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
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-600">
                        No reviews yet for this course
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedback.map((item) => (
                        <div
                          key={item._id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600 font-semibold">
                                  {item.user?.firstName?.[0]}
                                  {item.user?.lastName?.[0]}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.user?.firstName} {item.user?.lastName}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    {renderStars(item.rating)}
                                    <span className="text-xs text-gray-500">
                                      {formatDate(item.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {item.comment && (
                                <p className="mt-3 text-sm text-gray-700">
                                  {item.comment}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

CourseRatingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  course: PropTypes.object,
};

export default CourseRatingsModal;
