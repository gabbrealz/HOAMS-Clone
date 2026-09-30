import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/route/ProtectedRoute.jsx';
import { GuestRoute } from './components/route/GuestRoute.jsx';

import LandingPage from "./pages/default/landing-page.jsx";
import ResidentDashboard from "./pages/resident/resident-dashboard.jsx";
import LoginPage from "./pages/default/login.jsx";
import RegisterFlow from "./pages/default/register.jsx";
import RegistrationStatus from "./pages/default/registration-status.jsx";
import UnauthorizedPage from './pages/default/unauthorized-page.jsx';

import AdminDashboard from "./pages/admin_board/admin-dashboard";
import ResidentsListPage from "./pages/admin_board/admin-list.jsx";

import CreateAdminPage from "./pages/user_admin/userAd-reg.jsx";
import ResidentsListPage_User from "./pages/user_admin/userAd-list.jsx";

export default function App() {
  return (
    <BrowserRouter>
      {/* 1. Global Auth Provider wrapped around Routes */}
      <AuthProvider>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ================= GUEST ONLY ROUTES ================= */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterFlow />} />
            <Route path="/registration-status" element={<RegistrationStatus />} />
          </Route>

          {/* ================= RESIDENT ROUTES ================= */}
          <Route path="/resident" element={<ProtectedRoute allowedRoles={['resident']} />}>
            <Route path="dashboard" element={<ResidentDashboard />} />
          </Route>

          {/* ================= ADMIN STAFF ROUTES ================= */}
          <Route path="/admin" element={ <ProtectedRoute allowedRoles={['administrative_staff', 'board_member']} />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="list" element={<ResidentsListPage />} />
          </Route>

          {/* ================= USER ADMINISTRATOR ROUTES ================= */}
          <Route path="/user-admin" element={ <ProtectedRoute allowedRoles={['user_administrator']} />}>
            <Route path="list" element={<ResidentsListPage_User />} />
            <Route path="register-staff" element={<CreateAdminPage />} />+
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}