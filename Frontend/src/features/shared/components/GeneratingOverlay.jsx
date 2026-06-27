import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "../styles/generatingOverlay.module.css";

/* ─── Compile steps shown sequentially ───────────────────────────── */
const STEPS = [
  { icon: "psychology",       label: "Parsing your prompt with Gemini…" },
  { icon: "architecture",     label: "Designing layout & component tree…" },
  { icon: "code",             label: "Compiling HTML structure…" },
  { icon: "css",              label: "Generating adaptive styles…" },
  { icon: "javascript",       label: "Injecting interaction layer…" },
  { icon: "cloud_upload",     label: "Finalizing & saving your project…" },
];

/**
 * GeneratingOverlay
 *
 * Props:
 *  isVisible  — boolean, controls the overlay
 *  title      — optional project title string
 */
const GeneratingOverlay = ({ isVisible, title }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  // Cycle through steps while visible
  useEffect(() => {
    if (!isVisible) {
      setActiveStep(0);
      setElapsed(0);
      return;
    }

    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 3200);

    const elapsedInterval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(elapsedInterval);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const formatElapsed = (s) => {
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return createPortal(
    <div className={styles.overlay} role="status" aria-live="polite">
      {/* Ambient background glow */}
      <div className={styles.bgGlow} />
      <div className={styles.bgGrid} />

      {/* Main card */}
      <div className={styles.card}>
        {/* Top glow edge */}
        <div className={styles.cardTopGlow} />

        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>
            <span className={styles.logoText}>G/W</span>
          </div>
          <div className={styles.logoMeta}>
            <span className={styles.logoName}>GetWeb</span>
            <span className={styles.logoTag}>Compile Engine</span>
          </div>
        </div>

        {/* Headline */}
        <div className={styles.headlineGroup}>
          <h2 className={styles.headline}>
            {title ? `Compiling "${title}"` : "Compiling your webpage"}
          </h2>
          <p className={styles.subline}>
            Gemini AI is building your project. This usually takes 20–60 seconds.
          </p>
        </div>

        {/* Animated progress bar */}
        <div className={styles.progressTrack}>
          <div className={styles.progressBar} />
          <div className={styles.progressGlow} />
        </div>

        {/* Step list */}
        <div className={styles.stepList}>
          {STEPS.map((step, i) => {
            const isDone    = i < activeStep;
            const isActive  = i === activeStep;
            const isPending = i > activeStep;
            return (
              <div
                key={step.label}
                className={`${styles.step} ${isDone ? styles.stepDone : isActive ? styles.stepActive : styles.stepPending}`}
              >
                <div className={styles.stepIconWrap}>
                  {isDone ? (
                    <span className={`material-symbols-outlined ${styles.stepCheckIcon}`}>
                      check
                    </span>
                  ) : isActive ? (
                    <span className={`material-symbols-outlined ${styles.stepActiveIcon} animate-spin-slow`}>
                      progress_activity
                    </span>
                  ) : (
                    <span className={`material-symbols-outlined ${styles.stepPendingIcon}`}>
                      {step.icon}
                    </span>
                  )}
                </div>
                <span className={styles.stepLabel}>{step.label}</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerTimer}>
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
              timer
            </span>
            {formatElapsed(elapsed)} elapsed
          </span>
          <span className={styles.footerNote}>You'll be redirected automatically</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GeneratingOverlay;
