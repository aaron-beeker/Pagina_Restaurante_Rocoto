import { WorkerStateManager } from "./WorkerStateManager.js";
import { AttendanceRegisterController } from "./AttendanceRegisterController.js";
import { AttendanceReportController } from "./AttendanceReportController.js";
import { WorkerManagementController } from "./WorkerManagementController.js";

/**
 * Fachada que orquesta los 3 controllers de asistencia.
 * Mantiene compatibilidad con el Router mientras delega la lógica real.
 */
export class AttendanceController {
  /**
   * @param {{
   *   workerRepository: import("../services/WorkerRepository.js").WorkerRepository,
   *   companyRepository: import("../services/CompanyRepository.js").CompanyRepository,
   *   attendanceRepository: import("../services/AttendanceRepository.js").AttendanceRepository,
   *   supremaService: import("../services/SupremaService.js").SupremaService,
   *   excelService: import("../services/ExcelService.js").ExcelService,
   *   pdfService: import("../services/PdfService.js").PdfService,
   *   navigateTo: function(string): void
   * }} deps
   */
  constructor(deps) {
    const workerStateManager = new WorkerStateManager({ workerRepository: deps.workerRepository });

    this.workerStateManager = workerStateManager;

    this.registerController = new AttendanceRegisterController({
      workerStateManager,
      attendanceRepository: deps.attendanceRepository,
      supremaService: deps.supremaService,
      navigateTo: deps.navigateTo,
    });

    this.reportController = new AttendanceReportController({
      workerStateManager,
      attendanceRepository: deps.attendanceRepository,
      companyRepository: deps.companyRepository,
      excelService: deps.excelService,
      pdfService: deps.pdfService,
      navigateTo: deps.navigateTo,
    });

    this.managementController = new WorkerManagementController({
      workerStateManager,
      companyRepository: deps.companyRepository,
      attendanceRepository: deps.attendanceRepository,
      supremaService: deps.supremaService,
      excelService: deps.excelService,
      pdfService: deps.pdfService,
      navigateTo: deps.navigateTo,
    });

    this.workerRepository = deps.workerRepository;
    this.companyRepository = deps.companyRepository;
    this.attendanceRepository = deps.attendanceRepository;
    this.supremaService = deps.supremaService;
    this.excelService = deps.excelService;
    this.pdfService = deps.pdfService;
    this.navigateTo = deps.navigateTo;

    this.lastWorkerSearch = "";
    this._cachedTemplates = null;
    this.workers = [];
    this.workerUnsubscribe = null;
    this.onWorkersUpdate = null;
  }

  set navigate(fn) {
    this.navigateTo = fn;
    this.registerController.navigateTo = fn;
    this.reportController.navigateTo = fn;
    this.managementController.navigateTo = fn;
  }

  subscribeWorkers(onUpdate) {
    this.workerStateManager.subscribe(onUpdate);
  }

  async abrirRegistroAsistencia(silent = false) {
    await this.registerController.open(silent);
  }

  async abrirGestionAsistencia(silent = false) {
    await this.reportController.open(silent);
  }

  async abrirGestionTrabajadores(silent = false) {
    await this.managementController.openWorkers(silent);
  }

  async abrirGestionEmpresas(silent = false) {
    await this.managementController.openCompanies(silent);
  }

  async procesarRegistroWorker(worker, tipo, today, refreshCb) {
    return await this.registerController._procesarRegistroWorker(worker, tipo, today, refreshCb);
  }

  async registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo = 0, esConsumoPropio = true) {
    return await this.registerController._registrarAsistencia(
      worker,
      tipo,
      today,
      refreshCb,
      cantidadCampo,
      esConsumoPropio
    );
  }
}
