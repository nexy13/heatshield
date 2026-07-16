import { useAlerts } from '@/context/AlertContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'border-emerald-500/30 text-emerald-400',
  error: 'border-red-500/30 text-red-400',
  warning: 'border-amber-500/30 text-amber-400',
  info: 'border-blue-500/30 text-blue-400',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useAlerts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            className={`toast-enter glass px-5 py-3 rounded-xl flex items-center gap-3 shadow-2xl border ${styles[toast.type]} max-w-md`}
          >
            <Icon size={18} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
