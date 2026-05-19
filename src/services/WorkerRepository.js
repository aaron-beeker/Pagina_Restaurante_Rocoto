import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

/**
 * Repositorio para gestionar trabajadores en Firestore.
 * Incluye soporte de suscripción en tiempo real.
 */
export class WorkerRepository {
  constructor() {
    /** @type {string} */
    this.collectionName = "trabajadores_fasal";
  }

  /**
   * Suscribe a cambios en tiempo real en la colección de trabajadores.
   * @param {Function} callback Función que recibe la lista actualizada de trabajadores.
   * @returns {Function} Función para cancelar la suscripción (unsubscribe).
   */
  subscribeToWorkers(callback) {
    const q = query(collection(db, this.collectionName), orderBy("apellidos", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const workers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(workers);
      },
      (error) => {
        console.error("Error en suscripción de trabajadores:", error);
      }
    );
  }

  /**
   * Obtiene todos los trabajadores ordenados por apellidos.
   * @returns {Promise<Array<{id: string, dni: string, apellidos: string, nombre: string, empresa?: string, [key: string]: any}>>}
   */
  async getAllWorkers() {
    try {
      const q = query(collection(db, this.collectionName), orderBy("apellidos", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting all workers:", error);
      return [];
    }
  }

  /**
   * Busca un trabajador por su DNI.
   * @param {string} dni - DNI del trabajador.
   * @returns {Promise<{id: string, dni: string, apellidos: string, nombre: string, [key: string]: any}|null>}
   */
  async getWorkerByDni(dni) {
    try {
      const q = query(collection(db, this.collectionName), where("dni", "==", dni));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      }
      return null;
    } catch (error) {
      console.error("Error getting worker by DNI:", error);
      return null;
    }
  }

  /**
   * Agrega un nuevo trabajador. Valida que no exista otro con el mismo DNI.
   * @param {{dni: string, apellidos: string, nombre: string, empresa?: string, [key: string]: any}} workerData
   * @returns {Promise<boolean>} True si se agregó correctamente.
   * @throws {Error} Si ya existe un trabajador con el mismo DNI.
   */
  async addWorker(workerData) {
    try {
      const existing = await this.getWorkerByDni(workerData.dni);
      if (existing) {
        throw new Error("Ya existe un trabajador con este DNI");
      }

      await addDoc(collection(db, this.collectionName), {
        ...workerData,
        fechaRegistro: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error adding worker:", error);
      throw error;
    }
  }

  /**
   * Actualiza los datos de un trabajador existente.
   * @param {string} id - ID del documento del trabajador.
   * @param {{[key: string]: any}} updatedData - Datos a actualizar.
   * @returns {Promise<boolean>} True si se actualizó correctamente.
   */
  async updateWorker(id, updatedData) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await setDoc(docRef, updatedData, { merge: true });
      return true;
    } catch (error) {
      console.error("Error updating worker:", error);
      return false;
    }
  }

  /**
   * Elimina un trabajador por su ID.
   * @param {string} id - ID del documento del trabajador.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   */
  async deleteWorker(id) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error("Error deleting worker:", error);
      return false;
    }
  }
}
