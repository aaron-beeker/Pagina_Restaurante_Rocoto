import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

/**
 * Repositorio para gestionar registros de asistencia (control de alimentación).
 * Colección: `asistencia_fasal`.
 */
export class AttendanceRepository {
  constructor() {
    /** @type {string} */
    this.collectionName = "asistencia_fasal";
  }

  /**
   * Obtiene un registro detallado de asistencia por DNI, fecha y tipo.
   * @param {string} dni - DNI del trabajador.
   * @param {string} fecha - Fecha en formato YYYY-MM-DD.
   * @param {string} tipo - Tipo de comida ("desayuno", "almuerzo", "cena").
   * @returns {Promise<{id: string, dni: string, fecha: string, tipo: string, soloCampo: boolean, [key: string]: any}|null>}
   */
  async getDetailedAttendance(dni, fecha, tipo) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("dni", "==", dni),
        where("fecha", "==", fecha),
        where("tipo", "==", tipo),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      return null;
    }
  }

  /**
   * Registra asistencia con lógica de unificación: si ya existe un registro
   * del mismo servicio para el mismo trabajador, se unifican las raciones.
   * @param {{dni: string, fecha: string, tipo: string, soloCampo: boolean, cantidadCampo?: number, [key: string]: any}} attendanceData
   * @returns {Promise<boolean>} True si se registró o unificó correctamente.
   */
  async registerAttendance(attendanceData) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("dni", "==", attendanceData.dni),
        where("fecha", "==", attendanceData.fecha),
        where("tipo", "==", attendanceData.tipo),
        limit(1)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        const existingData = snapshot.docs[0].data();

        if (attendanceData.soloCampo === false || existingData.soloCampo === false) {
          await updateDoc(docRef, {
            ...attendanceData,
            cantidadCampo: (existingData.cantidadCampo || 0) + (attendanceData.cantidadCampo || 0),
            soloCampo: false,
            updatedAt: new Date(),
            updatedBy: "sistema_unificar",
          });
          return true;
        }
      }

      const timestamp = new Date();
      await addDoc(collection(db, this.collectionName), {
        ...attendanceData,
        timestamp: timestamp,
      });
      return true;
    } catch (error) {
      console.error("Error registering attendance:", error);
      return false;
    }
  }

  /**
   * Agrega un registro de asistencia sin lógica de unificación.
   * @param {{dni: string, fecha: string, tipo: string, timestamp?: Date, [key: string]: any}} attendanceData
   * @returns {Promise<boolean>} True si se agregó correctamente.
   */
  async addAttendance(attendanceData) {
    try {
      const timestamp = attendanceData.timestamp || new Date();
      await addDoc(collection(db, this.collectionName), {
        ...attendanceData,
        timestamp: timestamp,
      });
      return true;
    } catch (error) {
      console.error("Error adding attendance:", error);
      return false;
    }
  }

  /**
   * Actualiza un registro de asistencia existente.
   * @param {string} id - ID del documento de asistencia.
   * @param {{[key: string]: any}} data - Datos a actualizar.
   * @returns {Promise<boolean>} True si se actualizó correctamente.
   */
  async updateAttendance(id, data) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, data);
      return true;
    } catch (error) {
      console.error("Error updating attendance:", error);
      return false;
    }
  }

  /**
   * Elimina un registro de asistencia por su ID.
   * @param {string} id - ID del documento de asistencia.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   */
  async deleteAttendance(id) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      return false;
    }
  }

  /**
   * Obtiene registros de asistencia por fecha específica o los últimos 1000 si no hay fecha.
   * @param {string|null} fecha - Fecha en formato YYYY-MM-DD, o null para los más recientes.
   * @returns {Promise<Array<{id: string, dni: string, fecha: string, tipo: string, timestamp: {seconds: number}, [key: string]: any}>>}
   */
  async getAttendanceByDate(fecha) {
    try {
      const collRef = collection(db, this.collectionName);
      let q;

      if (fecha) {
        q = query(collRef, where("fecha", "==", fecha));
      } else {
        q = query(collRef, orderBy("timestamp", "desc"), limit(1000));
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (fecha) {
        return docs.sort((a, b) => {
          const timeA = a.timestamp?.seconds || 0;
          const timeB = b.timestamp?.seconds || 0;
          return timeB - timeA;
        });
      }

      return docs;
    } catch (error) {
      console.error("Error getting attendance by date:", error);
      return [];
    }
  }

  /**
   * Suscribe a los cambios de registros de asistencia por fecha específica.
   * @param {string} fecha - Fecha en formato YYYY-MM-DD.
   * @param {function} callback - Función a llamar cuando hay cambios. Recibe la lista de documentos.
   * @returns {function} Función para desuscribirse.
   */
  subscribeToAttendanceByDate(fecha, callback) {
    const collRef = collection(db, this.collectionName);
    const q = query(collRef, where("fecha", "==", fecha));

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedDocs = docs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
      callback(sortedDocs);
    }, (error) => {
      console.error("Error in real-time listener:", error);
    });
  }

  /**
   * Obtiene registros de asistencia en un rango de fechas.
   * @param {string} startDate - Fecha inicio en formato YYYY-MM-DD.
   * @param {string} endDate - Fecha fin en formato YYYY-MM-DD.
   * @returns {Promise<Array<{id: string, dni: string, fecha: string, tipo: string, [key: string]: any}>>}
   */
  async getAttendanceByDateRange(startDate, endDate) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("fecha", ">=", startDate),
        where("fecha", "<=", endDate)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return docs.sort((a, b) => {
        if (a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha);
        }
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeA - timeB;
      });
    } catch (error) {
      console.error("Error getting attendance by date range:", error);
      return [];
    }
  }

  /**
   * Suscribe a los cambios de registros de asistencia en un rango de fechas.
   * @param {string} startDate - Fecha inicio en formato YYYY-MM-DD.
   * @param {string} endDate - Fecha fin en formato YYYY-MM-DD.
   * @param {function} callback - Función a llamar cuando hay cambios.
   * @returns {function} Función para desuscribirse.
   */
  subscribeToAttendanceByDateRange(startDate, endDate, callback) {
    const q = query(
      collection(db, this.collectionName),
      where("fecha", ">=", startDate),
      where("fecha", "<=", endDate)
    );

    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sortedDocs = docs.sort((a, b) => {
        if (a.fecha !== b.fecha) {
          return a.fecha.localeCompare(b.fecha);
        }
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeA - timeB;
      });
      callback(sortedDocs);
    }, (error) => {
      console.error("Error in real-time listener (range):", error);
    });
  }

  /**
   * Obtiene todos los registros de asistencia de un trabajador por su DNI.
   * @param {string} dni - DNI del trabajador.
   * @returns {Promise<Array<{id: string, dni: string, fecha: string, tipo: string, timestamp: {seconds: number}, [key: string]: any}>>}
   */
  async getAttendanceByDni(dni) {
    try {
      const q = query(collection(db, this.collectionName), where("dni", "==", dni));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return docs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error getting attendance by dni:", error);
      return [];
    }
  }

  /**
   * Verifica si ya existe un registro de asistencia para un DNI, fecha y tipo.
   * @param {string} dni - DNI del trabajador.
   * @param {string} fecha - Fecha en formato YYYY-MM-DD.
   * @param {string} tipo - Tipo de comida.
   * @returns {Promise<boolean>} True si existe al menos un registro.
   */
  async checkIfExists(dni, fecha, tipo) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("dni", "==", dni),
        where("fecha", "==", fecha),
        where("tipo", "==", tipo),
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking existence:", error);
      return false;
    }
  }
}
