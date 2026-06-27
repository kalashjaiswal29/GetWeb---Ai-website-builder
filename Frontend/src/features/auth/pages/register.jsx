import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import styles from "../styles/auth.module.css";
import {
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconUser,
  IconShield,
} from "../components/icons";
import PageLoader from "../../shared/components/PageLoader";

/* ─── Password Strength Indicator ──────*/
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: "Weak", color: "#ff4444" },
    { label: "Fair", color: "#ff9500" },
    { label: "Good", color: "#ffcc00" },
    { label: "Strong", color: "#22c55e" },
  ];
  return { score, ...levels[Math.max(0, score - 1)] };
};

/* ─── Register Page ──── */
const Register = () => {
  const { loading, handleRegister, error, setError, initialized, user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("All fields are required.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match. Please check and try again.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      await handleRegister({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      
    } catch (err) {
      setError(
        "Registration failed. Please try again or use a different email.",
      );
      console.error("Register error:", err);
    }
  };

  // 1. Still bootstrapping — show loader
  if (!initialized) return <PageLoader />;

  // 2. Already authenticated — skip register page
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className={styles.authRoot}>
      <div className={styles.authWrapper}>
        {/* Left Panel Form */}
        <section className={styles.leftPanel} aria-label="Create account form">
          <div className={styles.formContainer}>
            {/* G/W Monogram Logo */}
            <div className={styles.logoWrapper}>
              <div className={styles.monogram} aria-hidden="true">
                <span className={styles.monogramText}>G/W</span>
              </div>
              <span className={styles.brandLabel}>GetWeb Platform</span>
            </div>

            {/* Heading */}
            <h1 className={styles.formHeading}>Create your account.</h1>
            <p className={styles.formSubheading}>
              Join thousands of professionals building with GetWeb.
            </p>

            {/* Error Banner */}
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

            {/* ── Form ── */}
            <form
              className={styles.form}
              method="POST"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* Full Name */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="reg-name">
                  Full Name
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <IconUser />
                  </span>
                  <input
                    className={styles.input}
                    id="reg-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="Kalash Jaiswal"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Business Email */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="reg-email">
                  Email
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <IconMail />
                  </span>
                  <input
                    className={styles.input}
                    id="reg-email"
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
                <label className={styles.label} htmlFor="reg-password">
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <IconLock />
                  </span>
                  <input
                    className={styles.input}
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    autoComplete="new-password"
                    placeholder="Min. 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    aria-required="true"
                    aria-describedby="password-strength"
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

                {/* Password Strength Bar */}
                {formData.password && (
                  <div
                    id="password-strength"
                    className={styles.strengthBar}
                    aria-label={`Password strength: ${strength.label}`}
                  >
                    <div className={styles.strengthTrack}>
                      {[1, 2, 3, 4].map((segment) => (
                        <div
                          key={segment}
                          className={styles.strengthSegment}
                          style={{
                            background:
                              segment <= strength.score
                                ? strength.color
                                : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      className={styles.strengthLabel}
                      style={{ color: strength.color }}
                    >
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="reg-confirm">
                  Confirm Password
                </label>
                <div className={styles.inputWrapper}>
                  <span className={styles.inputIcon} aria-hidden="true">
                    <IconShield />
                  </span>
                  <input
                    className={styles.input}
                    id="reg-confirm"
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={
                      showConfirm
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {/* CTA Button */}
              <button
                type="submit"
                className={styles.ctaButton}
                id="register-submit"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className={styles.buttonSpinner} aria-hidden="true" />
                    Creating Account…
                  </>
                ) : (
                  "Create My Account"
                )}
              </button>
            </form>

            {/* Footer Nav */}
            <div className={styles.divider}>
              <span className={styles.dividerText}>Already a member?</span>
            </div>
            <div className={styles.footerNav}>
              <span className={styles.footerNavText}>
                Already have an account?{" "}
                <Link to="/login" className={styles.navLink}>
                  Sign in
                </Link>
              </span>
            </div>
          </div>
        </section>

        {/* Right Panel Video */}
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

export default Register;
