import { ManageAttendanceView } from "../views/ManageAttendanceView.js";
import { AttendanceView } from "../views/AttendanceView.js";
import { ManageWorkersView } from "../views/ManageWorkersView.js";
import { ManageCompaniesView } from "../views/ManageCompaniesView.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog, preloader } from "../utils/notifications.js";
import { appStore } from "../utils/Store.js";

export class AttendanceController {
    constructor(dependencies) {
        this.workerRepository = dependencies.workerRepository;
        this.companyRepository = dependencies.companyRepository;
        this.attendanceRepository = dependencies.attendanceRepository;
        this.supremaService = dependencies.supremaService;
        this.excelService = dependencies.excelService;
        this.pdfService = dependencies.pdfService;
        this.navigateTo = dependencies.navigateTo;
        
        // Estado persistente
        this.lastWorkerSearch = "";
        this._cachedTemplates = null;
        this.workers = [];
        this.workerUnsubscribe = null;
        this.onWorkersUpdate = null; // Callback dinámico para la vista activa
    }

    /**
     * Inicia la suscripción en tiempo real a los trabajadores si no existe.
     * Siempre actualiza el callback para que la vista actual reciba los datos.
     */
    subscribeWorkers(onUpdate) {
        this.onWorkersUpdate = onUpdate;
        
        if (this.workerUnsubscribe) return;
        
        this.workerUnsubscribe = this.workerRepository.subscribeToWorkers((updatedWorkers) => {
            this.workers = updatedWorkers;
            this._cachedTemplates = null;
            if (this.onWorkersUpdate) this.onWorkersUpdate(updatedWorkers);
        });
    }

    /**
     * Obtiene y cachea la lista plana de templates para una búsqueda ultrarrápida.
     */
    _getWorkerTemplates(workers) {
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

    async abrirGestionAsistencia(silent = false) {
        if (!silent) preloader.show("Cargando Reportes...");
        try {
            const today = getLocalDateString();
            const now = new Date();
            const startOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
            const endOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));

            // Asegurar que tenemos trabajadores actualizados
            if (this.workers.length === 0) {
                this.workers = await this.workerRepository.getAllWorkers();
            }

            const [attendances, monthAttendances, companies] = await Promise.all([
                this.attendanceRepository.getAttendanceByDate(today),
                this.attendanceRepository.getAttendanceByDateRange(startOfMonth, endOfMonth),
                this.companyRepository.getAllCompanies()
            ]);

            const manageView = new ManageAttendanceView(document.getElementById("admin-layer"));
            
            const acciones = {
              onBack: () => {
                this.navigateTo("#/");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
                onSave: async (id, data) => {
                    try {
                        const currentUser = appStore.getState().user;
                        const metadata = {
                            updatedBy: currentUser?.email || "sistema",
                            updatedAt: new Date()
                        };

                        let result = false;
                        if (id) {
                            result = await this.attendanceRepository.updateAttendance(id, { ...data, ...metadata, registroStatus: "editado" });
                        } else {
                            metadata.createdBy = currentUser?.email || "sistema";
                            metadata.createdAt = new Date();
                            result = await this.attendanceRepository.addAttendance({ ...data, ...metadata, registroStatus: "manual" });
                        }

                        if (result) {
                            const currentFilterDate = document.getElementById("filter-date")?.value || today;
                            await acciones.onRefresh(currentFilterDate, true);
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
                    if (await dialog.confirm("Eliminar Asistencia", "¿Está seguro de eliminar este registro de asistencia?")) {
                        try {
                            if (await this.attendanceRepository.deleteAttendance(id)) {
                                toast.success("Registro eliminado");
                                await acciones.onRefresh(document.getElementById("filter-date").value, true);
                            }
                        } catch (error) {
                            console.error("Error al eliminar asistencia:", error);
                            toast.error("Error al eliminar asistencia");
                        }
                    }
                },
                onEdit: (id) => {
                    const a = manageView.allAttendances.find(x => x.id === id);
                    if (a) manageView.prepareEdit(a);
                },
                onRefresh: async (date, silentRefresh = false) => {
                    if (!silentRefresh) preloader.show("Actualizando lista...");
                    try {
                        const [dayList, monthList] = await Promise.all([
                            this.attendanceRepository.getAttendanceByDate(date),
                            this.attendanceRepository.getAttendanceByDateRange(startOfMonth, endOfMonth)
                        ]);
                        manageView.updateList(dayList, monthList);
                    } finally {
                        if (!silentRefresh) preloader.hide();
                    }
                },
                onDownloadGroupPdf: async (company, start, end, prices = {d:10, a:10, c:10}) => {
                    preloader.show("Generando PDF...");
                    try {
                        const list = await this.attendanceRepository.getAttendanceByDateRange(start, end);
                        let filteredAttendances = list;
                        let filteredWorkers = this.workers;

                        if (company) {
                            const searchCompany = company.trim().toLowerCase();
                            filteredAttendances = list.filter(a => (a.empresa || "Particular").trim().toLowerCase() === searchCompany);
                            filteredWorkers = this.workers.filter(w => (w.empresa || "Particular").trim().toLowerCase() === searchCompany);
                        }

                        if (filteredAttendances.length === 0) return toast.info("No hay datos para el rango y empresa seleccionados.");
                        await this.pdfService.generarReporteAsistenciaGrupal(company, start, end, filteredAttendances, filteredWorkers, prices);
                    } finally {
                        preloader.hide();
                    }
                },
                onDownloadGroupExcel: async (company, start, end, prices = {d:10, a:10, c:10}) => {
                    preloader.show("Generando Excel...");
                    try {
                        const list = await this.attendanceRepository.getAttendanceByDateRange(start, end);
                        let filteredAttendances = list;
                        let filteredWorkers = this.workers;

                        if (company) {
                            const searchCompany = company.trim().toLowerCase();
                            filteredAttendances = list.filter(a => (a.empresa || "Particular").trim().toLowerCase() === searchCompany);
                            filteredWorkers = this.workers.filter(w => (w.empresa || "Particular").trim().toLowerCase() === searchCompany);
                        }

                        if (filteredAttendances.length === 0) return toast.info("No hay datos para el rango y empresa seleccionados.");
                        await this.excelService.generarReporteAsistenciaGrupal(company, start, end, filteredAttendances, filteredWorkers, prices);
                    } finally {
                        preloader.hide();
                    }
                }
            };

            manageView.render({ day: attendances, month: monthAttendances }, this.workers, companies, acciones);
        } finally {
            if (!silent) preloader.hide();
        }
    }

    async abrirRegistroAsistencia(silent = false) {
        const attendanceView = new AttendanceView(document.getElementById("admin-layer"));
        const today = getLocalDateString();
        
        const refreshLastRegistrations = async () => {
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
            onCheckConnection: async () => {
                return await this.supremaService.checkConnection();
            },
            onScanFingerprint: async (tipo, onStep) => {
                if (this.workers.length === 0) {
                    toast.info("Sincronizando base de datos de huellas... espere un segundo.");
                    return { success: false, error: "Cargando..." };
                }
                try {
                    const captureResult = await this.supremaService.capture(onStep);
                    if (captureResult.retCode !== 0) return { success: false, error: captureResult.error };
                    
                    const capturedTemplate = captureResult.template;
                    const templateList = this._getWorkerTemplates(this.workers);
                    const justTemplates = templateList.map(item => item.template);

                    // PASO 1: Intentar identificación masiva (1:N) en una sola llamada (Súper rápido)
                    const idResult = await this.supremaService.identify(capturedTemplate, justTemplates);
                    if (idResult && idResult.match) {
                        const matchedWorker = templateList[idResult.index]?.worker;
                        if (matchedWorker) return await this.procesarRegistroWorker(matchedWorker, tipo, today, refreshLastRegistrations);
                    }

                    // PASO 2: Fallback a comparación secuencial offline
                    for (let i = 0; i < templateList.length; i++) {
                        const item = templateList[i];
                        if (await this.supremaService.match(item.template, capturedTemplate)) {
                            return await this.procesarRegistroWorker(item.worker, tipo, today, refreshLastRegistrations);
                        }
                    }
                    
                    return { success: false, error: "Huella no reconocida" };
                } catch (e) { return { success: false, error: "Error de conexión" }; }
            },
            onManualDni: async (dni, tipo) => {
                if (this.workers.length === 0) {
                    toast.info("Cargando datos... reintente.");
                    return { success: false, error: "Cargando..." };
                }
                try {
                    const worker = this.workers.find(w => w.dni === dni);
                    if (!worker) return { success: false, error: "DNI no registrado" };
                    return await this.procesarRegistroWorker(worker, tipo, today, refreshLastRegistrations);
                } catch (e) { return { success: false, error: "Error al validar DNI" }; }
            },
            onVerify: async (dni, tipo, onStep) => {
                if (this.workers.length === 0) {
                    toast.info("Cargando datos... reintente.");
                    return { success: false, error: "Cargando..." };
                }
                try {
                    const worker = this.workers.find(w => w.dni === dni);
                    if (!worker) return { success: false, error: "DNI no registrado" };
                    
                    const captureResult = await this.supremaService.capture(onStep);
                    if (captureResult.retCode !== 0) return { success: false, error: captureResult.error };

                    const capturedTemplate = captureResult.template;
                    const templates = worker.huellas || (worker.huella ? [worker.huella] : []);
                    
                    // Verificación OFFLINE
                    for (const t of templates) {
                        if (await this.supremaService.match(t, capturedTemplate)) {
                            return await this.procesarRegistroWorker(worker, tipo, today, refreshLastRegistrations);
                        }
                    }
                    return { success: false, error: "Huella no coincide" };
                } catch (e) { return { success: false, error: "Error de conexión" }; }
            }
        };

        // Renderizado inmediato de la estructura UI
        attendanceView.render(acciones);

        // Carga de datos en segundo plano (Pesado)
        (async () => {
            if (!silent) preloader.show("Sincronizando Lector...");
            try {
                this.subscribeWorkers(() => {
                    // Actualización automática al recibir cambios
                });

                // Carga inicial si no hay datos persistentes
                if (this.workers.length === 0) {
                    this.workers = await this.workerRepository.getAllWorkers();
                }

                await refreshLastRegistrations();
            } catch (error) {
                console.error("Error en la carga de asistencia:", error);
            } finally {
                if (!silent) preloader.hide();
            }
        })();
    }

    async procesarRegistroWorker(worker, tipo, today, refreshCb) {
        // Removido preloader intrusivo para registro rápido
        try {
            // Consultar estado previo del trabajador (Consumo Local específicamente)
            const existing = await this.attendanceRepository.getDetailedAttendance(worker.dni, today, tipo);
            const hasLocal = existing && existing.soloCampo === false;

            // --- CASO 1: TRABAJADOR NORMAL ---
            if (!worker.esEncargadoCampo) {
                if (hasLocal) return { success: false, error: "Ya registrado hoy" };
                return await this.registrarAsistencia(worker, tipo, today, refreshCb, 0, true);
            }

            // --- CASO 2: TRABAJADOR ENCARGADO ---
            // 1. Consulta raciones a campo
            const input = await dialog.prompt("Raciones a Campo", `¿${worker.nombre}, cuántas raciones lleva a campo?`, "0");
            const wasCancelled = (input === null);
            const cantidadCampo = parseInt(input) || 0;

            if (!wasCancelled) {
                // SUB-CASO: Ingresó monto y dio ACEPTAR
                if (hasLocal) {
                    // Camino A: Existe local -> Se genera solo registro de raciones a campo (Independiente)
                    return await this.registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, false);
                } else {
                    // Camino B: No existe local -> Consultar consumo individual
                    const tambienCome = await dialog.confirm("Consumo Individual", "¿Usted también consumirá su ración en el local?");
                    if (tambienCome) {
                        // Camino B1: SÍ -> Generación de reporte ÚNICO (Consumo Local + Consumo Campo)
                        return await this.registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, true);
                    } else {
                        // Camino B2: NO -> Registro solo raciones a campo
                        return await this.registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, false);
                    }
                }
            } else {
                // SUB-CASO: Dio a CANCELAR
                if (hasLocal) {
                    // Camino A: Existe local -> Fin
                    return { success: true, workerName: worker.nombre };
                } else {
                    // Camino B: No existe local -> Consultar consumo individual
                    const tambienCome = await dialog.confirm("Consumo Individual", "¿Usted también consumirá su ración en el local?");
                    if (tambienCome) {
                        // Camino B1: SÍ -> Genera solo consumo local
                        return await this.registrarAsistencia(worker, tipo, today, refreshCb, 0, true);
                    } else {
                        // Camino B2: NO -> Fin (ningún reporte)
                        return { success: true, workerName: worker.nombre };
                    }
                }
            }
        } catch (error) {
            console.error("Error al procesar registro:", error);
            return { success: false, error: "Error interno al procesar" };
        }
    }

    async registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo = 0, esConsumoPropio = true) {
        const currentUser = appStore.getState().user;
        
        // Bloqueo de duplicado de CONSUMO LOCAL (Ración individual)
        if (esConsumoPropio) {
            const existing = await this.attendanceRepository.getDetailedAttendance(worker.dni, today, tipo);
            if (existing && existing.soloCampo === false) return { success: false, error: "Ya registrado hoy" };
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
            cantidadCampo: cantidadCampo
        };
        
        if (await this.attendanceRepository.registerAttendance(data)) {
            await refreshCb();
            return { success: true, workerName: worker.nombre };
        }
        return { success: false, error: "Error al guardar registro" };
    }

    async abrirGestionEmpresas(silent = false) {
        if (!silent) preloader.show("Cargando Empresas...");
        try {
            const companies = await this.companyRepository.getAllCompanies();
            const manageView = new ManageCompaniesView(document.getElementById("admin-layer"));
            const acciones = {
              onBack: () => {
                this.navigateTo("#/");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
                onSave: async (id, data) => {
                    try {
                        if (id ? await this.companyRepository.updateCompany(id, data) : await this.companyRepository.addCompany(data)) {
                            toast.success("Empresa guardada");
                            await this.abrirGestionEmpresas(true);
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
                                await this.abrirGestionEmpresas(true);
                            }
                        } catch (error) {
                            console.error("Error al eliminar empresa:", error);
                            toast.error("Error al eliminar empresa");
                        }
                    }
                },
                onEdit: (id) => {
                    const c = companies.find(x => x.id === id);
                    if (c) manageView.prepareEdit(c);
                }
            };
            manageView.render(companies, acciones);
        } finally {
            if (!silent) preloader.hide();
        }
    }

    async abrirGestionTrabajadores(silent = false) {
        if (!silent) preloader.show("Cargando Personal...");
        try {
            const companies = await this.companyRepository.getAllCompanies();
            const manageView = new ManageWorkersView(document.getElementById("admin-layer"));

            const acciones = {
              onBack: () => {
                this.navigateTo("#/");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
                onSave: async (id, data) => {
                    try {
                        if (id) {
                            if (await this.workerRepository.updateWorker(id, data)) {
                                toast.success("Trabajador actualizado");
                            }
                        } else {
                            if (await this.workerRepository.addWorker(data)) {
                                toast.success("Trabajador registrado");
                            }
                        }
                    } catch (error) { 
                        console.error("Error al guardar trabajador:", error);
                        toast.error(error.message || "Error al guardar trabajador"); 
                    }
                },
                onDelete: async (id) => {
                    if (await dialog.confirm("Eliminar Trabajador", "¿Está seguro de eliminar a este trabajador?")) {
                        try {
                            if (await this.workerRepository.deleteWorker(id)) {
                                toast.success("Trabajador eliminado");
                            }
                        } catch (error) {
                            console.error("Error al eliminar trabajador:", error);
                            toast.error("Error al eliminar trabajador");
                        }
                    }
                },
                onEdit: (id) => {
                    const w = this.workers.find(x => x.id === id);
                    if (w) manageView.prepareEdit(w);
                },
                onCapture: async (onStep) => {
                    const result = await this.supremaService.capture();
                    if (result.retCode === 0) {
                        if (onStep) onStep('captured');
                        return result.template;
                    } else throw new Error(result.error || "Error al capturar");
                },
                onSearch: (q, company) => {
                    // El filtrado ahora ocurre internamente en la vista
                    this.lastWorkerSearch = q;
                    manageView.render(this.workers, acciones, companies);
                },
                onViewDetails: async (id) => {
                    preloader.show("Cargando detalles...");
                    try {
                        const w = this.workers.find(x => x.id === id);
                        if (!w) return;
                        const attendance = (await this.attendanceRepository.getAttendanceByDni(w.dni)).filter(a => !a.soloCampo);
                        manageView.showWorkerDetails(w, attendance, {
                            onDownloadPdf: async (worker, list) => {
                                preloader.show("Generando PDF...");
                                try { await this.pdfService.generarReporteAsistencia(worker, list); }
                                finally { preloader.hide(); }
                            },
                            onDownloadExcel: async (worker, list) => {
                                preloader.show("Generando Excel...");
                                try { await this.excelService.generarReporteAsistencia(worker, list); }
                                finally { preloader.hide(); }
                            }
                        });
                    } finally {
                        preloader.hide();
                    }
                }
            };

            this.subscribeWorkers(() => {
                // Si el contenedor de la lista existe en el DOM, refrescamos la vista completa
                if (document.getElementById("workers-list-container")) {
                    manageView.render(this.workers, acciones, companies);
                }
            });

            // Carga inicial rápida
            if (this.workers.length === 0) {
                this.workers = await this.workerRepository.getAllWorkers();
            }
            
            manageView.render(this.workers, acciones, companies);

            if (this.lastWorkerSearch) {
                const searchInput = document.getElementById("search-worker");
                if (searchInput) { 
                    searchInput.value = this.lastWorkerSearch; 
                    manageView.filters.query = this.lastWorkerSearch;
                    manageView.render(this.workers, acciones, companies);
                }
            }
        } finally {
            if (!silent) preloader.hide();
        }
    }
}
