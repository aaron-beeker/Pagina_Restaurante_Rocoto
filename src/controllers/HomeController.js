import { CATEGORIAS_SOLO_MENU_DIARIO } from "../constants/menuCategories.js";
import { AdminMenuView } from "../views/AdminMenuView.js";
import { HeroPromoAdminView } from "../views/HeroPromoAdminView.js";
import { menuSeed, recetarioPlatos } from "../data/seed.js";
import { ManageCartaView } from "../views/ManageCartaView.js";
import { ManageWorkersView } from "../views/ManageWorkersView.js";
import { ManageCompaniesView } from "../views/ManageCompaniesView.js";
import { AttendanceView } from "../views/AttendanceView.js";
import { ManageAttendanceView } from "../views/ManageAttendanceView.js";
import { auth, googleProvider } from "../services/firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { PdfService } from "../services/PdfService.js";
import { ExcelService } from "../services/ExcelService.js";
import { WorkerRepository } from "../services/WorkerRepository.js";
import { CompanyRepository } from "../services/CompanyRepository.js";
import { AttendanceRepository } from "../services/AttendanceRepository.js";
import { SupremaService } from "../services/SupremaService.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog } from "../utils/notifications.js";

export class HomeController {
  constructor({ homeView, menuView, menuRepository, restaurantInfo }) {
    this.homeView = homeView;
    this.menuView = menuView;
    this.menuRepository = menuRepository;
    this.restaurantInfo = restaurantInfo;
    this.workerRepository = new WorkerRepository();
    this.companyRepository = new CompanyRepository();
    this.attendanceRepository = new AttendanceRepository();
    this.supremaService = new SupremaService();
    this.excelService = new ExcelService(restaurantInfo);
    this.pdfService = new PdfService(restaurantInfo);
    this.activeCategory = "Inicio";
    this.currentUser = null;
    this.currentDailyMenu = { entradas: ["Sopa"], segundos: ["Chifa"], refrescos: ["Chicha"] };
    
    // Estado persistente para el buscador de admin
    this.lastAdminSearch = "";
    this.lastWorkerSearch = "";

    // Escuchar cambios en la URL
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  async initialize() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const admins = ["beeker147@gmail.com", "mjeanfranco22@gmail.com" , "aliciamattoslimaymanta@gmail.com"];
        this.currentUser = {
          name: user.displayName.split(' ')[0],
          email: user.email.toLowerCase().trim(),
          role: admins.includes(user.email.toLowerCase().trim()) ? "admin" : "client"
        };
      } else { 
        this.currentUser = null; 
      }
      
      // Cargar datos esenciales antes del routing
      await this.menuRepository.loadAllPlatos();
      let daily = null;
      try { daily = await this.menuRepository.getDailyMenuConfig(); } catch (e) {}
      if (daily) this.currentDailyMenu = daily;

      this.handleRouting();
    });
  }

  async handleRouting() {
    const hash = window.location.hash || '#/';
    
    // Resetear scroll al inicio en cada navegación
    window.scrollTo(0, 0);
    
    // Si la ruta es protegida y no hay admin, redirigir a home
    const adminRoutes = ['#/admin/menu', '#/admin/carta', '#/admin/hero', '#/admin/asistencia', '#/admin/trabajadores', '#/admin/empresas'];
    if (adminRoutes.includes(hash) && (!this.currentUser || this.currentUser.role !== 'admin')) {
      window.location.hash = '#/';
      return;
    }

    switch (hash) {
      case '#/':
        await this.renderAll();
        break;
      case '#/asistencia':
        await this.abrirRegistroAsistencia();
        break;
      case '#/admin/menu':
        await this.abrirSelectorMenuEjecutivo();
        break;
      case '#/admin/carta':
        await this.abrirPanelGestionCarta();
        break;
      case '#/admin/hero':
        await this.abrirPanelHeroPromo();
        break;
      case '#/admin/asistencia':
        await this.abrirGestionAsistencias();
        break;
      case '#/admin/trabajadores':
        await this.abrirGestionTrabajadores();
        break;
      case '#/admin/empresas':
        await this.abrirGestionEmpresas();
        break;
      default:
        window.location.hash = '#/';
    }
  }

  // Métodos de navegación que solo cambian el hash
  navigateTo(route) {
    window.location.hash = route;
  }

  async abrirGestionAsistencias() {
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

    const manageView = new ManageAttendanceView(document.getElementById("app"));
    
    const acciones = {
        onBack: () => this.navigateTo('#/'),
        onSave: async (id, data) => {
            if (id) {
                if (await this.attendanceRepository.updateAttendance(id, data)) {
                    toast.success("Asistencia actualizada");
                    acciones.onRefresh(document.getElementById("filter-date").value);
                    manageView.resetForm();
                }
            } else {
                if (await this.attendanceRepository.addAttendance(data)) {
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
            let filtered = list;
            if (company) {
                const searchCompany = company.trim().toLowerCase();
                filtered = list.filter(a => (a.empresa || "Particular").trim().toLowerCase() === searchCompany);
            }
            if (filtered.length === 0) return toast.info("No hay datos para el rango y empresa seleccionados.");
            await this.pdfService.generarReporteAsistenciaGrupal(company, start, end, filtered, prices);
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
    const attendanceView = new AttendanceView(document.getElementById("app"));
    const workers = await this.workerRepository.getAllWorkers();
    const today = getLocalDateString();
    
    const refreshLastRegistrations = async () => {
        const list = await this.attendanceRepository.getAttendanceByDate(today);
        attendanceView.renderLastRegistrations(list);
    };

    const acciones = {
        onBack: () => this.navigateTo('#/'),
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
    let cantidadCampo = 0;
    if (worker.esEncargadoCampo) {
        if (await dialog.confirm("Raciones a Campo", `¿${worker.nombre}, lleva comidas a campo?`)) {
            const input = await dialog.prompt("Cantidad Raciones", "Ingrese la CANTIDAD de raciones que lleva a campo (sin incluir la suya):", "0");
            const cant = parseInt(input);
            if (!isNaN(cant) && cant > 0) cantidadCampo = cant;
            if (cantidadCampo > 0) {
                const tambienCome = await dialog.confirm("Consumo Individual", "¿Usted también consumirá su ración ahora?");
                if (!tambienCome) return await this.registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, false);
            }
        }
    }
    return await this.registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo, true);
  }

  async registrarAsistencia(worker, tipo, today, refreshCb, cantidadCampo = 0, esConsumoPropio = true) {
    const alreadyExists = await this.attendanceRepository.checkIfExists(worker.dni, today, tipo);
    if (alreadyExists && esConsumoPropio && cantidadCampo === 0) return { success: false, error: "Ya registrado hoy" };
    const data = { dni: worker.dni, nombreCompleto: `${worker.apellidos}, ${worker.nombre}`, empresa: worker.empresa || "Particular", tipo, fecha: today, esEncargadoCampo: !!worker.esEncargadoCampo };
    if (cantidadCampo > 0) data.cantidadCampo = cantidadCampo;
    if (!esConsumoPropio) data.soloCampo = true;
    if (await this.attendanceRepository.registerAttendance(data)) {
        await refreshCb();
        return { success: true, workerName: worker.nombre };
    }
    return { success: false, error: "Error al guardar registro" };
  }

  async abrirGestionEmpresas() {
    const companies = await this.companyRepository.getAllCompanies();
    const manageView = new ManageCompaniesView(document.getElementById("app"));
    const acciones = {
        onBack: () => this.navigateTo('#/'),
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
    const manageView = new ManageWorkersView(document.getElementById("app"));
    const acciones = {
        onBack: () => this.navigateTo('#/'),
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
            const attendance = await this.attendanceRepository.getAttendanceByDni(w.dni);
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

  async abrirPanelGestionCarta() {
    const searchInput = document.getElementById("search-product");
    if (searchInput) this.lastAdminSearch = searchInput.value;
    const [platosOriginales, categoriasReales] = await Promise.all([this.menuRepository.getAllFromFirestore(), this.menuRepository.getCategoriesFromFirestore()]);
    const manageView = new ManageCartaView(document.getElementById("app"));
    const acciones = {
        onBack: () => { this.lastAdminSearch = ""; this.navigateTo('#/'); },
        onAdd: async (data) => {
            const id = document.getElementById("edit-id").value;
            if (id ? await this.menuRepository.updatePlato(id, data) : await this.menuRepository.addPlato(data)) this.abrirPanelGestionCarta();
        },
        onDelete: async (id) => { 
            if (await dialog.confirm("Eliminar Producto", "¿Eliminar este producto?")) {
                if (await this.menuRepository.deletePlato(id)) this.abrirPanelGestionCarta();
            }
        },
        onSearch: (q) => {
            this.lastAdminSearch = q;
            const query = q.toLowerCase().trim();
            const filtrados = platosOriginales.filter(p => {
                const coincideNombre = p.name.toLowerCase().includes(query);
                const categories = Array.isArray(p.category) ? p.category : [p.category];
                return coincideNombre || categories.some(c => String(c).toLowerCase().includes(query));
            });
            const container = document.getElementById("table-container");
            if (container) { 
              container.innerHTML = manageView.renderTableBody(filtrados); 
              manageView.attachTableEvents(acciones.onEdit, acciones.onDelete); 
            }
        },
        onEdit: (id) => { const p = platosOriginales.find(x => x.id === id); if (p) manageView.prepareEdit(p); },
        onAddCategory: async (n, u, a) => { if (await this.menuRepository.addCategory(n, u, a)) this.abrirPanelGestionCarta(); },
        onUpdateCategory: async (id, n, an, u, a) => { if (await this.menuRepository.updateCategory(id, n, an, u, a)) this.abrirPanelGestionCarta(); },
        onDeleteCategory: async (id) => { 
            if (await dialog.confirm("Eliminar Categoría", "¿Seguro? Se borrará la categoría pero no los platos.")) {
                if (await this.menuRepository.deleteCategory(id)) this.abrirPanelGestionCarta(); 
            }
        },
        onReorderCategories: async (list) => { if (await this.menuRepository.saveCategoriesOrder(list)) this.abrirPanelGestionCarta(); }
    };
    manageView.render(platosOriginales, categoriasReales, acciones);
    if (this.lastAdminSearch) {
        const newSearchInput = document.getElementById("search-product");
        if (newSearchInput) { newSearchInput.value = this.lastAdminSearch; acciones.onSearch(this.lastAdminSearch); }
    }
  }

  async renderAll() {
    let hero = null;
    try { hero = await this.menuRepository.getHeroPromo(); } catch (e) {}
    this.homeView.renderShell(this.restaurantInfo, this.currentUser, this.currentDailyMenu, hero);
    this.homeView.initSwiper();
    this.menuView.filterContainer = document.getElementById("menu-filters");
    this.menuView.gridContainer = document.getElementById("menu-grid");
    const mNav = document.getElementById("mobile-nav-panel"), uMenu = document.getElementById("user-menu-panel");
    const navBtn = document.getElementById("mobile-nav-toggle");
    if (navBtn) {
        navBtn.onclick = () => mNav.classList.remove("hidden");
        mNav.querySelectorAll(".mobile-nav-link").forEach(link => { link.onclick = () => mNav.classList.add("hidden"); });
        const closeBtn = mNav.querySelector(".close-nav");
        if (closeBtn) closeBtn.onclick = () => mNav.classList.add("hidden");
    }
    const uBtn = document.getElementById("user-menu-toggle");
    if (uBtn) { 
        uBtn.onclick = () => uMenu.classList.remove("hidden"); 
        const closeUserBtn = uMenu.querySelector(".close-user-menu");
        if (closeUserBtn) closeUserBtn.onclick = () => uMenu.classList.add("hidden"); 
    }
    const setup = (id, route) => { const b = document.getElementById(id); if (b) b.onclick = () => { uMenu.classList.add("hidden"); this.navigateTo(route); } };
    setup("admin-daily-menu-btn", "#/admin/menu");
    setup("admin-manage-carta-btn", "#/admin/carta");
    setup("admin-hero-promo-btn", "#/admin/hero");
    setup("admin-fasal-attendance-btn", "#/asistencia");
    setup("admin-fasal-manage-attendance-btn", "#/admin/asistencia");
    setup("admin-fasal-workers-btn", "#/admin/trabajadores");
    setup("admin-fasal-companies-btn", "#/admin/empresas");
    const lBtn = document.getElementById("login-btn-panel"); if (lBtn) lBtn.onclick = () => signInWithPopup(auth, googleProvider);
    const loBtn = document.getElementById("logout-btn"); if (loBtn) loBtn.onclick = () => signOut(auth);
    if (this.menuView.filterContainer) await this.renderMenu();
  }

  async abrirPanelHeroPromo() {
    let d = null; try { d = await this.menuRepository.getHeroPromo(); } catch (e) {}
    const v = new HeroPromoAdminView(document.getElementById("app"));
    v.render(d, {
        onSave: async (p) => { 
            if (await this.menuRepository.saveHeroPromo(p)) { 
                toast.success("Banners guardados correctamente"); 
            }
        },
        onBack: () => this.navigateTo('#/')
    });
  }

  async abrirSelectorMenuEjecutivo() {
    const opc = await this.menuRepository.getOpcionesParaAdmin(), av = new AdminMenuView(document.getElementById('app'));
    av.render(opc.segundos, opc.entradas, opc.refrescos, {
      onSave: async (n) => { if (await this.menuRepository.saveDailyMenu(n)) { this.currentDailyMenu = n; toast.success("Menú actualizado"); } },
      onBack: () => this.navigateTo('#/')
    });
    const pdfBtn = document.getElementById("download-pdf-a3");
    if (pdfBtn) pdfBtn.onclick = async () => await this.pdfService.generarMenuA2(this.currentDailyMenu, await this.menuRepository.loadAllPlatos());
  }

  async renderMenu() {
    const dbCats = await this.menuRepository.getCategoriesFromFirestore();
    const activeCats = dbCats.filter(c => !CATEGORIAS_SOLO_MENU_DIARIO.includes(c.nombre) && c.activo !== false);
    if (this.activeCategory === "Inicio") {
        this.menuView.renderCategoryGrid(activeCats, (cat) => { this.activeCategory = cat; this.renderMenu(); document.getElementById("menu")?.scrollIntoView({ behavior: 'smooth' }); });
    } else {
        const items = this.menuRepository.getByCategory(this.activeCategory);
        this.menuView.renderCategoryDetail(this.activeCategory, items, () => { this.activeCategory = "Inicio"; this.renderMenu(); });
    }
  }
}
