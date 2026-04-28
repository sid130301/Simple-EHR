"use client";

import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

let firebaseApp: FirebaseApp | null = null;

function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
    return null;
  }

  return config;
}

export function isFirebaseConfigured() {
  return Boolean(getFirebaseConfig());
}

export async function getGoogleIdToken() {
  const config = getFirebaseConfig();
  if (!config) {
    throw new Error("Firebase is not configured");
  }

  firebaseApp ??= initializeApp(config);
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);

  return result.user.getIdToken();
}
