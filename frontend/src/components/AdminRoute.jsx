import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated, selectIsAdmin } from "@/store/slices/authSlice";

/**
 * AdminRoute Component
 * Protects routes that should only be accessible to admin users
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if authenticated but not an admin
 */
function AdminRoute({ children }) {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);

  if (!isAuthenticated) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!isAdmin) {
    // Logged in but not an admin, show unauthorized page
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // User is authenticated and is an admin
  return children;
}

export default AdminRoute;
