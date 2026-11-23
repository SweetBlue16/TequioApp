import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/contexts/AuthContext';

export function ProtectedRoutes({ requiredRoleId }: Readonly<{ requiredRoleId?: number }>) {
  const { session, isInitializing } = useSession();
  const location = useLocation();

  if (isInitializing) {
    return <output>Restaurando sesión…</output>;
  }
  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (requiredRoleId && session.roleId !== requiredRoleId) {
    return <Navigate to="/perfil" replace />;
  }
  return <Outlet />;
}
