import { Routes, Route, Navigate } from "react-router-dom";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Login from "@views/Login";
import Register from "@views/Register";
import AdminDashboard from "@views/AdminDashboard";
import FacultyDashboard from "@views/FacultyDashboard";
import StudentDashboard from "@views/StudentDashboard";
import ExploreCourses from "@views/ExploreCourses";
import UserManagement from "@views/UserManagement";
import CourseManagement from "@views/CourseManagement";
import CourseDetail from "@views/CourseDetail";
import Unauthorized from "@views/Unauthorized";
import AdminRoute from "@components/AdminRoute";
import FacultyRoute from "@components/FacultyRoute";
import PrivateRoute from "@components/PrivateRoute";
import { authService } from "@services/authService";

// Component to handle root redirect based on auth status
function RootRedirect() {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const user = authService.getCurrentUser();

  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user?.role === "faculty") {
    return <Navigate to="/faculty/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/student/dashboard"
            element={
              <PrivateRoute>
                <StudentDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/student/explore-courses"
            element={
              <PrivateRoute>
                <ExploreCourses />
              </PrivateRoute>
            }
          />
          <Route
            path="/course/:courseId"
            element={
              <PrivateRoute>
                <CourseDetail />
              </PrivateRoute>
            }
          />
          <Route
            path="/faculty/dashboard"
            element={
              <FacultyRoute>
                <FacultyDashboard />
              </FacultyRoute>
            }
          />
          <Route
            path="/faculty/courses"
            element={
              <FacultyRoute>
                <CourseManagement />
              </FacultyRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <CourseManagement />
              </AdminRoute>
            }
          />
          {/* Catch-all route for non-existent pages */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
