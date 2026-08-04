import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth';
import { paths } from '@/app/routes';

export function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Create an account</h1>
      <RegisterForm onSuccess={() => navigate(paths.home, { replace: true })} />
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link to={paths.login} className="font-medium text-slate-900 underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
