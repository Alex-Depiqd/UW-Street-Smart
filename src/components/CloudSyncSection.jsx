import React, { useState, useEffect } from "react";
import {
  sendSignInLinkToEmail,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { Cloud, ClipboardPaste, DownloadCloud, LogOut, Mail, RefreshCw } from "lucide-react";
import { getFirebaseAuth, isFirebaseConfigured } from "@/firebase";
import { EMAIL_SIGNIN_STORAGE_KEY } from "@/firebaseAuthShared";
import {
  completeEmailLinkSignIn,
  findEmailSignInUrlInText,
} from "@/firebaseEmailLinkComplete";
import { isStandaloneDisplayMode } from "@/pwaUtils";

export default function CloudSyncSection({
  onExport,
  lastCloudSyncAt = null,
  cloudSyncStatus = "idle",
  cloudSyncMessage = "",
  onSyncNow,
  onPullFromCloud,
  cloudPushPaused = false,
}) {
  const [userEmail, setUserEmail] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentHint, setSentHint] = useState(false);
  const [error, setError] = useState("");
  const [pastedLink, setPastedLink] = useState("");
  const [pasteSigningIn, setPasteSigningIn] = useState(false);

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

  const handlePasteSignIn = async () => {
    setError("");
    const urlString = findEmailSignInUrlInText(auth, pastedLink);
    if (!urlString) {
      setError(
        "That does not look like a valid sign-in link. In Mail, long-press the sign-in button, copy the link, then paste it into the text box below in this Street Smart screen (on your phone — not a computer terminal)."
      );
      return;
    }

    let email = window.localStorage.getItem(EMAIL_SIGNIN_STORAGE_KEY)?.trim() || "";
    if (!email) {
      email =
        window
          .prompt("Enter the same email address you used when you requested the link.", "")
          ?.trim() || "";
    }
    if (!email) {
      setError("We need your email to finish signing in.");
      return;
    }

    setPasteSigningIn(true);
    try {
      await completeEmailLinkSignIn(auth, urlString, email);
      setPastedLink("");
      setSentHint(false);
      window.alert(
        "You are signed in inside this Street Smart window, with the data that lives here. Cloud backup can run from this copy."
      );
    } catch (e) {
      setError(
        e?.message ||
          "Sign-in failed. Request a new link from this screen, copy the link from the email (do not tap it), and paste into the box below again."
      );
    } finally {
      setPasteSigningIn(false);
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

      {userEmail && isStandaloneDisplayMode() && (
        <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/25 text-xs text-blue-950 dark:text-blue-100">
          <p className="font-medium mb-1">Home-screen app</p>
          <p>
            Your account is tied to <strong>this</strong> app window. Tapping the email link elsewhere still opens Safari — use <strong>Get latest from cloud</strong> there if needed, or finish sign-in using the <strong>paste-into-the-box</strong> steps in Settings here so this home-screen copy stays the one that is online.
          </p>
        </div>
      )}

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
          {onPullFromCloud && (
            <button
              type="button"
              onClick={() => onPullFromCloud()}
              disabled={cloudSyncStatus === "syncing"}
              className="w-full text-left px-3 py-2 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sm hover:bg-sky-200/80 dark:hover:bg-sky-900/50 transition-colors flex items-center gap-2 disabled:opacity-50 text-sky-950 dark:text-sky-100"
            >
              <DownloadCloud className={`w-4 h-4 ${cloudSyncStatus === "syncing" ? "animate-pulse" : ""}`} />
              Get latest from cloud
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
              {isStandaloneDisplayMode() ? (
                <>
                  Check your email (and junk/spam). <strong>Do not tap the link</strong> if you want this home-screen app signed in — copy the link, return to Street Smart, and paste it into the <strong>text box in Settings below</strong> (in the app on your phone). You may need to enter your email once to finish.
                </>
              ) : (
                <>
                  Check your email (and junk/spam) and tap the link. You may need to type your email once to finish — that is normal.
                </>
              )}
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

          {isStandaloneDisplayMode() && (
            <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/25 text-xs text-emerald-950 dark:text-emerald-100 space-y-2">
              <p className="font-medium">Home-screen app: finish sign-in here</p>
              <p>
                Tapping the link in email opens <strong>Safari or Chrome</strong>, so you get signed in <strong>there</strong> — not in this window where your street data lives. All of this happens <strong>on your phone</strong>: copy the link in Mail, then paste it into Street Smart — no computer or terminal.
              </p>
              <ol className="list-decimal list-inside space-y-1 pl-0.5">
                <li>Tap <strong>Email me a sign-in link</strong> above (if you have not already).</li>
                <li>When the email arrives, <strong>long-press</strong> the sign-in button and choose <strong>Copy link</strong>.</li>
                <li>Open Street Smart again to this Settings screen, tap in the <strong>text box below</strong>, paste, then tap <strong>Complete sign-in</strong>.</li>
              </ol>
              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-medium text-emerald-900 dark:text-emerald-200">
                  Paste the sign-in link here (inside Street Smart)
                </label>
                <textarea
                  value={pastedLink}
                  onChange={(e) => setPastedLink(e.target.value)}
                  placeholder="https://…"
                  rows={3}
                  disabled={pasteSigningIn}
                  className="w-full p-2 rounded-lg bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handlePasteSignIn}
                  disabled={pasteSigningIn || !pastedLink.trim()}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ClipboardPaste className={`w-4 h-4 ${pasteSigningIn ? "animate-pulse" : ""}`} />
                  {pasteSigningIn ? "Signing in…" : "Complete sign-in"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
