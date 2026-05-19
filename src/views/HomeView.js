import { html, render } from "lit-html";
import { layout, typography, button, card, form } from "../ui/layout.js";
import Swiper from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import logoSolo from "../assets/img/logo_small_restaurante_rocoto.png";

const LOGO_HORIZONTAL =
  "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png";

export class HomeView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.swiper = null;
    this.companiesSwiper = null;
    this.elements = {};
    this._isFirstLoad = true;

    // Evitar que el navegador restaure la posición del scroll al recargar
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }

  /**
   * Muestra el restaurante y oculta la capa de admin.
   */
  show() {
    this.rootElement.classList.remove("hidden");
    document.body.style.overflow = "auto";
    const adminLayer = document.getElementById("admin-layer");
    if (adminLayer) {
      adminLayer.classList.add("hidden");
      // Limpieza SEGURA usando Lit-html en lugar de innerHTML
      render(html``, adminLayer);
    }
  }

  /**
   * Oculta el restaurante y muestra la capa de admin.
   */
  hide() {
    this.rootElement.classList.add("hidden");
    document.body.style.overflow = "hidden";
    const adminLayer = document.getElementById("admin-layer");
    if (adminLayer) adminLayer.classList.remove("hidden");
  }

  /**
   * Renderiza la estructura base del Home (Marco Global).
   */
  renderStaticShell(restaurantInfo) {
    if (document.getElementById("nav-container")) {
      this._cacheElements();
      return;
    }

    const template = html`
      <!-- Preloader Essence Ultra-Minimalista -->
      <div
        id="main-preloader"
        class="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center transition-opacity duration-800"
      >
        <div
          class="relative flex flex-col items-center gap-6 animate-pulse"
          style="animation-duration: 3s"
        >
          <div class="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
            <img
              src="${logoSolo}"
              class="h-full w-full object-contain opacity-90 brightness-0 invert select-none"
              alt="Rocoto"
            />
            <div
              class="absolute inset-0 -m-2 border-t border-white/20 rounded-full animate-[spin_6s_linear_infinite]"
            ></div>
          </div>
          <div class="flex flex-col items-center">
            <span
              class="text-stone-300 font-medium uppercase tracking-[1.5em] text-[7px] sm:text-[8px] select-none translate-x-[0.75em]"
              >Rocoto</span
            >
          </div>
        </div>
      </div>

      <div id="nav-container"></div>
      <div id="mobile-nav-container"></div>
      <div id="user-menu-container"></div>

      <main
        id="main-content"
        class="bg-[#fafafa] overflow-x-hidden"
      >
        <!-- SECCIÓN: HERO -->
        <div id="hero-container" class="bg-stone-50"></div>

        <!-- SECCIÓN: MENÚ DEL DÍA -->
        <div id="daily-menu-container" class="relative bg-stone-50/50">
          <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div
              class="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-float"
            ></div>
          </div>
        </div>

        <!-- SECCIÓN: NOSOTROS -->
        <div class="bg-white relative">${this._renderAboutUs(restaurantInfo)}</div>

        <!-- SECCIÓN: LA CARTA -->
        <div class="bg-[#f8f8f8] relative border-y border-stone-100">
          <div
            class="absolute top-1/2 left-0 w-80 h-80 bg-primary/5 blur-[100px] rounded-full -translate-x-1/2 animate-float"
            style="animation-delay: 2s"
          ></div>
          ${this._renderMenuSection()}
        </div>

        <!-- SECCIÓN: PENSIÓN -->
        <div class="bg-[#f4f7f5] relative">${this._renderPension(restaurantInfo)}</div>

        <!-- SECCIÓN: CONTACTO -->
        <div class="bg-white relative">
          <div
            class="absolute bottom-0 left-1/2 w-full h-96 bg-stone-50 -translate-x-1/2 -z-0"
          ></div>
          ${this._renderContact(restaurantInfo)}
        </div>

        <div id="global-footer-container">${this._renderFooter(restaurantInfo)}</div>
      </main>
      ${this._renderGlobalStyles()}
    `;

    try {
      render(template, this.rootElement);
    } catch (error) {
      console.warn("Lit-html markers lost, forcing clean render...");
      this.rootElement.innerHTML = "";
      render(template, this.rootElement);
    }

    this._cacheElements();
    this.show();
  }

  _ensurePreloaderVisible() {
    let preloader = document.getElementById("main-preloader");
    const mainContent = document.getElementById("main-content");

    if (!preloader) {
      preloader = document.createElement("div");
      preloader.id = "main-preloader";
      preloader.className =
        "fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center transition-opacity duration-800";
      preloader.innerHTML = `
          <div class="relative flex flex-col items-center gap-6 animate-pulse" style="animation-duration: 3s">
            <div class="relative h-16 w-16 sm:h-20 sm:w-20 flex items-center justify-center">
              <img src="${logoSolo}" class="h-full w-full object-contain opacity-90 brightness-0 invert select-none" alt="Rocoto" />
              <div class="absolute inset-0 -m-2 border-t border-white/20 rounded-full animate-[spin_6s_linear_infinite]"></div>
            </div>
            <div class="flex flex-col items-center">
              <span class="text-stone-300 font-medium uppercase tracking-[1.5em] text-[7px] sm:text-[8px] select-none translate-x-[0.75em]">Rocoto</span>
            </div>
          </div>
        `;
      this.rootElement.prepend(preloader);
    }

    preloader.classList.remove("opacity-0");
    preloader.style.display = "";
    this._isFirstLoad = false;
  }

  _cacheElements() {
    this.elements = {
      nav: document.getElementById("nav-container"),
      mobileNav: document.getElementById("mobile-nav-container"),
      userMenu: document.getElementById("user-menu-container"),
      hero: document.getElementById("hero-container"),
      dailyMenu: document.getElementById("daily-menu-container"),
      companies: document.getElementById("companies-carousel-container"),
      preloader: document.getElementById("main-preloader"),
      mainContent: document.getElementById("main-content"),
    };
  }

  // --- Métodos de Actualización de UI ---

  updateCompaniesUI(companies) {
    if (!this.elements.companies) return;
    render(this._renderCompaniesCarousel(companies), this.elements.companies);
    if (companies && companies.length > 0) this.initCompaniesSwiper();
  }

  updateUserUI(restaurantInfo, user) {
    if (this.elements.nav) render(this._renderNav(user), this.elements.nav);
    if (this.elements.userMenu) render(this._renderUserMenu(user), this.elements.userMenu);
  }

  updateDailyMenuUI(dailyMenu) {
    if (!this.elements.dailyMenu) return;

    // Si el menú no está activo según la configuración de admin, ocultar la sección completa
    if (dailyMenu && dailyMenu.activo === false) {
      this.elements.dailyMenu.classList.add("hidden");
      // También ocultar el link del nav
      const navLink = document.querySelector('a[href="#menu-del-dia"]');
      if (navLink) navLink.classList.add("hidden");
      const mobileNavLink = document.querySelector('a.mobile-nav-link[href="#menu-del-dia"]');
      if (mobileNavLink) mobileNavLink.classList.add("hidden");
      return;
    }

    // Asegurar que sea visible si está activo
    this.elements.dailyMenu.classList.remove("hidden");
    const navLink = document.querySelector('a[href="#menu-del-dia"]');
    if (navLink) navLink.classList.remove("hidden");
    const mobileNavLink = document.querySelector('a.mobile-nav-link[href="#menu-del-dia"]');
    if (mobileNavLink) mobileNavLink.classList.remove("hidden");

    render(this._renderDailyMenu(dailyMenu), this.elements.dailyMenu);
  }

  updateHeroUI(heroPromo) {
    if (!this.elements.hero) return;

    try {
      // Destruir Swiper de forma segura
      if (this.swiper) {
        this.swiper.destroy(true, true);
        this.swiper = null;
      }

      // Clonar el contenedor para limpiarlo por completo de las marcas corruptas de Lit-html
      const newHero = this.elements.hero.cloneNode(false); // Solo el div contenedor
      if (this.elements.hero.parentNode) {
        this.elements.hero.parentNode.replaceChild(newHero, this.elements.hero);
      }
      this.elements.hero = newHero; // Actualizar la referencia

      // Renderizar la nueva estructura en el contenedor limpio
      render(this._renderHero(heroPromo), this.elements.hero);

      // Inicializar el carrusel
      this.initHeroSwiper();
    } catch (error) {
      console.error("Error updating Hero UI:", error);
      try {
        render(this._renderHero(heroPromo), this.elements.hero);
      } catch (innerError) {
        this.elements.hero.innerHTML = '<div class="h-40 bg-stone-100 animate-pulse"></div>';
      }
    }
  }

  updateMobileNavUI() {
    if (this.elements.mobileNav) render(this._renderMobileNav(), this.elements.mobileNav);
  }

  dismissPreloader() {
    if (this.elements.preloader && this.elements.mainContent) {
      if (this.elements.preloader.style.display === "none") return;

      this.elements.preloader.classList.add("opacity-0");

      // FORZAR INICIO AL TOP (0,0) en carga o recarga
      if (this._isFirstLoad) {
        this._isFirstLoad = false;
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });

        // Si hay un hash específico (ej: #contacto), navegar a él después de un pequeño retraso
        const hash = window.location.hash;
        if (hash && hash !== "#/" && hash !== "#") {
          setTimeout(() => {
            const el = document.getElementById(hash.substring(1));
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }
      }

      setTimeout(() => {
        if (this.elements.preloader) this.elements.preloader.style.display = "none";
        document.body.style.overflow = "auto";
      }, 800);
    }
  }

  /**
   * Maneja el clic en el logo para volver al inicio suavemente.
   */
  _handleLogoClick(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    appStore.setState({ activeCategory: "Inicio" });
  }

  // --- Componentes Privados ---

  _renderNav(user) {
    const userColorClass = user ? "text-primary" : "text-stone-400";
    const userBgClass = user ? "bg-primary/5" : "bg-surface-container-low";
    return html` <nav
      class="fixed top-0 z-50 w-full border-b border-surface-variant bg-surface/90 backdrop-blur-md shadow-sm font-sans"
    >
      <div class="${layout.container} flex h-16 items-center justify-between">
        <a href="#/" class="flex shrink-0 items-center" @click=${(e) => this._handleLogoClick(e)}>
          <img alt="Logo" class="h-10 w-auto" src="${LOGO_HORIZONTAL}" />
        </a>
        <div class="hidden items-center gap-8 md:flex">${this._renderNavLinks()}</div>
        <div class="flex items-center gap-2 sm:gap-4">
          <button
            id="user-menu-toggle"
            class="group flex items-center p-1 transition-transform active:scale-95"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full ${userBgClass} border border-surface-variant transition-colors group-hover:border-primary/30"
            >
              <svg
                class="h-6 w-6 ${userColorClass}"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </button>
          <button
            id="mobile-nav-toggle"
            class="p-2 text-on-background md:hidden transition-transform active:scale-95"
          >
            <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>`;
  }

  _renderNavLinks() {
    const links = [
      { href: "#quienes-somos", label: "Nosotros", primary: true },
      { href: "#menu-del-dia", label: "Menú del día" },
      { href: "#menu", label: "La carta" },
      { href: "#pension", label: "Servicio Pensión" },
      { href: "#contacto", label: "Contacto" },
    ];
    return links.map(
      (l) =>
        html`<a
          class="${button.base} ${button.ghost} ${l.primary
            ? "!text-primary hover:!bg-primary/5"
            : "hover:!text-primary"}"
          href="${l.href}"
          >${l.label}</a
        >`
    );
  }

  _renderMobileNav() {
    return html` <div
      id="mobile-nav-panel"
      class="hidden fixed inset-0 z-[100] h-screen w-full font-sans"
    >
      <div
        class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onclick="document.getElementById('mobile-nav-panel').classList.add('hidden')"
      ></div>
      <div
        class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110] animate-slide-in-left"
      >
        <div
          class="flex items-center justify-between p-8 border-b border-stone-100 bg-white shrink-0"
        >
          <a href="#/" @click=${(e) => this._handleLogoClick(e)}>
            <img src="${LOGO_HORIZONTAL}" class="h-10 w-auto brightness-0" />
          </a>
          <button class="close-nav p-2 text-stone-300 hover:text-primary transition-colors">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="flex-1 flex flex-col gap-2 p-6 bg-white overflow-y-auto">
          ${this._renderMobileNavLinks()}
        </div>
      </div>
    </div>`;
  }

  _renderMobileNavLinks() {
    const links = [
      { href: "#quienes-somos", label: "Nosotros" },
      { href: "#menu-del-dia", label: "Menú del día" },
      { href: "#menu", label: "Nuestra Carta" },
      { href: "#pension", label: "Servicio Pensión" },
      { href: "#contacto", label: "Encuéntranos", highlight: true },
    ];
    return links.map(
      (l) => html`
        <a
          class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all ${l.highlight
            ? "hover:bg-emerald-50"
            : "hover:bg-primary/5"}"
          href="${l.href}"
        >
          <span
            class="text-base font-bold text-stone-800 uppercase tracking-tighter ${l.highlight
              ? "group-hover:text-primary"
              : "group-hover:text-primary"} transition-colors font-sans"
            >${l.label}</span
          >
        </a>
      `
    );
  }

  _renderUserMenu(user) {
    return html` <div
      id="user-menu-panel"
      class="hidden fixed inset-0 z-[100] h-screen w-full flex justify-end font-sans"
    >
      <div
        class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
        onclick="document.getElementById('user-menu-panel').classList.add('hidden')"
      ></div>
      <div
        class="relative h-full w-80 sm:w-96 bg-[#fafafa] shadow-2xl flex flex-col z-[110] animate-slide-in-right border-l border-stone-100"
      >
        ${this._renderUserMenuHeader(user)}
        <div class="flex-1 p-6 sm:p-8 flex flex-col gap-10 overflow-y-auto scrollbar-hide">
          ${!user
            ? html`<button
                id="login-btn-panel"
                class="${button.base} ${button.primary} w-full py-5 rounded-2xl font-sans uppercase tracking-widest text-[10px]"
              >
                Entrar con Google
              </button>`
            : ""}
          ${user?.role === "admin" ? this._renderAdminActions() : ""}
          ${user
            ? html` <div class="pt-10 border-t border-stone-100">
                <button
                  id="logout-btn"
                  class="flex items-center gap-4 w-full p-5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all group active:scale-95 font-sans"
                >
                  <div
                    class="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-width="2.5"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                      ></path>
                    </svg>
                  </div>
                  <span class="text-xs font-bold uppercase tracking-widest">Cerrar Sesión</span>
                </button>
              </div>`
            : ""}
        </div>
      </div>
    </div>`;
  }

  _renderUserMenuHeader(user) {
    return html` <div class="bg-white p-8 sm:p-10 border-b border-stone-100 shrink-0">
      <button
        class="close-user-menu absolute top-6 right-6 p-2 text-stone-300 hover:text-primary transition-colors"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="flex items-center gap-5">
        <div
          class="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-emerald-100 shrink-0"
        >
          <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-width="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <div class="min-w-0">
          <p
            class="text-lg font-black text-on-background truncate uppercase tracking-tighter font-display"
          >
            ${user ? user.name : "Invitado"}
          </p>
          <p class="text-[9px] uppercase tracking-[0.3em] text-primary font-black opacity-60">
            ${user ? user.role : "Visitante"}
          </p>
        </div>
      </div>
    </div>`;
  }

  _renderAdminActions() {
    return html` <div class="space-y-6">
      <div class="flex flex-col gap-2">
        <h3 class="${layout.label} px-4 !mb-2 opacity-30">Gestión Restaurante</h3>
        ${this._renderAdminBtn(
          "admin-daily-menu-btn",
          "emerald",
          "M12 6v6m0 0v6m0-6h6m-6 0H6",
          "Menú del Día"
        )}
        ${this._renderAdminBtn(
          "admin-manage-carta-btn",
          "emerald",
          "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
          "Gestionar Carta"
        )}
        ${this._renderAdminBtn(
          "admin-hero-promo-btn",
          "emerald",
          "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
          "Banner Principal"
        )}
      </div>
      <div class="flex flex-col gap-2">
        <h3 class="${layout.label} px-4 !mb-2 opacity-30">Servicio Pensión</h3>
        ${this._renderAdminBtn(
          "admin-fasal-attendance-btn",
          "blue",
          "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
          "Registrar Asistencia"
        )}
        ${this._renderAdminBtn(
          "admin-fasal-manage-attendance-btn",
          "blue",
          "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
          "Reportes de Pensión"
        )}
        ${this._renderAdminBtn(
          "admin-fasal-workers-btn",
          "blue",
          "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
          "Lista de Personal"
        )}
        ${this._renderAdminBtn(
          "admin-fasal-companies-btn",
          "blue",
          "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
          "Empresas Aliadas"
        )}
      </div>
      <div class="flex flex-col gap-2">
        <h3 class="${layout.label} px-4 !mb-2 opacity-30">Seguridad</h3>
        ${this._renderAdminBtn(
          "admin-manage-users-btn",
          "purple",
          "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
          "Control de Accesos"
        )}
      </div>
    </div>`;
  }

  _renderAdminBtn(id, color, svgPath, label) {
    const colors = {
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600",
      blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-600",
      purple: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-600",
    };
    return html`<button
      id="${id}"
      class="flex items-center gap-3 w-full p-4 rounded-2xl ${colors[
        color
      ]} border hover:text-white transition-all duration-300 group/btn shadow-sm active:scale-95 text-left"
    >
      <div
        class="h-10 w-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-width="2" d="${svgPath}" />
        </svg>
      </div>
      <span class="text-xs font-black uppercase tracking-widest">${label}</span>
    </button>`;
  }

  _renderHero(heroPromo) {
    if (!heroPromo)
      return html`<div
        class="w-full h-[450px] sm:h-[650px] bg-stone-50 flex flex-col items-center justify-center relative overflow-hidden"
      >
        <!-- Placeholder neutro sin logo para evitar destellos -->
      </div>`;
    const banners = heroPromo?.banners?.filter((b) => b.activo) || [];
    return html`<section class="relative w-full overflow-hidden bg-background" id="hero">
      <div class="swiper hero-swiper h-full w-full">
        <div class="swiper-wrapper">
          ${banners.length === 0
            ? this._renderHeroPlaceholder()
            : banners.map((b) => this._renderHeroSlide(b))}
        </div>
        <div class="swiper-pagination"></div>
      </div>
    </section>`;
  }

  _renderHeroSlide(banner) {
    return html`<div class="swiper-slide w-full">
      <picture class="w-full"
        ><source media="(max-width: 640px)" srcset="${banner.mobileImageUrl || banner.imageUrl}" />
        <img src="${banner.imageUrl}" class="w-full h-auto block" alt="Banner"
      /></picture>
    </div>`;
  }

  _renderHeroPlaceholder() {
    return html`<div
      class="swiper-slide w-full h-[600px] bg-stone-100 flex items-center justify-center"
    >
      <span class="text-stone-700 font-black uppercase tracking-[0.5em] italic font-display"
        >Rocoto Experience</span
      >
    </div>`;
  }

  _renderDailyMenu(dailyMenu) {
    if (!dailyMenu || (dailyMenu.entradas?.length === 0 && dailyMenu.segundos?.length === 0))
      return html`<div class="max-w-5xl mx-auto py-24 px-4 text-center opacity-30">
        <div class="h-10 w-64 bg-primary/10 mx-auto rounded-full mb-12 animate-pulse"></div>
        <div
          class="relative bg-gradient-to-br from-emerald-50/80 to-white rounded-[3rem] p-12 border border-primary/10 overflow-hidden"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div class="space-y-4">
              <div class="h-3 w-20 bg-primary/10 mx-auto rounded-full"></div>
              <div class="h-6 w-40 bg-primary/10 mx-auto rounded-full animate-pulse"></div>
            </div>
            <div class="space-y-4">
              <div class="h-3 w-20 bg-primary/10 mx-auto rounded-full"></div>
              <div class="h-6 w-48 bg-primary/10 mx-auto rounded-full animate-pulse"></div>
            </div>
            <div class="space-y-4">
              <div class="h-3 w-20 bg-primary/10 mx-auto rounded-full"></div>
              <div class="h-6 w-40 bg-primary/10 mx-auto rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>`;
    return html`<section
      class="relative pt-10 pb-16 sm:pt-12 sm:pb-24 overflow-hidden border-b border-primary/10 bg-gradient-to-b from-emerald-50/30 via-white to-emerald-50/20"
      id="menu-del-dia"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-primary/[0.03] rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none"
      ></div>
      <div class="${layout.container} relative z-10 text-center">
        <div class="max-w-5xl mx-auto">
          ${this._renderSectionHeader(
            "Experiencia Amazónica",
            html`Menú del <span class="text-primary font-black">Día</span>`,
            "Sabor de Casa, Todos los Días."
          )}
          <div class="relative bg-gradient-to-br from-primary to-emerald-800 rounded-[2rem] p-0.5 shadow-xl overflow-hidden">
            <div class="relative bg-white rounded-[1.9rem] overflow-hidden">
              <div
                class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-200/40 to-transparent"
              ></div>
              <div class="p-6 sm:p-10 lg:px-12 lg:py-10 text-center">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
                  <div
                    class="hidden lg:block absolute left-1/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-200/30 to-transparent"
                  ></div>
                  <div
                    class="hidden lg:block absolute left-2/3 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-200/30 to-transparent"
                  ></div>
                  ${this._renderDailyMenuColumn(
                    "Entradas",
                    dailyMenu.entradas || []
                  )}${this._renderDailyMenuColumn(
                    "Fondos",
                    dailyMenu.segundos || [],
                    true
                  )}${this._renderDailyMenuColumn("Refrescos", dailyMenu.refrescos || [])}
                </div>
                ${this._renderDailyMenuFooter()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  _renderDailyMenuColumn(title, items, isSpecial = false) {
    return html`<div class="space-y-6 group">
      <h3 class="${layout.label} !text-primary/70">${title}</h3>
      <ul class="space-y-4">
        ${items.map(
          (item) =>
            html`<li class="flex flex-col items-center gap-1">
              <div class="flex items-center gap-3">
                <span
                  class="w-1.5 h-1.5 rounded-full bg-primary/30 shrink-0 group-hover:bg-primary transition-colors duration-500"
                ></span>
                <span class="${typography.h3} text-primary italic font-display leading-tight"
                  >${item}</span
                >
              </div>
              ${isSpecial
                ? html`<span
                    class="inline-block text-[7px] uppercase tracking-[0.3em] bg-primary/10 text-primary font-bold px-3 py-1 rounded-full"
                    >Especialidad</span
                  >`
                : ""}
            </li>`
        )}
      </ul>
    </div>`;
  }

  _renderDailyMenuFooter() {
    return html`<div
      class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-primary/10 pt-8"
    >
      <div class="flex items-center gap-3 text-left font-sans">
        <div
          class="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-emerald-700 text-white flex items-center justify-center font-black italic text-[10px] shadow-sm"
        >
          R
        </div>
        <div>
          <p class="${layout.label} !mb-0 text-primary/40">Atención</p>
          <p class="text-[10px] font-bold text-stone-700">12:00 PM - 03:30 PM</p>
        </div>
      </div>
      <div class="relative group/price">
        <div
          class="absolute inset-0 bg-primary rounded-xl rotate-2 group-hover/price:rotate-0 transition-transform"
        ></div>
        <div
          class="relative bg-white border-2 border-primary rounded-xl px-8 py-2 flex items-baseline gap-2 shadow-lg"
        >
          <span class="text-xs font-bold text-primary font-sans">S/</span
          ><span class="text-4xl font-black text-primary font-display italic leading-none"
            >8.00</span
          >
        </div>
      </div>
      <p class="${layout.label} text-primary/30 hidden sm:block font-sans">Calidad e Inocuidad</p>
    </div>`;
  }

  _renderAboutUs(restaurantInfo) {
    return html` <section
      id="quienes-somos"
      class="relative py-24 sm:py-32 bg-white scroll-mt-20 overflow-hidden"
    >
      <!-- Sutil textura de fondo -->
      <div class="absolute top-0 right-0 w-1/2 h-full bg-stone-50/50 -z-0"></div>

      <div class="${layout.container} relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center mb-32">
          <!-- Lado Imagen -->
          <div class="lg:col-span-5 order-2 lg:order-1">
            <div class="relative group flex justify-center">
              <!-- Sticker: ligeramente rotado, como pegado a la pared -->
              <div
                class="relative -rotate-[1.5deg] sm:-rotate-[2deg] group-hover:rotate-0 transition-all duration-700 ease-out"
              >
                <!-- Cuerpo del sticker (base blanca + sombra realista) -->
                <div
                  class="relative bg-white rounded-2xl shadow-[8px_8px_30px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.03)] group-hover:shadow-[14px_14px_45px_rgba(0,0,0,0.14)] transition-shadow duration-700"
                >
                  <!-- La imagen PNG sin fondo sobre fondo blanco -->
                  <img
                    src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778388097/FB_IMG_1542216440936-removebg-preview_icr9pc.png"
                    class="block w-full max-w-[320px] h-auto object-contain select-none group-hover:scale-[1.02] transition-transform duration-700"
                    alt="Alicia Mattos"
                  />
                  <!-- Texto impreso en el sticker -->
                  <div class="py-3 px-4 text-center border-t border-stone-100">
                    <p
                      class="text-[7px] uppercase tracking-[0.4em] text-primary font-bold"
                    >
                      El Corazón de Rocoto
                    </p>
                    <h4 class="text-sm font-display italic text-stone-900">Alicia Mattos</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Lado Contenido -->
          <div class="lg:col-span-7 order-1 lg:order-2 space-y-12">
            <div class="max-w-2xl space-y-8">
              <div class="space-y-4">
                <span
                  class="inline-block text-[10px] uppercase tracking-[0.5em] text-primary font-bold border-b border-primary/20 pb-2"
                  >Nuestra Esencia</span
                >
                <h2 class="text-5xl sm:text-7xl font-display italic leading-[1.1] text-stone-950">
                  Sabor que <span class="text-primary font-black not-italic">conecta</span> con la
                  tierra.
                </h2>
              </div>

              <p class="text-lg text-stone-500 leading-relaxed font-light">
                En el corazón de **San Ramón**, fusionamos la riqueza de la selva central con el
                legado de una sazón artesanal que trasciende generaciones.
              </p>

              <div class="relative pl-12 border-l-2 border-stone-100">
                <svg
                  class="absolute left-0 top-0 h-8 w-8 text-primary/10 -translate-x-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M14.017 21L14.017 18C14.017 16.895 14.912 16 16.017 16H19.017C19.569 16 20.017 15.552 20.017 15V9C20.017 8.448 19.569 8 19.017 8H15.017C14.465 8 14.017 8.448 14.017 9V15L11.017 15V9C11.017 6.791 12.808 5 15.017 5H19.017C21.226 5 23.017 6.791 23.017 9V15C23.017 18.866 19.883 22 16.017 22H14.017L14.017 21ZM1.017 21L1.017 18C1.017 16.895 1.912 16 3.017 16H6.017C6.569 16 7.017 15.552 7.017 15V9C7.017 8.448 6.569 8 6.017 8H2.017C1.465 8 1.017 8.448 1.017 9V15L-1.983 15V9C-1.983 6.791 -0.192 5 2.017 5H6.017C8.226 5 10.017 6.791 10.017 9V15C10.017 18.866 6.883 22 3.017 22H1.017L1.017 21Z"
                  ></path>
                </svg>
                <p class="text-2xl sm:text-3xl text-stone-800 font-display italic leading-snug">
                  "La cocina es un acto de amor. Cada plato que sale de nuestra cocina lleva un
                  pedazo de nuestro hogar."
                </p>
                <p class="mt-4 text-[10px] uppercase tracking-[0.3em] font-bold text-stone-400">
                  &mdash; Alicia Mattos, Fundadora
                </p>
              </div>
            </div>
            ${this._renderAboutUsStats()}
          </div>
        </div>

        ${this._renderCommitmentBanner()} ${this._renderSignatureDishes()}
      </div>
    </section>`;
  }

  _renderAboutUsStats() {
    const stats = [
      { val: "100%", label: "Insumos Locales", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
      { val: "Tradición", label: "Cocina de Hogar", icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
      { val: "Amazonía", label: "Nuestra Identidad", icon: "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" },
    ];
    return html` <div class="relative pt-8 mt-8">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <div class="h-px w-16 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent"></div>
        <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z"/>
        </svg>
        <div class="h-px w-16 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent"></div>
      </div>
      <div class="grid grid-cols-3 gap-8 pt-8">
        ${stats.map(
          (s) =>
            html` <div class="space-y-2 text-center">
              <svg class="w-6 h-6 mx-auto text-primary/40" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                <path d="${s.icon}" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            <span class="block text-2xl font-black text-primary italic font-display leading-none"
              >${s.val}</span
            >
            <span class="block text-[8px] uppercase tracking-widest text-primary/60 font-bold"
              >${s.label}</span
            >
          </div>`
        )}
      </div>
    </div>`;
  }

  _renderCommitmentBanner() {
    return html` <div
      class="bg-gradient-to-br from-emerald-950 via-stone-950 to-emerald-950 rounded-[4rem] p-12 sm:p-20 text-white overflow-hidden relative mb-32"
    >
      <div
        class="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] -mr-48 -mt-48"
      ></div>
      <div
        class="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-[100px] -ml-36 -mb-36"
      ></div>

      <div class="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-8">
          <h3 class="text-4xl font-display italic leading-tight">
            Excelencia en cada <span class="text-emerald-300">detalle.</span>
          </h3>
          <p class="text-stone-400 font-light leading-relaxed">
            Nuestro compromiso va más allá del sabor. Implementamos los más altos estándares de
            inocuidad y selección de ingredientes para garantizar una experiencia saludable y
            honesta.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-10 border-l border-primary/20 pl-10">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span class="text-[9px] uppercase tracking-widest text-emerald-300 font-bold"
                >Inocuidad</span
              >
            </div>
            <p class="text-sm font-light text-stone-300 italic">
              Procesos certificados de seguridad alimentaria.
            </p>
          </div>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span class="text-[9px] uppercase tracking-widest text-emerald-300 font-bold"
                >Dirección</span
              >
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-white uppercase tracking-tighter">
                B. Aarón Valdéz Mattos
              </p>
              <p class="text-xs font-bold text-white uppercase tracking-tighter">
                Samuel Fernandez C.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  _renderSignatureDishes() {
    const dishes = [
      {
        img: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392584/Gemini_Generated_Image_9gab2q9gab2q9gab-removebg-preview_lw7exv.png",
        name: "Chaufa de Cecina",
        desc: "Ahumado Artesanal",
      },
      {
        img: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392882/Gemini_Generated_Image_pvazc5pvazc5pvaz-removebg-preview_akr1dd.png",
        name: "Chicharrón de Doncella",
        desc: "Tradición del Río",
      },
      {
        img: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392997/Gemini_Generated_Image_sl2vm5sl2vm5sl2v-removebg-preview_cokfr1.png",
        name: "Tacacho con Cecina",
        desc: "Clásico Amazónico",
      },
    ];
    return html` <div class="space-y-24 mt-20 sm:mt-40">
      <div class="flex flex-col items-center text-center space-y-4">
        <div class="flex items-center gap-3">
          <div class="h-px w-12 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent"></div>
          <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z"/>
          </svg>
          <div class="h-px w-12 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent"></div>
        </div>
        <h2
          class="text-3xl sm:text-4xl font-display italic text-stone-950 uppercase tracking-tighter"
        >
          Platos <span class="text-primary font-black not-italic">Insignia</span>
        </h2>
        <span class="text-[8px] uppercase tracking-[0.6em] text-primary/60 font-bold"
          >Selección de la Casa</span
        >
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-20 lg:gap-24">
        ${dishes.map(
          (d) =>
            html` <div class="group relative flex flex-col items-center text-center space-y-8">
              <div class="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                <div
                  class="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white rounded-full border border-emerald-200/20 group-hover:bg-gradient-to-br group-hover:from-emerald-100 group-hover:to-emerald-50 group-hover:scale-105 group-hover:border-primary/20 transition-all duration-1000"
                ></div>
                <div
                  class="absolute inset-8 border border-dashed border-emerald-200/30 rounded-full group-hover:rotate-45 group-hover:border-primary/20 transition-all duration-1000"
                ></div>
                <div
                  class="absolute inset-4 bg-gradient-to-br from-emerald-200/10 via-transparent to-transparent rounded-full blur-xl"
                ></div>

                <img
                  src="${d.img}"
                  class="relative z-10 w-[110%] max-w-none h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] group-hover:-translate-y-6 group-hover:rotate-2 group-hover:scale-110 transition-all duration-700 select-none"
                  alt="${d.name}"
                />
              </div>

              <div class="space-y-2 relative z-20">
                <h4 class="text-xl sm:text-2xl font-display italic text-stone-900 leading-none">
                  ${d.name}
                </h4>
                <div class="flex items-center justify-center gap-3">
                  <div class="h-px w-4 bg-emerald-200/40"></div>
                  <p class="text-[9px] uppercase tracking-[0.3em] text-primary font-bold">
                    ${d.desc}
                  </p>
                  <div class="h-px w-4 bg-emerald-200/40"></div>
                </div>
              </div>
            </div>`
        )}
      </div>
    </div>`;
  }

  _renderMenuSection() {
    return html` <section
      class="relative pt-12 pb-24 sm:pt-16 sm:pb-32 overflow-hidden scroll-mt-20 bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30"
      id="menu"
    >
      <div
        class="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-primary/[0.03] via-emerald-100/10 to-transparent pointer-events-none"
      ></div>
      <div
        class="absolute -top-6 left-0 w-full overflow-hidden pointer-events-none text-primary/[0.02]"
      >
        <svg class="w-full h-20" viewBox="0 0 1440 80" preserveAspectRatio="none">
          <path d="M0,40 C360,120 1080,-40 1440,40 L1440,80 L0,80 Z" fill="currentColor"/>
        </svg>
      </div>
      <div class="${layout.container} relative z-10">
        <div class="max-w-4xl mb-12 text-left">
          <span class="${layout.label} border-l-4 border-primary pl-4"
            >Experiencia Gastronómica</span
          >
          <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
            <h2 class="${layout.sectionTitle} italic">
              Nuestra <span class="text-primary font-black">Carta</span>
            </h2>
            <p
              class="${typography.bodyLg} italic text-primary/40 max-w-sm border-l border-primary/20 pl-6 hidden lg:block leading-tight"
            >
              Sabores de la selva central que cuentan nuestra historia en cada bocado.
            </p>
          </div>
        </div>
        <div id="menu-filters" class="mb-12"></div>
        <div class="grid grid-cols-1 gap-10" id="menu-grid"></div>
      </div>
    </section>`;
  }

  // --- Componentes Privados: Pensión, Contacto y Footer ---

  _renderPension(restaurantInfo) {
    const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, "")}?text=${encodeURIComponent("¡Hola Rocoto! Deseo información sobre el servicio de pensión.")}`;

    return html` <section
      id="pension"
      class="relative py-24 sm:py-36 overflow-hidden bg-white scroll-mt-20"
    >
      <div class="absolute top-0 left-0 w-full h-px bg-stone-100"></div>

      <div class="${layout.container} relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          <!-- LADO IZQUIERDO: Propuesta de Valor -->
          <div class="lg:col-span-5 space-y-12">
            <div class="space-y-6">
              <span
                class="inline-block text-[10px] uppercase tracking-[0.5em] text-primary font-bold"
                >Soluciones Corporativas</span
              >
              <h2 class="text-5xl sm:text-6xl font-display italic leading-tight text-stone-950">
                Nutrición que impulsa su
                <span class="text-primary font-black not-italic">negocio.</span>
              </h2>
              <p class="text-lg text-stone-500 font-light leading-relaxed">
                Garantizamos la alimentación de su equipo con puntualidad y los más estrictos
                estándares de inocuidad. Una sazón que motiva y rinde.
              </p>
            </div>

            <div class="space-y-4">
              ${this._renderPensionFeature(
                "Higiene Certificada",
                "Protocolos de inocuidad en cada proceso.",
                "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              )}
              ${this._renderPensionFeature(
                "Menús de Hogar",
                "Equilibrio nutricional y sabor artesanal.",
                "M13 10V3L4 14h7v7l9-11h-7z",
                "amber"
              )}
            </div>

            <div class="pt-6">
              <a
                href="${whatsappLink}"
                target="_blank"
                class="inline-flex items-center gap-6 px-10 py-5 bg-stone-950 text-white rounded-full text-[10px] uppercase tracking-[0.4em] font-bold group hover:bg-primary transition-all duration-500 shadow-xl"
              >
                Cotizar Convenio
                <svg
                  class="h-4 w-4 group-hover:translate-x-2 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-width="3" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </a>
            </div>
          </div>

          <!-- LADO DERECHO: Respaldado por el Mercado (Aliados) -->
          <div
            class="lg:col-span-7 bg-stone-50/50 rounded-[3rem] p-8 sm:p-16 border border-stone-100 flex flex-col justify-center space-y-12"
          >
            <div class="space-y-2">
              <span class="text-[9px] uppercase tracking-[0.4em] text-primary font-bold"
                >Trayectoria</span
              >
              <h3 class="text-3xl font-display italic text-stone-900 leading-tight">
                Empresas que respaldan nuestra experiencia.
              </h3>
            </div>

            <div id="companies-carousel-container" class="w-full">
              <!-- El carrusel se inyecta aquí -->
              <div
                class="py-12 text-center text-stone-200 text-[10px] font-bold uppercase tracking-widest animate-pulse"
              >
                Conectando...
              </div>
            </div>

            <p
              class="text-[10px] text-stone-400 font-light leading-relaxed border-t border-stone-100 pt-8 uppercase tracking-widest"
            >
              Más de 5 años brindando soluciones gastronómicas a las principales instituciones de
              San Ramón y Chanchamayo.
            </p>
          </div>
        </div>
      </div>
    </section>`;
  }

  _renderPensionFeature(title, desc, svgPath, color = "primary") {
    const colors = color === "amber" ? "text-emerald-600 bg-emerald-50" : "text-primary bg-primary/5";
    return html` <div class="flex items-center gap-5">
      <div class="h-10 w-10 rounded-xl ${colors} flex items-center justify-center shrink-0">
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-width="2" d="${svgPath}" />
        </svg>
      </div>
      <div>
        <h4 class="text-[11px] font-bold uppercase tracking-widest text-stone-900 leading-none">
          ${title}
        </h4>
        <p class="text-[10px] text-stone-400 font-light uppercase tracking-tighter">${desc}</p>
      </div>
    </div>`;
  }

  _renderCompaniesCarousel(companies) {
    if (!companies || companies.length === 0) return html``;
    return html` <div class="swiper companies-swiper overflow-hidden">
      <div class="swiper-wrapper items-center">
        ${companies.map(
          (c) => html`
            <div
              class="swiper-slide flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
            >
              ${c.logo
                ? html`<img
                    src="${c.logo}"
                    alt="${c.nombre}"
                    class="max-h-16 w-auto object-contain mx-auto"
                  />`
                : html`<span class="text-stone-300 font-bold text-sm uppercase tracking-[0.2em]"
                    >${c.nombre}</span
                  >`}
            </div>
          `
        )}
      </div>
    </div>`;
  }

  _renderContact(restaurantInfo) {
    return html` <section
      id="contacto"
      class="relative py-24 sm:py-36 bg-white overflow-hidden scroll-mt-20"
    >
      <!-- Sutil degradado de fondo para profundidad -->
      <div class="absolute bottom-0 left-0 w-full h-1/2 bg-stone-50/50 -z-0"></div>

      <div class="${layout.container} relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          <!-- LADO IZQUIERDO: Información Editorial -->
          <div class="lg:col-span-5 space-y-12 text-left">
            <div class="space-y-6">
              <span
                class="inline-block text-[10px] uppercase tracking-[0.5em] text-primary font-bold"
                >Ubicación</span
              >
              <h2 class="text-5xl sm:text-7xl font-display italic leading-[1.1] text-stone-950">
                Nuestra
                <span
                  class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8"
                  >Casa</span
                >
              </h2>
              <p class="text-lg text-stone-500 font-light leading-relaxed">
                Te esperamos en el corazón de San Ramón para compartir el sabor de nuestra tierra.
              </p>
            </div>

            <div class="space-y-8">
              ${this._renderContactItem(
                "Visítanos",
                restaurantInfo.address,
                "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              )}
              ${this._renderContactItem(
                "Llámanos",
                restaurantInfo.phone,
                "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
              )}
            </div>

            <div class="pt-4">
              <a
                href="${restaurantInfo.mapsUrl}"
                target="_blank"
                class="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold text-stone-950 hover:text-primary transition-colors group"
              >
                Ver Mapa Completo
                <svg
                  class="h-4 w-4 group-hover:translate-x-2 transition-transform duration-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                </svg>
              </a>
            </div>
          </div>

          <!-- LADO DERECHO: El Mapa (Efecto Zen Branded) -->
          <div class="lg:col-span-7 relative group">
            <!-- Contenedor con fondo de marca para el efecto de tintado -->
            <div
              class="relative aspect-[4/3] sm:aspect-video rounded-[3rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.2)] border-8 border-white bg-stone-100"
            >
              <!-- Mapa con filtros avanzados -->
              <iframe
                src="${restaurantInfo.mapsEmbedUrl}"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                class="grayscale invert contrast-[1.2] opacity-40 mix-blend-luminosity hover:grayscale-0 hover:invert-0 hover:opacity-100 hover:mix-blend-normal transition-all duration-1000"
              ></iframe>

              <!-- Overlay esmeralda sutil para armonizar con el logo -->
              <div
                class="absolute inset-0 bg-primary/10 pointer-events-none group-hover:opacity-0 transition-opacity duration-1000"
              ></div>
            </div>

            <!-- Detalle minimalista (Sello de Marca) -->
            <div
              class="absolute -bottom-6 -right-6 h-32 w-32 bg-stone-950 rounded-full flex flex-col items-center justify-center p-6 text-center shadow-2xl rotate-12 hidden sm:flex border border-white/5"
            >
              <div class="h-[1px] w-8 bg-primary mb-2 opacity-50"></div>
              <span
                class="text-[8px] uppercase tracking-[0.3em] text-stone-400 font-bold leading-tight select-none"
                >Atención Diaria</span
              >
              <div class="h-[1px] w-8 bg-primary mt-2 opacity-50"></div>
            </div>
          </div>
        </div>
      </div>
    </section>`;
  }

  _renderContactItem(label, val, svgPath) {
    return html` <div class="group flex items-start gap-6">
      <div
        class="h-10 w-10 rounded-full bg-stone-50 border border-stone-100 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-width="1.5" d="${svgPath}"></path>
        </svg>
      </div>
      <div class="space-y-1">
        <p class="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-bold">${label}</p>
        <p class="text-sm sm:text-base font-medium text-stone-900 leading-tight">${val}</p>
      </div>
    </div>`;
  }

  _renderFooter(restaurantInfo) {
    const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, "")}?text=${encodeURIComponent("¡Hola Rocoto! Deseo información sobre el servicio de pensión.")}`;
    return html` <footer
      class="bg-stone-900 text-white pt-24 pb-12 overflow-hidden relative font-sans"
    >
      <div class="${layout.container} relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20">
          <div class="md:col-span-5 space-y-10">
            <div class="space-y-6">
              <a href="#/" @click=${(e) => this._handleLogoClick(e)}>
                <img alt="Logo" class="h-14 w-auto brightness-0 invert" src="${LOGO_HORIZONTAL}" />
              </a>
              <p class="text-stone-400 text-sm leading-relaxed max-w-sm italic">
                Fusión de tradición chifa y vanguardia culinaria en el corazón de la selva central.
                Sabores que trascienden el paladar.
              </p>
            </div>
          </div>
          <div class="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
            ${this._renderFooterColumn("Navegación", [
              { href: "#menu-del-dia", label: "Menú Diario" },
              { href: "#menu", label: "La Carta" },
              { href: "#contacto", label: "Visítanos" },
            ])}
            ${this._renderFooterColumn("Pensión", [
              { href: "#pension", label: "Empresas" },
              { href: whatsappLink, label: "Cotizar Plan" },
            ])}
          </div>
        </div>
        <div
          class="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold uppercase tracking-[0.4em] text-stone-500"
        >
          <p>&copy; 2026 ${restaurantInfo.name.toUpperCase()}. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
      </div>
    </footer>`;
  }

  _renderFooterColumn(title, links) {
    return html` <div>
      <h4 class="${layout.label} !text-primary">${title}</h4>
      <ul class="space-y-4">
        ${links.map(
          (l) =>
            html`<li>
              <a
                href="${l.href}"
                class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase"
                >${l.label}</a
              >
            </li>`
        )}
      </ul>
    </div>`;
  }

  // --- Helpers Genéricos de Renderizado ---

  _renderSectionHeader(label, title, subtitle) {
    return html` <div class="mb-10 text-center">
      <span class="${layout.label}">${label}</span>
      <h2 class="${layout.sectionTitle} italic">${title}</h2>
      <p class="${typography.bodyLg} italic text-stone-400 mt-2">${subtitle}</p>
    </div>`;
  }

  _renderGlobalStyles() {
    return html` <style>
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }

      @keyframes loading-dash {
        0% {
          stroke-dashoffset: 283;
          transform: rotate(0deg);
        }
        50% {
          stroke-dashoffset: 70;
          transform: rotate(180deg);
        }
        100% {
          stroke-dashoffset: 283;
          transform: rotate(360deg);
        }
      }

      @keyframes shimmer {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(200%);
        }
      }

      @keyframes float {
        0%,
        100% {
          transform: translateY(0) scale(1);
        }
        50% {
          transform: translateY(-20px) scale(1.05);
        }
      }

      .animate-float {
        animation: float 8s ease-in-out infinite;
      }
    </style>`;
  }

  // --- Inicialización de Swipers ---

  initHeroSwiper() {
    if (this.swiper) {
      this.swiper.destroy(true, true);
      this.swiper = null;
    }

    // Pequeño delay para asegurar que el DOM de Lit-html esté listo y las imágenes cargando
    setTimeout(() => {
      const swiperEl = document.querySelector(".hero-swiper");
      if (!swiperEl) return;

      const slidesCount = swiperEl.querySelectorAll(".swiper-slide").length;
      if (slidesCount === 0) return;

      this.swiper = new Swiper(".hero-swiper", {
        modules: [Navigation, Pagination, Autoplay],
        loop: slidesCount > 1,
        speed: 1000,
        autoplay: slidesCount > 1 ? { delay: 6000, disableOnInteraction: false } : false,
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
        observer: true,
        observeParents: true,
        watchOverflow: true,
      });
    }, 100);
  }

  initCompaniesSwiper() {
    if (this.companiesSwiper) this.companiesSwiper.destroy();
    if (!document.querySelector(".companies-swiper")) return;
    this.companiesSwiper = new Swiper(".companies-swiper", {
      modules: [Autoplay],
      slidesPerView: 2,
      spaceBetween: 20,
      loop: true,
      autoplay: { delay: 2500, disableOnInteraction: false },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 40 },
      },
    });
  }
}
