import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSession } from '@/entities/session';
import { paths } from '../paths';

/** Blocks access to nested routes until a session is bootstrapped and authenticated. */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useSession();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to={paths.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
