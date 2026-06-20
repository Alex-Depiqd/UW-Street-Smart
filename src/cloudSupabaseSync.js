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
