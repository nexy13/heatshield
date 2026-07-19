import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AlertProvider } from '@/context/AlertContext';
import ToastContainer from '@/components/ui/Toast';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import KioskPage from '@/pages/KioskPage';
import SupervisorDashboard from '@/pages/SupervisorDashboard';
import WorkerGridPage from '@/pages/WorkerGridPage';
import SOSResponsePage from '@/pages/SOSResponsePage';
import AdminDashboard from '@/pages/AdminDashboard';
import KilnSiteManagerPage from '@/pages/KilnSiteManagerPage';
import UserManagerPage from '@/pages/UserManagerPage';
import ComplianceReportsPage from '@/pages/ComplianceReportsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import SystemAlertsPage from '@/pages/SystemAlertsPage';
import ShiftSchedulerPage from '@/pages/ShiftSchedulerPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFoundPage from '@/pages/NotFoundPage';

/** Layout with sidebar for authenticated pages */
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      <main className="flex-1 lg:ml-0 p-6 pt-16 lg:pt-8 max-w-5xl mx-auto w-full relative">
        {children}
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  // Public pages don't have sidebar
  const publicPaths = ['/', '/login', '/reset-password'];
  const isKiosk = location.pathname.startsWith('/kiosk/');
  const isPublic = publicPaths.includes(location.pathname) || isKiosk;

  if (isPublic) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/kiosk/:siteId" element={<KioskPage />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        {/* Supervisor Routes */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/workers"
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <WorkerGridPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/alerts"
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <SystemAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/shifts"
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <ShiftSchedulerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/sos"
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <SOSResponsePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sites"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <KilnSiteManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alerts"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SystemAlertsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/compliance"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ComplianceReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <AppRoutes />
          <ToastContainer />
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
}
