import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '@/features/auth';
import { paths } from '@/app/routes';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? paths.home;

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Log in</h1>
      <LoginForm onSuccess={() => navigate(from, { replace: true })} />
      <p className="mt-4 text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <Link to={paths.register} className="font-medium text-slate-900 underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
