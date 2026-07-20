import { useAlerts } from '@/context/AlertContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const accents = {
  success: 'var(--safe)',
  error: 'var(--emergency)',
  warning: 'var(--caution)',
  info: 'var(--info)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useAlerts();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center w-full max-w-md px-4">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        const accent = accents[toast.type];
        return (
          <div
            key={toast.id}
            className="toast-enter w-full px-4 py-3.5 rounded-2xl flex items-start gap-3 border"
            style={{
              background: 'rgba(10, 20, 40, 0.94)',
              borderColor: 'rgba(148, 163, 184, 0.18)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 20px 48px rgba(6, 13, 31, 0.45)',
            }}
          >
            <span
              className="shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg"
              style={{ background: `color-mix(in srgb, ${accent} 18%, transparent)`, color: accent }}
            >
              <Icon size={15} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-snug">{toast.title}</p>
              {toast.message && (
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(203, 213, 225, 0.8)' }}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md transition-colors cursor-pointer"
              style={{ color: 'rgba(148, 163, 184, 0.7)' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(148, 163, 184, 0.7)'; }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
