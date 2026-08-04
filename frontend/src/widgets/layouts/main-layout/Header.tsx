import { Link, NavLink } from 'react-router-dom';
import { paths } from '@/app/routes';
import { useCart } from '@/entities/cart';
import { useSession } from '@/entities/session';
import { useLogout } from '@/features/auth';

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900';
}

export function Header() {
  const { user } = useSession();
  const { data: cart } = useCart();
  const logout = useLogout();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to={paths.home} className="text-lg font-semibold text-slate-900">
          Mini Marketplace
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <NavLink to={paths.home} end className={navLinkClassName}>
            Products
          </NavLink>
          <NavLink to={paths.cart} className={navLinkClassName}>
            Cart{cart && cart.totalItems > 0 ? ` (${cart.totalItems})` : ''}
          </NavLink>
          <NavLink to={paths.profile} className={navLinkClassName}>
            Profile
          </NavLink>
          {user?.role === 'ADMIN' && (
            <NavLink to={paths.admin.dashboard} className={navLinkClassName}>
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
            className="text-sm font-medium text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
