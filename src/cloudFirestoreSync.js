import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/firebase";

export const SCHEMA_VERSION = 1;

export function buildLocalPayload(campaigns, dark) {
  return {
    schemaVersion: SCHEMA_VERSION,
    campaigns,
    settings: { dark },
    partner_name: localStorage.getItem("partner_name"),
    partner_scripts: localStorage.getItem("partner_scripts"),
    partner_script_order: localStorage.getItem("partner_script_order"),
    partner_documents: localStorage.getItem("partner_documents"),
  };
}

export async function fetchCloudPayload(uid) {
  const db = getFirebaseDb();
  if (!db || !uid) return null;
  const ref = doc(db, "users", uid, "data", "appState");
  const snap = await getDoc(ref);
  const exists = typeof snap.exists === "function" ? snap.exists() : snap.exists;
  if (!exists) return null;
  return snap.data();
}

export async function saveCloudPayload(uid, payload) {
  const db = getFirebaseDb();
  if (!db || !uid) return;
  const ref = doc(db, "users", uid, "data", "appState");
  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
  await setDoc(
    ref,
    {
      ...clean,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export function cloudPayloadHasCampaigns(data) {
  return !!(data?.campaigns && Array.isArray(data.campaigns) && data.campaigns.length > 0);
}

/**
 * Applies remote snapshot to localStorage-backed state (campaigns, theme, partner fields).
 */
export function applyPayloadToStores(data, handlers) {
  const {
    updateCampaigns,
    setDark,
    setActiveCampaignId,
    setActiveStreetId,
    setActivePropertyId,
  } = handlers;

  if (data.campaigns && Array.isArray(data.campaigns)) {
    updateCampaigns(data.campaigns);
  }
  if (data.settings && typeof data.settings.dark === "boolean") {
    setDark(data.settings.dark);
  }
  if (data.partner_name != null) {
    localStorage.setItem("partner_name", data.partner_name);
  }
  if (data.partner_scripts != null) {
    localStorage.setItem("partner_scripts", data.partner_scripts);
  }
  if (data.partner_script_order != null) {
    localStorage.setItem("partner_script_order", data.partner_script_order);
  }
  if (data.partner_documents != null) {
    localStorage.setItem("partner_documents", data.partner_documents);
  }

  const firstC = data.campaigns?.[0];
  if (firstC?.id) {
    setActiveCampaignId(firstC.id);
    const firstS = firstC.streets?.[0];
    setActiveStreetId(firstS?.id || "");
    setActivePropertyId(firstS?.properties?.[0]?.id || "");
  }
}

export function formatCloudUpdatedAt(data) {
  const ts = data?.updatedAt;
  if (ts && typeof ts.toDate === "function") {
    try {
      return ts.toDate().toLocaleString();
    } catch {
      return null;
    }
  }
  return null;
}

/** Milliseconds from Firestore `updatedAt`, or 0 if missing. */
export function getCloudUpdatedAtMs(data) {
  const ts = data?.updatedAt;
  if (ts && typeof ts.toDate === "function") {
    try {
      return ts.toDate().getTime();
    } catch {
      return 0;
    }
  }
  return 0;
}
