import { createContext, useState, useCallback, useContext } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', title = null) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    const newToast = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showSuccess = useCallback((msg, title = 'Success') => addToast(msg, 'success', title), [addToast]);
  const showError = useCallback((msg, title = 'Error') => addToast(msg, 'error', title), [addToast]);
  const showInfo = useCallback((msg, title = 'Notification') => addToast(msg, 'info', title), [addToast]);
  const showWarning = useCallback((msg, title = 'Warning') => addToast(msg, 'warning', title), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, showSuccess, showError, showInfo, showWarning }}>
      {children}

      <style>{`
        @keyframes toastDropDown {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Floating Popup Toast Container - Top Centered */}
      <div
        style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '520px',
          width: 'calc(100vw - 40px)',
          pointerEvents: 'none',
          alignItems: 'center',
        }}
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          const borderColor = isSuccess
            ? '#16a34a'
            : isError
            ? '#dc2626'
            : isWarning
            ? '#d97706'
            : 'var(--govt-navy)';

          const bgColor = isSuccess
            ? '#f0fdf4'
            : isError
            ? '#fef2f2'
            : isWarning
            ? '#fffbeb'
            : '#f0f9ff';

          const iconColor = isSuccess
            ? '#16a34a'
            : isError
            ? '#dc2626'
            : isWarning
            ? '#d97706'
            : 'var(--govt-navy)';

          return (
            <div
              key={toast.id}
              style={{
                pointerEvents: 'auto',
                background: bgColor,
                borderLeft: `5px solid ${borderColor}`,
                borderTop: '1px solid var(--border-color)',
                borderRight: '1px solid var(--border-color)',
                borderBottom: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '12px 18px',
                boxShadow: '0 12px 30px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                width: '100%',
                animation: 'toastDropDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                color: 'var(--text-primary)',
              }}
            >
              <div style={{ marginTop: '2px', flexShrink: 0 }}>
                {isSuccess && <CheckCircle2 size={20} color={iconColor} />}
                {isError && <AlertCircle size={20} color={iconColor} />}
                {isWarning && <AlertTriangle size={20} color={iconColor} />}
                {!isSuccess && !isError && !isWarning && <Info size={20} color={iconColor} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {toast.title && (
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: borderColor, marginBottom: '2px' }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: '0.85rem', lineHeight: 1.4, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                  {toast.message}
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
