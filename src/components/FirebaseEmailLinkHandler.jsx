import { useEffect } from "react";
import { isSignInWithEmailLink } from "firebase/auth";
import { getFirebaseAuth } from "@/firebase";
import { EMAIL_SIGNIN_STORAGE_KEY } from "@/firebaseAuthShared";
import { completeEmailLinkSignIn } from "@/firebaseEmailLinkComplete";
import { isStandaloneDisplayMode } from "@/pwaUtils";

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
        window.alert("Sign-in was cancelled. Request a new link from Settings if you still want to sign in.");
        return;
      }
    }

    completeEmailLinkSignIn(auth, href, email)
      .then(() => {
        window.history.replaceState({}, document.title, `${url.origin}/`);
        const installedApp = isStandaloneDisplayMode();
        window.alert(
          installedApp
            ? "You are signed in inside the Street Smart app you opened from your home screen.\n\nCloud backup will run while you use the app here."
            : "You are signed in in this web browser tab.\n\nIf you use Street Smart from a home-screen icon as well, that copy is separate: open it, go to Settings → Account & cloud sync, copy the link from your sign-in email (don’t tap it), and paste it into the text box there — all on your phone, not a terminal."
        );
      })
      .catch((err) => {
        window.alert(err?.message || "Sign-in failed. You can request a new link from Settings.");
      });
  }, []);

  return null;
}
