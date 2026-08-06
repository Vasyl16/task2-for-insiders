import { createBrowserRouter } from 'react-router-dom';
import { MainLayout, AdminLayout } from '@/widgets/layouts';
import { HomePage } from '@/pages/home';
import { ProductPage } from '@/pages/product';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';
import { OrdersPage } from '@/pages/orders';
import { ProfilePage } from '@/pages/profile';
import { LoginPage } from '@/pages/login';
import { RegisterPage } from '@/pages/register';
import {
  AdminDashboardPage,
  AdminProductsPage,
  AdminCategoriesPage,
  AdminOrdersPage,
} from '@/pages/admin';
import { NotFoundPage } from '@/pages/not-found';
import { paths } from './paths';
import { RequireAuth, RequireRole, GuestOnly } from './guards';

export const router = createBrowserRouter([
  {
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: paths.home, element: <HomePage /> },
          { path: paths.product, element: <ProductPage /> },
          { path: paths.cart, element: <CartPage /> },
          { path: paths.checkout, element: <CheckoutPage /> },
          { path: paths.orders, element: <OrdersPage /> },
          { path: paths.profile, element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <GuestOnly />,
    children: [
      { path: paths.login, element: <LoginPage /> },
      { path: paths.register, element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireRole allowedRoles={['ADMIN']} />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: paths.admin.dashboard, element: <AdminDashboardPage /> },
              { path: paths.admin.products, element: <AdminProductsPage /> },
              { path: paths.admin.categories, element: <AdminCategoriesPage /> },
              { path: paths.admin.orders, element: <AdminOrdersPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
