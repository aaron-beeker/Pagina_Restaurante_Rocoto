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
  orderBy
} from "firebase/firestore";

export class WorkerRepository {
  constructor() {
    this.collectionName = "trabajadores_fasal";
  }

  async getAllWorkers() {
    try {
      const q = query(collection(db, this.collectionName), orderBy("apellidos", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting workers:", error);
      return [];
    }
  }

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

  async addWorker(workerData) {
    try {
      const existing = await this.getWorkerByDni(workerData.dni);
      if (existing) {
        throw new Error("Ya existe un trabajador con este DNI");
      }

      await addDoc(collection(db, this.collectionName), {
        ...workerData,
        fechaRegistro: new Date()
      });
      return true;
    } catch (error) {
      console.error("Error adding worker:", error);
      throw error;
    }
  }

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
