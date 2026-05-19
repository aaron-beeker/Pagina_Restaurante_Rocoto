import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

/**
 * Repositorio para gestionar usuarios y sus roles en Firestore.
 * El ID del documento es el email del usuario (en minúsculas y sin espacios).
 */
export class UserRepository {
  constructor() {
    /** @type {string} */
    this.collectionName = "users";
  }

  /**
   * Obtiene el rol de un usuario por su email.
   * @param {string|null} email - Email del usuario.
   * @returns {Promise<"admin"|"client">} Rol del usuario, "client" por defecto.
   */
  async getUserRole(email) {
    if (!email) return "client";
    try {
      const docRef = doc(db, this.collectionName, email.toLowerCase().trim());
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().role || "client" : "client";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return "client";
    }
  }

  /**
   * Obtiene todos los usuarios desde Firestore.
   * @returns {Promise<Array<{email: string, role: string, [key: string]: any}>>}
   */
  async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map((doc) => ({
        email: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  /**
   * Elimina un usuario por su email.
   * @param {string} email - Email del usuario a eliminar.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   */
  async deleteUser(email) {
    try {
      await deleteDoc(doc(db, this.collectionName, email.toLowerCase().trim()));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  /**
   * Asigna el rol de admin a un usuario.
   * @param {string} email - Email del usuario.
   * @returns {Promise<boolean>} True si se asignó correctamente.
   */
  async makeAdmin(email) {
    try {
      const docRef = doc(db, this.collectionName, email.toLowerCase().trim());
      await setDoc(docRef, { role: "admin" }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error setting admin role:", error);
      return false;
    }
  }

  /**
   * Guarda o actualiza los datos de un usuario.
   * @param {string} email - Email del usuario (clave del documento).
   * @param {{role?: string, [key: string]: any}} data - Datos del usuario.
   * @returns {Promise<boolean>} True si se guardó correctamente.
   */
  async saveUser(email, data) {
    try {
      const docRef = doc(db, this.collectionName, email.toLowerCase().trim());
      await setDoc(docRef, data, { merge: true });
      return true;
    } catch (error) {
      console.error("Error saving user:", error);
      return false;
    }
  }

  /**
   * Asigna un rol específico a un usuario.
   * @param {string} email - Email del usuario.
   * @param {string} role - Rol a asignar ("admin", "client", etc.).
   * @returns {Promise<boolean>} True si se asignó correctamente.
   */
  async setUserRole(email, role) {
    try {
      const docRef = doc(db, this.collectionName, email.toLowerCase().trim());
      await setDoc(docRef, { role }, { merge: true });
      return true;
    } catch (error) {
      console.error("Error setting user role:", error);
      return false;
    }
  }
}
