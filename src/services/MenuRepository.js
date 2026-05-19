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
  writeBatch,
  onSnapshot,
} from "firebase/firestore";

/**
 * Repositorio para gestionar platos, categorías, menú diario y promociones del hero.
 * Usa caché en memoria (`allPlatos`) para lecturas rápidas.
 */
export class MenuRepository {
  constructor() {
    /** @type {Array<Object>} */
    this.allPlatos = [];
  }

  /**
   * Carga todos los platos desde Firestore y los cachea en memoria.
   * @returns {Promise<Array<{id: string, name: string, category: string|string[], [key: string]: any}>>}
   */
  async loadAllPlatos() {
    const querySnapshot = await getDocs(collection(db, "platos_carta"));
    this.allPlatos = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return this.allPlatos;
  }

  /**
   * Obtiene platos filtrados por categoría desde la caché en memoria.
   * Excluye productos que son solo para menú del día.
   * @param {string} category - Nombre de la categoría o "Todos".
   * @returns {Array<{id: string, name: string, category: string|string[], [key: string]: any}>}
   */
  getByCategory(category) {
    if (category === "Todos")
      return this.allPlatos.filter((item) => !esProductoSoloMenuDiario(item));
    return this.allPlatos.filter((item) => {
      if (esProductoSoloMenuDiario(item)) return false;
      const cats = Array.isArray(item.category) ? item.category : [item.category];
      return cats.includes(category);
    });
  }

  /**
   * Obtiene todos los platos directamente desde Firestore (sin caché).
   * @returns {Promise<Array<{id: string, [key: string]: any}>>}
   */
  async getAllFromFirestore() {
    const querySnapshot = await getDocs(collection(db, "platos_carta"));
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Suscribe a los cambios de platos en Firestore.
   * Actualiza la caché en memoria y llama al callback.
   * @param {function} callback - Función a llamar cuando hay cambios.
   * @returns {function} Función para desuscribirse.
   */
  subscribeToPlatos(callback) {
    return onSnapshot(collection(db, "platos_carta"), (snapshot) => {
      this.allPlatos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      callback(this.allPlatos);
    });
  }

  /**
   * Obtiene la configuración del menú ejecutivo desde Firestore.
   * @returns {Promise<{activo: boolean, entradas: string[], segundos: string[], refrescos: string[]}>}
   */
  async getDailyMenuConfig() {
    const docRef = doc(db, "configuracion", "menu_ejecutivo");
    const docSnap = await getDoc(docRef);
    return docSnap.exists()
      ? docSnap.data()
      : { activo: true, entradas: [], segundos: [], refrescos: [] };
  }

  /**
   * Suscribe a los cambios de configuración del menú ejecutivo.
   * @param {function} callback - Función a llamar cuando hay cambios.
   * @returns {function} Función para desuscribirse.
   */
  subscribeToDailyMenuConfig(callback) {
    const docRef = doc(db, "configuracion", "menu_ejecutivo");
    return onSnapshot(docRef, (docSnap) => {
      const data = docSnap.exists()
        ? docSnap.data()
        : { activo: true, entradas: [], segundos: [], refrescos: [] };
      callback(data);
    });
  }

  /**
   * Guarda la visibilidad del menú diario (activo/inactivo).
   * @param {boolean} activo - Si el menú diario está visible.
   * @returns {Promise<boolean>} True si se guardó correctamente.
   */
  async saveDailyMenuVisibility(activo) {
    try {
      const docRef = doc(db, "configuracion", "menu_ejecutivo");
      await setDoc(docRef, { activo }, { merge: true });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Guarda la configuración completa del menú diario.
   * @param {{entradas: string[], segundos: string[], refrescos: string[]}} nuevaConfig
   * @returns {Promise<boolean>} True si se guardó correctamente.
   */
  async saveDailyMenu(nuevaConfig) {
    try {
      const docRef = doc(db, "configuracion", "menu_ejecutivo");
      await setDoc(docRef, { ...nuevaConfig, ultimaActualizacion: new Date() });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene la configuración de la promoción del hero (banners).
   * @returns {Promise<{banners: Array<{id: string, activo: boolean, titulo: string, subtitulo: string, imageUrl: string}>}>}
   */
  async getHeroPromo() {
    const docRef = doc(db, "configuracion", "hero_promocion");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.banners && Array.isArray(data.banners)) return data;
      return {
        banners: [
          {
            id: "legacy",
            activo: !!data.activo,
            titulo: data.titulo,
            subtitulo: data.subtitulo,
            imageUrl: data.imageUrl,
          },
        ],
      };
    }
    return { banners: [] };
  }

  /**
   * Suscribe a los cambios de la promoción del hero.
   * @param {function} callback - Función a llamar cuando hay cambios.
   * @returns {function} Función para desuscribirse.
   */
  subscribeToHeroPromo(callback) {
    const docRef = doc(db, "configuracion", "hero_promocion");
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.banners && Array.isArray(data.banners)) {
          callback(data);
          return;
        }
        callback({
          banners: [
            {
              id: "legacy",
              activo: !!data.activo,
              titulo: data.titulo,
              subtitulo: data.subtitulo,
              imageUrl: data.imageUrl,
            },
          ],
        });
        return;
      }
      callback({ banners: [] });
    });
  }

  /**
   * Guarda la configuración de la promoción del hero.
   * @param {{banners: Array<{id: string, activo: boolean, titulo: string, subtitulo: string, imageUrl: string}>}} payload
   * @returns {Promise<boolean>} True si se guardó correctamente.
   */
  async saveHeroPromo(payload) {
    try {
      const docRef = doc(db, "configuracion", "hero_promocion");
      await setDoc(docRef, { banners: payload.banners || [], ultimaActualizacion: new Date() });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Agrega un nuevo plato a Firestore y refresca la caché.
   * @param {{name: string, category: string|string[], [key: string]: any}} platoData
   * @returns {Promise<boolean>} True si se agregó correctamente.
   */
  async addPlato(platoData) {
    try {
      await addDoc(collection(db, "platos_carta"), {
        ...platoData,
        category: Array.isArray(platoData.category) ? platoData.category : [platoData.category],
      });
      await this.loadAllPlatos(); // Refrescar caché
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Elimina un plato de Firestore y refresca la caché.
   * @param {string} id - ID del documento del plato.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   */
  async deletePlato(id) {
    try {
      await deleteDoc(doc(db, "platos_carta", id));
      await this.loadAllPlatos(); // Refrescar caché
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Actualiza un plato en Firestore y refresca la caché.
   * @param {string} id - ID del documento del plato.
   * @param {{name?: string, category?: string|string[], [key: string]: any}} updatedData
   * @returns {Promise<boolean>} True si se actualizó correctamente.
   */
  async updatePlato(id, updatedData) {
    try {
      await setDoc(
        doc(db, "platos_carta", id),
        {
          ...updatedData,
          category: Array.isArray(updatedData.category)
            ? updatedData.category
            : [updatedData.category],
        },
        { merge: true }
      );
      await this.loadAllPlatos(); // Refrescar caché
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene todas las categorías desde Firestore, ordenadas por el campo `orden`.
   * @returns {Promise<Array<{id: string, nombre: string, orden?: number, imageUrl?: string, activo?: boolean}>>}
   */
  async getCategoriesFromFirestore() {
    try {
      const querySnapshot = await getDocs(collection(db, "categorias_carta"));
      const categorias = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      return categorias.sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      return [];
    }
  }

  /**
   * Suscribe a los cambios de categorías en Firestore.
   * @param {function} callback - Función a llamar cuando hay cambios.
   * @returns {function} Función para desuscribirse.
   */
  subscribeToCategories(callback) {
    return onSnapshot(collection(db, "categorias_carta"), (snapshot) => {
      const categorias = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const sorted = categorias.sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
      callback(sorted);
    });
  }

  /**
   * Agrega una nueva categoría a Firestore.
   * @param {string} nombre - Nombre de la categoría.
   * @param {string} [imageUrl=""] - URL de la imagen de la categoría.
   * @param {boolean} [activo=true] - Si la categoría está activa.
   * @returns {Promise<boolean>} True si se agregó correctamente.
   */
  async addCategory(nombre, imageUrl = "", activo = true) {
    try {
      const querySnapshot = await getDocs(collection(db, "categorias_carta"));
      const currentCount = querySnapshot.size;
      await addDoc(collection(db, "categorias_carta"), {
        nombre,
        imageUrl,
        activo: activo !== false,
        orden: currentCount,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Elimina una categoría de Firestore.
   * @param {string} id - ID del documento de la categoría.
   * @returns {Promise<boolean>} True si se eliminó correctamente.
   */
  async deleteCategory(id) {
    try {
      await deleteDoc(doc(db, "categorias_carta", id));
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Actualiza una categoría y propaga el cambio de nombre a los platos relacionados.
   * @param {string} id - ID del documento de la categoría.
   * @param {string} nuevoNombre - Nuevo nombre de la categoría.
   * @param {string} antiguoNombre - Nombre anterior para buscar platos a actualizar.
   * @param {string|null} [imageUrl=null] - Nueva URL de imagen (opcional).
   * @param {boolean|null} [activo=null] - Nuevo estado activo (opcional).
   * @returns {Promise<boolean>} True si se actualizó correctamente.
   */
  async updateCategory(id, nuevoNombre, antiguoNombre, imageUrl = null, activo = null) {
    try {
      const catRef = doc(db, "categorias_carta", id);
      const updatePayload = { nombre: nuevoNombre };
      if (imageUrl !== null) updatePayload.imageUrl = imageUrl;
      if (activo !== null) updatePayload.activo = activo;
      await setDoc(catRef, updatePayload, { merge: true });

      if (nuevoNombre !== antiguoNombre) {
        const q = query(
          collection(db, "platos_carta"),
          where("category", "array-contains", antiguoNombre)
        );
        const snap = await getDocs(q);
        const batch = writeBatch(db);
        snap.forEach((d) => {
          const newCats = d.data().category.map((c) => (c === antiguoNombre ? nuevoNombre : c));
          batch.update(doc(db, "platos_carta", d.id), { category: newCats });
        });
        await batch.commit();
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Guarda el orden de las categorías en Firestore usando batch write.
   * @param {Array<{id: string, orden?: number}>} categories - Lista de categorías con su nuevo orden.
   * @returns {Promise<boolean>} True si se guardó correctamente.
   */
  async saveCategoriesOrder(categories) {
    try {
      const batch = writeBatch(db);
      categories.forEach((cat, index) => {
        batch.update(doc(db, "categorias_carta", cat.id), { orden: index });
      });
      await batch.commit();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene platos agrupados por tipo de menú para el panel de admin.
   * Usa la caché si está disponible, sino carga desde Firestore.
   * @returns {Promise<{entradas: Array<Object>, segundos: Array<Object>, refrescos: Array<Object>}>}
   */
  async getOpcionesParaAdmin() {
    try {
      const platos = this.allPlatos.length > 0 ? this.allPlatos : await this.loadAllPlatos();

      return {
        entradas: platos.filter((p) =>
          Array.isArray(p.category) ? p.category.includes("Entrada") : p.category === "Entrada"
        ),
        segundos: platos.filter((p) =>
          Array.isArray(p.category)
            ? p.category.includes("Menú del Día")
            : p.category === "Menú del Día"
        ),
        refrescos: platos.filter((p) =>
          Array.isArray(p.category)
            ? p.category.includes("Bebida Menú")
            : p.category === "Bebida Menú"
        ),
      };
    } catch (error) {
      console.error("Error en getOpcionesParaAdmin:", error);
      return { entradas: [], segundos: [], refrescos: [] };
    }
  }
}
