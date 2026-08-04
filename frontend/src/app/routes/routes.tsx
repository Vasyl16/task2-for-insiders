import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AdminLayout } from '@/widgets/layouts';
import { HomePage } from '@/pages/home';
import { ProductPage } from '@/pages/product';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';
import { ProfilePage } from '@/pages/profile';
import {
  AdminDashboardPage,
  AdminProductsPage,
  AdminCategoriesPage,
  AdminOrdersPage,
} from '@/pages/admin';
import { NotFoundPage } from '@/pages/not-found';
import { paths } from './paths';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: paths.home, element: <HomePage /> },
      { path: paths.product, element: <ProductPage /> },
      { path: paths.cart, element: <CartPage /> },
      { path: paths.checkout, element: <CheckoutPage /> },
      { path: paths.profile, element: <ProfilePage /> },
    ],
  },
  {
    element: <AdminLayout />,
    children: [
      { path: paths.admin.dashboard, element: <AdminDashboardPage /> },
      { path: paths.admin.products, element: <AdminProductsPage /> },
      { path: paths.admin.categories, element: <AdminCategoriesPage /> },
      { path: paths.admin.orders, element: <AdminOrdersPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
