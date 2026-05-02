import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfqw4ma70j8CppJLj3ccHviqgHtIJww-M",
  authDomain: "rocoto-restaurante-chifa.firebaseapp.com",
  projectId: "rocoto-restaurante-chifa",
  storageBucket: "rocoto-restaurante-chifa.firebasestorage.app",
  messagingSenderId: "145874262181",
  appId: "1:145874262181:web:a5c860f91b3457162b154c"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();