import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "@/store/slices/authSlice";

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * Redirects to login page if not authenticated
 */
function PrivateRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // User is authenticated
  return children;
}

export default PrivateRoute;
