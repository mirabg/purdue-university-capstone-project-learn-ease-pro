import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  useGetEnrollmentsByCourseQuery,
  useGetCourseEnrollmentStatsQuery,
  useUpdateEnrollmentStatusMutation,
} from "@/store/apiSlice";
import Icon from "@components/Icon";
import EditEnrollmentModal from "@components/EditEnrollmentModal";

function EnrollmentManagementModal({ isOpen, onClose, course }) {
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // RTK Query hooks
  const {
    data: enrollmentsData,
    isLoading: loading,
    refetch: refetchEnrollments,
  } = useGetEnrollmentsByCourseQuery(
    {
      courseId: course?._id,
      status: filterStatus === "all" ? undefined : filterStatus,
    },
    {
      skip: !isOpen || !course,
    }
  );

  const { data: statsData } = useGetCourseEnrollmentStatsQuery(course?._id, {
    skip: !isOpen || !course,
  });

  const [updateEnrollmentStatus] = useUpdateEnrollmentStatusMutation();

  // Extract enrollments and stats from query results
  const enrollments =
    enrollmentsData?.data?.filter(
      (enrollment) => enrollment.student && enrollment.student._id
    ) || [];
  const stats = statsData?.data || {
    pending: 0,
    accepted: 0,
    denied: 0,
    total: 0,
  };

  const handleOpenEditModal = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedEnrollment(null);
    setEditModalOpen(false);
  };

  const handleSaveEnrollment = async (enrollmentId, status, comments) => {
    try {
      setError(null);
      await updateEnrollmentStatus({
        enrollmentId,
        status,
        comments,
      }).unwrap();
      // Refetch will happen automatically due to cache invalidation
    } catch (err) {
      console.error("Error updating enrollment:", err);
      setError(err.data?.message || "Failed to update enrollment");
      throw err;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-2 sm:top-10 mx-auto p-3 sm:p-5 border w-full sm:w-11/12 max-w-6xl shadow-lg rounded-md bg-white mb-20">
        {/* Header */}
        <div className="flex justify-between items-start mb-4 sm:mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
              Enrollment Management
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <div className="text-xs sm:text-sm font-medium text-blue-600">
              Total Enrollments
            </div>
            <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-blue-900">
              {stats.total}
            </div>
          </div>
          <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
            <div className="text-xs sm:text-sm font-medium text-yellow-600">
              Pending
            </div>
            <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-yellow-900">
              {stats.pending}
            </div>
          </div>
          <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
            <div className="text-xs sm:text-sm font-medium text-green-600">
              Accepted
            </div>
            <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-green-900">
              {stats.accepted}
            </div>
          </div>
          <div className="bg-red-50 p-3 sm:p-4 rounded-lg">
            <div className="text-xs sm:text-sm font-medium text-red-600">
              Denied
            </div>
            <div className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-red-900">
              {stats.denied}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-4">
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full md:w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
          >
            <option value="all">All Enrollments</option>
            <option value="pending">Pending Only</option>
            <option value="accepted">Accepted Only</option>
            <option value="denied">Denied Only</option>
          </select>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Icon name="error" className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enrollments Table */}
        <div className="overflow-x-auto -mx-3 sm:mx-0">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-sm text-gray-500">
                Loading enrollments...
              </p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="p-8 text-center">
              <Icon
                name="users-empty"
                className="mx-auto h-12 w-12 text-gray-400"
              />
              <p className="mt-2 text-sm text-gray-500">
                {filterStatus === "all"
                  ? "No enrollments found for this course"
                  : `No ${filterStatus} enrollments found`}
              </p>
            </div>
          ) : (
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Student
                      </th>
                      <th
                        scope="col"
                        className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Enrolled Date
                      </th>
                      <th
                        scope="col"
                        className="hidden xl:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Comments
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {enrollments.map((enrollment) => (
                      <tr key={enrollment._id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {enrollment.student?.firstName ||
                            enrollment.student?.lastName
                              ? `${enrollment.student?.firstName || ""} ${
                                  enrollment.student?.lastName || ""
                                }`.trim()
                              : "Unknown Student"}
                          </div>
                          <div className="md:hidden text-xs text-gray-500 mt-1">
                            {enrollment.student?.email || "N/A"}
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {enrollment.student?.email || "N/A"}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {formatDate(enrollment.createdAt)}
                        </td>
                        <td className="hidden xl:table-cell px-3 sm:px-6 py-4">
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {enrollment.comments || "-"}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                              enrollment.status
                            )}`}
                          >
                            {enrollment.status.charAt(0).toUpperCase() +
                              enrollment.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                          <button
                            onClick={() => handleOpenEditModal(enrollment)}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                            title="Edit enrollment"
                          >
                            <Icon name="edit" className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 sm:mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit Enrollment Modal */}
      <EditEnrollmentModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        enrollment={selectedEnrollment}
        onSave={handleSaveEnrollment}
      />
    </div>
  );
}

EnrollmentManagementModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  course: PropTypes.object,
};

export default EnrollmentManagementModal;
