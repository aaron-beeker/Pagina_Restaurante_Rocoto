import { collection, getDocs, doc, getDoc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebaseConfig.js";

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
    if (category === "Todos") return this.allPlatos;
    return this.allPlatos.filter(item => item.category === category);
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

}
