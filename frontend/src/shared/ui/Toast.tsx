import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastProps {
  variant: ToastVariant;
  message: string;
  onDismiss: () => void;
}

const VARIANT_CONFIG: Record<ToastVariant, { Icon: typeof Info; className: string }> = {
  success: { Icon: CheckCircle2, className: 'border-green-200 bg-green-50 text-green-800' },
  error: { Icon: AlertCircle, className: 'border-red-200 bg-red-50 text-red-800' },
  info: { Icon: Info, className: 'border-slate-200 bg-white text-slate-800' },
};

export function Toast({ variant, message, onDismiss }: ToastProps) {
  const { Icon, className } = VARIANT_CONFIG[variant];

  return (
    <div
      role="alert"
      className={`flex w-80 items-start gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg ${className}`}
    >
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <p className="flex-1">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-current opacity-60 hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
