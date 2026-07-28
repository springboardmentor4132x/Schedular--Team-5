import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export function ProtectedRoute({
  allowedRoles,
}: ProtectedRouteProps) {
  const token = localStorage.getItem('auth_token');
  const role = localStorage.getItem('user_role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (
    allowedRoles &&
    (!role || !allowedRoles.includes(role))
  ) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}