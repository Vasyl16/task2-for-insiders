import { Link } from 'react-router-dom';
import { paths } from '@/app/routes';

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-500">The page you're looking for doesn't exist.</p>
      <Link to={paths.home} className="mt-6 text-sm font-medium text-slate-900 underline">
        Back to products
      </Link>
    </div>
  );
}
