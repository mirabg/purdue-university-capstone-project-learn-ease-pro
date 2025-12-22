import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/store/slices/authSlice";
import Icon from "@components/Icon";

function Unauthorized() {
  const navigate = useNavigate();
  const location = useLocation();
  const attemptedPath = location.state?.from || "the requested page";
  const user = useSelector(selectUser);

  return (
    <div className="h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          {/* Warning Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <Icon name="warning" className="h-10 w-10 text-red-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Unauthorized Access
          </h2>
          <p className="text-gray-600 mb-2">
            You do not have permission to access this page
          </p>
          <p className="text-gray-600 mb-8">
            This area is restricted to administrators only.
          </p>
        </div>

        {/* Card with additional info */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-4">
            <div className="flex items-start">
              <Icon
                name="info-circle"
                className="h-5 w-5 text-gray-400 mt-0.5 mr-3"
              />
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Need Access?
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  If you believe you should have access to this area, please
                  contact your system administrator.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
              >
                <Icon name="arrow-back" className="mr-2 h-4 w-4" />
                Go Back
              </button>
              <button
                onClick={() => {
                  if (user && user.role === "admin") {
                    navigate("/admin/dashboard");
                  } else if (user) {
                    navigate("/student/dashboard");
                  } else {
                    navigate("/login");
                  }
                }}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Unauthorized;
