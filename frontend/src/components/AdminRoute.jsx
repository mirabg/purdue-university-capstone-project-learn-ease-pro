import { Navigate } from "react-router-dom";
import { authService } from "@services/authService";

/**
 * AdminRoute Component
 * Protects routes that should only be accessible to admin users
 * Redirects to login if not authenticated or to unauthorized page if not an admin
 */
function AdminRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Logged in but not an admin, show unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and is an admin
  return children;
}

export default AdminRoute;
