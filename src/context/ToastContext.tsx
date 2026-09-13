import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-react';

export type ToastTone = 'success' | 'danger' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, tone: ToastTone) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, tone }]);

      // Auto dismiss after 4.5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast],
  );

  const toast = {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'danger'),
    warning: (msg: string) => addToast(msg, 'warning'),
    info: (msg: string) => addToast(msg, 'info'),
  };

  const getToneStyle = (tone: ToastTone) => {
    switch (tone) {
      case 'success':
        return {
          icon: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
          border: 'border-emerald-500/30',
          bg: 'bg-bg-surface',
        };
      case 'danger':
        return {
          icon: <AlertOctagon size={16} className="text-rose-400 shrink-0" />,
          border: 'border-rose-500/30',
          bg: 'bg-bg-surface',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
          border: 'border-amber-500/30',
          bg: 'bg-bg-surface',
        };
      default:
        return {
          icon: <Info size={16} className="text-sky-400 shrink-0" />,
          border: 'border-sky-500/30',
          bg: 'bg-bg-surface',
        };
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md pointer-events-none"
      >
        {toasts.map((item) => {
          const style = getToneStyle(item.tone);
          return (
            <div
              key={item.id}
              className={`
                pointer-events-auto p-3.5 rounded-xl border ${style.border} ${style.bg}
                shadow-2xl shadow-black/80 flex items-start justify-between gap-3 text-xs
                animate-in slide-in-from-bottom-3 duration-200 transition-all
              `}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {style.icon}
                <p className="text-text-primary font-medium leading-relaxed">
                  {item.message}
                </p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                aria-label="Dismiss notification"
                className="text-text-muted hover:text-text-primary p-0.5 rounded transition-colors shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue['toast'] {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx.toast;
}
