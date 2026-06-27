import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import styles from "../styles/auth.module.css";
import { IconMail, IconLock, IconEye, IconEyeOff } from "../components/icons";
import PageLoader from "../../shared/components/PageLoader";

/* ─── Login Page ─── */
const LogIn = () => {
  const { loading, handleLogin, error, setError, initialized, user } =
    useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await handleLogin({ email: formData.email, password: formData.password });
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", err);
    }
  };

  // 1. Still bootstrapping (refresh-token check in progress) — show loader
  if (!initialized) return <PageLoader />;

  // 2. Already authenticated — skip login page entirely
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.authRoot}>
      <div className={styles.authWrapper}>
        {/* Left Panel Form */}
        <section className={styles.leftPanel} aria-label="Login form">
          <div className={styles.formContainer}>
            {/* G/W Monogram Logo */}
            <div className={styles.logoWrapper}>
              <div className={styles.monogram} aria-hidden="true">
                <span className={styles.monogramText}>G/W</span>
              </div>
              <span className={styles.brandLabel}>GetWeb Platform</span>
            </div>

            {/* ── Heading ── */}
            <h1 className={styles.formHeading}>Welcome back.</h1>
            <p className={styles.formSubheading}>
              Sign in to continue to your workspace.
            </p>

            {/* ── Error Banner ── */}
            {error && (
              <div className={styles.errorMsg} role="alert">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form
              className={styles.form}
              method="POST"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="login-email">
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <IconMail />
                  </span>
                  <input
                    className={styles.input}
                    id="login-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="kalashjaiswal@getintern.in"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Password */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="login-password">
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <IconLock />
                  </span>
                  <input
                    className={styles.input}
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className={styles.formMeta}>
                <a href="#" className={styles.forgotLink}>
                  Forgot password?
                </a>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                className={styles.ctaButton}
                id="login-submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.buttonSpinner} aria-hidden="true" />
                    Authenticating…
                  </>
                ) : (
                  "Secure Login"
                )}
              </button>
            </form>

            {/* Footer Nav */}
            <div className={styles.divider}>
              <span className={styles.dividerText}>New here?</span>
            </div>
            <div className={styles.footerNav}>
              <span className={styles.footerNavText}>
                Don&apos;t have an account?{" "}
                <Link to="/register" className={styles.navLink}>
                  Create one
                </Link>
              </span>
            </div>
          </div>
        </section>

        {/* ═══ RIGHT PANEL — Video ═══ */}
        <aside
          className={styles.rightPanel}
          aria-hidden="true"
          role="presentation"
        >
          {/* Seamless blend overlay — invisible partition */}
          <div className={styles.videoBlend} />

          <video
            className={styles.bgVideo}
            src="/givr_only_the_animation_video (1).mp4"
            loop
            autoPlay
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          />
        </aside>
      </div>
    </div>
  );
};

export default LogIn;
