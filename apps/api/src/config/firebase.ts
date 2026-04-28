import admin from "firebase-admin";
import { env } from "./env.js";

let firebaseApp: admin.app.App | null = null;

export function getFirebaseApp() {
  if (firebaseApp) {
    return firebaseApp;
  }

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  });

  return firebaseApp;
}
