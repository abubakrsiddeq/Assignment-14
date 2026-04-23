import { useToast } from "../context/ToastContext";

const ToastViewport = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item toast-${toast.type}`}>
          <p>{toast.message}</p>
          <button type="button" onClick={() => dismissToast(toast.id)} aria-label="Close message">
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastViewport;
