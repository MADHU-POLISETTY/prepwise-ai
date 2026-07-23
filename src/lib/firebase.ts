import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Active configuration resolves environment variables first, then falls back to local configuration JSON
const activeConfig = {
  apiKey: ((import.meta as any).env?.VITE_FIREBASE_API_KEY as string) || firebaseConfig?.apiKey || "",
  authDomain: ((import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN as string) || firebaseConfig?.authDomain || "",
  projectId: ((import.meta as any).env?.VITE_FIREBASE_PROJECT_ID as string) || firebaseConfig?.projectId || "",
  storageBucket: ((import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET as string) || firebaseConfig?.storageBucket || "",
  messagingSenderId: ((import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || firebaseConfig?.messagingSenderId || "",
  appId: ((import.meta as any).env?.VITE_FIREBASE_APP_ID as string) || firebaseConfig?.appId || "",
  firestoreDatabaseId: ((import.meta as any).env?.VITE_FIREBASE_DATABASE_ID as string) || ((import.meta as any).env?.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || firebaseConfig?.firestoreDatabaseId || "(default)"
};

let app;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let isFirebaseActive = false;

// Determine if config is still a placeholder or looks operational
const isPlaceholder = 
  !activeConfig.apiKey ||
  activeConfig.apiKey.includes("PLACEHOLDER") ||
  !activeConfig.projectId ||
  activeConfig.projectId.includes("PLACEHOLDER");

if (!isPlaceholder) {
  try {
    app = getApps().length === 0 ? initializeApp(activeConfig) : getApp();
    db = getFirestore(app, activeConfig.firestoreDatabaseId || "(default)");
    auth = getAuth(app);
    isFirebaseActive = true;
    console.log("[PrepWise AI Firebase] Firebase initialized successfully and connected in Live Cloud DB Mode.");

    // Validate connection asynchronously as instructed in guideline
    getDocFromServer(doc(db, "test", "connection")).catch((err) => {
      if (err instanceof Error && err.message.includes("offline")) {
        console.error("Please check your Firebase configuration and network parameters.");
      }
    });
  } catch (err) {
    console.error("[PrepWise AI Firebase] Failed to safely configure Firebase SDK. Falling back to local playground simulation.", err);
    isFirebaseActive = false;
  }
} else {
  console.log("[PrepWise AI Firebase] Running in client-side Local Storage simulation mode (No cloud Firebase config detected).");
}

export { auth, db, isFirebaseActive };

// Custom Firestore Action Error codes required by Guidelines standard
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.currentUser?.uid || null,
      email: currentAuth?.currentUser?.email || null,
      emailVerified: currentAuth?.currentUser?.emailVerified || null,
      isAnonymous: currentAuth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path,
  };
  console.error("Firestore Error Handler Triggered: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
