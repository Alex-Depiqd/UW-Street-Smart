import React, { useState, useEffect } from "react";
import {
  sendSignInLinkToEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { Cloud, LogOut, Mail, RefreshCw } from "lucide-react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/firebase";
import { EMAIL_SIGNIN_STORAGE_KEY } from "@/firebaseAuthShared";

export default function CloudSyncSection({
  onExport,
  lastCloudSyncAt = null,
  cloudSyncStatus = "idle",
  cloudSyncMessage = "",
  onSyncNow,
  cloudPushPaused = false,
}) {
  const [userEmail, setUserEmail] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentHint, setSentHint] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return () => {};
    return onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || null);
    });
  }, []);

  if (!isFirebaseConfigured()) {
    return (
      <div className="space-y-2">
        <h4 className="font-medium flex items-center gap-2">
          <Cloud className="w-4 h-4" />
          Account &amp; cloud sync
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Online sign-in is not configured in this build (missing Firebase environment variables).
        </p>
      </div>
    );
  }

  const auth = getFirebaseAuth();
  if (!auth) return null;

  const handleSendLink = async () => {
    setError("");
    const trimmed = emailInput.trim();
    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }
    if (!backupConfirmed) {
      setError("Please confirm you have exported a backup first.");
      return;
    }

    const continueUrl = `${window.location.origin}/`;
    const actionCodeSettings = {
      url: continueUrl,
      handleCodeInApp: true,
    };

    setSending(true);
    try {
      window.localStorage.setItem(EMAIL_SIGNIN_STORAGE_KEY, trimmed);
      await sendSignInLinkToEmail(auth, trimmed, actionCodeSettings);
      setSentHint(true);
      setEmailInput("");
    } catch (e) {
      window.localStorage.removeItem(EMAIL_SIGNIN_STORAGE_KEY);
      setError(e?.message || "Could not send sign-in email.");
    } finally {
      setSending(false);
    }
  };

  const handleSignOut = async () => {
    setError("");
    try {
      await signOut(auth);
    } catch (e) {
      setError(e?.message || "Could not sign out.");
    }
  };

  return (
    <div className="space-y-2">
      <h4 className="font-medium flex items-center gap-2">
        <Cloud className="w-4 h-4" />
        Account &amp; cloud sync
      </h4>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        When signed in, your data is still kept on this device and is also saved to your private cloud backup (campaigns, theme, and partner scripts/documents). Export a file backup as well if you like.
      </p>

      {userEmail ? (
        <div className="space-y-2 rounded-xl border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-sm">
            Signed in as <span className="font-medium">{userEmail}</span>
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {cloudPushPaused && (
              <p className="text-amber-800 dark:text-amber-200">
                Automatic cloud upload is paused (you chose Decide later on the backup choice). Use <strong>Save to cloud now</strong> when you are ready to upload this device, or sign out and sign in again to choose cloud vs device.
              </p>
            )}
            {cloudSyncStatus === "syncing" && <p>Saving to cloud…</p>}
            {cloudSyncStatus === "ok" && lastCloudSyncAt != null && (
              <p>Last saved to cloud: {new Date(lastCloudSyncAt).toLocaleString()}</p>
            )}
            {cloudSyncStatus === "ok" && lastCloudSyncAt == null && (
              <p>Cloud backup will run shortly after you make changes.</p>
            )}
            {cloudSyncStatus === "error" && cloudSyncMessage && (
              <p className="text-red-600 dark:text-red-400">{cloudSyncMessage}</p>
            )}
          </div>
          {onSyncNow && (
            <button
              type="button"
              onClick={() => onSyncNow()}
              disabled={cloudSyncStatus === "syncing"}
              className="w-full text-left px-3 py-2 rounded-xl bg-primary-600/15 dark:bg-primary-500/20 text-sm hover:bg-primary-600/25 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${cloudSyncStatus === "syncing" ? "animate-spin" : ""}`} />
              Save to cloud now
            </button>
          )}
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign out of online account
          </button>
        </div>
      ) : (
        <>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-100 space-y-2">
            <p>
              <strong>Before you sign in:</strong> export a backup so you always have a copy of your data on this device.
            </p>
            <button
              type="button"
              onClick={() => onExport?.()}
              className="w-full px-3 py-2 rounded-lg bg-amber-200/80 dark:bg-amber-800/50 text-amber-950 dark:text-amber-50 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800 transition-colors"
            >
              Export backup now
            </button>
            <label className="flex items-start gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-amber-400"
                checked={backupConfirmed}
                onChange={(e) => setBackupConfirmed(e.target.checked)}
              />
              <span>I have exported a backup of my data (recommended before signing in).</span>
            </label>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">Email for magic link</label>
            <input
              type="email"
              autoComplete="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              disabled={!backupConfirmed || sending}
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          {sentHint && (
            <p className="text-xs text-green-700 dark:text-green-300">
              Check your email and tap the sign-in link. If the link opens in another app, you may be asked to type your email once to finish signing in — that is normal.
            </p>
          )}

          <button
            type="button"
            onClick={handleSendLink}
            disabled={!backupConfirmed || sending || !emailInput.trim()}
            className="w-full text-left px-3 py-2 rounded-xl bg-primary-600 text-white text-sm hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4" />
            {sending ? "Sending…" : "Email me a sign-in link"}
          </button>
        </>
      )}
    </div>
  );
}
