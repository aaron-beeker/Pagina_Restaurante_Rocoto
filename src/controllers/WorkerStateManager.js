/**
 * Gestiona el estado compartido de trabajadores entre los controllers de asistencia.
 * Centraliza la suscripción en tiempo real y el caché de templates de huellas.
 */
export class WorkerStateManager {
  /**
   * @param {{workerRepository: import("../services/WorkerRepository.js").WorkerRepository}} deps
   */
  constructor({ workerRepository }) {
    /** @type {import("../services/WorkerRepository.js").WorkerRepository} */
    this.workerRepository = workerRepository;
    /** @type {Array<{id: string, dni: string, apellidos: string, nombre: string, empresa?: string, huellas?: string[], huella?: string, esEncargadoCampo?: boolean, [key: string]: any}>} */
    this.workers = [];
    /** @type {Function|null} */
    this.workerUnsubscribe = null;
    /** @type {Function|null} */
    this.onWorkersUpdate = null;
    /** @type {{list: Array<{worker: object, template: string}>, version: number}|null} */
    this._cachedTemplates = null;
    /** @type {string} */
    this.lastWorkerSearch = "";
  }

  /**
   * Inicia la suscripción en tiempo real a los trabajadores.
   * Siempre actualiza el callback para que la vista activa reciba los datos.
   * @param {Function} onUpdate - Callback que recibe la lista actualizada.
   */
  subscribe(onUpdate) {
    this.onWorkersUpdate = onUpdate;

    if (this.workerUnsubscribe) return;

    this.workerUnsubscribe = this.workerRepository.subscribeToWorkers((updatedWorkers) => {
      this.workers = updatedWorkers;
      this._cachedTemplates = null;
      if (this.onWorkersUpdate) this.onWorkersUpdate(updatedWorkers);
    });
  }

  /**
   * Cancela la suscripción en tiempo real.
   */
  unsubscribe() {
    if (this.workerUnsubscribe) {
      this.workerUnsubscribe();
      this.workerUnsubscribe = null;
    }
  }

  /**
   * Carga inicial de trabajadores si el caché está vacío.
   * @returns {Promise<Array<object>>}
   */
  async ensureLoaded() {
    if (this.workers.length === 0) {
      this.workers = await this.workerRepository.getAllWorkers();
    }
    return this.workers;
  }

  /**
   * Obtiene y cachea la lista plana de templates para identificación 1:N ultrarrápida.
   * @param {Array<object>} workers - Lista de trabajadores.
   * @returns {Array<{worker: object, template: string}>}
   */
  getWorkerTemplates(workers) {
    if (this._cachedTemplates && this._cachedTemplates.version === workers.length) {
      return this._cachedTemplates.list;
    }
    const list = [];
    for (let i = 0; i < workers.length; i++) {
      const w = workers[i];
      const ts = w.huellas || (w.huella ? [w.huella] : []);
      for (let j = 0; j < ts.length; j++) {
        if (ts[j]) list.push({ worker: w, template: ts[j] });
      }
    }
    this._cachedTemplates = { list, version: workers.length };
    return list;
  }
}
