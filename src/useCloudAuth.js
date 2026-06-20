import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "@/firebase";
import { getSupabaseClient, isAuthRequired, isSupabaseConfigured } from "@/supabase";

/** @typedef {{ id: string, email: string | null }} CloudAuthUser */

/**
 * @returns {{ user: CloudAuthUser | null, loading: boolean, authRequired: boolean }}
 */
export function useCloudAuth() {
  const [user, setUser] = useState(/** @type {CloudAuthUser | null} */ (null));
  const [loading, setLoading] = useState(
    () => isSupabaseConfigured() || isFirebaseConfigured()
  );

  useEffect(() => {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setLoading(false);
        return () => {};
      }

      let active = true;
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        setUser(sessionToUser(session));
        setLoading(false);
      });

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(sessionToUser(session));
        setLoading(false);
      });

      return () => {
        active = false;
        sub.subscription.unsubscribe();
      };
    }

    if (isFirebaseConfigured()) {
      const auth = getFirebaseAuth();
      if (!auth) {
        setLoading(false);
        return () => {};
      }
      return onAuthStateChanged(auth, (fbUser) => {
        setUser(
          fbUser
            ? { id: fbUser.uid, email: fbUser.email ?? null }
            : null
        );
        setLoading(false);
      });
    }

    setLoading(false);
    return () => {};
  }, []);

  return {
    user,
    loading,
    authRequired: isAuthRequired(),
  };
}

/** @param {import('@supabase/supabase-js').Session | null} session */
function sessionToUser(session) {
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? null,
  };
}

export async function signOutCloudAuth() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    return;
  }
  const auth = getFirebaseAuth();
  if (auth) await auth.signOut();
}
