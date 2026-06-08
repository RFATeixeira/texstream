import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  type Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyClJnG8v0RxLP9SXFDcxhQl9-8173B2tjs",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "textream-35a7f.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "textream-35a7f",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "textream-35a7f.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "299688372449",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:299688372449:web:e1f7f830e99a0d9b46efa0",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-1PDFW51SXW",
};

export const isFirebaseConfigured =
  Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.storageBucket &&
      firebaseConfig.messagingSenderId &&
      firebaseConfig.appId
  );

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

export function getFirebaseAuth() {
  if (!isFirebaseConfigured) {
    return null;
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  if (!auth) {
    auth = getAuth(app);
    void setPersistence(auth, browserLocalPersistence);
  }

  return auth;
}

export async function getFirebaseAnalytics() {
  if (!isFirebaseConfigured || !firebaseConfig.measurementId || typeof window === "undefined") {
    return null;
  }

  if (!app) {
    app = initializeApp(firebaseConfig);
  }

  if (!analytics && (await isSupported())) {
    analytics = getAnalytics(app);
  }

  return analytics;
}
