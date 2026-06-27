import { Link } from "react-router-dom";
import styles from "../styles/home.module.css";

const Home = () => {
  return (
    <div className={styles.page}>

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <span className={styles.navBrand}>GETWEB</span>
        <div className={styles.navActions}>
          <Link to="/login" className={styles.navLoginBtn}>Login</Link>
          <Link to="/register" className={styles.navRegisterBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
              rocket_launch
            </span>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBgGlow} />
        <div className={styles.heroBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>
            auto_awesome
          </span>
          Powered by Gemini AI
        </div>
        <h1 className={styles.heroHeadline}>
          Build any webpage.{" "}
          <span className={styles.heroAccent}>Just describe it.</span>
        </h1>
        <p className={styles.heroSubtitle}>
          GetWeb turns your plain-English idea into a complete, download-ready
          website — HTML, CSS, and JavaScript — in under a minute.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/register" className={styles.ctaPrimary}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              rocket_launch
            </span>
            Start Building Free
          </Link>
          <Link to="/login" className={styles.ctaSecondary}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              login
            </span>
            Sign In
          </Link>
        </div>
      </section>

      {/* ── Beta Warning Banner ── */}
      <div className={styles.betaBanner}>
        <span className={`material-symbols-outlined ${styles.betaBannerIcon}`}>
          warning
        </span>
        <div className={styles.betaBannerText}>
          <span className={styles.betaBannerTitle}>
            Testing Phase — Free Tier API
          </span>
          <span className={styles.betaBannerDesc}>
            GetWeb is currently in testing. We use the free tier of the Gemini
            API, which has rate limits. If generation fails, please wait a
            minute and try again. Thank you for your patience!
          </span>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* ── How It Works ── */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>How it works</p>
        <h2 className={styles.sectionTitle}>Three steps to your website</h2>
        <p className={styles.sectionSubtitle}>
          No code required. Just describe what you want and GetWeb handles the rest.
        </p>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>Step 01</span>
            <div className={styles.stepIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                edit_note
              </span>
            </div>
            <span className={styles.stepTitle}>Describe your vision</span>
            <p className={styles.stepDesc}>
              Type what you want — a portfolio, a landing page, a dark-mode
              dashboard. Be as detailed or as brief as you like.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>Step 02</span>
            <div className={styles.stepIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                psychology
              </span>
            </div>
            <span className={styles.stepTitle}>AI compiles the code</span>
            <p className={styles.stepDesc}>
              Gemini AI generates clean, production-ready HTML, CSS, and
              JavaScript tailored to your prompt in seconds.
            </p>
          </div>

          <div className={styles.stepCard}>
            <span className={styles.stepNumber}>Step 03</span>
            <div className={styles.stepIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
                download
              </span>
            </div>
            <span className={styles.stepTitle}>Preview & download</span>
            <p className={styles.stepDesc}>
              See a live preview in the built-in sandbox. Then export your
              project as a ZIP file to use anywhere.
            </p>
          </div>
        </div>
      </div>

      <div className={styles.sectionDivider} />

      {/* ── Features ── */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Features</p>
        <h2 className={styles.sectionTitle}>Everything you need</h2>
        <p className={styles.sectionSubtitle}>
          Built for developers and non-developers alike.
        </p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                auto_awesome
              </span>
            </div>
            <span className={styles.featureTitle}>AI-Powered Generation</span>
            <p className={styles.featureDesc}>
              Gemini AI understands context and intent. Get pixel-perfect,
              styled output from natural language descriptions.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                preview
              </span>
            </div>
            <span className={styles.featureTitle}>Live Sandbox Preview</span>
            <p className={styles.featureDesc}>
              Preview your generated page instantly in desktop, tablet, and
              mobile viewports without leaving the platform.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                folder_zip
              </span>
            </div>
            <span className={styles.featureTitle}>One-Click ZIP Export</span>
            <p className={styles.featureDesc}>
              Download all generated files (HTML, CSS, JS) packaged in a
              ready-to-deploy ZIP with a single click.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                code
              </span>
            </div>
            <span className={styles.featureTitle}>Syntax-Highlighted IDE</span>
            <p className={styles.featureDesc}>
              Browse generated HTML, CSS, and JS in a beautiful built-in code
              viewer with full syntax highlighting.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                dashboard
              </span>
            </div>
            <span className={styles.featureTitle}>Project Dashboard</span>
            <p className={styles.featureDesc}>
              All your generated websites are saved and accessible from one
              clean dashboard. Revisit or delete anytime.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrap}>
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                lock
              </span>
            </div>
            <span className={styles.featureTitle}>Secure Sessions</span>
            <p className={styles.featureDesc}>
              JWT access tokens with refresh rotation and hashed session
              storage keep your account and projects safe.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className={styles.ctaStrip}>
        <div className={styles.ctaStripGlow} />
        <h2 className={styles.ctaStripTitle}>
          Ready to build your first AI-generated webpage?
        </h2>
        <div className={styles.heroCtas}>
          <Link to="/register" className={styles.ctaPrimary}>
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              rocket_launch
            </span>
            Create Free Account
          </Link>
          <Link to="/login" className={styles.ctaSecondary}>
            Sign In
          </Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>GETWEB</span>
        <span className={styles.footerNote}>
          Testing build · Free Gemini API · Generation may be rate-limited
        </span>
      </footer>

    </div>
  );
};

export default Home;
