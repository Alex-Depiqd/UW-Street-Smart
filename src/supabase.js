/**
 * Supabase bootstrap (Auth + Postgres via client).
 * No-op when VITE_SUPABASE_* env vars are missing.
 */
import { createClient } from "@supabase/supabase-js";

let clientInstance = null;

function readConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

export function isSupabaseConfigured() {
  const { url, anonKey } = readConfig();
  return !!(url && anonKey);
}

/** When Supabase is configured, users must sign in before using the app. */
export function isAuthRequired() {
  return isSupabaseConfigured();
}

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  const { url, anonKey } = readConfig();
  if (!url || !anonKey) return null;
  if (!clientInstance) {
    clientInstance = createClient(url, anonKey);
  }
  return clientInstance;
}

/** Redirect target for Supabase email links (confirm, password reset). */
export function getAuthRedirectUrl() {
  if (typeof window === "undefined") return undefined;
  return `${window.location.origin}${window.location.pathname}`;
}
