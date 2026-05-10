export class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  /**
   * Actualiza el estado y notifica a todos los suscriptores.
   * @param {Object} newState 
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  /**
   * Registra una función para ser llamada cuando el estado cambie.
   * @param {Function} listener 
   * @returns {Function} Desuscribir
   */
  subscribe(listener) {
    this.listeners.add(listener);
    // Llamar inmediatamente con el estado actual
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }
}

// Exportamos una instancia única para todo el proyecto (Singleton)
export const appStore = new Store({
  user: null,
  activeCategory: "Inicio",
  dailyMenu: { entradas: [], segundos: [], refrescos: [] },
  heroPromo: null,
  restaurantInfo: null
});
