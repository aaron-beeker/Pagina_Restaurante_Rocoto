import { CATEGORIAS_SOLO_MENU_DIARIO } from "../constants/menuCategories.js";
import { auth, googleProvider } from "../services/firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { PdfService } from "../services/PdfService.js";
import { ExcelService } from "../services/ExcelService.js";
import { WorkerRepository } from "../services/WorkerRepository.js";
import { CompanyRepository } from "../services/CompanyRepository.js";
import { AttendanceRepository } from "../services/AttendanceRepository.js";
import { SupremaService } from "../services/SupremaService.js";
import { toast } from "../utils/notifications.js";
import { appStore } from "../utils/Store.js";

// Nuevos Controladores y Vistas
import { AttendanceController } from "./AttendanceController.js";
import { AdminMenuController } from "./AdminMenuController.js";
import { UserRepository } from "../services/UserRepository.js";
import { ManageUsersView } from "../views/ManageUsersView.js";

export class HomeController {
  constructor({ homeView, menuView, menuRepository, restaurantInfo }) {
    this.homeView = homeView;
    this.menuView = menuView;
    this.menuRepository = menuRepository;
    this.restaurantInfo = restaurantInfo;
    
    // Servicios
    this.userRepository = new UserRepository();
    this.pdfService = new PdfService(restaurantInfo);
    const excelService = new ExcelService(restaurantInfo);
    const workerRepository = new WorkerRepository();
    const companyRepository = new CompanyRepository();
    const attendanceRepository = new AttendanceRepository();
    const supremaService = new SupremaService();

    // Estado interno para evitar re-renderizados innecesarios
    this.isUpdating = false;
    this.lastRenderedState = {
        userEmail: "initial",
        activeCategory: "Inicio",
        categoriesJson: ""
    };

    // Inicializar Controladores Especializados
    this.attendanceController = new AttendanceController({
      workerRepository,
      companyRepository,
      attendanceRepository,
      supremaService,
      excelService,
      pdfService: this.pdfService,
      navigateTo: this.navigateTo.bind(this)
    });

    this.adminMenuController = new AdminMenuController({
      menuRepository: this.menuRepository,
      pdfService: this.pdfService,
      navigateTo: this.navigateTo.bind(this)
    });

    // Estado inicial en Store
    appStore.setState({ restaurantInfo });
    
    this.currentHash = window.location.hash || '#/';
    window.addEventListener('hashchange', () => this.handleRouting());
  }

  async initialize() {
    // Suscribirse a cambios de estado para actualizaciones reactivas
    appStore.subscribe(async (state) => {
      if (this.isUpdating) return;
      this.isUpdating = true;
      try {
        await this.updateUI(state);
      } finally {
        this.isUpdating = false;
      }
    });

    onAuthStateChanged(auth, async (user) => {
      let userData = null;
      if (user) {
        const role = await this.userRepository.getUserRole(user.email);
        userData = {
          name: user.displayName.split(' ')[0],
          email: user.email.toLowerCase().trim(),
          role: role
        };
      }
      
      await this.menuRepository.loadAllPlatos();
      
      const [daily, hero] = await Promise.all([
          this.menuRepository.getDailyMenuConfig().catch(() => null),
          this.menuRepository.getHeroPromo().catch(() => null)
      ]);

      appStore.setState({ 
          user: userData,
          dailyMenu: daily || { entradas: [], segundos: [], refrescos: [] },
          heroPromo: hero,
          authInitialized: true 
      });
    });
  }

  /**
   * Orquestador de actualizaciones parciales basadas en el estado.
   */
  async updateUI(state) {
    const hash = window.location.hash || '#/';
    const isHome = hash === '#/' || hash.startsWith('#menu');
    
    // Si no estamos en el home, delegamos el renderizado al router
    if (!isHome) {
        if (state.authInitialized) {
            await this.handleRouting(true);
        }
        return;
    }

    // 1. Asegurar que el Shell estático existe
    this.homeView.renderStaticShell(state.restaurantInfo);
    
    // 2. Actualizaciones quirúrgicas
    this.homeView.updateUserUI(state.restaurantInfo, state.user);
    this.homeView.updateDailyMenuUI(state.dailyMenu);
    this.homeView.updateHeroUI(state.heroPromo);
    this.homeView.updateMobileNavUI(state.restaurantInfo);

    // 3. Re-vincular eventos
    this._bindEvents();
    
    // 4. Conectar y renderizar el menú dinámico
    this.menuView.filterContainer = document.getElementById("menu-filters");
    this.menuView.gridContainer = document.getElementById("menu-grid");
    
    if (this.menuView.gridContainer) {
        await this.renderMenu();
    }
  }

  _bindEvents() {
    const mNav = document.getElementById("mobile-nav-panel");
    const navBtn = document.getElementById("mobile-nav-toggle");
    if (navBtn && mNav) {
        navBtn.onclick = () => mNav.classList.remove("hidden");
        mNav.querySelectorAll(".mobile-nav-link").forEach(link => { 
            link.onclick = () => mNav.classList.add("hidden"); 
        });
        const closeBtn = mNav.querySelector(".close-nav");
        if (closeBtn) closeBtn.onclick = () => mNav.classList.add("hidden");
    }

    const uMenu = document.getElementById("user-menu-panel");
    const uBtn = document.getElementById("user-menu-toggle");
    if (uBtn && uMenu) { 
        uBtn.onclick = () => uMenu.classList.remove("hidden"); 
        const closeUserBtn = uMenu.querySelector(".close-user-menu");
        if (closeUserBtn) closeUserBtn.onclick = () => uMenu.classList.add("hidden");
    }

    const setup = (id, route) => { 
        const b = document.getElementById(id); 
        if (b) b.onclick = () => { if(uMenu) uMenu.classList.add("hidden"); this.navigateTo(route); } 
    };

    setup("admin-daily-menu-btn", "#/admin/menu");
    setup("admin-manage-carta-btn", "#/admin/carta");
    setup("admin-hero-promo-btn", "#/admin/hero");
    setup("admin-fasal-attendance-btn", "#/asistencia");
    setup("admin-fasal-manage-attendance-btn", "#/admin/asistencia");
    setup("admin-fasal-workers-btn", "#/admin/trabajadores");
    setup("admin-fasal-companies-btn", "#/admin/empresas");
    setup("admin-manage-users-btn", "#/admin/users");

    const backBtn = document.getElementById("back-to-home");
    if (backBtn) backBtn.onclick = () => this.navigateTo('#/');

    const backBtnMobile = document.getElementById("back-to-home-mobile");
    if (backBtnMobile) backBtnMobile.onclick = () => this.navigateTo('#/');

    const lBtn = document.getElementById("login-btn-panel"); 
    if (lBtn) lBtn.onclick = () => signInWithPopup(auth, googleProvider);

    const loBtn = document.getElementById("logout-btn"); 
    if (loBtn) loBtn.onclick = () => signOut(auth);
  }

  async handleRouting(force = false) {
    const hash = window.location.hash || '#/';
    const state = appStore.getState();
    
    // Si no se ha inicializado el auth, no tomamos decisiones de redirección
    if (!state.authInitialized) return;

    // Evitar re-renderizado si ya estamos en la misma ruta y no es forzado
    // (Excepto para anclas internas que solo necesitan scroll)
    const internalAnchors = ['#menu-del-dia', '#menu', '#pension', '#contacto'];
    if (!force && hash === this.currentHash && !internalAnchors.includes(hash)) return;
    
    this.currentHash = hash;

    const adminRoutes = ['#/admin/menu', '#/admin/carta', '#/admin/hero', '#/admin/asistencia', '#/admin/trabajadores', '#/admin/empresas', '#/admin/users'];
    
    if (adminRoutes.includes(hash)) {
      if (!state.user || state.user.role !== 'admin') {
        this.currentHash = '#/';
        window.location.hash = '#/';
        return;
      }
    }

    if (internalAnchors.includes(hash)) {
      if (!document.getElementById("nav-container")) { await this.updateUI(state); }
      // El scroll lo maneja el navegador por defecto con el hash
      return;
    }

    switch (hash) {
      case '#/': await this.updateUI(state); break;
      case '#/asistencia': await this.attendanceController.abrirRegistroAsistencia(); break;
      case '#/admin/menu': await this.adminMenuController.abrirSelectorMenuEjecutivo(state.dailyMenu, (newMenu) => { appStore.setState({ dailyMenu: newMenu }); }); break;
      case '#/admin/carta': await this.adminMenuController.abrirPanelGestionCarta(); break;
      case '#/admin/hero': await this.adminMenuController.abrirPanelHeroPromo(); break;
      case '#/admin/asistencia': await this.attendanceController.abrirGestionAsistencias(); break;
      case '#/admin/trabajadores': await this.attendanceController.abrirGestionTrabajadores(); break;
      case '#/admin/empresas': await this.attendanceController.abrirGestionEmpresas(); break;
      case '#/admin/users': await this.abrirGestionUsuarios(); break;
      default: 
        if (hash !== '#/' && !hash.startsWith('#')) {
          this.currentHash = '#/';
          window.location.hash = '#/';
        }
    }
  }

  async abrirGestionUsuarios() {
      const users = await this.userRepository.getAllUsers();
      const view = new ManageUsersView(document.getElementById("app"));
      view.render(users, {
          onAdd: async (email, role) => {
              if (await this.userRepository.setUserRole(email, role)) {
                  toast.success("Usuario autorizado");
                  this.abrirGestionUsuarios();
              }
          },
          onEdit: async (email, role) => {
              if (await this.userRepository.setUserRole(email, role)) {
                  toast.success("Rol actualizado correctamente");
                  this.abrirGestionUsuarios();
              }
          },
          onDelete: async (email) => {
              const state = appStore.getState();
              if (email === state.user.email) return toast.error("No puedes quitarte tus propios permisos");
              if (await this.userRepository.deleteUser(email)) {
                  toast.success("Permisos revocados");
                  this.abrirGestionUsuarios();
              }
          }
      });
  }

  navigateTo(route) { window.location.hash = route; }

  async renderMenu() {
    const state = appStore.getState();
    const dbCats = await this.menuRepository.getCategoriesFromFirestore();
    
    // Función de Super-Normalización (Ignora espacios, mayúsculas y acentos básicos)
    const normalize = (str) => {
        return (str || "")
            .trim()
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Quitar acentos
            .replace(/[^a-z0-9]/g, ""); // Solo letras y números
    };

    const specialNormalized = CATEGORIAS_SOLO_MENU_DIARIO.map(c => normalize(c));
    
    const uniqueCats = Array.from(
        dbCats.reduce((map, cat) => {
            const normalized = normalize(cat.nombre);
            
            if (normalized && !specialNormalized.includes(normalized) && cat.activo !== false) {
                // Si el nombre normalizado ya existe, no lo volvemos a añadir
                if (!map.has(normalized)) {
                    map.set(normalized, cat);
                }
            }
            return map;
        }, new Map()).values()
    );

    // CONTROL DE DUPLICIDAD: Verificar si el estado visual actual es idéntico al solicitado
    const currentCatsJson = JSON.stringify(uniqueCats.map(c => normalize(c.nombre)));
    const currentUserEmail = state.user?.email || null;
    
    if (this.lastRenderedState.activeCategory === state.activeCategory && 
        this.lastRenderedState.categoriesJson === currentCatsJson &&
        this.lastRenderedState.userEmail === currentUserEmail) {
        return; // No re-renderizar si es exactamente lo mismo
    }

    // Actualizar caché de renderizado
    this.lastRenderedState = {
        activeCategory: state.activeCategory,
        categoriesJson: currentCatsJson,
        userEmail: currentUserEmail
    };
    
    if (state.activeCategory === "Inicio") {
        this.menuView.renderCategoryGrid(uniqueCats, (cat) => { 
            appStore.setState({ activeCategory: cat });
            document.getElementById("menu")?.scrollIntoView({ behavior: 'smooth' }); 
        });
    } else {
        const items = this.menuRepository.getByCategory(state.activeCategory);
        this.menuView.renderCategoryDetail(state.activeCategory, items, () => { 
            appStore.setState({ activeCategory: "Inicio" });
        });
    }
  }
}
