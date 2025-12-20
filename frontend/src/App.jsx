import { Routes, Route, Navigate } from "react-router-dom";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Login from "@views/Login";
import AdminDashboard from "@views/AdminDashboard";
import AdminRoute from "@components/AdminRoute";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-br from-primary-50 via-white to-primary-100">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
