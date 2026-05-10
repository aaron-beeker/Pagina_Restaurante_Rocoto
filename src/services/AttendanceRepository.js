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

  async registerAttendance(attendanceData) {
    try {
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
      const q = query(
        collection(db, this.collectionName), 
        where("fecha", "==", fecha)
      );
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort by timestamp desc in JS
      return docs.sort((a, b) => {
        const timeA = a.timestamp?.seconds || 0;
        const timeB = b.timestamp?.seconds || 0;
        return timeB - timeA;
      });
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
