import React, { useState } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { getSupabaseClient } from "@/supabase";

export default function SupabaseAuthScreen() {
  const [mode, setMode] = useState("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Sign-in is not configured in this build.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signUp") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) throw signUpError;
        if (data.session) {
          return;
        }
        setMessage(
          "Account created. If email confirmation is enabled, check your inbox to confirm, then sign in."
        );
        setMode("signIn");
        setPassword("");
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl p-6 space-y-5">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center mx-auto">
            UW
          </div>
          <h1 className="text-xl font-semibold">Street Smart</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sign in to use Street Smart. Your street data stays on this device and can sync to your
            account when cloud backup is enabled.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
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
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Password</label>
            <input
              type="password"
              autoComplete={mode === "signUp" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500"
              placeholder="••••••••"
              disabled={busy}
              minLength={6}
            />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
          {message && <p className="text-xs text-green-700 dark:text-green-300">{message}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {mode === "signUp" ? (
              <>
                <UserPlus className="w-4 h-4" />
                {busy ? "Creating account…" : "Create account"}
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                {busy ? "Signing in…" : "Sign in"}
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {mode === "signUp" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                onClick={() => {
                  setMode("signIn");
                  setError("");
                  setMessage("");
                }}
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
                onClick={() => {
                  setMode("signUp");
                  setError("");
                  setMessage("");
                }}
              >
                Create an account
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
