import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@services/authService";
import Icon from "@components/Icon";

function FacultyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user info (already verified by FacultyRoute)
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Faculty Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Main Course Management Section */}
        <div className="bg-white shadow rounded-lg border border-gray-200">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-center">
              <button
                onClick={() => navigate("/faculty/courses")}
                className="relative rounded-lg border-2 border-blue-400 bg-white px-8 py-6 shadow-lg flex items-center space-x-4 hover:border-blue-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
              >
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Icon name="book" className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 text-center">
                  <p className="text-lg font-bold text-gray-900">
                    Manage Your Courses
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    View, create, edit, and manage your courses
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Icon
                    name="chevron-right"
                    className="h-6 w-6 text-blue-600"
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <Icon name="info" className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Faculty Resources
              </h3>
              <p className="mt-2 text-sm text-blue-700">
                As a faculty member, you can create and manage your courses,
                upload course materials, and track student enrollments. Click
                "Manage Your Courses" to get started.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;
