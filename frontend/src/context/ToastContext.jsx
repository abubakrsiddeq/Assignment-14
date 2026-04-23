import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3200) => {
    const id = crypto.randomUUID();
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setToasts((prev) => [...prev, { id, message, type }]);
    setActivityLog((prev) => [{ id, message, type, time }, ...prev].slice(0, 12));

    window.setTimeout(() => {
      dismissToast(id);
    }, duration);
  }, [dismissToast]);

  const clearActivityLog = useCallback(() => {
    setActivityLog([]);
  }, []);

  const value = useMemo(
    () => ({ toasts, showToast, dismissToast, activityLog, clearActivityLog }),
    [toasts, showToast, dismissToast, activityLog, clearActivityLog]
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
