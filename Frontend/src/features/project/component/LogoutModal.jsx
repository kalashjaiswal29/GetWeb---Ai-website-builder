import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/modal.module.css";
import logoutStyles from "../styles/logoutModal.module.css";

/**
 * LogoutModal
 *
 * Props:
 *  isOpen     — boolean, controls visibility
 *  onCancel   — fn() called when user dismisses
 *  onConfirm  — fn(scope) called with "this" | "all"
 */
const LogoutModal = ({ isOpen, onCancel, onConfirm }) => {
  const [scope, setScope] = useState("this");
  const [exiting, setExiting] = useState(false);

  // Reset state every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setScope("this");
      setExiting(false);
    }
  }, [isOpen]);

  // Escape key to cancel
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") triggerCancel();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const triggerCancel = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onCancel();
    }, 200);
  };

  const handleConfirm = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onConfirm(scope);
    }, 200);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`${styles.overlay} ${exiting ? styles.overlayExiting : ""}`}
      onClick={triggerCancel}
    >
      <div
        className={`${styles.card} ${logoutStyles.card} ${exiting ? styles.cardExiting : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top-edge amber glow */}
        <div className={logoutStyles.cardTopGlowAmber} />

        {/* Radial bg glow */}
        <div className={logoutStyles.cardBgGlowAmber} />

        {/* Header */}
        <div className={styles.header}>
          <div className={logoutStyles.iconWrapAmber}>
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              logout
            </span>
          </div>
          <div className={styles.titleGroup}>
            <h2 className={styles.modalTitle}>Sign Out</h2>
            <p className={styles.modalSubtitle}>
              Choose where you'd like to sign out from.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Radio options */}
          <div className={logoutStyles.radioGroup}>
            <label
              className={`${logoutStyles.radioCard} ${scope === "this" ? logoutStyles.radioCardActive : ""}`}
              htmlFor="logout-this"
            >
              <input
                id="logout-this"
                type="radio"
                name="logoutScope"
                value="this"
                checked={scope === "this"}
                onChange={() => setScope("this")}
                className={logoutStyles.radioInput}
              />
              <div className={logoutStyles.radioIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  devices
                </span>
              </div>
              <div className={logoutStyles.radioText}>
                <span className={logoutStyles.radioLabel}>This device</span>
                <span className={logoutStyles.radioDesc}>
                  Sign out only from this browser session
                </span>
              </div>
              <div className={logoutStyles.radioIndicator} />
            </label>

            <label
              className={`${logoutStyles.radioCard} ${scope === "all" ? logoutStyles.radioCardActive : ""}`}
              htmlFor="logout-all"
            >
              <input
                id="logout-all"
                type="radio"
                name="logoutScope"
                value="all"
                checked={scope === "all"}
                onChange={() => setScope("all")}
                className={logoutStyles.radioInput}
              />
              <div className={logoutStyles.radioIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                  phonelink_erase
                </span>
              </div>
              <div className={logoutStyles.radioText}>
                <span className={logoutStyles.radioLabel}>All devices</span>
                <span className={logoutStyles.radioDesc}>
                  Revoke all sessions — every device will be signed out
                </span>
              </div>
              <div className={logoutStyles.radioIndicator} />
            </label>
          </div>

          {/* Divider */}
          <div className={styles.divider} />

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={triggerCancel}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                close
              </span>
              Cancel
            </button>
            <button
              className={`${logoutStyles.confirmBtn} ${scope === "all" ? logoutStyles.confirmBtnDanger : ""}`}
              onClick={handleConfirm}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                logout
              </span>
              {scope === "all" ? "Sign Out Everywhere" : "Sign Out"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutModal;
