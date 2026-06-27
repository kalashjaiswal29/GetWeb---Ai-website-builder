import { useContext, useEffect } from "react";

import { AuthContext } from "../data/auth.context";
import {
  register,
  login,
  refreshToken,
  getMe,
  logout,
  logoutFromAll,
} from "../services/auth.api";
import { useNavigate } from "react-router";
import { useToast } from "../../shared/components/Toast";

// Module-level flag — prevents the refresh call from firing more than once
// even if multiple components on the same page call useAuth().
let bootstrapDone = false;

const useAuth = () => {
  const {
    user,
    setUser,
    loading,
    setLoading,
    error,
    setError,
    accessToken,
    setAccessToken,
    initialized,
    setInitialized,
  } = useContext(AuthContext);
  const navigate = useNavigate();
  const toast = useToast();

  const handleRegister = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ name, email, password });
      console.log("data from useAuthReg", data);
      if (data.success == true) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        setInitialized(true);
        toast.success(
          `Welcome aboard, ${data.user?.name || ""}! Your account is ready.`,
          "Account created",
        );
        navigate("/dashboard");
      }
      if (data.success == false) setError(data.message);
    } catch (err) {
      console.log("error from useAuthReg", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      console.log("Login data ", data);
      if (data.success == true) {
        setUser(data.user);
        setAccessToken(data.accessToken);
        setInitialized(true);
        toast.success(`Welcome back, ${data.user?.name || ""}!`, "Signed in");
        navigate("/dashboard");
      }
      if (data.success == false) setError(data.message);
    } catch (err) {
      console.log("Login Error ", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetMe = async (accessTokenN) => {
    try {
      const res = await getMe(accessTokenN);
      console.log("res from getME", res);
      if (res.success) {
        setUser(res.user);
      } else {
        setError(res.message);
      }
    } catch (err) {
      console.log("handle getME Error ", err);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await logout();
      if (res.success) {
        setAccessToken(null);
        setUser(null);
        toast.info("You've been signed out successfully.", "Signed out");

      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutFromAll = async () => {
    setLoading(true);
    try {
      const res = await logoutFromAll();
      if (res.success) {
        setAccessToken(null);
        setUser(null);
        toast.info("Signed out from all devices.", "Signed out everywhere");
        navigate("/login");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only run once across the entire app lifetime.
    if (bootstrapDone) return;
    bootstrapDone = true;

    const handleRefreshToken = async () => {
      setLoading(true);
      try {
        const res = await refreshToken();
        if (res?.success) {
          setAccessToken(res.accessToken);

          // FIX 1: Set user BEFORE setting initialized=true.
          // If we set initialized first (user still null), Protected briefly
          // sees initialized=true + user=null and flashes a redirect to /login.
          await handleGetMe(res.accessToken);

          setInitialized(true);   // user is already set — no flash to /login
          navigate("/dashboard");
        }
        // FIX 2: On failure, fall through to finally which sets initialized=true
        // so the login form is unblocked (it was stuck on <PageLoader> forever).
      } catch (err) {
        console.log("refresh token useAuth Error ", err);
      } finally {
        setLoading(false);
        // Always mark initialized so consumers (Login, Protected) can render.
        setInitialized(true);
      }
    };

    handleRefreshToken();
  }, []);

  return {
    loading,
    user,
    error,
    setError,
    initialized,
    handleRegister,
    handleLogin,
    handleLogout,
    handleLogoutFromAll,
  };
};

export default useAuth;
