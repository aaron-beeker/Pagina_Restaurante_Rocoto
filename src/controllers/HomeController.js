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
    this.lastHash = null; // Para rastrear el último hash renderizado
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
      console.log("Auth state changed. User:", user ? user.email : "none");
      let userData = null;
      
      try {
          if (user) {
            const role = await this.userRepository.getUserRole(user.email);
            userData = {
              name: user.displayName?.split(' ')[0] || "Usuario",
              email: user.email.toLowerCase().trim(),
              role: role
            };
          }
          
          console.log("Loading initial data...");
          // Cargar datos con un catch para evitar bloqueos totales
          await this.menuRepository.loadAllPlatos().catch(e => console.error("Error platos:", e));
          
          const [daily, hero] = await Promise.all([
              this.menuRepository.getDailyMenuConfig().catch(() => null),
              this.menuRepository.getHeroPromo().catch(() => null)
          ]);

          let companies = [];
          try {
              companies = await this.attendanceController.companyRepository.getAllCompanies();
          } catch (error) {
              console.warn("Error empresas:", error);
          }

          console.log("Data loaded. Updating state...");
          appStore.setState({ 
              user: userData,
              dailyMenu: daily || { entradas: [], segundos: [], refrescos: [] },
              heroPromo: hero,
              companies: companies,
              authInitialized: true 
          });
      } catch (criticalError) {
          console.error("Critical error in initialize:", criticalError);
          // Forzar inicialización aunque haya error crítico
          appStore.setState({ authInitialized: true });
      }
    });
  }

  /**
   * Orquestador de actualizaciones parciales basadas en el estado.
   */
  async updateUI(state) {
    const hash = window.location.hash || '#/';
    const isHome = hash === '#/' || hash === '' || (!hash.startsWith('#/admin') && !hash.startsWith('#/'));
    
    if (!isHome) {
        if (state.authInitialized) {
            this.homeView.hide(); // Ocultar Home
            await this.handleRouting(true);
            this.homeView.dismissPreloader();
        }
        return;
    }

    // 1. Mostrar restaurante y limpiar Admin
    this.homeView.show();
    this.homeView.renderStaticShell(state.restaurantInfo);
    
    // 2. Actualizar datos dinámicos
    this.homeView.updateUserUI(state.restaurantInfo, state.user);
    
    requestAnimationFrame(() => {
        this.homeView.updateHeroUI(state.heroPromo);
        
        requestAnimationFrame(async () => {
            this.homeView.updateDailyMenuUI(state.dailyMenu);
            this.homeView.updateCompaniesUI(state.companies);
            this.homeView.updateMobileNavUI(state.restaurantInfo);

            if (state.authInitialized) {
                this.homeView.dismissPreloader();
            }

            this._bindEvents();
            
            this.menuView.filterContainer = document.getElementById("menu-filters");
            this.gridContainer = document.getElementById("menu-grid");
            this.menuView.gridContainer = this.gridContainer;
            
            if (this.gridContainer) {
                await this.renderMenu();
            }
        });
    });
  }

  _bindEvents() {
    const mobileNavToggle = document.getElementById("mobile-nav-toggle");
    if (mobileNavToggle) {
      mobileNavToggle.onclick = () => {
        const panel = document.getElementById("mobile-nav-panel");
        if (panel) panel.classList.toggle("hidden");
      };
    }

    const userMenuToggle = document.getElementById("user-menu-toggle");
    if (userMenuToggle) {
      userMenuToggle.onclick = () => {
        const panel = document.getElementById("user-menu-panel");
        if (panel) panel.classList.toggle("hidden");
      };
    }

    // Botones de Admin en el menú de usuario
    const loginBtn = document.getElementById("login-btn-panel");
    if (loginBtn) {
      loginBtn.onclick = () => this.login();
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.onclick = () => this.logout();
    }

    // Links de navegación móvil
    document.querySelectorAll(".mobile-nav-link").forEach(link => {
      link.onclick = () => {
        const panel = document.getElementById("mobile-nav-panel");
        if (panel) panel.classList.add("hidden");
      };
    });

    // Botones de cierre
    document.querySelectorAll(".close-nav, .close-user-menu").forEach(btn => {
        btn.onclick = () => {
            const panel = btn.classList.contains("close-nav") ? "mobile-nav-panel" : "user-menu-panel";
            document.getElementById(panel)?.classList.add("hidden");
        };
    });

    // Botones de gestión admin
    const adminButtons = [
      { id: "admin-daily-menu-btn", route: "#/admin/menu-diario" },
      { id: "admin-manage-carta-btn", route: "#/admin/carta" },
      { id: "admin-hero-promo-btn", route: "#/admin/hero" },
      { id: "admin-fasal-attendance-btn", route: "#/admin/asistencia" },
      { id: "admin-fasal-manage-attendance-btn", route: "#/admin/reportes" },
      { id: "admin-fasal-workers-btn", route: "#/admin/personal" },
      { id: "admin-fasal-companies-btn", route: "#/admin/empresas" },
      { id: "admin-manage-users-btn", route: "#/admin/users" }
    ];

    adminButtons.forEach(btn => {
      const el = document.getElementById(btn.id);
      if (el) el.onclick = () => {
          this.navigateTo(btn.route);
          document.getElementById("user-menu-panel")?.classList.add("hidden");
      };
    });
  }

  async login() {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Bienvenido");
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Error al iniciar sesión");
    }
  }

  async logout() {
    try {
      await signOut(auth);
      appStore.setState({ user: null, activeCategory: "Inicio" });
      toast.info("Sesión cerrada");
      this.navigateTo("#/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async abrirGestionUsuarios() {
    this.navigateTo("#/admin/users");
    const users = await this.userRepository.getAllUsers();
    
    this.homeView.hide(); 
    const adminLayer = this._getCleanAdminLayer();
    const manageView = new ManageUsersView(adminLayer);
    
    manageView.render(users, {
      onBack: () => this.navigateTo("#/"),
      onSave: async (userData, oldEmail) => {
        const { email } = userData;
        
        // Si hay oldEmail y es diferente al nuevo, borrar el viejo primero
        if (oldEmail && oldEmail !== email) {
            await this.userRepository.deleteUser(oldEmail);
        }

        if (await this.userRepository.saveUser(email, userData)) {
          toast.success(oldEmail ? "Usuario actualizado" : "Usuario creado");
          const updatedUsers = await this.userRepository.getAllUsers();
          manageView.render(updatedUsers, manageView.acciones);
        } else {
          toast.error("Error al procesar el usuario");
        }
      },
      onDelete: async (email) => {
        if (await this.userRepository.deleteUser(email)) {
          toast.success("Usuario eliminado");
          const updatedUsers = await this.userRepository.getAllUsers();
          manageView.render(updatedUsers, manageView.acciones);
        }
      }
    });
  }

  navigateTo(hash) {
    if (window.location.hash === hash) {
      this.handleRouting();
    } else {
      window.location.hash = hash;
    }
  }

  async handleRouting(fromStateUpdate = false) {
    const hash = window.location.hash || '#/';
    
    // Si viene de actualización de estado y el hash ya fue renderizado, ignorar
    if (fromStateUpdate && hash === this.lastHash) return;
    this.lastHash = hash;

    // Si es Home o un ancla de sección del home
    const isHome = hash === '#/' || hash === '' || (!hash.startsWith('#/admin') && !hash.startsWith('#/'));

    if (isHome) {
      this.homeView.show(); // Asegurar que el restaurante sea visible
      await this.updateUI(appStore.getState());
      return;
    }

    // --- RUTA DE ADMINISTRACIÓN ---
    this.homeView.hide(); // Ocultar restaurante

    // HARD RESET: Reemplazar el contenedor por uno nuevo para eliminar marcas corruptas de Lit-html
    const adminLayer = this._getCleanAdminLayer();

    if (hash === '#/admin/menu-diario') {
      const state = appStore.getState();
      await this.adminMenuController.abrirGestionMenuDiario(state.dailyMenu, (newMenu) => {
          appStore.setState({ dailyMenu: newMenu });
      });
    } else if (hash === '#/admin/carta') {
      await this.adminMenuController.abrirGestionCarta();
    } else if (hash === '#/admin/hero') {
      await this.adminMenuController.abrirGestionHero((newHero) => {
          appStore.setState({ heroPromo: newHero });
      });
    } else if (hash === '#/admin/asistencia') {
      await this.attendanceController.abrirRegistroAsistencia();
    } else if (hash === '#/admin/reportes') {
      await this.attendanceController.abrirGestionAsistencia();
    } else if (hash === '#/admin/personal') {
      await this.attendanceController.abrirGestionTrabajadores();
    } else if (hash === '#/admin/empresas') {
      await this.attendanceController.abrirGestionEmpresas();
    } else if (hash === '#/admin/users') {
      await this.abrirGestionUsuarios();
    }
    
    // Una vez abierta la vista de admin, quitar el preloader si estaba activo
    this.homeView.dismissPreloader();
  }

  // Helper para limpiar el rastro de errores del DOM (Solución definitiva al error de ChildPart)
  _getCleanAdminLayer() {
      const oldLayer = document.getElementById("admin-layer");
      if (!oldLayer) return null;
      
      const newLayer = oldLayer.cloneNode(false); // Clonar sin hijos
      newLayer.classList.remove("hidden"); // Asegurar que sea visible
      oldLayer.parentNode.replaceChild(newLayer, oldLayer);
      return newLayer;
  }

  async renderMenu() {
    const state = appStore.getState();
    const categories = await this.menuRepository.getCategoriesFromFirestore();
    
    // Normalizar nombres para evitar duplicados por tildes o mayúsculas
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    
    // Obtener categorías únicas filtrando las que son exclusivas del menú diario
    const specialNormalized = CATEGORIAS_SOLO_MENU_DIARIO.map(normalize);
    
    const uniqueCats = categories.filter(cat => {
        const normalized = normalize(cat.nombre);
        return normalized && !specialNormalized.includes(normalized) && cat.activo !== false;
    });

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
            // Eliminado scrollIntoView para permitir que el usuario permanezca en la sección
        });
    } else {
        const items = this.menuRepository.getByCategory(state.activeCategory);
        this.menuView.renderCategoryDetail(state.activeCategory, items, () => { 
            appStore.setState({ activeCategory: "Inicio" });
        });
    }
  }
}
