import { LogOut, Package, ShieldCheck, ShoppingCart, Store, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useCart } from '@/entities/cart';
import { useSession } from '@/entities/session';
import { useLogout } from '@/features/auth';

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return [
    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
    isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');
}

export function Header() {
  const { user } = useSession();
  const { data: cart } = useCart();
  const logout = useLogout();
  const itemCount = cart?.totalItems ?? 0;

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={paths.home} className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Store className="h-6 w-6 text-slate-900" strokeWidth={2} />
          Mini Marketplace
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to={paths.home} end className={navLinkClassName}>
            <Package className="h-4 w-4" />
            Products
          </NavLink>
          <NavLink to={paths.cart} className={navLinkClassName}>
            <span className="relative">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </span>
            Cart
          </NavLink>
          <NavLink to={paths.profile} className={navLinkClassName}>
            <User className="h-4 w-4" />
            Profile
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to={paths.admin.dashboard} className={navLinkClassName}>
              <ShieldCheck className="h-4 w-4" />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {user && <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>}
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
