import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { courseService } from "@services/courseService";
import Icon from "@components/Icon";

function AddEditRatingModal({
  isOpen,
  onClose,
  course,
  existingFeedback,
  onSuccess,
}) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && existingFeedback) {
      setRating(existingFeedback.rating || 0);
      setComment(existingFeedback.comment || "");
    } else if (isOpen) {
      setRating(0);
      setComment("");
    }
    setError(null);
  }, [isOpen, existingFeedback]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await courseService.addOrUpdateFeedback(course._id, rating, comment);

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit rating. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex justify-center gap-2 my-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Icon
              name="star"
              className={`h-10 w-10 ${
                star <= (hoveredRating || rating)
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {existingFeedback ? "Edit Your Rating" : "Rate This Course"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {course?.courseCode} - {course?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <Icon name="close" className="h-6 w-6" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 text-center mb-2">
                  Select Your Rating
                </label>
                {renderStars()}
                {rating > 0 && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    {rating} {rating === 1 ? "star" : "stars"}
                  </p>
                )}
              </div>

              {/* Comment */}
              <div className="mb-4">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Review (Optional)
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  placeholder="Share your thoughts about this course..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500 text-right">
                  {comment.length}/1000 characters
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || rating === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <img
                      src="/icons/spinner.svg"
                      alt=""
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    />
                    Submitting...
                  </span>
                ) : existingFeedback ? (
                  "Update Rating"
                ) : (
                  "Submit Rating"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

AddEditRatingModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  course: PropTypes.object,
  existingFeedback: PropTypes.object,
  onSuccess: PropTypes.func,
};

export default AddEditRatingModal;
