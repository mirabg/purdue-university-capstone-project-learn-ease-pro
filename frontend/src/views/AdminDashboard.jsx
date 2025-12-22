import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@services/authService";
import { userService } from "@services/userService";
import { courseService } from "@services/courseService";
import courseEnrollmentService from "@services/courseEnrollmentService";
import Icon from "@components/Icon";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(null);
  const [totalCourses, setTotalCourses] = useState(null);
  const [enrollmentStats, setEnrollmentStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current user info (already verified by AdminRoute)
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Fetch total users and courses count
    const fetchStats = async () => {
      try {
        const usersResponse = await userService.getAllUsers(1, 1);
        if (usersResponse.success) {
          setTotalUsers(usersResponse.count);
        }

        const coursesResponse = await courseService.getAllCourses(1, 1);
        if (coursesResponse.success) {
          setTotalCourses(coursesResponse.count);
        }

        const enrollmentResponse =
          await courseEnrollmentService.getGlobalEnrollmentStats();
        if (enrollmentResponse.success) {
          setEnrollmentStats(enrollmentResponse.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>

        {/* Stats Grid - Placeholder */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <Icon name="users" className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Users
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalUsers !== null ? totalUsers : "-"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Icon name="book" className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Courses
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {totalCourses !== null ? totalCourses : "-"}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <Icon name="check-circle" className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Enrollments
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {enrollmentStats !== null ? enrollmentStats.total : "-"}
                  </dd>
                  {enrollmentStats && (
                    <dd className="mt-2 text-xs text-gray-600">
                      <span className="text-yellow-600 font-medium">
                        Pending: {enrollmentStats.pending}
                      </span>
                      {" | "}
                      <span className="text-green-600 font-medium">
                        Approved: {enrollmentStats.accepted}
                      </span>
                      {" | "}
                      <span className="text-red-600 font-medium">
                        Denied: {enrollmentStats.denied}
                      </span>
                    </dd>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Management</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => navigate("/admin/users")}
                className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
              >
                <Icon name="users" className="mr-3 h-6 w-6" />
                Manage Users
              </button>
              <button
                onClick={() => navigate("/admin/courses")}
                className="inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition"
              >
                <Icon name="book" className="mr-3 h-6 w-6" />
                Manage Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
