import { LayoutDashboard, ListTree, LogOut, Package, Receipt, ShieldCheck, Store } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useLogout } from '@/features/auth';

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return [
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');
}

export function AdminHeader() {
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={paths.admin.dashboard} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <ShieldCheck className="h-6 w-6 text-slate-900" strokeWidth={2} />
          Admin
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to={paths.admin.dashboard} end className={navLinkClassName}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink to={paths.admin.products} className={navLinkClassName}>
            <Package className="h-4 w-4" />
            Products
          </NavLink>
          <NavLink to={paths.admin.categories} className={navLinkClassName}>
            <ListTree className="h-4 w-4" />
            Categories
          </NavLink>
          <NavLink to={paths.admin.orders} className={navLinkClassName}>
            <Receipt className="h-4 w-4" />
            Orders
          </NavLink>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            to={paths.home}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Back to store</span>
          </Link>
          <button
            type="button"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
