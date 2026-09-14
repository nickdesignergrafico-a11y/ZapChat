import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import appletConfig from '../firebase-applet-config.json';

// User's Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyCqCwlMdCLI8cnV8ZF_nCP86gcADW1WF8Q",
  authDomain: "zapchat-b635d.firebaseapp.com",
  projectId: "zapchat-b635d",
  storageBucket: "zapchat-b635d.firebasestorage.app",
  messagingSenderId: "407322219412",
  appId: "1:407322219412:web:4c3ef1b70d5d49ccd83581",
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || "ai-studio-zapchat-0d3e296c-a10d-4c47-b5ca-e28dbaf2dc0a"
};

// Initialize or reuse Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export Firebase Authentication
export const auth = getAuth(app);

// Export Firestore instance connected to the configured database
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Validate Connection to Firestore at application boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Aviso de conexão Firebase: o cliente está offline ou a base está inacessível.");
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
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
    tenantId?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export default app;
