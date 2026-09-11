/** sessionStorage fallback when sign-up requires email confirmation before a session exists */
export const PENDING_PROFILE_STORAGE_KEY = "uw_ss_pending_profile";
/** Last signed-in Supabase user id — used to detect account switches on one device */
export const LAST_AUTH_USER_ID_KEY = "uw_ss_last_auth_user_id";

export function formatDisplayName(firstName, lastName) {
  return [firstName, lastName]
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean)
    .join(" ");
}

export function savePartnerName(displayName) {
  const trimmed = displayName?.trim();
  if (trimmed) {
    localStorage.setItem("partner_name", trimmed);
  }
}

export function detectAccountSwitch(userId) {
  if (!userId) return false;
  const lastId = localStorage.getItem(LAST_AUTH_USER_ID_KEY);
  return !!(lastId && lastId !== userId);
}

export function recordAuthUserId(userId) {
  if (userId) {
    localStorage.setItem(LAST_AUTH_USER_ID_KEY, userId);
  }
}

export function deviceHasLocalCampaigns() {
  try {
    const raw = localStorage.getItem("uw_streetsmart_campaigns");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * Apply registration name to Settings personalisation (`partner_name`).
 * Updates when the account changed or the field is still empty/default.
 */
export function applyPartnerNameFromUser(user, { accountSwitched = false } = {}) {
  if (!user) return;

  const existing = localStorage.getItem("partner_name")?.trim();
  if (!accountSwitched && existing && existing !== "Your Name") return;

  const meta = user.user_metadata || {};
  let displayName = formatDisplayName(meta.first_name, meta.last_name);

  if (!displayName) {
    try {
      const raw = sessionStorage.getItem(PENDING_PROFILE_STORAGE_KEY);
      if (raw) {
        const pending = JSON.parse(raw);
        displayName = formatDisplayName(pending.first_name, pending.last_name);
        sessionStorage.removeItem(PENDING_PROFILE_STORAGE_KEY);
      }
    } catch {
      /* ignore */
    }
  }

  savePartnerName(displayName);
}

export function stashPendingProfile(firstName, lastName) {
  sessionStorage.setItem(
    PENDING_PROFILE_STORAGE_KEY,
    JSON.stringify({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
    })
  );
}
