import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, FormError, Input, Label } from '@/shared/ui';
import { updateProfileSchema, type UpdateProfile } from '../model/schemas';
import { useUpdateProfile } from '../api/use-update-profile';

interface UpdateProfileFormProps {
  currentEmail: string;
}

export function UpdateProfileForm({ currentEmail }: UpdateProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfile>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { email: currentEmail },
  });
  const updateProfile = useUpdateProfile();

  useEffect(() => {
    reset({ email: currentEmail });
  }, [currentEmail, reset]);

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values, { onSuccess: () => reset(values) });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div>
        <Label htmlFor="profile-email">Email</Label>
        <Input id="profile-email" type="email" autoComplete="email" {...register('email')} />
        <FormError message={errors.email?.message} />
      </div>
      <Button type="submit" isLoading={updateProfile.isPending} disabled={!isDirty}>
        Save changes
      </Button>
    </form>
  );
}
