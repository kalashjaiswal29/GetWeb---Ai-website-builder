import { createPortal } from "react-dom";
import styles from "../styles/aiLimitModal.module.css";

const AiLimitModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.cardTopGlow} />
        <div className={styles.cardBgGlow} />

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined" style={{ fontSize: "26px" }}>
              hourglass_empty
            </span>
          </div>
          <h2 className={styles.title}>AI Limit Reached</h2>
          <p className={styles.subtitle}>
            The Gemini API free tier quota has been exhausted or the connection
            timed out. Your project could not be generated.
          </p>
        </div>

        <div className={styles.body}>
          <div className={styles.infoBox}>
            <span className={`material-symbols-outlined ${styles.infoBoxIcon}`}>
              info
            </span>
            <span className={styles.infoBoxText}>
              GetWeb uses the free tier of the Google Gemini API which has
              rate limits. Please wait 1–2 minutes and try generating your
              project again. If the problem continues, try a shorter prompt.
            </span>
          </div>

          <div className={styles.divider} />

          <div className={styles.actions}>
            <button className={styles.closeBtn} onClick={onClose}>
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                check
              </span>
              Got it, I'll try again
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AiLimitModal;
