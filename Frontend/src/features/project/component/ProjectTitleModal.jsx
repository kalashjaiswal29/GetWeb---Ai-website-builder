import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from '../styles/modal.module.css';
import useProject from '../hooks/useProject';

/**
 * ProjectTitleModal
 *
 * Props:
 *  isOpen      — boolean, controls visibility
 *  onClose     — fn() called on cancel / backdrop click / Escape
 *  onConfirm   — fn(title: string) called with entered title on confirm
 *  promptHint  — optional string, shows the user's prompt as a preview chip
 *  mode        — 'new' | 'compile'  (changes icon + CTA label)
 */
const ProjectTitleModal = ({ isOpen, onClose, onConfirm, promptHint = '', mode = 'compile' }) => {
  

  const {title, setTitle} = useProject() ;

  const [exiting, setExiting]   = useState(false);
  const inputRef                = useRef(null);

  // Reset input when modal opens and auto-focus
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setExiting(false);
      // Small delay so animation plays before focus
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') triggerClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Animated close — plays exit animation then fires onClose
  const triggerClose = () => {
    setExiting(true);
    setTimeout(() => {
      setExiting(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
    triggerClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleConfirm(); }
  };

  if (!isOpen) return null;

  const isCompileMode = mode === 'compile';
  const icon          = isCompileMode ? 'auto_awesome' : 'add_circle';
  const headline      = isCompileMode ? 'Name your generation' : 'Name your project';
  const subtitle      = isCompileMode
    ? 'Give this webpage a memorable title before Gemini compiles it.'
    : 'Choose a title so you can find this project later.';
  const ctaLabel      = isCompileMode ? 'Compile' : 'Create Project';
  const ctaIcon       = isCompileMode ? 'send'    : 'arrow_forward';

  return createPortal(
    <div
      className={`${styles.overlay} ${exiting ? styles.overlayExiting : ''}`}
      onClick={triggerClose}
    >
      <div
        className={`${styles.card} ${exiting ? styles.cardExiting : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Orange top-edge glow */}
        <div className={styles.cardTopGlow} />

        {/* Radial bg glow */}
        <div className={styles.cardBgGlow} />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <span className="material-symbols-outlined">{icon}</span>
          </div>
          <div className={styles.titleGroup}>
            <h2 className={styles.modalTitle}>{headline}</h2>
            <p className={styles.modalSubtitle}>{subtitle}</p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Title input */}
          <div className={styles.fieldGroup}>
            <span className={styles.fieldLabel}>Project Title</span>
            <div className={styles.inputWrap}>
              <span className={`material-symbols-outlined ${styles.inputIcon}`}>
                title
              </span>
              <input
                ref={inputRef}
                className={styles.titleInput}
                type="text"
                placeholder={isCompileMode ? 'e.g. Neo-Banking Dashboard' : 'e.g. Security Pulse UI'}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={80}
              />
            </div>
          </div>

          {/* Prompt preview chip — only shown in compile mode when a prompt exists */}
          {isCompileMode && promptHint && (
            <div className={styles.promptPreview}>
              <span className={`material-symbols-outlined ${styles.promptPreviewIcon}`}>
                notes
              </span>
              <span className={styles.promptPreviewText}>
                "{promptHint}"
              </span>
            </div>
          )}

          {/* Divider */}
          <div className={styles.divider} />

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.cancelBtn} onClick={triggerClose}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              Cancel
            </button>
            <button
              className={styles.confirmBtn}
              onClick={handleConfirm}
              disabled={!title.trim()}
            >
              {ctaLabel}
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{ctaIcon}</span>
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProjectTitleModal;
