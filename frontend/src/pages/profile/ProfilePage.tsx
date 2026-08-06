import { AlertCircle, KeyRound, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useMyProfile } from '@/entities/user';
import { UpdateProfileForm } from '@/features/update-profile';
import { ChangePasswordForm } from '@/features/change-password';

export function ProfilePage() {
  const { data: profile, isLoading, isError } = useMyProfile();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-semibold text-slate-900">
        <UserIcon className="h-6 w-6" />
        Profile
      </h1>

      {isLoading && (
        <div className="flex items-center gap-2 py-16 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile…
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="text-sm text-red-700">Failed to load your profile.</p>
        </div>
      )}

      {profile && (
        <div className="space-y-6">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4" />
              {profile.role === 'ADMIN' ? 'Administrator' : 'Customer'}
            </span>
            <span className="text-xs text-slate-500">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">Account details</h2>
            <UpdateProfileForm currentEmail={profile.email} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <KeyRound className="h-4 w-4" />
              Change password
            </h2>
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </div>
  );
}
