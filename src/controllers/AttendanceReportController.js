import { ManageAttendanceView } from "../views/ManageAttendanceView.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog, preloader } from "../utils/notifications.js";
import { appStore } from "../utils/Store.js";
import { WorkerStateManager } from "./WorkerStateManager.js";

/**
 * Controller para gestión de reportes de asistencia.
 * Maneja CRUD de registros, filtros por fecha, y generación de reportes PDF/Excel grupales.
 */
export class AttendanceReportController {
  /**
   * @param {{
   *   workerStateManager: WorkerStateManager,
   *   attendanceRepository: import("../services/AttendanceRepository.js").AttendanceRepository,
   *   companyRepository: import("../services/CompanyRepository.js").CompanyRepository,
   *   excelService: import("../services/ExcelService.js").ExcelService,
   *   pdfService: import("../services/PdfService.js").PdfService,
   *   navigateTo: function(string): void
   * }} deps
   */
  constructor(deps) {
    /** @type {WorkerStateManager} */
    this.workerStateManager = deps.workerStateManager;
    /** @type {import("../services/AttendanceRepository.js").AttendanceRepository} */
    this.attendanceRepository = deps.attendanceRepository;
    /** @type {import("../services/CompanyRepository.js").CompanyRepository} */
    this.companyRepository = deps.companyRepository;
    /** @type {import("../services/ExcelService.js").ExcelService} */
    this.excelService = deps.excelService;
    /** @type {import("../services/PdfService.js").PdfService} */
    this.pdfService = deps.pdfService;
    /** @type {function(string): void} */
    this.navigateTo = deps.navigateTo;

    this.unsubscribeDay = null;
    this.unsubscribeMonth = null;
    this.unsubscribeWorkers = null;
    this.unsubscribeCompanies = null;
  }

  /**
   * Abre la vista de gestión de reportes de asistencia.
   * @param {boolean} [silent=false] - Si true, no muestra preloader.
   */
  async open(silent = false) {
    if (!silent) preloader.show("Cargando Reportes...");
    try {
      if (this.unsubscribeDay) this.unsubscribeDay();
      if (this.unsubscribeMonth) this.unsubscribeMonth();
      if (this.unsubscribeWorkers) this.unsubscribeWorkers();
      if (this.unsubscribeCompanies) this.unsubscribeCompanies();

      const today = getLocalDateString();
      const now = new Date();
      const startOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
      const endOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));

      await this.workerStateManager.ensureLoaded();

      const manageView = new ManageAttendanceView(document.getElementById("admin-layer"));

      let currentDayList = [];
      let currentMonthList = [];
      let currentCompanies = [];

      const acciones = {
        onBack: () => {
          if (this.unsubscribeDay) this.unsubscribeDay();
          if (this.unsubscribeMonth) this.unsubscribeMonth();
          if (this.unsubscribeWorkers) this.unsubscribeWorkers();
          if (this.unsubscribeCompanies) this.unsubscribeCompanies();
          this.navigateTo("#/");
          window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onSave: async (id, data) => {
          try {
            const currentUser = appStore.getState().user;
            const metadata = {
              updatedBy: currentUser?.email || "sistema",
              updatedAt: new Date(),
            };

            let result = false;
            if (id) {
              result = await this.attendanceRepository.updateAttendance(id, {
                ...data,
                ...metadata,
                registroStatus: "editado",
              });
            } else {
              metadata.createdBy = currentUser?.email || "sistema";
              metadata.createdAt = new Date();
              result = await this.attendanceRepository.addAttendance({
                ...data,
                ...metadata,
                registroStatus: "manual",
              });
            }

            if (result) {
              manageView.resetForm();
              toast.success(id ? "Asistencia actualizada" : "Asistencia registrada");
            } else {
              toast.error("No se pudo guardar la asistencia en la base de datos");
            }
          } catch (error) {
            console.error("Error al guardar asistencia:", error);
            toast.error("Error al guardar asistencia");
          }
        },
        onDelete: async (id) => {
          if (
            await dialog.confirm(
              "Eliminar Asistencia",
              "¿Está seguro de eliminar este registro de asistencia?"
            )
          ) {
            try {
              if (await this.attendanceRepository.deleteAttendance(id)) {
                toast.success("Registro eliminado");
              }
            } catch (error) {
              console.error("Error al eliminar asistencia:", error);
              toast.error("Error al eliminar asistencia");
            }
          }
        },
        onEdit: (id) => {
          const a = manageView.allAttendances.find((x) => x.id === id);
          if (a) manageView.prepareEdit(a);
        },
        onRefresh: async (date, silentRefresh = false) => {
          if (!silentRefresh) preloader.show("Actualizando lista...");
          try {
            if (this.unsubscribeDay) this.unsubscribeDay();
            this.unsubscribeDay = this.attendanceRepository.subscribeToAttendanceByDate(date, (dayList) => {
              currentDayList = dayList;
              manageView.updateList(currentDayList, currentMonthList);
            });
          } finally {
            if (!silentRefresh) preloader.hide();
          }
        },
        onDownloadGroupPdf: async (company, start, end, prices = { d: 10, a: 10, c: 10 }) => {
          preloader.show("Generando PDF...");
          try {
            const list = await this.attendanceRepository.getAttendanceByDateRange(start, end);
            let filteredAttendances = list;
            let filteredWorkers = this.workerStateManager.workers;

            if (company) {
              const searchCompany = company.trim().toLowerCase();
              filteredAttendances = list.filter(
                (a) => (a.empresa || "Particular").trim().toLowerCase() === searchCompany
              );
              filteredWorkers = this.workerStateManager.workers.filter(
                (w) => (w.empresa || "Particular").trim().toLowerCase() === searchCompany
              );
            }

            if (filteredAttendances.length === 0)
              return toast.info("No hay datos para el rango y empresa seleccionados.");
            await this.pdfService.generarReporteAsistenciaGrupal(
              company,
              start,
              end,
              filteredAttendances,
              filteredWorkers,
              prices
            );
          } finally {
            preloader.hide();
          }
        },
        onDownloadGroupExcel: async (company, start, end, prices = { d: 10, a: 10, c: 10 }) => {
          preloader.show("Generando Excel...");
          try {
            const list = await this.attendanceRepository.getAttendanceByDateRange(start, end);
            let filteredAttendances = list;
            let filteredWorkers = this.workerStateManager.workers;

            if (company) {
              const searchCompany = company.trim().toLowerCase();
              filteredAttendances = list.filter(
                (a) => (a.empresa || "Particular").trim().toLowerCase() === searchCompany
              );
              filteredWorkers = this.workerStateManager.workers.filter(
                (w) => (w.empresa || "Particular").trim().toLowerCase() === searchCompany
              );
            }

            if (filteredAttendances.length === 0)
              return toast.info("No hay datos para el rango y empresa seleccionados.");
            await this.excelService.generarReporteAsistenciaGrupal(
              company,
              start,
              end,
              filteredAttendances,
              filteredWorkers,
              prices
            );
          } finally {
            preloader.hide();
          }
        },
      };

      manageView.render(
        { day: [], month: [] },
        this.workerStateManager.workers,
        [],
        acciones
      );

      this.unsubscribeMonth = this.attendanceRepository.subscribeToAttendanceByDateRange(startOfMonth, endOfMonth, (monthList) => {
        currentMonthList = monthList;
        manageView.updateList(currentDayList, currentMonthList);
      });

      this.unsubscribeDay = this.attendanceRepository.subscribeToAttendanceByDate(today, (dayList) => {
        currentDayList = dayList;
        manageView.updateList(currentDayList, currentMonthList);
      });

      this.unsubscribeWorkers = this.workerStateManager.subscribe(() => {
        // Al actualizar trabajadores, volvemos a renderizar la vista para que se actualicen los selects
        manageView.render(
          { day: currentDayList, month: currentMonthList },
          this.workerStateManager.workers,
          currentCompanies,
          acciones
        );
      });

      this.unsubscribeCompanies = this.companyRepository.subscribeToCompanies((companies) => {
        currentCompanies = companies;
        manageView.render(
          { day: currentDayList, month: currentMonthList },
          this.workerStateManager.workers,
          currentCompanies,
          acciones
        );
      });

    } finally {
      if (!silent) preloader.hide();
    }
  }
}
