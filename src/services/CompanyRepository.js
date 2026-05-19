import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

/**
 * Repositorio para gestionar las empresas (FASAL) en Firestore.
 */
export class CompanyRepository {
  constructor() {
    /** @type {string} */
    this.collectionName = "empresas_fasal";
  }

  /**
   * Obtiene todas las empresas ordenadas alfabéticamente por nombre.
   * @returns {Promise<Array<{id: string, nombre: string, [key: string]: any}>>}
   */
  async getAllCompanies() {
    try {
      const q = query(collection(db, this.collectionName), orderBy("nombre", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting companies:", error);
      return [];
    }
  }

  /**
   * Suscribe a los cambios de las empresas en Firestore.
   * @param {function} callback - Función a llamar cuando hay cambios.
   * @returns {function} Función para desuscribirse.
   */
  subscribeToCompanies(callback) {
    const q = query(collection(db, this.collectionName), orderBy("nombre", "asc"));
    return onSnapshot(q, (snapshot) => {
      const companies = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(companies);
    }, (error) => {
      console.error("Error in real-time listener (companies):", error);
    });
  }

  /**
   * Agrega una nueva empresa con fecha de registro automática.
   * @param {{nombre: string, [key: string]: any}} companyData - Datos de la empresa.
   * @returns {Promise<boolean>} True si se agregó correctamente.
   */
  async addCompany(companyData) {
    try {
      await addDoc(collection(db, this.collectionName), {
        ...companyData,
        fechaRegistro: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error adding company:", error);
      return false;
    }
  }

  /**
   * Actualiza los datos de una empresa existente.
   * @param {string} id - ID del documento de la empresa.
   * @param {{[key: string]: any}} updatedData - Datos a actualizar.
   * @returns {Promise<boolean>} True si se actualizó correctamente.
   */
  async updateCompany(id, updatedData) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await setDoc(docRef, updatedData, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating company:", error);
      return false;
    }
  }

  /**
   * Elimina una empresa por su ID.
   * @param {string} id - ID del documento de la empresa.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   */
  async deleteCompany(id) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error("Error deleting company:", error);
      return false;
    }
  }
}
