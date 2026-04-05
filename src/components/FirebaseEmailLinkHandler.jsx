import { useEffect } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { getFirebaseAuth } from "@/firebase";
import { EMAIL_SIGNIN_STORAGE_KEY } from "@/firebaseAuthShared";

/**
 * Completes email-link sign-in when the user lands with oobCode in the URL.
 * Does not touch campaign data. Safe no-op when Firebase is off or URL is normal.
 */
export default function FirebaseEmailLinkHandler() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = getFirebaseAuth();
    if (!auth) return;

    const href = window.location.href;
    if (!isSignInWithEmailLink(auth, href)) return;

    let url;
    try {
      url = new URL(href);
    } catch {
      return;
    }
    const oob = url.searchParams.get("oobCode");
    if (!oob) return;

    const lockKey = `uw_ss_email_link_${oob}`;
    if (sessionStorage.getItem(lockKey)) return;
    sessionStorage.setItem(lockKey, "1");

    let email = window.localStorage.getItem(EMAIL_SIGNIN_STORAGE_KEY)?.trim() || "";
    // Email apps often open the link in a different browser / WebView than the tab where
    // the user requested the link, so localStorage may be empty — ask once.
    if (!email) {
      email =
        window
          .prompt(
            "Finish signing in: enter the same email address you used when you requested the link.",
            ""
          )
          ?.trim() || "";
      if (!email) {
        sessionStorage.removeItem(lockKey);
        window.alert("Sign-in was cancelled. Request a new link from Settings if you still want to sign in.");
        return;
      }
    }

    signInWithEmailLink(auth, email, href)
      .then(() => {
        try {
          window.localStorage.removeItem(EMAIL_SIGNIN_STORAGE_KEY);
        } catch {
          /* ignore */
        }
        window.history.replaceState({}, document.title, `${url.origin}/`);
        window.alert(
          "You are signed in to your Street Smart account. Your data is still stored on this device as before. Cloud sync will arrive in a later update."
        );
      })
      .catch((err) => {
        sessionStorage.removeItem(lockKey);
        window.alert(err?.message || "Sign-in failed. You can request a new link from Settings.");
      });
  }, []);

  return null;
}
