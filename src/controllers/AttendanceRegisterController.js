import { AttendanceView } from "../views/AttendanceView.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, preloader } from "../utils/notifications.js";
import { appStore } from "../utils/Store.js";
import { WorkerStateManager } from "./WorkerStateManager.js";

/**
 * Controller para el registro de asistencia con lector de huellas Suprema.
 * Maneja escaneo de huella, DNI manual y verificación 1:1.
 */
export class AttendanceRegisterController {
  /**
   * @param {{
   *   workerStateManager: WorkerStateManager,
   *   attendanceRepository: import("../services/AttendanceRepository.js").AttendanceRepository,
   *   supremaService: import("../services/SupremaService.js").SupremaService,
   *   navigateTo: function(string): void
   * }} deps
   */
  constructor(deps) {
    /** @type {WorkerStateManager} */
    this.workerStateManager = deps.workerStateManager;
    /** @type {import("../services/AttendanceRepository.js").AttendanceRepository} */
    this.attendanceRepository = deps.attendanceRepository;
    /** @type {import("../services/SupremaService.js").SupremaService} */
    this.supremaService = deps.supremaService;
    /** @type {function(string): void} */
    this.navigateTo = deps.navigateTo;
  }

  /**
   * Abre la vista de registro de asistencia con lector de huellas.
   * @param {boolean} [silent=false] - Si true, no muestra preloader.
   */
  async open(silent = false) {
    const attendanceView = new AttendanceView(document.getElementById("admin-layer"));
    const today = getLocalDateString();

    const refreshCb = async () => {
      try {
        const list = await this.attendanceRepository.getAttendanceByDate(today);
        attendanceView.renderLastRegistrations(list);
      } catch (error) {
        console.error("Error al refrescar registros recientes:", error);
      }
    };

    const acciones = {
      onBack: () => {
        this.navigateTo("#/");
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onCheckConnection: async () => {
        return await this.supremaService.checkConnection();
      },
      onScanFingerprint: async (tipo, onStep) => {
        const workers = await this.workerStateManager.ensureLoaded();
        if (workers.length === 0) {
          toast.info("Sincronizando base de datos de huellas... espere un segundo.");
          return { success: false, error: "Cargando..." };
        }
        try {
          const captureResult = await this.supremaService.capture(onStep);
          if (captureResult.retCode !== 0) return { success: false, error: captureResult.error };

          const capturedTemplate = captureResult.template;
          const templateList = this.workerStateManager.getWorkerTemplates(workers);
          const justTemplates = templateList.map((item) => item.template);

          const idResult = await this.supremaService.identify(capturedTemplate, justTemplates);
          if (idResult && idResult.match) {
            const matchedWorker = templateList[idResult.index]?.worker;
            if (matchedWorker)
              return await this._procesarRegistroWorker(matchedWorker, tipo, today, refreshCb);
          }

          for (let i = 0; i < templateList.length; i++) {
            const item = templateList[i];
            if (await this.supremaService.match(item.template, capturedTemplate)) {
              return await this._procesarRegistroWorker(item.worker, tipo, today, refreshCb);
            }
          }

          return { success: false, error: "Huella no reconocida" };
        } catch (e) {
          return { success: false, error: "Error de conexión" };
        }
      },
      onManualDni: async (dni, tipo) => {
        const workers = await this.workerStateManager.ensureLoaded();
        if (workers.length === 0) {
          toast.info("Cargando datos... reintente.");
          return { success: false, error: "Cargando..." };
        }
        try {
          const worker = workers.find((w) => w.dni === dni);
          if (!worker) return { success: false, error: "DNI no registrado" };
          return await this._procesarRegistroWorker(worker, tipo, today, refreshCb);
        } catch (e) {
          return { success: false, error: "Error al validar DNI" };
        }
      },
      onVerify: async (dni, tipo, onStep) => {
        const workers = await this.workerStateManager.ensureLoaded();
        if (workers.length === 0) {
          toast.info("Cargando datos... reintente.");
          return { success: false, error: "Cargando..." };
        }
        try {
          const worker = workers.find((w) => w.dni === dni);
          if (!worker) return { success: false, error: "DNI no registrado" };

          const captureResult = await this.supremaService.capture(onStep);
          if (captureResult.retCode !== 0) return { success: false, error: captureResult.error };

          const capturedTemplate = captureResult.template;
          const templates = worker.huellas || (worker.huella ? [worker.huella] : []);

          for (const t of templates) {
            if (await this.supremaService.match(t, capturedTemplate)) {
              return await this._procesarRegistroWorker(worker, tipo, today, refreshCb);
            }
          }
          return { success: false, error: "Huella no coincide" };
        } catch (e) {
          return { success: false, error: "Error de conexión" };
        }
      },
    };

    attendanceView.render(acciones);

    (async () => {
      if (!silent) preloader.show("Sincronizando Lector...");
      try {
        this.workerStateManager.subscribe(() => {});
        await this.workerStateManager.ensureLoaded();
        await refreshCb();
      } catch (error) {
        console.error("Error en la carga de asistencia:", error);
      } finally {
        if (!silent) preloader.hide();
      }
    })();
  }

  /**
   * Procesa el registro de un trabajador según su tipo (normal o encargado de campo).
   * @param {object} worker - Datos del trabajador.
   * @param {string} tipo - Tipo de comida.
   * @param {string} today - Fecha actual YYYY-MM-DD.
   * @param {Function} refreshCb - Callback para refrescar la vista.
   * @returns {Promise<{success: boolean, error?: string, workerName?: string}>}
   */
  async _procesarRegistroWorker(worker, tipo, today, refreshCb) {
    try {
      const existing = await this.attendanceRepository.getDetailedAttendance(
        worker.dni,
        today,
        tipo
      );
      const hasLocal = existing && existing.soloCampo === false;

      if (!worker.esEncargadoCampo) {
        if (hasLocal) return { success: false, error: "Ya registrado hoy" };
        return await this._registrarAsistencia(worker, tipo, today, refreshCb, 0, true);
      }

      const { dialog } = await import("../utils/notifications.js");
      const input = await dialog.prompt(
        "Raciones a Campo",
        `${worker.nombre}, cuántas raciones lleva a campo?`,
        "0"
      );
      const wasCancelled = input === null;
      const cantidadCampo = parseInt(input) || 0;

      if (!wasCancelled) {
        if (hasLocal) {
          return await this._registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, false);
        } else {
          const tambienCome = await dialog.confirm(
            "Consumo Individual",
            "Usted también consumirá su ración en el local?"
          );
          if (tambienCome) {
            return await this._registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, true);
          } else {
            return await this._registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, false);
          }
        }
      } else {
        if (hasLocal) {
          return { success: true, workerName: worker.nombre };
        } else {
          const tambienCome = await dialog.confirm(
            "Consumo Individual",
            "Usted también consumirá su ración en el local?"
          );
          if (tambienCome) {
            return await this._registrarAsistencia(worker, tipo, today, refreshCb, 0, true);
          } else {
            return { success: true, workerName: worker.nombre };
          }
        }
      }
    } catch (error) {
      console.error("Error al procesar registro:", error);
      return { success: false, error: "Error interno al procesar" };
    }
  }

  /**
   * Registra la asistencia en Firestore con metadatos.
   * @param {object} worker - Datos del trabajador.
   * @param {string} tipo - Tipo de comida.
   * @param {string} today - Fecha actual YYYY-MM-DD.
   * @param {Function} refreshCb - Callback para refrescar la vista.
   * @param {number} cantidadCampo - Cantidad de raciones a campo.
   * @param {boolean} esConsumoPropio - Si es consumo local del trabajador.
   * @returns {Promise<{success: boolean, error?: string, workerName?: string}>}
   */
  async _registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo = 0, esConsumoPropio = true) {
    const currentUser = appStore.getState().user;

    if (esConsumoPropio) {
      const existing = await this.attendanceRepository.getDetailedAttendance(
        worker.dni,
        today,
        tipo
      );
      if (existing && existing.soloCampo === false)
        return { success: false, error: "Ya registrado hoy" };
    }

    const data = {
      dni: worker.dni,
      nombreCompleto: `${worker.apellidos}, ${worker.nombre}`,
      empresa: worker.empresa || "Particular",
      tipo,
      fecha: today,
      esEncargadoCampo: !!worker.esEncargadoCampo,
      createdBy: currentUser?.email || "sistema",
      createdAt: new Date(),
      registroStatus: "sistema",
      soloCampo: !esConsumoPropio,
      cantidadCampo: cantidadCampo,
    };

    if (await this.attendanceRepository.registerAttendance(data)) {
      await refreshCb();
      return { success: true, workerName: worker.nombre };
    }
    return { success: false, error: "Error al guardar registro" };
  }
}
