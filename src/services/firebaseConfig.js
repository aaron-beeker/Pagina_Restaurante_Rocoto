import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Importante: Si no usas un empaquetador como Vite, 
// el navegador no leerá el .env directamente.
// En ese caso, la seguridad real depende de las "Restricciones de API Key" en Google Cloud.

const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyCfqw4ma70j8CppJLj3ccHviqgHtIJww-M",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "rocoto-restaurante-chifa.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "rocoto-restaurante-chifa",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "rocoto-restaurante-chifa.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "145874262181",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:145874262181:web:a5c860f91b3457162b154c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();