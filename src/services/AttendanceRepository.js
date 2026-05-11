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
  limit
} from "firebase/firestore";

export class AttendanceRepository {
  constructor() {
    this.collectionName = "asistencia_fasal";
  }

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
    } catch (error) { return null; }
  }

  async registerAttendance(attendanceData) {
    try {
      // Intentar unificar con un registro previo del mismo servicio para el mismo trabajador
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

        // REGLA DE UNIFICACIÓN:
        // 1. Si el nuevo registro es de consumo local (soloCampo: false), unificamos SIEMPRE.
        // 2. Si el registro existente ya era local, bloqueamos (esto se valida en el controller también).
        if (attendanceData.soloCampo === false || existingData.soloCampo === false) {
          await updateDoc(docRef, {
            ...attendanceData,
            // Sumamos las raciones si ambos tienen montos, o mantenemos el mayor
            cantidadCampo: (existingData.cantidadCampo || 0) + (attendanceData.cantidadCampo || 0),
            soloCampo: false, // Si cualquiera de los dos es consumo local, el resultado es consumo local
            updatedAt: new Date(),
            updatedBy: "sistema_unificar"
          });
          return true;
        }
      }

      // Si no hay nada que unificar o son registros de campo totalmente independientes
      const timestamp = new Date();
      await addDoc(collection(db, this.collectionName), {
        ...attendanceData,
        timestamp: timestamp
      });
      return true;
    } catch (error) {
      console.error("Error registering attendance:", error);
      return false;
    }
  }

  async addAttendance(attendanceData) {
    try {
      const timestamp = attendanceData.timestamp || new Date();
      await addDoc(collection(db, this.collectionName), {
        ...attendanceData,
        timestamp: timestamp
      });
      return true;
    } catch (error) {
      console.error("Error adding attendance:", error);
      return false;
    }
  }

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

  async deleteAttendance(id) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      return false;
    }
  }

  async getAttendanceByDate(fecha) {
    try {
      const collRef = collection(db, this.collectionName);
      let q;
      
      if (fecha) {
        q = query(collRef, where("fecha", "==", fecha));
      } else {
        // Si no hay fecha, traemos los últimos 1000 registros
        q = query(collRef, orderBy("timestamp", "desc"), limit(1000));
      }

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (fecha) {
        // Sort by timestamp desc in JS for consistency
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

  async getAttendanceByDateRange(startDate, endDate) {
    try {
      const q = query(
        collection(db, this.collectionName), 
        where("fecha", ">=", startDate),
        where("fecha", "<=", endDate)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort in JS
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

  async getAttendanceByDni(dni) {
    try {
      const q = query(
        collection(db, this.collectionName), 
        where("dni", "==", dni)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
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
