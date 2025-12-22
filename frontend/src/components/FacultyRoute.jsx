import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsFaculty,
} from "@/store/slices/authSlice";

/**
 * FacultyRoute Component
 * Protects routes that should only be accessible to faculty users
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if authenticated but not a faculty member
 */
function FacultyRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isFaculty = useSelector(selectIsFaculty);

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isFaculty) {
    // Logged in but not a faculty member, show unauthorized page
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // User is authenticated and is a faculty member
  return children;
}

export default FacultyRoute;
