import { Routes, Route, Navigate } from "react-router-dom";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Login from "@views/Login";
import Register from "@views/Register";
import AdminDashboard from "@views/AdminDashboard";
import StudentDashboard from "@views/StudentDashboard";
import UserManagement from "@views/UserManagement";
import Unauthorized from "@views/Unauthorized";
import AdminRoute from "@components/AdminRoute";
import PrivateRoute from "@components/PrivateRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
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
          {/* Catch-all route for non-existent pages */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
