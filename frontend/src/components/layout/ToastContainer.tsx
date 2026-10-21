import React from 'react';
import { useToast, ToastType } from '../../context/ToastContext';

const getToastIcon = (type: ToastType) => {
  switch (type) {
    case 'error':
      return 'error';
    case 'success':
      return 'check_circle';
    case 'warning':
      return 'warning';
    case 'info':
    default:
      return 'info';
  }
};

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'error':
      return 'bg-error-container text-on-error-container border-error/30';
    case 'success':
      return 'bg-emerald-50 text-emerald-900 border-emerald-300';
    case 'warning':
      return 'bg-amber-50 text-amber-900 border-amber-300';
    case 'info':
    default:
      return 'bg-surface-container-high text-on-surface border-outline-variant';
  }
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 ${getToastStyles(
            toast.type
          )}`}
          role="alert"
        >
          <span
            className={`material-symbols-outlined text-xl shrink-0 mt-0.5 ${
              toast.type === 'error'
                ? 'text-error'
                : toast.type === 'success'
                ? 'text-emerald-600'
                : toast.type === 'warning'
                ? 'text-amber-600'
                : 'text-primary'
            }`}
          >
            {getToastIcon(toast.type)}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>
            {toast.message && (
              <p className="text-xs opacity-90 mt-0.5 leading-snug break-words">
                {toast.message}
              </p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 rounded-lg hover:bg-black/10 transition-colors shrink-0 text-current opacity-70 hover:opacity-100"
            aria-label="Cerrar notificación"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      ))}
    </div>
  );
};
