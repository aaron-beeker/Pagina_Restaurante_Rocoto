import { db } from "./firebaseConfig.js";
import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  setDoc, 
  deleteDoc, 
  query,      
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class CompanyRepository {
  constructor() {
    this.collectionName = "empresas_fasal";
  }

  async getAllCompanies() {
    try {
      const q = query(collection(db, this.collectionName), orderBy("nombre", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error getting companies:", error);
      return [];
    }
  }

  async addCompany(companyData) {
    try {
      await addDoc(collection(db, this.collectionName), {
        ...companyData,
        fechaRegistro: new Date()
      });
      return true;
    } catch (error) {
      console.error("Error adding company:", error);
      return false;
    }
  }

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
