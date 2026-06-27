import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/toast.module.css";

/* ─── Context ────────────────────────────────────────────────────── */
const ToastContext = createContext(null);

/* ─── Hook ───────────────────────────────────────────────────────── */
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

/* ─── Icons ──────────────────────────────────────────────────────── */
const ICONS = {
  success: "check_circle",
  error: "error",
  info: "info",
  warning: "warning",
};

/* ─── Single Toast Item ──────────────────────────────────────────── */
const ToastItem = ({ toast, onRemove }) => {
  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${toast.exiting ? styles.exiting : styles.entering}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Left accent bar */}
      <div className={styles.accentBar} />

      {/* Icon */}
      <span className={`material-symbols-outlined ${styles.toastIcon}`}>
        {ICONS[toast.type] || "info"}
      </span>

      {/* Content */}
      <div className={styles.toastContent}>
        {toast.title && <p className={styles.toastTitle}>{toast.title}</p>}
        <p className={styles.toastMessage}>{toast.message}</p>
      </div>

      {/* Close button */}
      <button
        className={styles.closeBtn}
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
          close
        </span>
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div
          className={styles.progressBar}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      )}
    </div>
  );
};

/* ─── Provider ───────────────────────────────────────────────────── */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const removeToast = useCallback((id) => {
    // Mark as exiting first for animation
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 350);
  }, []);

  const addToast = useCallback(
    ({ type = "info", title = "", message, duration = 4000 }) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, title, message, duration, exiting: false }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = "Success") => addToast({ type: "success", title, message }),
    error: (message, title = "Error") => addToast({ type: "error", title, message, duration: 6000 }),
    info: (message, title = "") => addToast({ type: "info", title, message }),
    warning: (message, title = "Warning") => addToast({ type: "warning", title, message }),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {createPortal(
        <div className={styles.container} aria-label="Notifications">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export default ToastProvider;
