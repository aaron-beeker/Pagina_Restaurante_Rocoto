import { html, render } from 'lit-html';
import { layout, typography, button, card, form } from "../ui/layout.js";
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const LOGO_HORIZONTAL = "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png";

export class HomeView {
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.swiper = null;
        this.companiesSwiper = null;
        this.elements = {}; 
        this._initialScrollDone = false;
    }

    /**
     * Muestra el restaurante y oculta la capa de admin.
     */
    show() {
        this.rootElement.classList.remove("hidden");
        const adminLayer = document.getElementById("admin-layer");
        if (adminLayer) {
            adminLayer.classList.add("hidden");
            adminLayer.innerHTML = ""; 
        }
    }

    /**
     * Oculta el restaurante y muestra la capa de admin.
     */
    hide() {
        this.rootElement.classList.add("hidden");
        const adminLayer = document.getElementById("admin-layer");
        if (adminLayer) adminLayer.classList.remove("hidden");
    }

    /**
     * Renderiza la estructura base del Home (Shell estático).
     */
    renderStaticShell(restaurantInfo) {
      if (document.getElementById("nav-container")) {
        this.show();
        this._cacheElements();
        return;
      }

      const template = html`
        <!-- Preloader Full Screen -->
        <div id="main-preloader" class="fixed inset-0 z-[1000] bg-stone-950 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700">
            <div class="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-50"></div>
            <div class="relative z-10 flex flex-col items-center gap-8">
                <div class="h-24 w-24 rounded-full border-2 border-primary/30 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(27,94,52,0.3)]">
                    <span class="text-5xl font-black text-primary italic font-display">R</span>
                </div>
                <div class="flex flex-col items-center text-center px-4">
                    <span class="text-white/60 font-black uppercase tracking-[0.8em] text-xs sm:text-sm animate-pulse mb-3">Rocoto Experience</span>
                    <div class="h-[1px] w-24 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                </div>
            </div>
            <div class="absolute bottom-12 text-white/20 text-[9px] font-bold uppercase tracking-[0.5em] italic">San Ramón &bull; Chanchamayo</div>
        </div>

        <div id="nav-container"></div>
        <div id="mobile-nav-container"></div>
        <div id="user-menu-container"></div>
        
        <main id="main-content" class="bg-[#fafafa] opacity-0 transition-opacity duration-1000">
          <div id="hero-container" class="bg-white"></div>
          <div id="daily-menu-container" class="bg-white"></div>
          
          ${this._renderAboutUs(restaurantInfo)}
          ${this._renderMenuSection()}
          
          <div class="bg-stone-50 border-y border-stone-100">
            ${this._renderPension(restaurantInfo)}
          </div>

          ${this._renderContact(restaurantInfo)}
          <div id="global-footer-container">
            ${this._renderFooter(restaurantInfo)}
          </div>
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
      
      this._handleInitialScroll();
      this._cacheElements();
      this.show();
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
            mainContent: document.getElementById("main-content")
        };
    }

    // --- Métodos de Actualización de UI (Puntos de entrada) ---

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
        render(this._renderDailyMenu(dailyMenu), this.elements.dailyMenu);
    }

    updateHeroUI(heroPromo) {
        if (!this.elements.hero) return;
        render(this._renderHero(heroPromo), this.elements.hero);
        if (heroPromo?.banners?.length > 0) this.initHeroSwiper();
    }

    updateMobileNavUI() {
        if (this.elements.mobileNav) render(this._renderMobileNav(), this.elements.mobileNav);
    }

    dismissPreloader() {
        if (this.elements.preloader && this.elements.mainContent) {
            this.elements.preloader.classList.add("opacity-0");
            this.elements.mainContent.classList.remove("opacity-0");
            this.elements.mainContent.classList.add("opacity-100");
            
            setTimeout(() => {
                this.elements.preloader.style.display = "none";
                document.body.style.overflow = "auto";
            }, 700);
        }
    }

    // --- Componentes Privados: Navegación ---

    _renderNav(user) {
        const userColorClass = user ? "text-primary" : "text-stone-400";
        const userBgClass = user ? "bg-primary/5" : "bg-surface-container-low";
        
        return html`
         <nav class="fixed top-0 z-50 w-full border-b border-surface-variant bg-surface/90 backdrop-blur-md shadow-sm font-sans">
           <div class="${layout.container} flex h-16 items-center justify-between">
              <a href="#/" class="flex shrink-0 items-center">
                 <img alt="Logo" class="h-10 w-auto" src="${LOGO_HORIZONTAL}" />
              </a>
              <div class="hidden items-center gap-8 md:flex">
                 ${this._renderNavLinks()}
              </div>
              <div class="flex items-center gap-2 sm:gap-4">
                 <button id="user-menu-toggle" class="group flex items-center p-1 transition-transform active:scale-95">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full ${userBgClass} border border-surface-variant transition-colors group-hover:border-primary/30">
                        <svg class="h-6 w-6 ${userColorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                 </button>
                 <button id="mobile-nav-toggle" class="p-2 text-on-background md:hidden transition-transform active:scale-95">
                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
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
            { href: "#contacto", label: "Contacto" }
        ];
        return links.map(l => html`
            <a class="${button.base} ${button.ghost} ${l.primary ? '!text-primary hover:!bg-primary/5' : 'hover:!text-primary'}" href="${l.href}">${l.label}</a>
        `);
    }

    _renderMobileNav() {
        return html`
          <div id="mobile-nav-panel" class="hidden fixed inset-0 z-[100] h-screen w-full font-sans">
            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onclick="document.getElementById('mobile-nav-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110] animate-slide-in-left">
                <div class="flex items-center justify-between p-8 border-b border-stone-100 bg-white shrink-0">
                  <img src="${LOGO_HORIZONTAL}" class="h-10 w-auto brightness-0">
                  <button class="close-nav p-2 text-stone-300 hover:text-primary transition-colors">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
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
            { href: "#contacto", label: "Encuéntranos", highlight: true }
        ];
        return links.map(l => html`
            <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all ${l.highlight ? 'hover:bg-amber-50' : 'hover:bg-primary/5'}" href="${l.href}">
                <span class="text-base font-bold text-stone-800 uppercase tracking-tighter ${l.highlight ? 'group-hover:text-amber-700' : 'group-hover:text-primary'} transition-colors font-sans">${l.label}</span>
            </a>
        `);
    }

    _renderUserMenu(user) {
        return html`
          <div id="user-menu-panel" class="hidden fixed inset-0 z-[100] h-screen w-full flex justify-end font-sans">
            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onclick="document.getElementById('user-menu-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 sm:w-96 bg-[#fafafa] shadow-2xl flex flex-col z-[110] animate-slide-in-right border-l border-stone-100">
                ${this._renderUserMenuHeader(user)}
                <div class="flex-1 p-6 sm:p-8 flex flex-col gap-10 overflow-y-auto scrollbar-hide">
                  ${!user ? html`
                    <button id="login-btn-panel" class="${button.base} ${button.primary} w-full py-5 rounded-2xl font-sans uppercase tracking-widest text-[10px]">
                      Entrar con Google
                    </button>
                  ` : ''}

                  ${user?.role === 'admin' ? this._renderAdminActions() : ''}

                  ${user ? html`
                    <div class="pt-10 border-t border-stone-100">
                      <button id="logout-btn" class="flex items-center gap-4 w-full p-5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all group active:scale-95 font-sans">
                        <div class="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                        </div>
                        <span class="text-xs font-bold uppercase tracking-widest">Cerrar Sesión</span>
                      </button>
                    </div>` : ''}
                </div>
                <div class="p-8 border-t border-stone-100 bg-white text-center">
                   <p class="text-[8px] font-black uppercase tracking-[0.5em] text-stone-200 italic font-sans">Rocoto Experience &copy; 2026</p>
                </div>
            </div>
          </div>`;
    }

    _renderUserMenuHeader(user) {
        return html`
            <div class="bg-white p-8 sm:p-10 border-b border-stone-100 shrink-0">
                <button class="close-user-menu absolute top-6 right-6 p-2 text-stone-300 hover:text-primary transition-colors">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <div class="flex items-center gap-5">
                <div class="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-emerald-100 shrink-0">
                    <svg class="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="min-w-0">
                    <p class="text-lg font-black text-on-background truncate uppercase tracking-tighter font-display">${user ? user.name : 'Invitado'}</p>
                    <p class="text-[9px] uppercase tracking-[0.3em] text-primary font-black opacity-60">${user ? user.role : 'Visitante'}</p>
                </div>
                </div>
            </div>`;
    }

    _renderAdminActions() {
        return html`
            <div class="space-y-6">
                <!-- GESTIÓN GASTRONÓMICA -->
                <div class="flex flex-col gap-2">
                <h3 class="${layout.label} px-4 !mb-2 opacity-30">Gestión Restaurante</h3>
                ${this._renderAdminBtn("admin-daily-menu-btn", "emerald", "M12 6v6m0 0v6m0-6h6m-6 0H6", "Menú del Día")}
                ${this._renderAdminBtn("admin-manage-carta-btn", "emerald", "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z", "Gestionar Carta")}
                ${this._renderAdminBtn("admin-hero-promo-btn", "emerald", "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", "Banner Principal")}
                </div>

                <!-- SERVICIO PENSIÓN -->
                <div class="flex flex-col gap-2">
                <h3 class="${layout.label} px-4 !mb-2 opacity-30">Servicio Pensión</h3>
                ${this._renderAdminBtn("admin-fasal-attendance-btn", "blue", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", "Registrar Asistencia")}
                ${this._renderAdminBtn("admin-fasal-manage-attendance-btn", "blue", "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", "Reportes de Pensión")}
                ${this._renderAdminBtn("admin-fasal-workers-btn", "blue", "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z", "Lista de Personal")}
                ${this._renderAdminBtn("admin-fasal-companies-btn", "blue", "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", "Empresas Aliadas")}
                </div>

                <!-- SEGURIDAD -->
                <div class="flex flex-col gap-2">
                <h3 class="${layout.label} px-4 !mb-2 opacity-30">Seguridad</h3>
                ${this._renderAdminBtn("admin-manage-users-btn", "purple", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", "Control de Accesos")}
                </div>
            </div>`;
    }

    _renderAdminBtn(id, color, svgPath, label) {
        const colors = {
            emerald: "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-600",
            blue: "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-600",
            purple: "bg-purple-50 text-purple-700 border-purple-100 hover:bg-purple-600"
        };
        return html`
            <button id="${id}" class="flex items-center gap-3 w-full p-4 rounded-2xl ${colors[color]} border hover:text-white transition-all duration-300 group/btn shadow-sm active:scale-95 text-left">
                <div class="h-10 w-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 group-hover/btn:bg-white/20 group-hover/btn:text-white transition-colors">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="${svgPath}"/></svg>
                </div>
                <span class="text-xs font-black uppercase tracking-widest">${label}</span>
            </button>`;
    }

    // --- Componentes Privados: Hero y Menú Diario ---

    _renderHero(heroPromo) {
        if (!heroPromo) {
            return html`
                <div class="w-full h-[450px] sm:h-[650px] bg-stone-900 flex flex-col items-center justify-center relative overflow-hidden">
                    <div class="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-30"></div>
                    <div class="relative z-10 flex flex-col items-center gap-6">
                        <div class="h-20 w-20 rounded-full border-2 border-primary/30 flex items-center justify-center animate-pulse shadow-[0_0_50px_rgba(27,94,52,0.2)]">
                            <span class="text-4xl font-black text-primary italic font-display">R</span>
                        </div>
                    </div>
                </div>
            `;
        }

        const banners = heroPromo?.banners?.filter(b => b.activo) || [];
        return html`
           <section class="relative w-full overflow-hidden bg-background" id="hero">
             <div class="swiper hero-swiper h-full w-full">
                <div class="swiper-wrapper">
                    ${banners.length === 0 ? this._renderHeroPlaceholder() : banners.map(b => this._renderHeroSlide(b))}
                </div>
                <div class="swiper-pagination"></div>
             </div>
           </section>`;
    }

    _renderHeroSlide(banner) {
        return html`
            <div class="swiper-slide w-full">
                <picture class="w-full">
                    <source media="(max-width: 640px)" srcset="${banner.mobileImageUrl || banner.imageUrl}">
                    <img src="${banner.imageUrl}" class="w-full h-auto block" alt="Banner" />
                </picture>
            </div>`;
    }

    _renderHeroPlaceholder() {
        return html`
            <div class="swiper-slide w-full h-[600px] bg-stone-900 flex items-center justify-center">
                <span class="text-stone-700 font-black uppercase tracking-[0.5em] italic font-display">Rocoto Experience</span>
            </div>`;
    }

    _renderDailyMenu(dailyMenu) {
        if (!dailyMenu || (dailyMenu.entradas?.length === 0 && dailyMenu.segundos?.length === 0)) {
            return html`
                <div class="max-w-5xl mx-auto py-24 px-4 text-center">
                    <div class="space-y-4 mb-12">
                        <div class="h-4 w-32 bg-stone-100 mx-auto rounded-full animate-pulse"></div>
                        <div class="h-10 w-64 bg-stone-100 mx-auto rounded-full animate-pulse"></div>
                    </div>
                    <div class="relative bg-stone-50 rounded-[3rem] p-12 border border-stone-100 overflow-hidden">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div class="space-y-4">
                                <div class="h-3 w-20 bg-stone-200/50 mx-auto rounded-full"></div>
                                <div class="h-6 w-40 bg-stone-200/50 mx-auto rounded-full animate-pulse"></div>
                            </div>
                            <div class="space-y-4">
                                <div class="h-3 w-20 bg-stone-200/50 mx-auto rounded-full"></div>
                                <div class="h-6 w-48 bg-stone-200/50 mx-auto rounded-full animate-pulse"></div>
                                <div class="h-6 w-32 bg-stone-200/50 mx-auto rounded-full animate-pulse" style="animation-delay: 200ms"></div>
                            </div>
                            <div class="space-y-4">
                                <div class="h-3 w-20 bg-stone-200/50 mx-auto rounded-full"></div>
                                <div class="h-6 w-40 bg-stone-200/50 mx-auto rounded-full animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        return html`
           <section class="relative pt-10 pb-16 sm:pt-12 sm:pb-24 overflow-hidden border-b border-primary/10 bg-white" id="menu-del-dia">
             <div class="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
             <div class="${layout.container} relative z-10 text-center">
               <div class="max-w-5xl mx-auto">
                 ${this._renderSectionHeader("Experiencia Amazónica", html`Menú del <span class='text-primary font-black'>Día</span>`, "Sabor de Casa, Todos los Días.")}
                 
                 <div class="relative bg-primary rounded-[2rem] p-0.5 shadow-[0_30px_70px_-15px_rgba(27,94,52,0.15)] overflow-hidden">
                    <div class="relative bg-white rounded-[1.9rem] overflow-hidden">
                        <div class="p-6 sm:p-10 lg:px-12 lg:py-10 text-center">
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
                                <div class="hidden lg:block absolute left-1/3 top-0 bottom-0 w-px bg-stone-100"></div>
                                <div class="hidden lg:block absolute left-2/3 top-0 bottom-0 w-px bg-stone-100"></div>
                                
                                ${this._renderDailyMenuColumn("Entradas", dailyMenu.entradas || [])}
                                ${this._renderDailyMenuColumn("Fondos", dailyMenu.segundos || [], true)}
                                ${this._renderDailyMenuColumn("Refrescos", dailyMenu.refrescos || [])}
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
        return html`
            <div class="space-y-6 group">
                <h3 class="${layout.label} !text-stone-300">${title}</h3>
                <ul class="space-y-3">
                    ${items.map(item => html`
                        <li class="flex flex-col items-center">
                            <span class="${typography.h3} text-primary italic leading-tight font-display">${item}</span>
                            ${isSpecial ? html`<span class="${layout.label} !text-amber-500 !mb-0">Especialidad</span>` : ''}
                        </li>`)}
                </ul>
            </div>`;
    }

    _renderDailyMenuFooter() {
        return html`
            <div class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-stone-50 pt-8">
                <div class="flex items-center gap-3 text-left font-sans">
                    <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-black italic text-[10px]">R</div>
                    <div>
                        <p class="${layout.label} !mb-0 opacity-40">Atención</p>
                        <p class="text-[10px] font-bold text-on-background">12:00 PM &mdash; 03:30 PM</p>
                    </div>
                </div>
                <div class="relative group/price">
                    <div class="absolute inset-0 bg-primary rounded-xl rotate-2 group-hover/price:rotate-0 transition-transform"></div>
                    <div class="relative bg-white border-2 border-primary rounded-xl px-8 py-2 flex items-baseline gap-2 shadow-lg">
                        <span class="text-xs font-bold text-primary font-sans">S/</span>
                        <span class="text-4xl font-black text-primary font-display italic leading-none">8.00</span>
                    </div>
                </div>
                <p class="${layout.label} opacity-30 hidden sm:block font-sans">Calidad e Inocuidad</p>
            </div>`;
    }

    // --- Componentes Privados: Quiénes Somos y Carta ---

    _renderAboutUs() {
        return html`
           <section id="quienes-somos" class="relative pt-10 pb-16 sm:pt-12 sm:pb-24 overflow-hidden bg-white scroll-mt-20">
             <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-100 to-transparent"></div>
             <div class="${layout.container}">
               <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                 ${this._renderAboutUsImage()}
                 <div class="order-1 lg:order-2 space-y-6 text-left">
                    ${this._renderAboutUsContent()}
                    ${this._renderAboutUsStats()}
                 </div>
               </div>
               ${this._renderCommitmentBanner()}
               ${this._renderSignatureDishes()}
             </div>
           </section>`;
    }

    _renderAboutUsImage() {
        return html`
            <div class="relative order-2 lg:order-1 flex justify-center lg:justify-start">
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl opacity-60"></div>
                <div class="relative group w-full max-w-[320px] sm:max-w-sm">
                    <img src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778388097/FB_IMG_1542216440936-removebg-preview_icr9pc.png" class="relative z-10 w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)]" alt="Alicia Mattos" />
                    <div class="absolute -bottom-4 -right-4 z-20 bg-white p-4 rounded-[2rem] shadow-xl border border-stone-50 hidden sm:block rotate-3">
                        <p class="${layout.label} !mb-0.5">El Corazón</p>
                        <h4 class="${typography.h3} italic leading-none">Alicia Mattos</h4>
                    </div>
                </div>
            </div>`;
    }

    _renderAboutUsContent() {
        return html`
            <div class="space-y-2">
                <span class="${layout.label} border-l-4 border-primary pl-4">Nuestra Esencia</span>
                <h2 class="${layout.sectionTitle} italic">Bienvenidos a <span class="text-primary font-black">Rocoto</span></h2>
                <p class="${typography.bodyLg} italic text-stone-300">El Legado de una Gran Sazón.</p>
            </div>
            <div class="space-y-4">
                <p class="${typography.bodyLg}">En **San Ramón**, fusionamos la riqueza amazónica con el cariño inigualable de la cocina de hogar.</p>
                <div class="relative p-6 bg-amber-50/50 rounded-[2rem] border-l-4 border-amber-500">
                    <p class="text-xl sm:text-2xl text-amber-900/80 leading-relaxed font-cursive">"La sazón de la Sra. Alicia es el pilar de cada plato. Ella asegura que cada bocado se sienta como un abrazo al corazón."</p>
                    <p class="text-right text-amber-700/50 font-cursive text-lg mt-2">&mdash; Alicia Mattos</p>
                </div>
            </div>`;
    }

    _renderAboutUsStats() {
        const stats = [
            { val: "100%", label: "Artesanal" },
            { val: "Local", label: "San Ramón" },
            { val: "Tradición", label: "Familiar", amber: true }
        ];
        return html`
            <div class="grid grid-cols-3 gap-4 pt-2">
                ${stats.map(s => html`
                    <div class="flex flex-col gap-1 border-l border-stone-100 pl-4">
                        <span class="${s.amber ? 'text-2xl text-amber-600' : 'text-3xl text-primary'} font-black leading-none font-display italic">${s.val}</span>
                        <span class="text-[9px] font-bold uppercase tracking-widest text-stone-400 font-sans">${s.label}</span>
                    </div>`)}
            </div>`;
    }

    _renderCommitmentBanner() {
        return html`
            <div class="bg-primary rounded-[3rem] p-8 sm:p-12 text-white overflow-hidden relative mt-16 mb-16">
                <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    <div class="lg:col-span-7 space-y-10">
                        <h3 class="${typography.h2} text-white uppercase italic">Compromiso con la Excelencia</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
                            <div class="space-y-4">
                                <h4 class="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300 font-sans">Inocuidad Alimentaria</h4>
                                <p class="text-sm text-white/70 leading-relaxed font-sans">Nuestros procesos de higiene y seguridad alimentaria garantizan platos saludables para tu familia.</p>
                            </div>
                            <div class="space-y-4 font-sans">
                                <h4 class="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">Equipo Directivo</h4>
                                <div class="space-y-2">
                                    <p class="text-sm font-bold text-white flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Valdéz Mattos Beeker Aarón</p>
                                    <p class="text-sm font-bold text-white flex items-center gap-3"><span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Fernandez Cordova Samuel</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    _renderSignatureDishes() {
        const dishes = [
            { img: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392584/Gemini_Generated_Image_9gab2q9gab2q9gab-removebg-preview_lw7exv.png", name: "Chaufa de Cecina", desc: "Ahumado y Artesanal" },
            { img: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392882/Gemini_Generated_Image_pvazc5pvazc5pvaz-removebg-preview_akr1dd.png", name: "Chicharrón de Doncella", desc: "Crujiente y Tradicional" },
            { img: "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392997/Gemini_Generated_Image_sl2vm5sl2vm5sl2v-removebg-preview_cokfr1.png", name: "Tacacho con Cecina", desc: "Plátanos verdes y yuca frita" }
        ];
        return html`
            <div class="hidden md:block space-y-24 mt-32">
                <div class="text-center space-y-4">
                    <span class="${layout.label}">Selección del Chef</span>
                    <h2 class="${layout.sectionTitle} italic">Platos <span class="text-primary font-black italic">Insignia</span></h2>
                    <div class="h-1 w-20 bg-amber-400 mx-auto rounded-full"></div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
                    ${dishes.map(d => html`
                        <div class="group relative">
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-stone-50 rounded-full group-hover:bg-primary/5 group-hover:scale-110 transition-all duration-700"></div>
                            <div class="relative aspect-square flex items-center justify-center mb-8 px-4">
                                <img src="${d.img}" class="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)] group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-700" alt="${d.name}" />
                            </div>
                            <div class="text-center space-y-2">
                                <h4 class="${typography.h3} italic leading-none">${d.name}</h4>
                                <p class="${layout.label} !text-primary/60">${d.desc}</p>
                            </div>
                        </div>`)}
                </div>
            </div>`;
    }

    _renderMenuSection() {
        return html`
            <section class="relative pt-12 pb-24 sm:pt-16 sm:pb-32 overflow-hidden scroll-mt-20 bg-white" id="menu">
            <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
            <div class="${layout.container} relative z-10">
                <div class="max-w-4xl mb-12 text-left">
                <span class="${layout.label} border-l-4 border-primary pl-4">Experiencia Gastronómica</span>
                <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
                    <h2 class="${layout.sectionTitle} italic">Nuestra <span class="text-primary font-black">Carta</span></h2>
                    <p class="${typography.bodyLg} italic text-on-surface-variant/40 max-w-sm border-l border-stone-100 pl-6 hidden lg:block leading-tight">
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
        const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola Rocoto! Deseo información sobre el servicio de pensión y reservas.')}`;

        return html`
           <section id="pension" class="relative py-24 sm:py-32 overflow-hidden bg-white scroll-mt-20">
              <div class="absolute inset-0 bg-stone-50/30 pointer-events-none"></div>
              <div class="${layout.container} relative z-10">
                  <div class="flex flex-col gap-20">
                      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-end">
                          <div class="lg:col-span-7 space-y-6">
                              <span class="${layout.label} border-l-4 border-primary pl-4">Soluciones Corporativas</span>
                              <h2 class="${layout.sectionTitle} italic !text-5xl sm:!text-7xl">Servicio de <span class="text-primary font-black">Pensión</span></h2>
                              <p class="${typography.bodyLg} italic text-on-surface-variant/60 max-w-2xl">Alimentamos el motor de su empresa con la sazón y calidad que nos caracteriza, garantizando puntualidad y nutrición superior.</p>
                          </div>
                          <div class="lg:col-span-5 flex flex-col sm:flex-row gap-6 lg:justify-end">
                                ${this._renderPensionFeature("Inocuidad Total", "Higiene 100% garantizada.", "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z")}
                                ${this._renderPensionFeature("Nutrición", "Menús balanceados.", "M13 10V3L4 14h7v7l9-11h-7z", "amber")}
                          </div>
                      </div>

                      ${this._renderCompaniesSection()}

                      <div class="flex justify-center font-sans">
                         <a href="${whatsappLink}" target="_blank" class="${button.base} ${button.primary} rounded-full tracking-[0.4em] uppercase shadow-2xl py-6 px-12 group">
                            Cotizar Convenio
                            <svg class="h-5 w-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                         </a>
                      </div>
                  </div>
              </div>
           </section>`;
    }

    _renderPensionFeature(title, desc, svgPath, color = "primary") {
        const colors = color === "amber" ? "bg-amber-50 text-amber-600" : "bg-primary/5 text-primary";
        return html`
            <div class="flex items-center gap-4 bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm font-sans flex-1">
                <div class="h-12 w-12 rounded-2xl ${colors} flex items-center justify-center shrink-0 shadow-inner">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="${svgPath}"/></svg>
                </div>
                <div>
                    <h4 class="${layout.label} !mb-0 !text-on-background !text-[11px]">${title}</h4>
                    <p class="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">${desc}</p>
                </div>
            </div>`;
    }

    _renderCompaniesSection() {
        return html`
            <div class="relative py-16 border-y border-stone-100/50">
                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 sm:px-12 whitespace-nowrap">
                    <h3 class="${layout.label} italic !mb-0 text-primary opacity-80 flex items-center gap-3 sm:gap-6">
                    <span class="hidden sm:block h-px w-6 sm:w-10 bg-primary/20"></span>
                    Avalan nuestra experiencia
                    <span class="hidden sm:block h-px w-6 sm:w-10 bg-primary/20"></span>
                    </h3>
                </div>
                <div id="companies-carousel-container" class="max-w-6xl mx-auto">
                    <div class="py-12 text-center text-stone-200 text-[10px] font-bold uppercase tracking-widest animate-pulse">Cargando aliados estratégicos...</div>
                </div>
            </div>`;
    }

    _renderCompaniesCarousel(companies) {
        if (!companies || companies.length === 0) return html``;
        return html`
            <div class="swiper companies-swiper overflow-hidden py-6">
                <div class="swiper-wrapper items-center">
                    ${companies.map(c => html`
                        <div class="swiper-slide flex flex-col items-center justify-center text-center group/logo">
                            <div class="h-28 sm:h-36 w-full flex items-center justify-center filter grayscale opacity-40 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 transition-all duration-700">
                                ${c.logo 
                                    ? html`<img src="${c.logo}" alt="${c.nombre}" class="max-h-full max-w-[85%] object-contain mx-auto transform group-hover/logo:scale-110 transition-transform duration-700" />`
                                    : html`<div class="h-24 w-24 rounded-3xl bg-stone-50 flex items-center justify-center text-primary font-bold text-3xl border border-stone-100 shadow-sm group-hover/logo:bg-primary group-hover/logo:text-white transition-all duration-500 mx-auto">${c.nombre.charAt(0).toUpperCase()}</div>`
                                }
                            </div>
                            <div class="w-full mt-6 px-2">
                                <span class="block text-[11px] font-black uppercase tracking-[0.25em] text-stone-300 group-hover/logo:text-primary transition-colors leading-relaxed mx-auto">${c.nombre}</span>
                            </div>
                        </div>
                    `)}
                </div>
            </div>`;
    }

    _renderContact(restaurantInfo) {
        return html`
           <section id="contacto" class="relative pt-10 pb-20 sm:pt-12 sm:pb-28 bg-white overflow-hidden scroll-mt-20">
              <div class="absolute top-1/2 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
              <div class="${layout.container} relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                   <div class="lg:col-span-5 space-y-8 text-left">
                      ${this._renderSectionHeader("Encuéntranos", html`Nuestra <span class='text-primary font-black'>Casa</span>`, "Te esperamos en el corazón de San Ramón.")}
                      <div class="space-y-4">
                        ${this._renderContactItem("Visítanos", restaurantInfo.address, "primary", "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z")}
                        ${this._renderContactItem("Llámanos", restaurantInfo.phone, "amber", "M3 5a2 2 0 012-2h3.28a1 1 0 011.94.445l-.992 2.985a1 1 0 01-1.16.674l-3.38-.73a1 1 0 00-1.037.495l-1.332 2.332a1 1 0 00.122 1.258l4.13 4.13a1 1 0 001.258.122l2.332-1.332a1 1 0 00.495-1.037l-.73-3.38a1 1 0 01.674-1.16l2.985-.992A1 1 0 0121 8.06V11a2 2 0 01-2 2h-1M3 20a2 2 0 012-2h.01")}
                      </div>
                      <div class="pt-2 font-sans"><a href="${restaurantInfo.mapsUrl}" target="_blank" class="${button.base} ${button.outlineDark} rounded-full !py-3">Ver Mapa Completo</a></div>
                   </div>
                   <div class="lg:col-span-7 relative h-[350px] sm:h-[420px] w-full font-sans">
                      <div class="h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group relative">
                        <iframe src="${restaurantInfo.mapsEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" class="grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-1000"></iframe>
                        <div class="absolute inset-0 bg-transparent pointer-events-none group-hover:pointer-events-auto"></div>
                      </div>
                   </div>
                </div>
              </div>
           </section>`;
    }

    _renderContactItem(label, val, color, svgPath) {
        const colors = color === "amber" ? "bg-amber-500" : "bg-primary";
        return html`
            <div class="group flex items-center gap-4 p-4 sm:p-5 rounded-[2rem] bg-stone-50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl font-sans">
                <div class="h-10 w-10 sm:h-12 sm:w-12 rounded-full ${colors} text-white flex items-center justify-center shrink-0 shadow-lg">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="${svgPath}"></path></svg>
                </div>
                <div class="min-w-0"><p class="${layout.label} !mb-0.5 opacity-40">${label}</p><p class="text-xs sm:text-sm font-bold text-on-background leading-tight truncate">${val}</p></div>
            </div>`;
    }

    _renderFooter(restaurantInfo) {
        const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola Rocoto! Deseo información sobre el servicio de pensión y reservas.')}`;
        return html`
           <footer class="bg-stone-900 text-white pt-24 pb-12 overflow-hidden relative font-sans">
             <div class="${layout.container} relative z-10">
               <div class="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20">
                 <div class="md:col-span-5 space-y-10">
                   <div class="space-y-6">
                      <img alt="Logo" class="h-14 w-auto brightness-0 invert" src="${LOGO_HORIZONTAL}" />
                      <p class="text-stone-400 text-sm leading-relaxed max-w-sm italic">Fusión de tradición chifa y vanguardia culinaria en el corazón de la selva central. Sabores que trascienden el paladar.</p>
                   </div>
                 </div>
                 <div class="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                    ${this._renderFooterColumn("Navegación", [
                        { href: "#menu-del-dia", label: "Menú Diario" },
                        { href: "#menu", label: "La Carta" },
                        { href: "#contacto", label: "Visítanos" }
                    ])}
                    ${this._renderFooterColumn("Pensión", [
                        { href: "#pension", label: "Empresas" },
                        { href: whatsappLink, label: "Cotizar Plan" }
                    ])}
                 </div>
               </div>
               <div class="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-bold uppercase tracking-[0.4em] text-stone-500">
                 <p>&copy; 2026 ${restaurantInfo.name.toUpperCase()}. TODOS LOS DERECHOS RESERVADOS.</p>
               </div>
             </div>
           </footer>`;
    }

    _renderFooterColumn(title, links) {
        return html`
            <div>
                <h4 class="${layout.label} !text-primary">${title}</h4>
                <ul class="space-y-4">
                ${links.map(l => html`<li><a href="${l.href}" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase">${l.label}</a></li>`)}
                </ul>
            </div>`;
    }

    // --- Helpers Genéricos de Renderizado ---

    _renderSectionHeader(label, title, subtitle) {
        return html`
            <div class="mb-10 text-center">
                <span class="${layout.label}">${label}</span>
                <h2 class="${layout.sectionTitle} italic">${title}</h2>
                <p class="${typography.bodyLg} italic text-stone-400 mt-2">${subtitle}</p>
            </div>`;
    }

    _renderGlobalStyles() {
        return html`
         <style>
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
         </style>`;
    }

    // --- Inicialización de Swipers y Scroll ---

    initHeroSwiper() {
        if (this.swiper) this.swiper.destroy(true, true);
        if (!document.querySelector('.hero-swiper')) return;
        this.swiper = new Swiper('.hero-swiper', {
            modules: [Navigation, Pagination, Autoplay],
            loop: true, speed: 1000, autoplay: { delay: 6000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
    }

    initCompaniesSwiper() {
        if (this.companiesSwiper) this.companiesSwiper.destroy();
        if (!document.querySelector('.companies-swiper')) return;
        this.companiesSwiper = new Swiper('.companies-swiper', {
            modules: [Autoplay],
            slidesPerView: 2, spaceBetween: 20, loop: true,
            autoplay: { delay: 2500, disableOnInteraction: false },
            breakpoints: {
                640: { slidesPerView: 2, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40 },
            }
        });
    }

    _handleInitialScroll() {
        if (!this._initialScrollDone) {
            this._initialScrollDone = true;
            setTimeout(() => {
                const hash = window.location.hash;
                if (hash && hash !== '#/' && hash !== '#') {
                    const el = document.getElementById(hash.substring(1));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo(0, 0);
                }
            }, 500);
        }
    }
}
