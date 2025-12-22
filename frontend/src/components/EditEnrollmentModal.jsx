import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Icon from "@components/Icon";

function EditEnrollmentModal({ isOpen, onClose, enrollment, onSave }) {
  const [formData, setFormData] = useState({
    status: "",
    comments: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && enrollment) {
      setFormData({
        status: enrollment.status || "pending",
        comments: enrollment.comments || "",
      });
    }
  }, [isOpen, enrollment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSave(enrollment._id, formData.status, formData.comments);
      onClose();
    } catch (error) {
      console.error("Error saving enrollment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      status: enrollment?.status || "pending",
      comments: enrollment?.comments || "",
    });
    onClose();
  };

  if (!isOpen || !enrollment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-700";
      case "accepted":
        return "text-green-700";
      case "denied":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-[60]">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Update Enrollment Status
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {enrollment.student?.firstName} {enrollment.student?.lastName}
            </p>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            disabled={isSubmitting}
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student Info */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs text-gray-500">Student Email</div>
            <div className="text-sm font-medium text-gray-900">
              {enrollment.student?.email}
            </div>
          </div>

          {/* Current Status Display */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-xs text-gray-500 mb-1">Current Status</div>
            <div
              className={`text-sm font-semibold ${getStatusColor(
                enrollment.status
              )}`}
            >
              {enrollment.status.charAt(0).toUpperCase() +
                enrollment.status.slice(1)}
            </div>
          </div>

          {/* Status Selector */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              New Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              required
              disabled={isSubmitting}
            >
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="denied">Denied</option>
            </select>
          </div>

          {/* Comments */}
          <div>
            <label
              htmlFor="comments"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Comments
            </label>
            <textarea
              id="comments"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows="4"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Add any notes or reasons for this status change..."
              disabled={isSubmitting}
            />
            <p className="mt-1 text-xs text-gray-500">
              Optional: Provide a reason for accepting or denying this
              enrollment
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditEnrollmentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  enrollment: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default EditEnrollmentModal;
