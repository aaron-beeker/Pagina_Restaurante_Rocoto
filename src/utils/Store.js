/**
 * Store reactivo tipo Redux para gestión de estado global.
 * Permite suscribirse a cambios y notifica a todos los listeners.
 * @template {Record<string, any>} T
 */
export class Store {
  /**
   * @param {T} [initialState={}] - Estado inicial del store.
   */
  constructor(initialState = {}) {
    /** @type {T} */
    this.state = initialState;
    /** @type {Set<Function>} */
    this.listeners = new Set();
  }

  /**
   * Obtiene el estado actual.
   * @returns {T}
   */
  getState() {
    return this.state;
  }

  /**
   * Actualiza el estado haciendo merge con el nuevo estado y notifica a los suscriptores.
   * @param {Partial<T>} newState
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  /**
   * Registra una función que será llamada cada vez que el estado cambie.
   * Se ejecuta inmediatamente con el estado actual al suscribirse.
   * @param {Function} listener - Función que recibe el estado actual.
   * @returns {Function} Función para desuscribirse.
   */
  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifica a todos los listeners con el estado actual.
   */
  notify() {
    this.listeners.forEach((listener) => listener(this.state));
  }
}

/**
 * Instancia singleton del Store para todo el proyecto.
 * @type {Store<{user: null, authInitialized: boolean, activeCategory: string, dailyMenu: {entradas: string[], segundos: string[], refrescos: string[]}, heroPromo: null, restaurantInfo: null, companies: Array<any>}>}
 */
export const appStore = new Store({
  user: null,
  authInitialized: false,
  activeCategory: "Inicio",
  dailyMenu: { entradas: [], segundos: [], refrescos: [] },
  heroPromo: null,
  restaurantInfo: null,
  companies: [],
});
