import { ManageWorkersView } from "../views/ManageWorkersView.js";
import { ManageCompaniesView } from "../views/ManageCompaniesView.js";
import { toast, dialog, preloader } from "../utils/notifications.js";
import { WorkerStateManager } from "./WorkerStateManager.js";

/**
 * Controller para gestión de trabajadores y empresas.
 * Maneja CRUD de trabajadores, captura de huellas, detalles con reportes individuales,
 * y CRUD de empresas.
 */
export class WorkerManagementController {
  /**
   * @param {{
   *   workerStateManager: WorkerStateManager,
   *   companyRepository: import("../services/CompanyRepository.js").CompanyRepository,
   *   attendanceRepository: import("../services/AttendanceRepository.js").AttendanceRepository,
   *   supremaService: import("../services/SupremaService.js").SupremaService,
   *   excelService: import("../services/ExcelService.js").ExcelService,
   *   pdfService: import("../services/PdfService.js").PdfService,
   *   navigateTo: function(string): void
   * }} deps
   */
  constructor(deps) {
    /** @type {WorkerStateManager} */
    this.workerStateManager = deps.workerStateManager;
    /** @type {import("../services/CompanyRepository.js").CompanyRepository} */
    this.companyRepository = deps.companyRepository;
    /** @type {import("../services/AttendanceRepository.js").AttendanceRepository} */
    this.attendanceRepository = deps.attendanceRepository;
    /** @type {import("../services/SupremaService.js").SupremaService} */
    this.supremaService = deps.supremaService;
    /** @type {import("../services/ExcelService.js").ExcelService} */
    this.excelService = deps.excelService;
    /** @type {import("../services/PdfService.js").PdfService} */
    this.pdfService = deps.pdfService;
    /** @type {function(string): void} */
    this.navigateTo = deps.navigateTo;

    this.unsubscribeCompanies = null;
  }

  /**
   * Abre la vista de gestión de trabajadores.
   * @param {boolean} [silent=false] - Si true, no muestra preloader.
   */
  async openWorkers(silent = false) {
    if (!silent) preloader.show("Cargando Personal...");
    try {
      if (this.unsubscribeCompanies) this.unsubscribeCompanies();

      const manageView = new ManageWorkersView(document.getElementById("admin-layer"));

      let currentCompanies = [];

      const acciones = {
        onBack: () => {
          if (this.unsubscribeCompanies) this.unsubscribeCompanies();
          this.navigateTo("#/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onSave: async (id, data) => {
          try {
            if (id) {
              if (await this.workerStateManager.workerRepository.updateWorker(id, data)) {
                toast.success("Trabajador actualizado");
              }
            } else {
              if (await this.workerStateManager.workerRepository.addWorker(data)) {
                toast.success("Trabajador registrado");
              }
            }
          } catch (error) {
            console.error("Error al guardar trabajador:", error);
            toast.error(error.message || "Error al guardar trabajador");
          }
        },
        onDelete: async (id) => {
          if (
            await dialog.confirm(
              "Eliminar Trabajador",
              "¿Está seguro de eliminar a este trabajador?"
            )
          ) {
            try {
              if (await this.workerStateManager.workerRepository.deleteWorker(id)) {
                toast.success("Trabajador eliminado");
              }
            } catch (error) {
              console.error("Error al eliminar trabajador:", error);
              toast.error("Error al eliminar trabajador");
            }
          }
        },
        onEdit: (id) => {
          const w = this.workerStateManager.workers.find((x) => x.id === id);
          if (w) manageView.prepareEdit(w);
        },
        onCapture: async (onStep) => {
          const result = await this.supremaService.capture();
          if (result.retCode === 0) {
            if (onStep) onStep("captured");
            return result.template;
          } else throw new Error(result.error || "Error al capturar");
        },
        onSearch: (q, company) => {
          this.workerStateManager.lastWorkerSearch = q;
          manageView.render(this.workerStateManager.workers, acciones, currentCompanies);
        },
        onViewDetails: async (id) => {
          preloader.show("Cargando detalles...");
          try {
            const w = this.workerStateManager.workers.find((x) => x.id === id);
            if (!w) return;
            const attendance = (await this.attendanceRepository.getAttendanceByDni(w.dni)).filter(
              (a) => !a.soloCampo
            );
            manageView.showWorkerDetails(w, attendance, {
              onDownloadPdf: async (worker, list) => {
                preloader.show("Generando PDF...");
                try {
                  await this.pdfService.generarReporteAsistencia(worker, list);
                } finally {
                  preloader.hide();
                }
              },
              onDownloadExcel: async (worker, list) => {
                preloader.show("Generando Excel...");
                try {
                  await this.excelService.generarReporteAsistencia(worker, list);
                } finally {
                  preloader.hide();
                }
              },
            });
          } finally {
            preloader.hide();
          }
        },
      };

      this.workerStateManager.subscribe(() => {
        if (document.getElementById("workers-list-container")) {
          manageView.render(this.workerStateManager.workers, acciones, currentCompanies);
        }
      });

      await this.workerStateManager.ensureLoaded();
      
      this.unsubscribeCompanies = this.companyRepository.subscribeToCompanies((companies) => {
        currentCompanies = companies;
        manageView.render(this.workerStateManager.workers, acciones, currentCompanies);
        
        if (this.workerStateManager.lastWorkerSearch) {
          const searchInput = document.getElementById("search-worker");
          if (searchInput) {
            searchInput.value = this.workerStateManager.lastWorkerSearch;
            manageView.filters.query = this.workerStateManager.lastWorkerSearch;
            manageView.render(this.workerStateManager.workers, acciones, currentCompanies);
          }
        }
      });

    } finally {
      if (!silent) preloader.hide();
    }
  }

  /**
   * Abre la vista de gestión de empresas.
   * @param {boolean} [silent=false] - Si true, no muestra preloader.
   */
  async openCompanies(silent = false) {
    if (!silent) preloader.show("Cargando Empresas...");
    try {
      if (this.unsubscribeCompanies) this.unsubscribeCompanies();

      const manageView = new ManageCompaniesView(document.getElementById("admin-layer"));
      
      let currentCompanies = [];

      const acciones = {
        onBack: () => {
          if (this.unsubscribeCompanies) this.unsubscribeCompanies();
          this.navigateTo("#/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onSave: async (id, data) => {
          try {
            if (
              id
                ? await this.companyRepository.updateCompany(id, data)
                : await this.companyRepository.addCompany(data)
            ) {
              toast.success("Empresa guardada");
              manageView.resetForm();
            }
          } catch (error) {
            console.error("Error al guardar empresa:", error);
            toast.error("Error al guardar empresa");
          }
        },
        onDelete: async (id) => {
          if (await dialog.confirm("Eliminar Empresa", "¿Está seguro de eliminar esta empresa?")) {
            try {
              if (await this.companyRepository.deleteCompany(id)) {
                toast.success("Empresa eliminada");
              }
            } catch (error) {
              console.error("Error al eliminar empresa:", error);
              toast.error("Error al eliminar empresa");
            }
          }
        },
        onEdit: (id) => {
          const c = currentCompanies.find((x) => x.id === id);
          if (c) manageView.prepareEdit(c);
        },
      };
      
      manageView.render([], acciones);

      this.unsubscribeCompanies = this.companyRepository.subscribeToCompanies((companies) => {
        currentCompanies = companies;
        manageView.render(currentCompanies, acciones);
      });

    } finally {
      if (!silent) preloader.hide();
    }
  }
}
