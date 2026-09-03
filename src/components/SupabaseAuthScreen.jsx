import React, { useEffect, useState } from "react";
import { KeyRound, LogIn, Mail, UserPlus } from "lucide-react";
import { getAuthRedirectUrl, getSupabaseClient } from "@/supabase";
import {
  applyPartnerNameFromUser,
  formatDisplayName,
  savePartnerName,
  stashPendingProfile,
} from "@/supabaseAuthProfile";

export default function SupabaseAuthScreen({ recoveryMode = false, onRecoveryComplete }) {
  const [mode, setMode] = useState(recoveryMode ? "resetPassword" : "signIn");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (recoveryMode) setMode("resetPassword");
  }, [recoveryMode]);

  const clearFeedback = () => {
    setError("");
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearFeedback();

    const trimmedEmail = email.trim();
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Sign-in is not configured in this build.");
      return;
    }

    if (mode === "forgotPassword") {
      if (!trimmedEmail) {
        setError("Please enter your email.");
        return;
      }
      setBusy(true);
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: getAuthRedirectUrl(),
        });
        if (resetError) throw resetError;
        setMessage("If an account exists for that email, we sent a password reset link.");
        setPassword("");
      } catch (err) {
        setError(err?.message || "Could not send reset email. Please try again.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === "resetPassword") {
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      setBusy(true);
      try {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        onRecoveryComplete?.();
      } catch (err) {
        setError(err?.message || "Could not update password. Please try again.");
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signUp") {
      if (!trimmedFirst) {
        setError("Please enter your first name.");
        return;
      }
      if (!trimmedLast) {
        setError("Please enter your last name.");
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "signUp") {
        const displayName = formatDisplayName(trimmedFirst, trimmedLast);
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            data: {
              first_name: trimmedFirst,
              last_name: trimmedLast,
            },
          },
        });
        if (signUpError) throw signUpError;

        if (data.session?.user) {
          savePartnerName(displayName);
          applyPartnerNameFromUser(data.session.user);
          return;
        }

        stashPendingProfile(trimmedFirst, trimmedLast);
        savePartnerName(displayName);
        setMessage(
          "Account created. If email confirmation is enabled, check your inbox to confirm, then sign in."
        );
        setMode("signIn");
        setPassword("");
        setFirstName("");
        setLastName("");
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const switchToSignIn = () => {
    setMode("signIn");
    clearFeedback();
    setFirstName("");
    setLastName("");
    setPassword("");
    setConfirmPassword("");
  };

  const switchToSignUp = () => {
    setMode("signUp");
    clearFeedback();
  };

  const switchToForgotPassword = () => {
    setMode("forgotPassword");
    clearFeedback();
    setPassword("");
    setConfirmPassword("");
  };

  const title =
    mode === "signUp"
      ? "Create account"
      : mode === "forgotPassword"
        ? "Forgot password"
        : mode === "resetPassword"
          ? "Set new password"
          : "Street Smart";

  const subtitle =
    mode === "forgotPassword"
      ? "Enter your email and we will send you a link to reset your password."
      : mode === "resetPassword"
        ? "Choose a new password for your account."
        : "Sign in to use Street Smart. Your street data stays on this device and can sync to your account when cloud backup is enabled.";

  const submitLabel =
    mode === "signUp"
      ? busy
        ? "Creating account…"
        : "Create account"
      : mode === "forgotPassword"
        ? busy
          ? "Sending…"
          : "Send reset link"
        : mode === "resetPassword"
          ? busy
            ? "Updating…"
            : "Update password"
          : busy
            ? "Signing in…"
            : "Sign in";

  const SubmitIcon =
    mode === "signUp"
      ? UserPlus
      : mode === "forgotPassword"
        ? Mail
        : mode === "resetPassword"
          ? KeyRound
          : LogIn;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center mx-auto">
            UW
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signUp" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  First name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="First name"
                  disabled={busy}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Last name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                  placeholder="Last name"
                  disabled={busy}
                  required
                />
              </div>
            </div>
          )}

          {mode !== "resetPassword" && (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Email</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="you@example.com"
                disabled={busy}
                required
              />
            </div>
          )}

          {mode !== "forgotPassword" && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {mode === "resetPassword" ? "New password" : "Password"}
                </label>
                {mode === "signIn" && (
                  <button
                    type="button"
                    onClick={switchToForgotPassword}
                    className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
                    disabled={busy}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password"
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
                disabled={busy}
                minLength={6}
                required
              />
            </div>
          )}

          {mode === "resetPassword" && (
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Confirm new password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
                placeholder="••••••••"
                disabled={busy}
                minLength={6}
                required
              />
            </div>
          )}

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          {message && <p className="text-xs text-green-700 dark:text-green-300">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <SubmitIcon className="w-4 h-4" />
            {submitLabel}
          </button>
        </form>

        {!recoveryMode && (
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            {mode === "signUp" ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  onClick={switchToSignIn}
                >
                  Sign in
                </button>
              </>
            ) : mode === "forgotPassword" ? (
              <>
                Remember your password?{" "}
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  onClick={switchToSignIn}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New here?{" "}
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  onClick={switchToSignUp}
                >
                  Create an account
                </button>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
