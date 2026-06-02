import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TournamentsPage from "./pages/TournamentsPage";
import BannersPage from "./pages/BannersPage";
import HeadlinePage from "./pages/HeadlinePage";
import ClubPage from "./pages/ClubPage";
import PigeonOwnersPage from "./pages/PigeonOwnersPage";
import SubAdminPage from "./pages/SubAdminPage";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

const isLoggedIn = () => localStorage.getItem("admin_auth") === "true";

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  return isLoggedIn() ? (
    <AdminLayout>{children}</AdminLayout>
  ) : (
    <Navigate to="/login" replace />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/banners" element={<ProtectedRoute><BannersPage /></ProtectedRoute>} />
      <Route path="/headline" element={<ProtectedRoute><HeadlinePage /></ProtectedRoute>} />
      <Route path="/club" element={<ProtectedRoute><ClubPage /></ProtectedRoute>} />
      <Route path="/tournaments" element={<ProtectedRoute><TournamentsPage /></ProtectedRoute>} />
      <Route path="/pigeon-owners" element={<ProtectedRoute><PigeonOwnersPage /></ProtectedRoute>} />
      <Route path="/subadmin" element={<ProtectedRoute><SubAdminPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}