/**
 * Firebase bootstrap (Auth + Firestore only when configured).
 *
 * Safety: If VITE_* env vars are missing, all getters return null — the app
 * behaves exactly as before (localStorage only). Nothing is read or written
 * until a later step calls these after explicit user opt-in.
 *
 * Netlify / local: copy .env.example → .env.local and fill values from the
 * Firebase console (Web app config). Never commit .env.local.
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function readConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
  };
}

function hasRequiredConfig(cfg) {
  return !!(
    cfg.apiKey &&
    cfg.authDomain &&
    cfg.projectId &&
    cfg.storageBucket &&
    cfg.messagingSenderId &&
    cfg.appId
  );
}

let appInstance = null;

/**
 * @returns {import('firebase/app').FirebaseApp | null}
 */
export function getFirebaseApp() {
  const cfg = readConfig();
  if (!hasRequiredConfig(cfg)) return null;
  if (!appInstance) {
    appInstance = getApps().length > 0 ? getApp() : initializeApp(cfg);
  }
  return appInstance;
}

/** True when env has enough config to initialize Firebase (dev/prod). */
export function isFirebaseConfigured() {
  return hasRequiredConfig(readConfig());
}

/**
 * @returns {import('firebase/auth').Auth | null}
 */
export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return app ? getAuth(app) : null;
}

/**
 * @returns {import('firebase/firestore').Firestore | null}
 */
export function getFirebaseDb() {
  const app = getFirebaseApp();
  return app ? getFirestore(app) : null;
}
