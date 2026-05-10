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
      
      const [daily, hero, companies] = await Promise.all([
          this.menuRepository.getDailyMenuConfig().catch(() => null),
          this.menuRepository.getHeroPromo().catch(() => null),
          this.attendanceController.companyRepository.getAllCompanies().catch(() => [])
      ]);

      appStore.setState({ 
          user: userData,
          dailyMenu: daily || { entradas: [], segundos: [], refrescos: [] },
          heroPromo: hero,
          companies: companies,
          authInitialized: true 
      });
    });
  }

  /**
   * Orquestador de actualizaciones parciales basadas en el estado.
   */
  async updateUI(state) {
    const hash = window.location.hash || '#/';
    // Consideramos Home si es la raíz, o si el hash es una sección interna (no empieza con #/admin)
    const isHome = hash === '#/' || hash === '' || (!hash.startsWith('#/admin') && !hash.startsWith('#/'));
    
    // Si no estamos en el home (es una ruta de admin), delegamos el renderizado al router
    if (!isHome) {
        if (state.authInitialized) {
            await this.handleRouting(true);
        }
        return;
    }

    // 1. Asegurar que el Shell estático existe
    this.homeView.renderStaticShell(state.restaurantInfo);
    
    // 2. Actualizaciones quirúrgicas en cascada para suavizar la carga (Top -> Bottom)
    this.homeView.updateUserUI(state.restaurantInfo, state.user);
    
    // Prioridad 1: Hero (Lo primero que ve el usuario)
    requestAnimationFrame(() => {
        this.homeView.updateHeroUI(state.heroPromo);
        
        // Prioridad 2: Menú del Día (Justo debajo del Hero)
        requestAnimationFrame(async () => {
            this.homeView.updateDailyMenuUI(state.dailyMenu);
            this.homeView.updateCompaniesUI(state.companies);
            this.homeView.updateMobileNavUI(state.restaurantInfo);

            // 3. Re-vincular eventos
            this._bindEvents();
            
            // 4. Conectar y renderizar el menú dinámico (La Carta)
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
      { id: "admin-daily-menu-btn", action: () => this.adminMenuController.abrirGestionMenuDiario() },
      { id: "admin-manage-carta-btn", action: () => this.adminMenuController.abrirGestionCarta() },
      { id: "admin-hero-promo-btn", action: () => this.adminMenuController.abrirGestionHero() },
      { id: "admin-fasal-attendance-btn", action: () => this.attendanceController.abrirRegistroAsistencia() },
      { id: "admin-fasal-manage-attendance-btn", action: () => this.attendanceController.abrirGestionAsistencia() },
      { id: "admin-fasal-workers-btn", action: () => this.attendanceController.abrirGestionTrabajadores() },
      { id: "admin-fasal-companies-btn", action: () => this.attendanceController.abrirGestionEmpresas() },
      { id: "admin-manage-users-btn", action: () => this.abrirGestionUsuarios() }
    ];

    adminButtons.forEach(btn => {
      const el = document.getElementById(btn.id);
      if (el) el.onclick = () => {
          btn.action();
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
    const manageView = new ManageUsersView(document.getElementById("app"));
    manageView.render(users, {
      onBack: () => this.navigateTo("#/"),
      onUpdateRole: async (email, role) => {
        if (await this.userRepository.updateUserRole(email, role)) {
          toast.success("Rol actualizado");
          const updatedUsers = await this.userRepository.getAllUsers();
          manageView.renderListOnly(updatedUsers, manageView.acciones.onUpdateRole, manageView.acciones.onDelete);
        }
      },
      onDelete: async (email) => {
        if (await this.userRepository.deleteUser(email)) {
          toast.success("Usuario eliminado");
          const updatedUsers = await this.userRepository.getAllUsers();
          manageView.renderListOnly(updatedUsers, manageView.acciones.onUpdateRole, manageView.acciones.onDelete);
        }
      }
    });
  }

  navigateTo(hash) {
    window.location.hash = hash;
  }

  async handleRouting(fromStateUpdate = false) {
    const hash = window.location.hash || '#/';
    
    // Si el hash no ha cambiado y viene de un cambio de estado, ignorar
    if (fromStateUpdate && hash === this.currentHash) return;
    this.currentHash = hash;

    // Si es Home o un ancla de sección del home
    const isHome = hash === '#/' || hash === '' || (!hash.startsWith('#/admin') && !hash.startsWith('#/'));

    if (isHome) {
      await this.updateUI(appStore.getState());
      return;
    }

    if (hash === '#/admin/menu-diario') {
      await this.adminMenuController.abrirGestionMenuDiario();
    } else if (hash === '#/admin/carta') {
      await this.adminMenuController.abrirGestionCarta();
    } else if (hash === '#/admin/hero') {
      await this.adminMenuController.abrirGestionHero();
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
