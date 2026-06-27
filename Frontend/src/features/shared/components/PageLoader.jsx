import styles from "../styles/pageLoader.module.css";

/**
 * PageLoader — Fullscreen auth-initialization loader.
 * Shown while the app is refreshing the session token on mount.
 */
const PageLoader = () => {
  return (
    <div className={styles.root} aria-label="Authenticating" role="status">
      {/* Ambient radial glow */}
      <div className={styles.ambientGlow} />

      {/* Animated ring grid */}
      <div className={styles.ringGroup}>
        <div className={`${styles.ring} ${styles.ring1}`} />
        <div className={`${styles.ring} ${styles.ring2}`} />
        <div className={`${styles.ring} ${styles.ring3}`} />
      </div>

      {/* Centre logo */}
      <div className={styles.logoCore}>
        <span className={styles.logoText}>G/W</span>
        <div className={styles.logoPulse} />
      </div>

      {/* Label */}
      <div className={styles.labelGroup}>
        <p className={styles.label}>Authenticating session</p>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
