import { appStore } from "./utils/Store.js";

/**
 * Router basado en hash para la aplicación Rocoto.
 * Centraliza 9 rutas y orquesta la conexión entre Views y Controllers.
 */
export class Router {
  /**
   * @param {{homeView: object, homeController: object, attendanceController: object, adminMenuController: object, userRepository: object}} deps - Dependencias inyectadas.
   */
  constructor({
    homeView,
    homeController,
    attendanceController,
    adminMenuController,
    userRepository,
  }) {
    /** @type {object} */
    this.homeView = homeView;
    /** @type {object} */
    this.homeController = homeController;
    /** @type {object} */
    this.attendanceController = attendanceController;
    /** @type {object} */
    this.adminMenuController = adminMenuController;
    /** @type {object} */
    this.userRepository = userRepository;
    /** @type {string|null} */
    this.lastHash = null;

    /** @type {Record<string, Function>} */
    this.routes = this._defineRoutes();
  }

  /**
   * Define el mapa de rutas hash a handlers.
   * @returns {Record<string, Function>}
   */
  _defineRoutes() {
    return {
      "#/": () => this._handleHome(),
      "#/admin/menu-diario": () => this._handleAdminMenuDiario(),
      "#/admin/carta": () => this._handleAdminCarta(),
      "#/admin/hero": () => this._handleAdminHero(),
      "#/admin/asistencia": () => this._handleAdminAsistencia(),
      "#/admin/reportes": () => this._handleAdminReportes(),
      "#/admin/personal": () => this._handleAdminPersonal(),
      "#/admin/empresas": () => this._handleAdminEmpresas(),
      "#/admin/users": () => this._handleAdminUsers(),
    };
  }

  /**
   * Inicia el listener de hashchange y resuelve la ruta actual.
   */
  start() {
    window.addEventListener("hashchange", () => this.resolve());
    this.resolve();
  }

  /**
   * Navega a un hash específico.
   * @param {string} hash - Hash de destino (ej: "#/admin/menu-diario").
   */
  navigate(hash) {
    if (window.location.hash === hash) {
      this.resolve();
    } else {
      window.location.hash = hash;
    }
  }

  /**
   * Resuelve la ruta actual basada en el hash de la URL.
   * @param {boolean} [fromStateUpdate=false] - Si viene de una actualización de estado.
   */
  resolve(fromStateUpdate = false) {
    const hash = window.location.hash || "#/";

    if (fromStateUpdate && hash === this.lastHash) return;
    this.lastHash = hash;

    const handler = this.routes[hash];

    if (handler) {
      handler();
    } else if (this._isHomeHash(hash)) {
      this._handleHome();
    } else {
      this.navigate("#/");
    }
  }

  /**
   * Determina si un hash corresponde a la vista home.
   * @param {string} hash - Hash a evaluar.
   * @returns {boolean}
   */
  _isHomeHash(hash) {
    return hash === "#/" || hash === "" || (!hash.startsWith("#/admin") && !hash.startsWith("#/"));
  }

  /**
   * Reemplaza el admin-layer con una copia limpia sin contenido previo.
   * @returns {HTMLElement|null}
   */
  _getCleanAdminLayer() {
    const oldLayer = document.getElementById("admin-layer");
    if (!oldLayer) return null;
    const newLayer = oldLayer.cloneNode(false);
    newLayer.classList.remove("hidden");
    oldLayer.parentNode.replaceChild(newLayer, oldLayer);
    return newLayer;
  }

  /** Handler para la ruta home. */
  _handleHome() {
    this.homeView.show();
    this.homeController.updateUI(appStore.getState());
  }

  /** Handler para gestión de menú diario. */
  _handleAdminMenuDiario() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    const state = appStore.getState();
    this.adminMenuController.abrirGestionMenuDiario(state.dailyMenu, (newMenu) => {
      appStore.setState({ dailyMenu: newMenu });
    });
  }

  /** Handler para gestión de carta. */
  _handleAdminCarta() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    this.adminMenuController.abrirGestionCarta();
  }

  /** Handler para gestión de promoción hero. */
  _handleAdminHero() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    this.adminMenuController.abrirGestionHero((newHero) => {
      appStore.setState({ heroPromo: newHero });
    });
  }

  /** Handler para registro de asistencia. */
  _handleAdminAsistencia() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    this.attendanceController.abrirRegistroAsistencia();
  }

  /** Handler para reportes de asistencia. */
  _handleAdminReportes() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    this.attendanceController.abrirGestionAsistencia();
  }

  /** Handler para gestión de trabajadores. */
  _handleAdminPersonal() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    this.attendanceController.abrirGestionTrabajadores();
  }

  /** Handler para gestión de empresas. */
  _handleAdminEmpresas() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    this.attendanceController.abrirGestionEmpresas();
  }

  /** Handler para gestión de usuarios. */
  async _handleAdminUsers() {
    this.homeView.hide();
    this._getCleanAdminLayer();
    await this.homeController.abrirGestionUsuarios();
  }
}
