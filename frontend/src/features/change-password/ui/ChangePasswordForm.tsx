import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormError, Input, Label } from '@/shared/ui';
import { changePasswordSchema, type ChangePassword } from '../model/schemas';
import { useChangePassword } from '../api/use-change-password';

export function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePassword>({ resolver: zodResolver(changePasswordSchema) });
  const changePassword = useChangePassword();

  const onSubmit = handleSubmit((values) => {
    changePassword.mutate(values, { onSuccess: () => reset() });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          {...register('currentPassword')}
        />
        <FormError message={errors.currentPassword?.message} />
      </div>
      <div>
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          {...register('newPassword')}
        />
        <FormError message={errors.newPassword?.message} />
      </div>
      <div>
        <Label htmlFor="confirm-password">Confirm new password</Label>
        <Input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />
        <FormError message={errors.confirmPassword?.message} />
      </div>
      <Button type="submit" isLoading={changePassword.isPending}>
        Change password
      </Button>
    </form>
  );
}
