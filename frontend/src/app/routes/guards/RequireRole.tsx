import { Navigate, Outlet } from 'react-router-dom';
import { useSession } from '@/entities/session';
import type { Role } from '@/shared/types';
import { paths } from '../paths';

interface RequireRoleProps {
  allowedRoles: Role[];
}

/** Nest inside RequireAuth — assumes a session already exists. */
export function RequireRole({ allowedRoles }: RequireRoleProps) {
  const { user, isLoading } = useSession();

  if (isLoading) {
    return null;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={paths.home} replace />;
  }

  return <Outlet />;
}
