import { Outlet } from 'react-router-dom';
import { AdminHeader } from './AdminHeader';

/** Shell layout for the admin dashboard. Layout owns chrome (header/nav); pages own content. */
export function AdminLayout() {
  return (
    <>
      <AdminHeader />
      <Outlet />
    </>
  );
}
