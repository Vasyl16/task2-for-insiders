import { Outlet } from 'react-router-dom';

/**
 * Shell layout for the admin dashboard (sidebar/nav will be added once the
 * corresponding widgets are implemented).
 */
export function AdminLayout() {
  return <Outlet />;
}
