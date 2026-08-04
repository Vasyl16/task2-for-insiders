import { Outlet } from 'react-router-dom';
import { Header } from './Header';

/** Shell layout for public-facing pages. Layout owns chrome (header/nav); pages own content. */
export function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
