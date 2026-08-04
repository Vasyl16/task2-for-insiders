import { Link, NavLink } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useLogout } from '@/features/auth';

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900';
}

export function AdminHeader() {
  const logout = useLogout();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={paths.admin.dashboard} className="text-lg font-semibold text-slate-900">
          Admin
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <NavLink to={paths.admin.dashboard} end className={navLinkClassName}>
            Dashboard
          </NavLink>
          <NavLink to={paths.admin.products} className={navLinkClassName}>
            Products
          </NavLink>
          <NavLink to={paths.admin.categories} className={navLinkClassName}>
            Categories
          </NavLink>
          <NavLink to={paths.admin.orders} className={navLinkClassName}>
            Orders
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <Link to={paths.home} className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Back to store
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
