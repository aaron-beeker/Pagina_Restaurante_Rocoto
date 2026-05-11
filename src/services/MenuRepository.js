import { esProductoSoloMenuDiario } from "../constants/menuCategories.js";
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
  writeBatch
} from "firebase/firestore";

export class MenuRepository {
  constructor() {
    this.allPlatos = [];
  }

  async loadAllPlatos() {
    const querySnapshot = await getDocs(collection(db, "platos_carta"));
    this.allPlatos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return this.allPlatos;
  }

  getByCategory(category) {
    if (category === "Todos") return this.allPlatos.filter((item) => !esProductoSoloMenuDiario(item));
    return this.allPlatos.filter((item) => {
      if (esProductoSoloMenuDiario(item)) return false;
      const cats = Array.isArray(item.category) ? item.category : [item.category];
      return cats.includes(category);
    });
  }

  async getAllFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "platos_carta"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getDailyMenuConfig() {
    const docRef = doc(db, "configuracion", "menu_ejecutivo");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async saveDailyMenu(nuevaConfig) {
    try {
      const docRef = doc(db, "configuracion", "menu_ejecutivo");
      await setDoc(docRef, { ...nuevaConfig, ultimaActualizacion: new Date() });
      return true;
    } catch (error) { return false; }
  }

  async getHeroPromo() {
    const docRef = doc(db, "configuracion", "hero_promocion");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.banners && Array.isArray(data.banners)) return data;
      return { banners: [{ id: "legacy", activo: !!data.activo, titulo: data.titulo, subtitulo: data.subtitulo, imageUrl: data.imageUrl }] };
    }
    return { banners: [] };
  }

  async saveHeroPromo(payload) {
    try {
      const docRef = doc(db, "configuracion", "hero_promocion");
      await setDoc(docRef, { banners: payload.banners || [], ultimaActualizacion: new Date() });
      return true;
    } catch (error) { return false; }
  }

  async addPlato(platoData) {
    try {
        await addDoc(collection(db, "platos_carta"), {
            ...platoData,
            category: Array.isArray(platoData.category) ? platoData.category : [platoData.category],
        });
        return true;
    } catch (error) { return false; }
  }

  async deletePlato(id) {
    try {
        await deleteDoc(doc(db, "platos_carta", id));
        return true;
    } catch (error) { return false; }
  }

  async updatePlato(id, updatedData) {
    try {
      await setDoc(doc(db, "platos_carta", id), {
        ...updatedData,
        category: Array.isArray(updatedData.category) ? updatedData.category : [updatedData.category],
      }, { merge: true });
      return true;
    } catch (error) { return false; }
  }

  // CATEGORÍAS: Obtener todas sin filtros de Firestore y ordenar en memoria
  async getCategoriesFromFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "categorias_carta"));
        const categorias = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Ordenar en memoria para evitar que Firestore ignore docs sin el campo 'orden'
        return categorias.sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        return [];
    }
  }

  async addCategory(nombre, imageUrl = "", activo = true) {
    try {
        const querySnapshot = await getDocs(collection(db, "categorias_carta"));
        const currentCount = querySnapshot.size;
        await addDoc(collection(db, "categorias_carta"), { 
          nombre, imageUrl, activo: activo !== false,
          orden: currentCount
        });
        return true;
    } catch (error) { return false; }
  }

  async deleteCategory(id) {
    try {
        await deleteDoc(doc(db, "categorias_carta", id));
        return true;
    } catch (error) { return false; }
  }

  async updateCategory(id, nuevoNombre, antiguoNombre, imageUrl = null, activo = null) {
    try {
      const catRef = doc(db, "categorias_carta", id);
      const updatePayload = { nombre: nuevoNombre };
      if (imageUrl !== null) updatePayload.imageUrl = imageUrl;
      if (activo !== null) updatePayload.activo = activo;
      await setDoc(catRef, updatePayload, { merge: true });

      // Actualización en cascada
      if (nuevoNombre !== antiguoNombre) {
          const q = query(collection(db, "platos_carta"), where("category", "array-contains", antiguoNombre));
          const snap = await getDocs(q);
          const batch = writeBatch(db);
          snap.forEach((d) => {
              const newCats = d.data().category.map(c => c === antiguoNombre ? nuevoNombre : c);
              batch.update(doc(db, "platos_carta", d.id), { category: newCats });
          });
          await batch.commit();
      }
      return true;
    } catch (error) { return false; }
  }

  async saveCategoriesOrder(categories) {
      try {
          const batch = writeBatch(db);
          categories.forEach((cat, index) => {
              batch.update(doc(db, "categorias_carta", cat.id), { orden: index });
          });
          await batch.commit();
          return true;
      } catch (error) { return false; }
  }

  async getOpcionesParaAdmin() {
    try {
      // Priorizar datos en memoria (caché) para carga instantánea
      const platos = this.allPlatos.length > 0 ? this.allPlatos : await this.loadAllPlatos();
      
      return {
        entradas: platos.filter(p => Array.isArray(p.category) ? p.category.includes("Entrada") : p.category === "Entrada"),
        segundos: platos.filter(p => Array.isArray(p.category) ? p.category.includes("Menú del Día") : p.category === "Menú del Día"),
        refrescos: platos.filter(p => Array.isArray(p.category) ? p.category.includes("Bebida Menú") : p.category === "Bebida Menú")
      };
    } catch (error) { 
      console.error("Error en getOpcionesParaAdmin:", error);
      return { entradas: [], segundos: [], refrescos: [] }; 
    }
  }
}
