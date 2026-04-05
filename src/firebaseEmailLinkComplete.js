import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { EMAIL_SIGNIN_STORAGE_KEY } from "@/firebaseAuthShared";

/**
 * Find a Firebase email sign-in URL inside pasted text (full URL or surrounded by words).
 */
export function findEmailSignInUrlInText(auth, raw) {
  if (!raw || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;

  const tryUrl = (u) => {
    const s = u.replace(/[.,;)\]]+$/u, "").trim();
    if (!s) return null;
    try {
      return isSignInWithEmailLink(auth, s) ? s : null;
    } catch {
      return null;
    }
  };

  const direct = tryUrl(t);
  if (direct) return direct;

  const re = /https?:\/\/[^\s<>"']+/gi;
  let m;
  while ((m = re.exec(t)) != null) {
    const found = tryUrl(m[0]);
    if (found) return found;
  }
  return null;
}

/**
 * Complete email-link sign-in; uses sessionStorage lock per oobCode like the URL handler.
 */
export async function completeEmailLinkSignIn(auth, href, email) {
  const trimmedEmail = email?.trim();
  if (!trimmedEmail) {
    throw new Error("Email is required to finish signing in.");
  }

  let url;
  try {
    url = new URL(href);
  } catch {
    throw new Error("That link is not a valid web address.");
  }

  const oob = url.searchParams.get("oobCode");
  if (!oob) {
    throw new Error("That link does not look like a sign-in link (missing code).");
  }

  const lockKey = `uw_ss_email_link_${oob}`;
  if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(lockKey)) {
    throw new Error("This sign-in link was already used in this session. Request a new link if you still need to sign in.");
  }

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(lockKey, "1");
  }

  try {
    await signInWithEmailLink(auth, trimmedEmail, href);
  } catch (e) {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.removeItem(lockKey);
    }
    throw e;
  }

  try {
    window.localStorage.removeItem(EMAIL_SIGNIN_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
