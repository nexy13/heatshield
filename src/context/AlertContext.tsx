import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { Toast } from '@/types/common';

interface AlertContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

let toastCounter = 0;

export function AlertProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast-${++toastCounter}`;
      const newToast: Toast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      const duration = toast.duration ?? 4000;
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <AlertContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlerts(): AlertContextType {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
}
