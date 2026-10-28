import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TournamentsPage from "./pages/TournamentsPage";
import CreateResultPage from "./pages/CreateResultPage";
import BannersPage from "./pages/BannersPage";
import HeadlinePage from "./pages/HeadlinePage";
import ClubPage from "./pages/ClubPage";
import PigeonOwnersPage from "./pages/PigeonOwnersPage";
import SubAdminPage from "./pages/SubAdminPage";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

const isLoggedIn = () => !!localStorage.getItem("admin_token");

function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const user = useSelector((state) => state.auth.user);

  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/tournaments" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute roles={["admin"]}><Dashboard /></ProtectedRoute>} />
      <Route path="/banners" element={<ProtectedRoute roles={["admin"]}><BannersPage /></ProtectedRoute>} />
      <Route path="/headline" element={<ProtectedRoute roles={["admin"]}><HeadlinePage /></ProtectedRoute>} />
      <Route path="/club" element={<ProtectedRoute roles={["admin"]}><ClubPage /></ProtectedRoute>} />
      <Route path="/pigeon-owners" element={<ProtectedRoute roles={["admin"]}><PigeonOwnersPage /></ProtectedRoute>} />
      <Route path="/subadmin" element={<ProtectedRoute roles={["admin"]}><SubAdminPage /></ProtectedRoute>} />
      <Route path="/tournaments" element={<ProtectedRoute roles={["admin", "subadmin"]}><TournamentsPage /></ProtectedRoute>} />
      <Route path="/tournaments/:id/result" element={<ProtectedRoute roles={["admin", "subadmin"]}><CreateResultPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/tournaments" replace />} />
    </Routes>
  );
}
