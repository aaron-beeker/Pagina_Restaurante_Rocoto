import { ManageAttendanceView } from "../views/ManageAttendanceView.js";
import { AttendanceView } from "../views/AttendanceView.js";
import { ManageWorkersView } from "../views/ManageWorkersView.js";
import { ManageCompaniesView } from "../views/ManageCompaniesView.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog } from "../utils/notifications.js";
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
    }

    async abrirGestionAsistencia() {
        const today = getLocalDateString();
        const now = new Date();
        const startOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
        const endOfMonth = getLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));

        const [attendances, monthAttendances, workers, companies] = await Promise.all([
            this.attendanceRepository.getAttendanceByDate(today),
            this.attendanceRepository.getAttendanceByDateRange(startOfMonth, endOfMonth),
            this.workerRepository.getAllWorkers(),
            this.companyRepository.getAllCompanies()
        ]);

        const manageView = new ManageAttendanceView(document.getElementById("admin-layer"));
        
        const acciones = {
          onBack: () => {
            this.navigateTo("#/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
            onSave: async (id, data) => {
                const currentUser = appStore.getState().user;
                const metadata = {
                    updatedBy: currentUser?.email || "sistema",
                    updatedAt: new Date()
                };

                if (id) {
                    if (await this.attendanceRepository.updateAttendance(id, { ...data, ...metadata, registroStatus: "editado" })) {
                        toast.success("Asistencia actualizada");
                        acciones.onRefresh(document.getElementById("filter-date").value);
                        manageView.resetForm();
                    }
                } else {
                    metadata.createdBy = currentUser?.email || "sistema";
                    metadata.createdAt = new Date();
                    if (await this.attendanceRepository.addAttendance({ ...data, ...metadata, registroStatus: "manual" })) {
                        toast.success("Asistencia registrada");
                        acciones.onRefresh(document.getElementById("filter-date").value);
                        manageView.resetForm();
                    }
                }
            },
            onDelete: async (id) => {
                if (await dialog.confirm("Eliminar Asistencia", "¿Está seguro de eliminar este registro de asistencia?")) {
                    if (await this.attendanceRepository.deleteAttendance(id)) {
                        acciones.onRefresh(document.getElementById("filter-date").value);
                    }
                }
            },
            onEdit: (id) => {
                const a = manageView.allAttendances.find(x => x.id === id);
                if (a) manageView.prepareEdit(a);
            },
            onRefresh: async (date) => {
                const [dayList, monthList] = await Promise.all([
                    this.attendanceRepository.getAttendanceByDate(date),
                    this.attendanceRepository.getAttendanceByDateRange(startOfMonth, endOfMonth)
                ]);
                manageView.updateList(dayList, monthList);
            },
            onDownloadGroupPdf: async (company, start, end, prices = {d:10, a:10, c:10}) => {
                const list = await this.attendanceRepository.getAttendanceByDateRange(start, end);
                let filteredAttendances = list;
                let filteredWorkers = workers;

                if (company) {
                    const searchCompany = company.trim().toLowerCase();
                    filteredAttendances = list.filter(a => (a.empresa || "Particular").trim().toLowerCase() === searchCompany);
                    filteredWorkers = workers.filter(w => (w.empresa || "Particular").trim().toLowerCase() === searchCompany);
                }

                if (filteredAttendances.length === 0) return toast.info("No hay datos para el rango y empresa seleccionados.");
                await this.pdfService.generarReporteAsistenciaGrupal(company, start, end, filteredAttendances, filteredWorkers, prices);
            },
            onDownloadGroupExcel: async (company, start, end, prices = {d:10, a:10, c:10}) => {
                const list = await this.attendanceRepository.getAttendanceByDateRange(start, end);
                let filteredAttendances = list;
                let filteredWorkers = workers;

                if (company) {
                    const searchCompany = company.trim().toLowerCase();
                    filteredAttendances = list.filter(a => (a.empresa || "Particular").trim().toLowerCase() === searchCompany);
                    filteredWorkers = workers.filter(w => (w.empresa || "Particular").trim().toLowerCase() === searchCompany);
                }

                if (filteredAttendances.length === 0) return toast.info("No hay datos para el rango y empresa seleccionados.");
                await this.excelService.generarReporteAsistenciaGrupal(company, start, end, filteredAttendances, filteredWorkers, prices);
            }
        };

        manageView.render({ day: attendances, month: monthAttendances }, workers, companies, acciones);
    }

    async abrirRegistroAsistencia() {
        const attendanceView = new AttendanceView(document.getElementById("admin-layer"));
        const workers = await this.workerRepository.getAllWorkers();
        const today = getLocalDateString();
        
        const refreshLastRegistrations = async () => {
            const list = await this.attendanceRepository.getAttendanceByDate(today);
            attendanceView.renderLastRegistrations(list);
        };

        const acciones = {
          onBack: () => {
            this.navigateTo("#/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
            onScanFingerprint: async (tipo) => {
                try {
                    await this.supremaService.init();
                    const captureResult = await this.supremaService.capture();
                    if (captureResult.retCode !== 0) return { success: false, error: "Lector no activado" };
                    const capturedTemplate = captureResult.template;
                    let matchedWorker = null;
                    for (const worker of workers) {
                        const templates = worker.huellas || (worker.huella ? [worker.huella] : []);
                        for (const saved of templates) {
                            const isMatch = await this.supremaService.verify(saved, capturedTemplate);
                            if (isMatch) { matchedWorker = worker; break; }
                        }
                        if (matchedWorker) break;
                    }
                    if (matchedWorker) return await this.procesarRegistroWorker(matchedWorker, tipo, today, refreshLastRegistrations);
                    return { success: false, error: "Huella no reconocida" };
                } catch (e) { return { success: false, error: "Error de conexión" }; }
            },
            onManualDni: async (dni, tipo) => {
                try {
                    const worker = await this.workerRepository.getWorkerByDni(dni);
                    if (!worker) return { success: false, error: "DNI no registrado" };
                    return await this.procesarRegistroWorker(worker, tipo, today, refreshLastRegistrations);
                } catch (e) { return { success: false, error: "Error al validar DNI" }; }
            },
            onVerify: async (dni, tipo) => {
                try {
                    const worker = await this.workerRepository.getWorkerByDni(dni);
                    if (!worker) return { success: false, error: "DNI no registrado" };
                    await this.supremaService.init();
                    const templates = worker.huellas || (worker.huella ? [worker.huella] : []);
                    if (templates.length === 0) return { success: false, error: "No tiene huellas registradas" };
                    let matched = false;
                    for (const saved of templates) {
                        const isMatch = await this.supremaService.verify(saved);
                        if (isMatch) { matched = true; break; }
                    }
                    if (matched) return await this.procesarRegistroWorker(worker, tipo, today, refreshLastRegistrations);
                    return { success: false, error: "Huella no coincide" };
                } catch (e) { return { success: false, error: "Error de conexión" }; }
            }
        };

        attendanceView.render(acciones);
        await refreshLastRegistrations();
    }

    async procesarRegistroWorker(worker, tipo, today, refreshCb) {
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

    async abrirGestionEmpresas() {
        const companies = await this.companyRepository.getAllCompanies();
        const manageView = new ManageCompaniesView(document.getElementById("admin-layer"));
        const acciones = {
          onBack: () => {
            this.navigateTo("#/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
          },
            onSave: async (id, data) => {
                if (id ? await this.companyRepository.updateCompany(id, data) : await this.companyRepository.addCompany(data)) {
                    toast.success("Empresa guardada");
                    this.abrirGestionEmpresas();
                }
            },
            onDelete: async (id) => {
                if (await dialog.confirm("Eliminar Empresa", "¿Está seguro de eliminar esta empresa?")) {
                    if (await this.companyRepository.deleteCompany(id)) this.abrirGestionEmpresas();
                }
            },
            onEdit: (id) => {
                const c = companies.find(x => x.id === id);
                if (c) manageView.prepareEdit(c);
            }
        };
        manageView.render(companies, acciones);
    }

    async abrirGestionTrabajadores() {
        const [workers, companies] = await Promise.all([this.workerRepository.getAllWorkers(), this.companyRepository.getAllCompanies()]);
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
                            this.abrirGestionTrabajadores();
                        }
                    } else {
                        if (await this.workerRepository.addWorker(data)) {
                            toast.success("Trabajador registrado");
                            this.abrirGestionTrabajadores();
                        }
                    }
                } catch (e) { toast.error(e.message); }
            },
            onDelete: async (id) => {
                if (await dialog.confirm("Eliminar Trabajador", "¿Está seguro de eliminar a este trabajador?")) {
                    if (await this.workerRepository.deleteWorker(id)) this.abrirGestionTrabajadores();
                }
            },
            onEdit: (id) => {
                const w = workers.find(x => x.id === id);
                if (w) manageView.prepareEdit(w);
            },
            onCapture: async (onStep) => {
                await this.supremaService.init();
                const result = await this.supremaService.capture();
                if (result.retCode === 0) {
                    if (onStep) onStep('captured');
                    return result.template;
                } else throw new Error(result.error || "Error al capturar");
            },
            onSearch: (q, company) => {
                this.lastWorkerSearch = q;
                const query = q.toLowerCase().trim();
                const filtrados = workers.filter(w => {
                    const coincideBusqueda = w.dni.includes(query) || w.nombre.toLowerCase().includes(query) || w.apellidos.toLowerCase().includes(query);
                    const coincideEmpresa = !company || w.empresa === company;
                    return coincideBusqueda && coincideEmpresa;
                });
                manageView.renderListOnly(filtrados, acciones.onEdit, acciones.onDelete, acciones.onViewDetails);
            },
            onViewDetails: async (id) => {
                const w = workers.find(x => x.id === id);
                if (!w) return;
                const attendance = (await this.attendanceRepository.getAttendanceByDni(w.dni)).filter(a => !a.soloCampo);
                manageView.showWorkerDetails(w, attendance, {
                    onDownloadPdf: async (worker, list) => await this.pdfService.generarReporteAsistencia(worker, list),
                    onDownloadExcel: async (worker, list) => await this.excelService.generarReporteAsistencia(worker, list)
                });
            }
        };
        manageView.render(workers, acciones, companies);
        if (this.lastWorkerSearch) {
            const searchInput = document.getElementById("search-worker");
            if (searchInput) { searchInput.value = this.lastWorkerSearch; acciones.onSearch(this.lastWorkerSearch, ""); }
        }
    }
}
