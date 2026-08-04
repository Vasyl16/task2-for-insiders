import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/entities/session';
import { paths } from '../paths';

/** Keeps authenticated users off login/register — redirects them home instead. */
export function GuestOnly() {
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={paths.home} replace />;
  }

  return <Outlet />;
}
