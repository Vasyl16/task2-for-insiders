import { Outlet } from 'react-router-dom';

/**
 * Shell layout for public-facing pages (header/nav/footer will be added
 * once the corresponding widgets are implemented).
 */
export function MainLayout() {
  return <Outlet />;
}
