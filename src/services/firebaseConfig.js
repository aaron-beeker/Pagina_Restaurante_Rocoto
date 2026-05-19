import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

/**
 * Configuración de Firebase usando variables de entorno.
 * Lanza un error si falta alguna variable requerida.
 *
 * Variables requeridas en `.env`:
 * - VITE_FIREBASE_API_KEY
 * - VITE_FIREBASE_AUTH_DOMAIN
 * - VITE_FIREBASE_PROJECT_ID
 * - VITE_FIREBASE_STORAGE_BUCKET
 * - VITE_FIREBASE_MESSAGING_SENDER_ID
 * - VITE_FIREBASE_APP_ID
 */
const firebaseConfig = {
  /** @type {string|undefined} */
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  /** @type {string|undefined} */
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  /** @type {string|undefined} */
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  /** @type {string|undefined} */
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  /** @type {string|undefined} */
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  /** @type {string|undefined} */
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validar que las variables de entorno están presentes
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `Faltan variables de entorno de Firebase: ${missingVars.join(", ")}. ` +
      "Crea un archivo .env en la raíz del proyecto basado en .env.example."
  );
}

const app = initializeApp(firebaseConfig);

/** @type {import("firebase/firestore").Firestore} Instancia de Firestore. */
export const db = getFirestore(app);
/** @type {import("firebase/auth").Auth} Instancia de Firebase Auth. */
export const auth = getAuth(app);
/** @type {import("firebase/storage").FirebaseStorage} Instancia de Firebase Storage. */
export const storage = getStorage(app);
/** @type {import("firebase/auth").GoogleAuthProvider} Provider para login con Google. */
export const googleProvider = new GoogleAuthProvider();
