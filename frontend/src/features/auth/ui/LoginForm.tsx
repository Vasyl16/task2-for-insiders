import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, FormError } from '@/shared/ui';
import { loginSchema, type Login } from '../model/schemas';
import { useLogin } from '../api/use-login';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Login>({ resolver: zodResolver(loginSchema) });
  const loginMutation = useLogin();

  const onSubmit = handleSubmit((values) => {
    loginMutation.mutate(values, { onSuccess });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" autoComplete="email" {...register('email')} />
        <FormError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="login-password">Password</Label>
        <Input id="login-password" type="password" autoComplete="current-password" {...register('password')} />
        <FormError message={errors.password?.message} />
      </div>
      <FormError message={loginMutation.isError ? 'Invalid email or password.' : undefined} />
      <Button type="submit" isLoading={loginMutation.isPending}>
        Log in
      </Button>
    </form>
  );
}
