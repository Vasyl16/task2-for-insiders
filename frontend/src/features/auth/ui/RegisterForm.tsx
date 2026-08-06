import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Label, FormError } from '@/shared/ui';
import { registerSchema, type Register } from '../model/schemas';
import { useRegister } from '../api/use-register';
import { getRegisterErrorMessage } from '../model/get-register-error-message';

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
  const submitErrorMessage = registerMutation.isError
    ? getRegisterErrorMessage(registerMutation.error)
    : undefined;

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
      <div>
        <Label htmlFor="register-confirm-password">Repeat password</Label>
        <Input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        <FormError message={errors.confirmPassword?.message} />
      </div>
      <FormError message={submitErrorMessage} />
      <Button type="submit" isLoading={registerMutation.isPending}>
        Create account
      </Button>
    </form>
  );
}
