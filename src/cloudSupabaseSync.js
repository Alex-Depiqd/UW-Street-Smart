import { getSupabaseClient } from "@/supabase";

export async function fetchCloudPayload(userId) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return null;

  const { data, error } = await supabase
    .from("user_app_state")
    .select("payload, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload) return null;

  const payload =
    typeof data.payload === "object" && data.payload !== null ? data.payload : {};
  return {
    ...payload,
    updatedAt: data.updated_at,
  };
}

export async function saveCloudPayload(userId, payload) {
  const supabase = getSupabaseClient();
  if (!supabase || !userId) return;

  const clean = Object.fromEntries(
    Object.entries(payload).filter(([, v]) => v !== undefined)
  );
  const { updatedAt: _drop, ...toStore } = clean;

  const { error } = await supabase.from("user_app_state").upsert(
    {
      user_id: userId,
      payload: toStore,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) throw error;
}

/**
 * Staging-preview campaigns copied onto production, keyed by login email.
 * Missing table or RLS miss is treated as "no backup" so sign-in still works.
 */
export async function fetchPreviewUserBackup(email) {
  const supabase = getSupabaseClient();
  const normalized = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!supabase || !normalized) return null;

  const { data, error } = await supabase
    .from("preview_user_backups")
    .select("payload, source_updated_at")
    .eq("email", normalized)
    .maybeSingle();

  if (error) {
    console.warn("Preview backup lookup skipped", error.message);
    return null;
  }
  if (!data?.payload) return null;

  const payload =
    typeof data.payload === "object" && data.payload !== null ? data.payload : {};
  return {
    ...payload,
    updatedAt: data.source_updated_at,
  };
}
