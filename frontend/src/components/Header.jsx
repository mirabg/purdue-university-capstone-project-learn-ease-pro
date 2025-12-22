import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  logout,
} from "@/store/slices/authSlice";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-start items-center h-28 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/images/logo.svg" alt="Logo" className="h-24 w-auto" />
          </Link>

          {/* User Info and Logout */}
          {isAuthenticated && user && (
            <div className="absolute right-0 flex items-center gap-8">
              <div className="text-sm text-gray-700">
                <div>
                  <span className="font-bold">User:</span>{" "}
                  <span className="font-medium">
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.firstName || user.email}
                  </span>
                </div>
                <div>
                  <span className="font-bold">Role:</span>{" "}
                  <span className="font-medium">
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-150"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
