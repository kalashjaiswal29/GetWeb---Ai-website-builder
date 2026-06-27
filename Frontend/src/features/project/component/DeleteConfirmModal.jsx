import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/modal.module.css";
import deleteStyles from "../styles/deleteModal.module.css";

/**
 * DeleteConfirmModal
 *
 * Props:
 *  isOpen        — boolean, controls visibility
 *  projectTitle  — string, shown in the confirmation message
 *  onCancel      — fn() called when user dismisses without confirming
 *  onConfirm     — fn() called when user confirms deletion
 */
const DeleteConfirmModal = ({ isOpen, projectTitle, onCancel, onConfirm }) => {
  const [exiting, setExiting] = useState(false);

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

  // Reset exit state when opening
  useEffect(() => {
    if (isOpen) setExiting(false);
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
      onConfirm();
    }, 200);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`${styles.overlay} ${exiting ? styles.overlayExiting : ""}`}
      onClick={triggerCancel}
    >
      <div
        className={`${styles.card} ${deleteStyles.card} ${exiting ? styles.cardExiting : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Red top-edge glow */}
        <div className={deleteStyles.cardTopGlowRed} />

        {/* Radial bg glow */}
        <div className={deleteStyles.cardBgGlowRed} />

        {/* Header */}
        <div className={styles.header}>
          <div className={deleteStyles.iconWrapRed}>
            <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
              delete_forever
            </span>
          </div>
          <div className={styles.titleGroup}>
            <h2 className={styles.modalTitle}>Delete Project?</h2>
            <p className={styles.modalSubtitle}>
              This action is permanent and cannot be undone. The project{" "}
              {projectTitle ? (
                <span className={deleteStyles.projectNameHighlight}>
                  &ldquo;{projectTitle}&rdquo;
                </span>
              ) : (
                "this project"
              )}{" "}
              and all its files will be deleted forever.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {/* Divider */}
          <div className={styles.divider} />

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={triggerCancel}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                close
              </span>
              Cancel
            </button>
            <button className={deleteStyles.deleteBtn} onClick={handleConfirm}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                delete_forever
              </span>
              Delete Project
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal;
