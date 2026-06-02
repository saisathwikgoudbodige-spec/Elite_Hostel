import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const success = useCallback((msg, dur) => addToast(msg, 'success', dur), [addToast]);
  const error = useCallback((msg, dur) => addToast(msg, 'error', dur), [addToast]);
  const info = useCallback((msg, dur) => addToast(msg, 'info', dur), [addToast]);
  const warning = useCallback((msg, dur) => addToast(msg, 'warning', dur), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, info, warning }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-bounce-subtle flex items-start gap-3 ${
              t.type === 'success'
                ? 'bg-emerald-500/90 text-white border-emerald-400/50'
                : t.type === 'error'
                ? 'bg-rose-500/90 text-white border-rose-400/50'
                : t.type === 'warning'
                ? 'bg-amber-500/90 text-white border-amber-400/50'
                : 'bg-sky-500/90 text-white border-sky-400/50'
            }`}
          >
            <div className="flex-1 text-sm font-medium">{t.message}</div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-white/75 hover:text-white font-bold text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
