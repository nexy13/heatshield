import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AlertProvider } from '@/context/AlertContext';
import ToastContainer from '@/components/ui/Toast';
import Sidebar from '@/components/layout/Sidebar';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import WorkerDashboard from '@/pages/WorkerDashboard';
import SOSPage from '@/pages/SOSPage';
import SupervisorDashboard from '@/pages/SupervisorDashboard';
import WorkerGridPage from '@/pages/WorkerGridPage';
import SOSResponsePage from '@/pages/SOSResponsePage';
import AdminDashboard from '@/pages/AdminDashboard';
import ComplianceReportsPage from '@/pages/ComplianceReportsPage';
import NotFoundPage from '@/pages/NotFoundPage';

/** Layout with sidebar for authenticated pages */
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-0 p-6 pt-16 lg:pt-6 max-w-7xl mx-auto w-full relative z-10">
        {children}
      </main>
      {/* Mesh background */}
      <div className="mesh-bg" aria-hidden="true">
        <div className="mesh-orb" />
        <div className="mesh-orb" />
        <div className="mesh-orb" />
      </div>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();

  // Public pages don't have sidebar
  const publicPaths = ['/', '/login', '/register'];
  const isPublic = publicPaths.includes(location.pathname);

  if (isPublic) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    );
  }

  return (
    <DashboardLayout>
      <Routes>
        {/* Worker Routes */}
        <Route
          path="/worker"
          element={
            <ProtectedRoute allowedRoles={['worker', 'supervisor', 'admin']}>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/sos"
          element={
            <ProtectedRoute allowedRoles={['worker', 'supervisor']}>
              <SOSPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/shifts"
          element={
            <ProtectedRoute allowedRoles={['worker', 'supervisor', 'admin']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">My Shifts</h2>
                <p>Shift history and details — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/health"
          element={
            <ProtectedRoute allowedRoles={['worker', 'supervisor', 'admin']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Health Log</h2>
                <p>Body temperature and symptom tracking — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/worker/hydration"
          element={
            <ProtectedRoute allowedRoles={['worker', 'supervisor', 'admin']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Hydration Log</h2>
                <p>Water intake tracking — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />

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
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Alert Manager</h2>
                <p>Full alert management — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/shifts"
          element={
            <ProtectedRoute allowedRoles={['supervisor', 'admin']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Shift Scheduler</h2>
                <p>Shift creation and management — coming soon</p>
              </div>
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
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Kiln Site Manager</h2>
                <p>Create and manage kiln sites — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">User Manager</h2>
                <p>Manage users and roles — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/alerts"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">System Alerts</h2>
                <p>All alerts across sites — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/compliance"
          element={
            <ProtectedRoute allowedRoles={['admin', 'ngo']}>
              <ComplianceReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin', 'ngo']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Analytics</h2>
                <p>Charts and trend analysis — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p>App-wide configuration — coming soon</p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Shared */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <div className="text-center py-20 text-[var(--color-text-muted)]">
                <h2 className="text-2xl font-bold mb-2">Settings</h2>
                <p>Language, notifications, and theme — coming soon</p>
              </div>
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
