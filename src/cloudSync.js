/**
 * Unified cloud backup: Supabase when configured, else Firebase Firestore.
 */
import { isFirebaseConfigured } from "@/firebase";
import { isSupabaseConfigured } from "@/supabase";
import * as firestore from "@/cloudFirestoreSync";
import * as supabase from "@/cloudSupabaseSync";

export function getCloudSyncBackend() {
  if (isSupabaseConfigured()) return "supabase";
  if (isFirebaseConfigured()) return "firebase";
  return null;
}

export function isCloudSyncAvailable() {
  return getCloudSyncBackend() != null;
}

export {
  SCHEMA_VERSION,
  buildLocalPayload,
  applyPayloadToStores,
  cloudPayloadHasCampaigns,
  formatCloudUpdatedAt,
  getCloudUpdatedAtMs,
} from "@/cloudFirestoreSync";

export async function fetchCloudPayload(userId) {
  const backend = getCloudSyncBackend();
  if (backend === "supabase") return supabase.fetchCloudPayload(userId);
  if (backend === "firebase") return firestore.fetchCloudPayload(userId);
  return null;
}

export async function saveCloudPayload(userId, payload) {
  const backend = getCloudSyncBackend();
  if (backend === "supabase") return supabase.saveCloudPayload(userId, payload);
  if (backend === "firebase") return firestore.saveCloudPayload(userId, payload);
}
