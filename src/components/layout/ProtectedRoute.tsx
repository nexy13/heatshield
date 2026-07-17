import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Spinner from '@/components/ui/Spinner';
import type { UserRole } from '@/types/database';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { authUser, role, loading } = useAuth();

  if (loading) {
    return <Spinner label="Authenticating..." />;
  }

  if (!authUser || !role) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to the user's own dashboard based on their role
    const roleRedirects: Record<string, string> = {
      worker: '/worker',
      supervisor: '/supervisor',
      admin: '/admin',
      ngo: '/admin/compliance',
    };
    return <Navigate to={roleRedirects[role] ?? '/login'} replace />;
  }

  return <>{children}</>;
}
