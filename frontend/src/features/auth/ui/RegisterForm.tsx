import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, FormError } from '@/shared/ui';
import { registerSchema, type Register } from '../model/schemas';
import { useRegister } from '../api/use-register';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Register>({ resolver: zodResolver(registerSchema) });
  const registerMutation = useRegister();

  const onSubmit = handleSubmit((values) => {
    registerMutation.mutate(values, { onSuccess });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="register-email">Email</Label>
        <Input id="register-email" type="email" autoComplete="email" {...register('email')} />
        <FormError message={errors.email?.message} />
      </div>
      <div>
        <Label htmlFor="register-password">Password</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
        />
        <FormError message={errors.password?.message} />
      </div>
      <FormError
        message={registerMutation.isError ? 'Could not create an account with those details.' : undefined}
      />
      <Button type="submit" isLoading={registerMutation.isPending}>
        Create account
      </Button>
    </form>
  );
}
