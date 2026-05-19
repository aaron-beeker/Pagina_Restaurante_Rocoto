import { CATEGORIAS_SOLO_MENU_DIARIO } from "../constants/menuCategories.js";
import { auth, googleProvider } from "../services/firebaseConfig.js";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { PdfService } from "../services/PdfService.js";
import { ExcelService } from "../services/ExcelService.js";
import { WorkerRepository } from "../services/WorkerRepository.js";
import { CompanyRepository } from "../services/CompanyRepository.js";
import { AttendanceRepository } from "../services/AttendanceRepository.js";
import { SupremaService } from "../services/SupremaService.js";
import { toast, preloader } from "../utils/notifications.js";
import { appStore } from "../utils/Store.js";

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

    this.userRepository = new UserRepository();
    this.pdfService = new PdfService(restaurantInfo);
    const excelService = new ExcelService(restaurantInfo);
    const workerRepository = new WorkerRepository();
    const companyRepository = new CompanyRepository();
    const attendanceRepository = new AttendanceRepository();
    const supremaService = new SupremaService();

    this.isUpdating = false;
    this.lastRenderedState = {
      userEmail: "initial",
      activeCategory: "Inicio",
      categoriesJson: "",
    };

    this.attendanceController = new AttendanceController({
      workerRepository,
      companyRepository,
      attendanceRepository,
      supremaService,
      excelService,
      pdfService: this.pdfService,
      navigateTo: null,
    });

    this.adminMenuController = new AdminMenuController({
      menuRepository: this.menuRepository,
      pdfService: this.pdfService,
      navigateTo: null,
    });

    appStore.setState({ restaurantInfo });
  }

  setRouter(router) {
    this.attendanceController.navigate = router.navigate.bind(router);
    this.adminMenuController.navigateTo = router.navigate.bind(router);
    this.navigate = router.navigate.bind(router);
  }

  async initialize() {
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
            name: user.displayName?.split(" ")[0] || "Usuario",
            email: user.email.toLowerCase().trim(),
            role: role,
          };
        }

        console.log("Loading initial data...");
        await this.menuRepository.loadAllPlatos().catch((e) => console.error("Error platos:", e));

        console.log("Data loaded. Updating state...");
        appStore.setState({
          user: userData,
          authInitialized: true,
        });

        // Suscripciones globales para mantener la app actualizada en tiempo real
        this.menuRepository.subscribeToDailyMenuConfig((daily) => {
          appStore.setState({ dailyMenu: daily || { entradas: [], segundos: [], refrescos: [] } });
        });

        this.menuRepository.subscribeToHeroPromo((hero) => {
          appStore.setState({ heroPromo: hero });
        });

        this.menuRepository.subscribeToCategories((categories) => {
          appStore.setState({ categories });
        });

        this.menuRepository.subscribeToPlatos((platos) => {
          appStore.setState({ platosUpdated: Date.now() });
        });
        
        this.attendanceController.companyRepository.subscribeToCompanies((companies) => {
          appStore.setState({ companies });
        });

      } catch (criticalError) {
        console.error("Critical error in initialize:", criticalError);
        appStore.setState({ authInitialized: true });
      }
    });
  }

  async updateUI(state) {
    const hash = window.location.hash || "#/";
    const isHome =
      hash === "#/" || hash === "" || (!hash.startsWith("#/admin") && !hash.startsWith("#/"));

    if (!isHome) {
      if (state.authInitialized) {
        this.homeView.hide();
      }
      this.homeView.dismissPreloader();
      return;
    }

    this.homeView.show();
    this.homeView.renderStaticShell(state.restaurantInfo);

    // Actualizar UI de forma síncrona/directa para que esté lista antes de quitar el velo
    this.homeView.updateUserUI(state.restaurantInfo, state.user);
    this.homeView.updateHeroUI(state.heroPromo);
    this.homeView.updateDailyMenuUI(state.dailyMenu);
    this.homeView.updateCompaniesUI(state.companies);
    this.homeView.updateMobileNavUI();

    this._bindEvents();

    this.menuView.filterContainer = document.getElementById("menu-filters");
    const gridContainer = document.getElementById("menu-grid");
    this.menuView.gridContainer = gridContainer;

    if (gridContainer) {
      await this.renderMenu();
    }

    // SOLO quitar el preloader si tenemos los datos esenciales (Auth + Banner)
    // Esto evita ver el "esqueleto" o el logo pulsando antes de tiempo
    if (state.authInitialized && state.heroPromo) {
      requestAnimationFrame(() => {
        this.homeView.dismissPreloader();
      });
    }
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

    const loginBtn = document.getElementById("login-btn-panel");
    if (loginBtn) {
      loginBtn.onclick = () => this.login();
    }

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.onclick = () => this.logout();
    }

    document.querySelectorAll(".mobile-nav-link").forEach((link) => {
      link.onclick = () => {
        const panel = document.getElementById("mobile-nav-panel");
        if (panel) panel.classList.add("hidden");
      };
    });

    document.querySelectorAll(".close-nav, .close-user-menu").forEach((btn) => {
      btn.onclick = () => {
        const panel = btn.classList.contains("close-nav") ? "mobile-nav-panel" : "user-menu-panel";
        document.getElementById(panel)?.classList.add("hidden");
      };
    });

    const adminButtons = [
      { id: "admin-daily-menu-btn", route: "#/admin/menu-diario" },
      { id: "admin-manage-carta-btn", route: "#/admin/carta" },
      { id: "admin-hero-promo-btn", route: "#/admin/hero" },
      { id: "admin-fasal-attendance-btn", route: "#/admin/asistencia" },
      { id: "admin-fasal-manage-attendance-btn", route: "#/admin/reportes" },
      { id: "admin-fasal-workers-btn", route: "#/admin/personal" },
      { id: "admin-fasal-companies-btn", route: "#/admin/empresas" },
      { id: "admin-manage-users-btn", route: "#/admin/users" },
    ];

    adminButtons.forEach((btn) => {
      const el = document.getElementById(btn.id);
      if (el)
        el.onclick = () => {
          this.navigate(btn.route);
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
      this.navigate("#/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async abrirGestionUsuarios(silent = false) {
    if (!silent) preloader.show("Cargando Usuarios...");
    try {
      const users = await this.userRepository.getAllUsers();

      this.homeView.hide();
      const adminLayer = this._getCleanAdminLayer();
      const manageView = new ManageUsersView(adminLayer);

      manageView.render(users, {
        onBack: () => this.navigate("#/"),
        onSave: async (userData, oldEmail) => {
          try {
            const { email } = userData;

            if (oldEmail && oldEmail !== email) {
              await this.userRepository.deleteUser(oldEmail);
            }

            if (await this.userRepository.saveUser(email, userData)) {
              toast.success(oldEmail ? "Usuario actualizado" : "Usuario creado");
              await this.abrirGestionUsuarios(true);
            } else {
              toast.error("Error al procesar el usuario");
            }
          } catch (error) {
            console.error("Error al guardar usuario:", error);
            toast.error("Error al guardar usuario");
          }
        },
        onDelete: async (email) => {
          try {
            if (await this.userRepository.deleteUser(email)) {
              toast.success("Usuario eliminado");
              await this.abrirGestionUsuarios(true);
            }
          } catch (error) {
            console.error("Error al eliminar usuario:", error);
            toast.error("Error al eliminar usuario");
          }
        },
      });
    } catch (error) {
      console.error("Error al abrir gestión de usuarios:", error);
      toast.error("No se pudieron cargar los usuarios");
    } finally {
      if (!silent) preloader.hide();
    }
  }

  _getCleanAdminLayer() {
    const oldLayer = document.getElementById("admin-layer");
    if (!oldLayer) return null;
    const newLayer = oldLayer.cloneNode(false);
    newLayer.classList.remove("hidden");
    oldLayer.parentNode.replaceChild(newLayer, oldLayer);
    return newLayer;
  }

  async renderMenu() {
    const state = appStore.getState();
    // Use categories from state if available, otherwise fetch as fallback
    const categories = state.categories || await this.menuRepository.getCategoriesFromFirestore();

    const normalize = (str) =>
      str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    const specialNormalized = CATEGORIAS_SOLO_MENU_DIARIO.map(normalize);

    const uniqueCats = categories.filter((cat) => {
      const normalized = normalize(cat.nombre);
      return normalized && !specialNormalized.includes(normalized) && cat.activo !== false;
    });

    const currentCatsJson = JSON.stringify(uniqueCats.map((c) => normalize(c.nombre)));
    const currentUserEmail = state.user?.email || null;
    const currentPlatosUpdated = state.platosUpdated || null;

    if (
      this.lastRenderedState.activeCategory === state.activeCategory &&
      this.lastRenderedState.categoriesJson === currentCatsJson &&
      this.lastRenderedState.userEmail === currentUserEmail &&
      this.lastRenderedState.platosUpdated === currentPlatosUpdated
    ) {
      return;
    }

    this.lastRenderedState = {
      activeCategory: state.activeCategory,
      categoriesJson: currentCatsJson,
      userEmail: currentUserEmail,
      platosUpdated: currentPlatosUpdated,
    };

    if (state.activeCategory === "Inicio") {
      this.menuView.renderCategoryGrid(uniqueCats, (cat) => {
        appStore.setState({ activeCategory: cat });
      });
    } else {
      const items = this.menuRepository.getByCategory(state.activeCategory);
      this.menuView.renderCategoryDetail(state.activeCategory, items, () => {
        appStore.setState({ activeCategory: "Inicio" });
      });
    }
  }
}
