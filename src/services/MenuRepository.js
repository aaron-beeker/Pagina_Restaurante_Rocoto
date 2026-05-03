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
  query,      // Añadido para filtrar platos por categoría
  where,      // Añadido para la condición de búsqueda
  writeBatch  // Añadido para actualizar múltiples platos a la vez
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export class MenuRepository {
  constructor() {
    this.allPlatos = []; // Aquí guardaremos los platos que bajen de Firebase
  }

  // Descarga todos los platos y los guarda en memoria para filtrarlos rápido
  async loadAllPlatos() {
    const querySnapshot = await getDocs(collection(db, "platos_carta"));
    this.allPlatos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return this.allPlatos;
  }

  // Re-implementamos getByCategory para que la vista no falle
  getByCategory(category) {
    if (category === "Todos") {
      return this.allPlatos.filter((item) => !esProductoSoloMenuDiario(item));
    }

    return this.allPlatos.filter((item) => {
      if (esProductoSoloMenuDiario(item)) return false;
      if (Array.isArray(item.category)) {
        return item.category.includes(category);
      }
      return item.category === category;
    });
  }

  // Re-implementamos getCategories para los botones de la carta
  getCategories() {
    const categories = ["Todos", ...new Set(this.allPlatos.map(item => item.category))];
    return categories;
  }



  // Método para obtener todos los platos de la carta general desde Firebase
  async getAllFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "platos_carta"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Método para obtener la configuración actual del Menú Ejecutivo del Día
  async getDailyMenuConfig() {
    const docRef = doc(db, "configuracion", "menu_ejecutivo");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async uploadSeedData(menuSeed, recetarioPlatos) {
    console.log("Iniciando migración de datos a Firestore...");
    const todosLosPlatos = [...menuSeed, ...recetarioPlatos];
    const platosRef = collection(db, "platos_carta");

    for (const plato of todosLosPlatos) {
      await addDoc(platosRef, {
        name: plato.name,
        price: plato.price || 10,
        category: plato.category || plato.categoria || "General",
        description: plato.description || "Plato tradicional",
        imageUrl: plato.imageUrl || ""
      });
    }
    console.log("Migración completada con éxito.");
  }

  async saveDailyMenu(nuevaConfig) {
    try {
      const docRef = doc(db, "configuracion", "menu_ejecutivo");
      // setDoc reemplaza los datos existentes con los nuevos
      await setDoc(docRef, {
        ...nuevaConfig,
        ultimaActualizacion: new Date()
      });
      console.log("Menú Ejecutivo actualizado en Firebase");
      return true;
    } catch (error) {
      console.error("Error al guardar en Firebase:", error);
      return false;
    }
  }

  async getHeroPromo() {
    const docRef = doc(db, "configuracion", "hero_promocion");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }

  async saveHeroPromo(payload) {
    try {
      const docRef = doc(db, "configuracion", "hero_promocion");
      await setDoc(docRef, {
        activo: !!payload.activo,
        titulo: payload.titulo || "",
        subtitulo: payload.subtitulo || "",
        imageUrl: payload.imageUrl || "",
        ultimaActualizacion: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error al guardar promoción del hero:", error);
      return false;
    }
  }

  // Método para añadir un plato nuevo
  async addPlato(platoData) {
    try {
        const platosRef = collection(db, "platos_carta");
        await addDoc(platosRef, {
            ...platoData,
            description: platoData.description ?? "",
            imageUrl: platoData.imageUrl ?? "",
            category: Array.isArray(platoData.category) ? platoData.category : [platoData.category],
        });
        return true;
    } catch (error) {
        console.error("Error al añadir plato:", error);
        return false;
    }
  }
  //Métoco para eliminar plato
  async deletePlato(id) {
    try {
        const docRef = doc(db, "platos_carta", id);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error("Error al eliminar plato:", error);
        return false;
    }
  }


  async updatePlato(id, updatedData) {
    try {
      const docRef = doc(db, "platos_carta", id);
      const payload = {
        ...updatedData,
        category: Array.isArray(updatedData.category)
          ? updatedData.category
          : [updatedData.category],
      };
      await setDoc(docRef, payload, { merge: true });
      return true;
    } catch (error) {
      console.error("Error al actualizar plato:", error);
      return false;
    }
  }

// 1. Obtener categorías desde la nueva colección 'categorias_carta'
async getCategoriesFromFirestore() {
  try {
      const querySnapshot = await getDocs(collection(db, "categorias_carta"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
      console.error("Error al obtener categorías:", error);
      return [];
  }
}

// 2. Agregar una nueva categoría
async addCategory(nombre) {
  try {
      const catRef = collection(db, "categorias_carta");
      await addDoc(catRef, { nombre: nombre });
      return true;
  } catch (error) {
      console.error("Error al añadir categoría:", error);
      return false;
  }
}

// 3. Eliminar una categoría por su ID
async deleteCategory(id) {
  try {
      const docRef = doc(db, "categorias_carta", id);
      await deleteDoc(docRef);
      return true;
  } catch (error) {
      console.error("Error al eliminar categoría:", error);
      return false;
  }
}

async updateCategory(id, nuevoNombre, antiguoNombre) {
  try {
      // 1. Actualizar el nombre en la colección de categorías
      const catRef = doc(db, "categorias_carta", id);
      await setDoc(catRef, { nombre: nuevoNombre }, { merge: true });

      // 2. Actualizar en cascada todos los platos que usaban el nombre antiguo
      const platosRef = collection(db, "platos_carta");
      const q = query(platosRef, where("category", "==", antiguoNombre));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db); // Usamos batch para eficiencia
      querySnapshot.forEach((platoDoc) => {
          const platoRef = doc(db, "platos_carta", platoDoc.id);
          batch.update(platoRef, { category: nuevoNombre });
      });
      
      await batch.commit();
      return true;
  } catch (error) {
      console.error("Error al actualizar categoría y platos:", error);
      return false;
  }
}

// src/services/MenuRepository.js

async getOpcionesParaAdmin() {
  try {
    const platos = await this.getAllFromFirestore();
    
    return {
      // 1. Filtro para Entradas usando tu nueva categoría
      entradas: platos.filter(p => {
        const cat = p.category;
        return Array.isArray(cat) ? cat.includes("Entrada") : cat === "Entrada";
      }),

      segundos: platos.filter((p) => {
        const cat = p.category;
        return Array.isArray(cat) ? cat.includes("Menú del Día") : cat === "Menú del Día";
      }),

      // 3. Filtro para Refrescos usando tu nueva categoría
      refrescos: platos.filter(p => {
        const cat = p.category;
        return Array.isArray(cat) ? cat.includes("Bebida Menú") : cat === "Bebida Menú";
      })
    };
  } catch (error) {
    console.error("Error al filtrar por categorías específicas:", error);
    return { entradas: [], segundos: [], refrescos: [] };
  }
}

}
