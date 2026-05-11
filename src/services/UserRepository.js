import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from "firebase/firestore";

export class UserRepository {
    constructor() {
        this.collectionName = "users";
    }

    async getUserRole(email) {
        if (!email) return "client";
        try {
            const docRef = doc(db, this.collectionName, email.toLowerCase().trim());
            const docSnap = await getDoc(docRef);
            return docSnap.exists() ? (docSnap.data().role || "client") : "client";
        } catch (error) {
            console.error("Error fetching user role:", error);
            return "client";
        }
    }

    async getAllUsers() {
        try {
            const querySnapshot = await getDocs(collection(db, this.collectionName));
            return querySnapshot.docs.map(doc => ({
                email: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error("Error fetching all users:", error);
            return [];
        }
    }

    async deleteUser(email) {
        try {
            await deleteDoc(doc(db, this.collectionName, email.toLowerCase().trim()));
            return true;
        } catch (error) {
            console.error("Error deleting user:", error);
            return false;
        }
    }

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
