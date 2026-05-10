import { escapeHtml } from "../utils/html.js";
import { layout, typography, button, card, form } from "../ui/layout.js";
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export class HomeView {
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.swiper = null;
        this.elements = {}; // Cache de elementos para reactividad
    }

    /**
     * Renderiza la estructura base. Verifica si ya existe para evitar parpadeos.
     */
    renderStaticShell(restaurantInfo) {
      if (!document.getElementById("nav-container")) {
          this.rootElement.innerHTML = `
            <div id="nav-container"></div>
            <div id="mobile-nav-container"></div>
            <div id="user-menu-container"></div>
            <main class="bg-[#fafafa]">
              <div id="hero-container" class="relative bg-white"></div>
              
              <!-- SECCIÓN MENÚ DEL DÍA CON FONDO VIBRANTE -->
              <div id="daily-menu-container" class="relative bg-gradient-to-b from-white to-[#1B5E34]/5/30"></div>
              
              <!-- SECCIÓN QUIÉNES SOMOS -->
              ${this._renderAboutUs(restaurantInfo)}

              <!-- SECCIÓN CARTA CON FONDO GRADIENTE Y GLOW -->
              <section class="relative pt-12 pb-24 sm:pt-16 sm:pb-32 overflow-hidden scroll-mt-20 bg-white" id="menu">
                <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#1B5E34]/5 to-transparent pointer-events-none"></div>
                
                <div class="${layout.container} relative z-10">
                  <div class="max-w-4xl mb-4 sm:mb-6">
                    <span class="inline-block text-[9px] font-black text-primary uppercase tracking-[0.5em] mb-2 border-l-4 border-primary pl-4">Experiencia Gastronómica</span>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-10">
                        <h2 class="text-5xl sm:text-7xl font-black text-on-background tracking-tighter italic font-display leading-none">Nuestra <span class="text-primary">Carta</span></h2>
                        <p class="text-xs sm:text-base text-on-surface-variant/50 font-medium max-w-sm leading-tight italic border-l border-stone-100 pl-6 hidden lg:block">
                          Sabores de la selva central que cuentan nuestra historia en cada bocado.
                        </p>
                    </div>
                  </div>

                  <div id="menu-filters" class="mb-12"></div> 
                  <div class="grid grid-cols-1 gap-10" id="menu-grid"></div>
                </div>
              </section>

              <!-- SECCIÓN PENSIÓN CON COLOR DE FONDO -->
              <div class="bg-stone-50 border-y border-stone-100">
                ${this._renderPension(restaurantInfo)}
              </div>

              ${this._renderContact(restaurantInfo)}
              ${this._renderFooter(restaurantInfo)}
            </main>
            ${this._renderStyles()}
          `;

          // Auto-scroll SOLO en el primer render si hay un hash
          if (!this._initialScrollDone) {
            this._initialScrollDone = true;
            setTimeout(() => {
                const hash = window.location.hash;
                if (hash && hash !== '#/' && hash !== '#') {
                    const id = hash.substring(1);
                    const el = document.getElementById(id);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                    window.scrollTo(0, 0); // Forzar arriba si no hay hash
                }
            }, 500);
          }
      }
      
      this._cacheElements();
    }

    _cacheElements() {
        this.elements = {
            nav: document.getElementById("nav-container"),
            mobileNav: document.getElementById("mobile-nav-container"),
            userMenu: document.getElementById("user-menu-container"),
            hero: document.getElementById("hero-container"),
            dailyMenu: document.getElementById("daily-menu-container")
        };
    }

    // --- MÉTODOS DE ACTUALIZACIÓN REACTIVA ---

    updateUserUI(restaurantInfo, user) {
        if (this.elements.nav) this.elements.nav.innerHTML = this._renderNav(restaurantInfo, user);
        if (this.elements.userMenu) this.elements.userMenu.innerHTML = this._renderUserMenu(user);
    }

    updateDailyMenuUI(dailyMenu) {
        if (this.elements.dailyMenu) this.elements.dailyMenu.innerHTML = this._renderDailyMenu(dailyMenu);
    }

    updateHeroUI(heroPromo) {
        if (this.elements.hero) {
            this.elements.hero.innerHTML = this._renderHero(heroPromo);
            this.initSwiper();
        }
    }

    updateMobileNavUI(restaurantInfo) {
        if (this.elements.mobileNav) this.elements.mobileNav.innerHTML = this._renderMobileNav(restaurantInfo);
    }

    // --- MÉTODOS DE RENDERIZADO PRIVADOS ---

    _renderNav(restaurantInfo, user) {
        const userColorClass = user ? "text-primary" : "text-stone-400";
        const userBgClass = user ? "bg-primary/5" : "bg-surface-container-low";
        const LOGO_HORIZONTAL = "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png";
        
        return `
         <nav class="fixed top-0 z-50 w-full border-b border-surface-variant bg-surface/90 backdrop-blur-md shadow-sm font-sans">
           <div class="${layout.container} flex h-16 items-center justify-between">
              <a href="#/" class="flex shrink-0 items-center">
                 <img alt="Logo" class="h-10 w-auto" src="${LOGO_HORIZONTAL}" />
              </a>
              <div class="hidden items-center gap-8 md:flex">
                 <a class="${button.base} ${button.ghost} !text-[#1B5E34] hover:!bg-[#1B5E34]/5" href="#quienes-somos">Nosotros</a>
                 <a class="${button.base} ${button.ghost} hover:!text-[#1B5E34]" href="#menu-del-dia">Menú del día</a>
                 <a class="${button.base} ${button.ghost} hover:!text-[#1B5E34]" href="#menu">La carta</a>
                 <a class="${button.base} ${button.ghost} hover:!text-[#1B5E34]" href="#pension">Servicio Pensión</a>
                 <a class="${button.base} ${button.ghost} hover:!text-[#1B5E34]" href="#contacto">Contacto</a>
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

    _renderMobileNav(restaurantInfo) {
        const LOGO_HORIZONTAL = "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png";
        return `
          <div id="mobile-nav-panel" class="hidden fixed inset-0 z-[100] h-screen w-full font-sans">
            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onclick="document.getElementById('mobile-nav-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110] animate-slide-in-left">
                
                <!-- Cabecera del Panel Móvil -->
                <div class="flex items-center justify-between p-8 border-b border-stone-100 bg-white shrink-0 relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-24 h-24 bg-[#1B5E34]/5 rounded-full -ml-12 -mt-12 opacity-40"></div>
                  <img src="${LOGO_HORIZONTAL}" class="h-10 w-auto relative z-10 brightness-0">
                  <button class="close-nav p-2 text-stone-300 hover:text-[#1B5E34] transition-colors relative z-10">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <!-- Enlaces de Navegación (Premium List) -->
                <div class="flex-1 flex flex-col gap-2 p-6 bg-white overflow-y-auto scrollbar-hide">
                  <div class="mb-6 px-4">
                    <h3 class="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Explorar</h3>
                  </div>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-[#1B5E34]/5" href="#quienes-somos">
                      <div class="h-12 w-12 rounded-2xl bg-[#1B5E34]/5 text-[#1B5E34] flex items-center justify-center shadow-inner group-hover:bg-[#1B5E34] group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-[#1B5E34] transition-colors">Nosotros</span>
                  </a>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-[#1B5E34]/5" href="#menu-del-dia">
                      <div class="h-12 w-12 rounded-2xl bg-[#1B5E34]/5 text-[#1B5E34] flex items-center justify-center shadow-inner group-hover:bg-[#1B5E34] group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-[#1B5E34] transition-colors">Menú del día</span>
                  </a>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-[#1B5E34]/5" href="#menu">
                      <div class="h-12 w-12 rounded-2xl bg-[#1B5E34]/5 text-[#1B5E34] flex items-center justify-center shadow-inner group-hover:bg-[#1B5E34] group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-[#1B5E34] transition-colors">Nuestra Carta</span>
                  </a>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-[#1B5E34]/5" href="#pension">
                      <div class="h-12 w-12 rounded-2xl bg-[#1B5E34]/5 text-[#1B5E34] flex items-center justify-center shadow-inner group-hover:bg-[#1B5E34] group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-[#1B5E34] transition-colors">Servicio Pensión</span>
                  </a>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-amber-50" href="#contacto">
                      <div class="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-amber-700 transition-colors">Encuéntranos</span>
                  </a>
                </div>

                <!-- Footer del Panel Móvil -->
                <div class="p-10 border-t border-stone-100 bg-stone-50 text-center">
                   <p class="text-[8px] font-black uppercase tracking-[0.4em] text-stone-300 italic mb-2">Sabor que trasciende</p>
                   <p class="text-[7px] font-bold uppercase tracking-[0.2em] text-stone-200">Rocoto Restaurante &copy; 2026</p>
                </div>
            </div>
          </div>`;
    }

    _renderUserMenu(user) {
        return `
          <div id="user-menu-panel" class="hidden fixed inset-0 z-[100] h-screen w-full flex justify-end">
            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onclick="document.getElementById('user-menu-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 sm:w-96 bg-[#fafafa] shadow-2xl flex flex-col z-[110] animate-slide-in-right border-l border-stone-100">
                
                <div class="bg-white p-8 sm:p-10 border-b border-stone-100 shrink-0 relative overflow-hidden">
                  <div class="absolute top-0 right-0 w-32 h-32 bg-[#1B5E34]/5 rounded-full -mr-16 -mt-16 opacity-40"></div>
                  <button class="close-user-menu absolute top-6 right-6 p-2 text-stone-300 hover:text-primary transition-colors z-20">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                  <div class="flex items-center gap-5 relative z-10">
                    <div class="h-16 w-16 rounded-2xl bg-[#1B5E34]/5 flex items-center justify-center border border-emerald-100 shadow-inner shrink-0">
                      <svg class="h-8 w-8 text-[#1B5E34]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-lg font-black text-on-background truncate uppercase tracking-tighter">${user ? user.name : 'Invitado'}</p>
                      <p class="text-[9px] uppercase tracking-[0.3em] text-[#1B5E34] font-black opacity-60">${user ? user.role : 'Visitante'}</p>
                    </div>
                  </div>
                </div>

                <div class="flex-1 p-6 sm:p-8 flex flex-col gap-10 overflow-y-auto scrollbar-hide">
                ${!user ? `
                  <button id="login-btn-panel" class="flex items-center justify-center gap-4 w-full bg-white text-on-background border border-stone-200 rounded-2xl py-5 px-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all active:scale-95 font-black text-[10px] uppercase tracking-[0.2em]">
                      <svg class="h-5 w-5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                      Entrar con Google
                  </button>
              ` : ''}

                  ${user?.role === 'admin' ? `
                      <div class="space-y-10">
                        <div>
                          <div class="flex items-center gap-3 mb-6 px-4">
                            <h3 class="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Panel Restaurante</h3>
                            <div class="h-px flex-1 bg-stone-100"></div>
                          </div>
                          <div class="space-y-2">
                            <button id="admin-daily-menu-btn" class="admin-panel-btn-new group/btn" data-color="emerald">
                                <div class="icon-box bg-[#1B5E34]/5 text-[#1B5E34] group-hover/btn:bg-[#1B5E34] group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Menú del Día</span>
                            </button>
                            <button id="admin-manage-carta-btn" class="admin-panel-btn-new group/btn" data-color="emerald">
                                <div class="icon-box bg-[#1B5E34]/5 text-[#1B5E34] group-hover/btn:bg-[#1B5E34] group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Gestionar Carta</span>
                            </button>
                            <button id="admin-hero-promo-btn" class="admin-panel-btn-new group/btn" data-color="emerald">
                                <div class="icon-box bg-[#1B5E34]/5 text-[#1B5E34] group-hover/btn:bg-[#1B5E34] group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Banner Principal</span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <div class="flex items-center gap-3 mb-6 px-4">
                            <h3 class="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Servicio Pensión</h3>
                            <div class="h-px flex-1 bg-stone-100"></div>
                          </div>
                          <div class="space-y-2">
                            <button id="admin-fasal-attendance-btn" class="admin-panel-btn-new group/btn" data-color="blue">
                                <div class="icon-box bg-blue-50 text-blue-600 group-hover/btn:bg-blue-600 group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Registrar Asistencia</span>
                            </button>
                            <button id="admin-fasal-manage-attendance-btn" class="admin-panel-btn-new group/btn" data-color="blue">
                                <div class="icon-box bg-blue-50 text-blue-600 group-hover/btn:bg-blue-600 group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Reportes de Pensión</span>
                            </button>
                            <button id="admin-fasal-workers-btn" class="admin-panel-btn-new group/btn" data-color="blue">
                                <div class="icon-box bg-blue-50 text-blue-600 group-hover/btn:bg-blue-600 group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Lista de Personal</span>
                            </button>
                            <button id="admin-fasal-companies-btn" class="admin-panel-btn-new group/btn" data-color="blue">
                                <div class="icon-box bg-blue-50 text-blue-600 group-hover/btn:bg-blue-600 group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Empresas Aliadas</span>
                            </button>
                          </div>
                        </div>
                        <div>
                          <div class="flex items-center gap-3 mb-6 px-4">
                            <h3 class="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Seguridad</h3>
                            <div class="h-px flex-1 bg-stone-100"></div>
                          </div>
                          <button id="admin-manage-users-btn" class="admin-panel-btn-new group/btn" data-color="purple">
                              <div class="icon-box bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                              <span class="text-sm font-black uppercase tracking-tighter">Control de Accesos</span>
                          </button>
                        </div>
                      </div>
                  ` : ''}
                  ${user ? `
                      <div class="pt-10 border-t border-stone-100">
                        <button id="logout-btn" class="flex items-center gap-4 w-full p-5 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all group active:scale-95">
                          <div class="h-10 w-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-colors">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 01-3-3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                          </div>
                          <span class="text-xs font-black uppercase tracking-widest">Cerrar Sesión</span>
                        </button>
                      </div>` : ''}
                </div>
                <div class="p-8 border-t border-stone-100 bg-white text-center">
                   <p class="text-[8px] font-black uppercase tracking-[0.5em] text-stone-200 italic">Rocoto Experience &copy; 2026</p>
                </div>
            </div>
          </div>`;
    }

    _renderHero(heroPromo) {
        const banners = heroPromo?.banners?.filter(b => b.activo) || [];
        return `
           <section class="relative w-full overflow-hidden bg-background" id="hero">
             <div class="swiper hero-swiper h-full w-full">
                <div class="swiper-wrapper">
                    ${banners.length === 0 ? `
                        <div class="swiper-slide w-full h-[600px] bg-stone-900 flex items-center justify-center">
                            <span class="text-stone-700 font-black uppercase tracking-[0.5em] italic">Rocoto Experience</span>
                        </div>
                    ` : banners.map(b => `
                        <div class="swiper-slide w-full">
                            <picture class="w-full">
                                <source media="(max-width: 640px)" srcset="${escapeHtml(b.mobileImageUrl || b.imageUrl)}">
                                <img src="${escapeHtml(b.imageUrl)}" class="w-full h-auto block" alt="Banner" />
                            </picture>
                        </div>
                    `).join('')}
                </div>
                <div class="swiper-pagination !bottom-8"></div>
                <div class="swiper-button-next !text-white after:!text-lg !w-10 !h-10 sm:!w-12 sm:!h-12 !bg-black/10 hover:!bg-black/20 backdrop-blur-sm rounded-full transition-all hidden sm:flex"></div>
                <div class="swiper-button-prev !text-white after:!text-lg !w-10 !h-10 sm:!w-12 sm:!h-12 !bg-black/10 hover:!bg-black/20 backdrop-blur-sm rounded-full transition-all hidden sm:flex"></div>
             </div>
           </section>`;
    }

    _renderAboutUs(restaurantInfo) {
        return `
           <section id="quienes-somos" class="relative pt-10 pb-16 sm:pt-12 sm:pb-24 overflow-hidden bg-white scroll-mt-20">
             <!-- Decoración de Fondo Sutil -->
             <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-stone-100 to-transparent"></div>
             
             <div class="${layout.container}">
               <!-- Fila Unificada Ultra-Compacta -->
               <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                 
                 <!-- Columna de Imagen: Sra. Alicia (Escalado Reducido) -->
                 <div class="relative order-2 lg:order-1 flex justify-center lg:justify-start">
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square bg-gradient-to-tr from-[#1B5E34]/5 to-transparent rounded-full blur-3xl opacity-60"></div>
                    
                    <div class="relative group w-full max-w-[320px] sm:max-w-sm">
                        <img src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778388097/FB_IMG_1542216440936-removebg-preview_icr9pc.png" 
                             class="relative z-10 w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(27,94,52,0.2)] group-hover:scale-[1.02] transition-transform duration-700" 
                             alt="Sra. Alicia Mattos" />
                        
                        <!-- Badge flotante más pequeño -->
                        <div class="absolute -bottom-4 -right-4 z-20 bg-white p-4 rounded-[2rem] shadow-xl border border-stone-50 hidden sm:block rotate-3">
                            <p class="text-[8px] font-black text-[#1B5E34] uppercase tracking-[0.2em] mb-0.5">El Corazón</p>
                            <h4 class="text-xl font-black text-stone-800 tracking-tighter uppercase italic leading-none">Alicia Mattos</h4>
                        </div>
                    </div>
                 </div>

                 <!-- Columna de Texto: Bienvenida y Pilar (Alta Densidad) -->
                 <div class="order-1 lg:order-2 space-y-6">
                    <div class="space-y-2">
                        <span class="inline-block text-[9px] font-black text-[#1B5E34] uppercase tracking-[0.4em] mb-1 border-l-4 border-[#1B5E34] pl-4">Nuestra Esencia</span>
                        <h2 class="text-4xl sm:text-6xl font-black text-on-background tracking-tighter italic font-display leading-[0.9]">Bienvenidos a <span class="text-[#1B5E34]">Rocoto</span></h2>
                        <p class="text-lg sm:text-xl font-black text-stone-300 italic tracking-tight">El Legado de una Gran Sazón.</p>
                    </div>

                    <div class="space-y-4">
                        <p class="text-sm sm:text-base text-on-surface-variant/70 font-medium leading-relaxed">
                            En **San Ramón**, fusionamos la riqueza amazónica con el cariño inigualable de la cocina de hogar.
                        </p>
                        
                        <div class="relative p-5 bg-amber-50/50 rounded-[2rem] border-l-4 border-amber-500">
                            <p class="text-xs sm:text-sm text-amber-900/80 font-bold leading-relaxed italic">
                                "La sazón de la **Sra. Alicia** es el pilar de cada plato. Ella asegura que cada bocado se sienta como un abrazo al corazón."
                            </p>
                        </div>
                    </div>

                    <!-- Highlights Rápidos Compactos -->
                    <div class="grid grid-cols-3 gap-4 pt-2">
                        <div class="flex flex-col gap-1 border-l border-stone-100 pl-4">
                            <span class="text-2xl font-black text-[#1B5E34] leading-none">100%</span>
                            <span class="text-[8px] font-black uppercase tracking-widest text-stone-400">Artesanal</span>
                        </div>
                        <div class="flex flex-col gap-1 border-l border-stone-100 pl-4">
                            <span class="text-2xl font-black text-[#1B5E34] leading-none">Local</span>
                            <span class="text-[8px] font-black uppercase tracking-widest text-stone-400">San Ramón</span>
                        </div>
                        <div class="flex flex-col gap-1 border-l border-stone-100 pl-4">
                            <span class="text-2xl font-black text-amber-600 leading-none">Tradición</span>
                            <span class="text-[8px] font-black uppercase tracking-widest text-stone-400">Familiar</span>
                        </div>
                    </div>
                 </div>
               </div>

               <!-- Valores y Equipo (Separación Reducida) -->
               <div class="bg-[#1B5E34] rounded-[3rem] p-8 sm:p-12 text-white overflow-hidden relative mt-16 mb-16">
                    <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div class="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                        <div class="lg:col-span-7 space-y-10">
                            <h3 class="text-4xl sm:text-6xl font-black italic tracking-tighter leading-none uppercase">Compromiso con la Excelencia</h3>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div class="space-y-4">
                                    <h4 class="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Inocuidad Alimentaria</h4>
                                    <p class="text-sm text-[#1B5E34]/5/60 leading-relaxed">Nuestros procesos de higiene y seguridad alimentaria garantizan platos saludables para tu familia.</p>
                                </div>
                                <div class="space-y-4">
                                    <h4 class="text-xs font-black uppercase tracking-[0.3em] text-emerald-300">Equipo Directivo</h4>
                                    <div class="space-y-2">
                                        <p class="text-sm font-bold text-white flex items-center gap-3">
                                            <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Valdéz Mattos Beeker Aarón
                                            <span class="text-[8px] text-emerald-200/50 uppercase font-black tracking-widest ml-auto">R. Legal</span>
                                        </p>
                                        <p class="text-sm font-bold text-white flex items-center gap-3">
                                            <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span> Fernandez Cordova Samuel
                                            <span class="text-[8px] text-emerald-200/50 uppercase font-black tracking-widest ml-auto">Admin</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="lg:col-span-5 flex justify-center">
                            <img src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778318308/logo_blanco_qcb2a6.png" 
                                 class="w-full max-w-[300px] h-auto brightness-0 invert opacity-100" alt="Logo White" />
                        </div>
                    </div>
               </div>

               <!-- Platos Insignia -->
               <div class="space-y-24 mt-32">
                    <div class="text-center space-y-4">
                        <span class="inline-block text-[10px] font-black text-[#1B5E34] uppercase tracking-[0.4em] mb-2">Selección del Chef</span>
                        <h2 class="text-5xl sm:text-7xl font-black text-on-background tracking-tighter italic font-display leading-[0.9]">Platos <span class="text-[#1B5E34]">Insignia</span></h2>
                        <div class="h-1 w-20 bg-amber-400 mx-auto rounded-full"></div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-20">
                        <!-- Plato 1: Chaufa de Cecina -->
                        <div class="group relative">
                            <!-- Fondo Decorativo Circular -->
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-stone-50 rounded-full group-hover:bg-[#1B5E34]/5 group-hover:scale-110 transition-all duration-700"></div>
                            
                            <!-- Imagen PNG Flotante -->
                            <div class="relative aspect-square flex items-center justify-center mb-8 px-4">
                                <img src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392584/Gemini_Generated_Image_9gab2q9gab2q9gab-removebg-preview_lw7exv.png" 
                                     class="w-full h-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_35px_50px_rgba(27,94,52,0.25)] group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-700" 
                                     alt="Chaufa de Cecina" />
                            </div>

                            <!-- Info del Plato -->
                            <div class="text-center space-y-2">
                                <h4 class="text-2xl font-black text-on-background uppercase tracking-tighter italic leading-none">Chaufa de Cecina</h4>
                                <p class="text-[10px] font-bold text-[#1B5E34] uppercase tracking-[0.2em] opacity-60">Ahumado y Artesanal</p>
                                <div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pt-2">
                                    <div class="h-1 w-1 rounded-full bg-amber-500"></div>
                                    <div class="h-1 w-8 rounded-full bg-amber-500"></div>
                                    <div class="h-1 w-1 rounded-full bg-amber-500"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Plato 2: Chicharrón de Doncella -->
                        <div class="group relative">
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-stone-50 rounded-full group-hover:bg-[#1B5E34]/5 group-hover:scale-110 transition-all duration-700"></div>
                            
                            <div class="relative aspect-square flex items-center justify-center mb-8 px-4">
                                <img src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392882/Gemini_Generated_Image_pvazc5pvazc5pvaz-removebg-preview_akr1dd.png" 
                                     class="w-full h-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_35px_50px_rgba(27,94,52,0.25)] group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-700" 
                                     alt="Chicharrón de Doncella" />
                            </div>

                            <div class="text-center space-y-2">
                                <h4 class="text-2xl font-black text-on-background uppercase tracking-tighter italic leading-none">Chicharrón de Doncella</h4>
                                <p class="text-[10px] font-bold text-[#1B5E34] uppercase tracking-[0.2em] opacity-60">Crujiente y Tradicional</p>
                                <div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pt-2">
                                    <div class="h-1 w-1 rounded-full bg-amber-500"></div>
                                    <div class="h-1 w-8 rounded-full bg-amber-500"></div>
                                    <div class="h-1 w-1 rounded-full bg-amber-500"></div>
                                </div>
                            </div>
                        </div>

                        <!-- Plato 3: Tacacho con Cecina -->
                        <div class="group relative">
                            <div class="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-stone-50 rounded-full group-hover:bg-[#1B5E34]/5 group-hover:scale-110 transition-all duration-700"></div>
                            
                            <div class="relative aspect-square flex items-center justify-center mb-8 px-4">
                                <img src="https://res.cloudinary.com/dhcgrkrdc/image/upload/v1778392997/Gemini_Generated_Image_sl2vm5sl2vm5sl2v-removebg-preview_cokfr1.png" 
                                     class="w-full h-auto object-contain drop-shadow-[0_25px_40px_rgba(0,0,0,0.15)] group-hover:drop-shadow-[0_35px_50px_rgba(27,94,52,0.25)] group-hover:-translate-y-4 group-hover:scale-110 transition-all duration-700" 
                                     alt="Tacacho con Cecina" />
                            </div>

                            <div class="text-center space-y-2">
                                <h4 class="text-2xl font-black text-on-background uppercase tracking-tighter italic leading-none">Tacacho con Cecina</h4>
                                <p class="text-[10px] font-bold text-[#1B5E34] uppercase tracking-[0.2em] opacity-60">Plátanos verdes y yuca frita</p>
                                <div class="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pt-2">
                                    <div class="h-1 w-1 rounded-full bg-amber-500"></div>
                                    <div class="h-1 w-8 rounded-full bg-amber-500"></div>
                                    <div class="h-1 w-1 rounded-full bg-amber-500"></div>
                                </div>
                            </div>
                        </div>
                    </div>
               </div>

             </div>
           </section>`;
    }

    _renderDailyMenu(dailyMenu) {
        return `
           <section class="relative pt-10 pb-16 sm:pt-12 sm:pb-24 overflow-hidden scroll-mt-20 border-b border-[#1B5E34]/10 bg-white" id="menu-del-dia">
             <!-- Elementos de Identidad Orgánica -->
             <div class="absolute top-0 right-0 w-[300px] h-[300px] bg-[#1B5E34]/5 blur-[80px] rounded-full -mr-16 -mt-16 pointer-events-none"></div>
             
             <div class="${layout.container} relative z-10 font-sans text-center">
               <div class="max-w-5xl mx-auto">
                 
                 <!-- Cabecera Compacta -->
                 <div class="mb-8">
                    <span class="inline-block text-[9px] font-black text-[#1B5E34] uppercase tracking-[0.5em] mb-2">Experiencia Amazónica</span>
                    <h2 class="text-4xl sm:text-6xl font-black text-on-background tracking-tighter font-display leading-none mb-2 italic">
                        Menú del <span class="text-[#1B5E34]">Día</span>
                    </h2>
                    <div class="h-1 w-16 bg-amber-400 mx-auto rounded-full"></div>
                 </div>

                 <!-- El Tablón del Día (Compacto) -->
                 <div class="relative bg-[#1B5E34] rounded-[2rem] p-0.5 shadow-[0_30px_70px_-15px_rgba(27,94,52,0.15)] overflow-hidden">
                    
                    <div class="relative bg-white rounded-[1.9rem] overflow-hidden">
                        <div class="p-6 sm:p-10 lg:px-12 lg:py-10">
                            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 relative items-start">
                                
                                <!-- Divisores Verticales -->
                                <div class="hidden lg:block absolute left-1/3 top-0 bottom-0 w-px bg-stone-100"></div>
                                <div class="hidden lg:block absolute left-2/3 top-0 bottom-0 w-px bg-stone-100"></div>

                                <!-- SECCIÓN: PRIMEROS -->
                                <div class="space-y-6 group">
                                    <div class="flex flex-col items-center">
                                        <div class="h-8 w-8 text-[#1B5E34] mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                                        </div>
                                        <h3 class="text-[8px] font-black uppercase tracking-[0.4em] text-stone-300">Entradas</h3>
                                    </div>
                                    <ul class="space-y-3">
                                        ${dailyMenu.entradas.map(e => `
                                            <li class="flex flex-col items-center">
                                                <span class="text-lg sm:text-xl font-black text-on-background tracking-tight font-display italic text-[#1B5E34] leading-tight">${e}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>

                                <!-- SECCIÓN: SEGUNDOS -->
                                <div class="space-y-6 group">
                                    <div class="flex flex-col items-center">
                                        <div class="h-8 w-8 text-[#1B5E34] mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6H21M3 12H21M3 18H21" stroke-linecap="round"/></svg>
                                        </div>
                                        <h3 class="text-[8px] font-black uppercase tracking-[0.4em] text-stone-300">Fondos</h3>
                                    </div>
                                    <ul class="space-y-4">
                                        ${dailyMenu.segundos.map(s => `
                                            <li class="flex flex-col items-center">
                                                <span class="text-lg sm:text-2xl font-black text-on-background tracking-tight font-display italic text-[#1B5E34] leading-tight">${s}</span>
                                                <span class="text-[7px] font-bold text-amber-500 uppercase tracking-widest">Especialidad</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>

                                <!-- SECCIÓN: BEBIDAS -->
                                <div class="space-y-6 group">
                                    <div class="flex flex-col items-center">
                                        <div class="h-8 w-8 text-[#1B5E34] mb-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L12 22M12 2L18 8M12 2L6 8"/></svg>
                                        </div>
                                        <h3 class="text-[8px] font-black uppercase tracking-[0.4em] text-stone-300">Refrescos</h3>
                                    </div>
                                    <ul class="space-y-3">
                                        ${dailyMenu.refrescos.map(r => `
                                            <li class="flex flex-col items-center">
                                                <span class="text-lg sm:text-xl font-black text-on-background tracking-tight font-display italic text-[#1B5E34] leading-tight">${r}</span>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>

                            </div>

                            <!-- Footer Integrado (Compacto) -->
                            <div class="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-stone-50 pt-8">
                                <div class="flex items-center gap-3 text-left">
                                    <div class="h-8 w-8 rounded-full bg-[#1B5E34] text-white flex items-center justify-center font-black italic text-[10px]">R</div>
                                    <div>
                                        <p class="text-[8px] font-black uppercase tracking-widest text-on-surface-variant/40 leading-none">Atención</p>
                                        <p class="text-[10px] font-bold text-on-background">12:00 PM &mdash; 03:30 PM</p>
                                    </div>
                                </div>

                                <div class="relative group/price">
                                    <div class="absolute inset-0 bg-[#1B5E34] rounded-xl rotate-2 group-hover/price:rotate-0 transition-transform"></div>
                                    <div class="relative bg-white border-2 border-[#1B5E34] rounded-xl px-8 py-2 flex items-baseline gap-2 shadow-lg">
                                        <span class="text-xs font-black text-[#1B5E34]">S/</span>
                                        <span class="text-4xl font-black text-[#1B5E34] font-display italic leading-none">8.00</span>
                                    </div>
                                </div>

                                <p class="text-[8px] font-black uppercase tracking-[0.3em] text-[#1B5E34]/30 hidden sm:block">Calidad e Inocuidad</p>
                            </div>
                        </div>

                    </div>
                 </div>

               </div>
             </div>
           </section>`;
    }

    _renderPension(restaurantInfo) {
        const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola Rocoto! Deseo información sobre el servicio de pensión y reservas.')}`;
        const corporateLogos = [
            { name: "Amilla Ingenieros", url: "https://media.licdn.com/dms/image/v2/C4E0BAQHpbgzuL4Yyhg/company-logo_200_200/company-logo_200_200/0/1645142150214?e=2147483647&v=beta&t=W71Ha6_i-j3xxJRx8VEKwBmiknXLU7Oa0c8Jv3o2ubo" },
            { name: "Corporación Maya", url: "https://scontent-lim1-1.xx.fbcdn.net/v/t39.30808-6/300627995_760722825269522_8609167061658823472_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=NnGWRxjaPeEQ7kNvwG_Hfkr&_nc_oc=AdqAdqXTxz8sFWCFGddYyepT37oIyx0yjxoDy0x71W95fd8Tb4Tqa4GO-pkxHcvZiuEOP45RJUvg2vMsQhvx7_4K&_nc_zt=23&_nc_ht=scontent-lim1-1.xx&_nc_gid=wqQs-7r2AUL2bAO132fPWg&_nc_ss=7b289&oh=00_Af47HYCc6Nhd2P6ba4Ww6nlJVQJ2pxaZSmQ6l3_Tx0bN0w&oe=69FDE9AA" },
            { name: "Ecologas", url: "https://ecologascanta.com/wp-content/uploads/2021/03/Logo-600x440.png" },
            { name: "SIMSA", url: "https://www.simsa.com.pe/assets/images/logo.png" }
        ];

        return `
           <section id="pension" class="relative py-24 sm:py-32 overflow-hidden bg-white scroll-mt-20">
              <!-- Fondo Decorativo sutil con identidad -->
              <div class="absolute inset-0 bg-stone-50/50 pointer-events-none"></div>
              <div class="${layout.container} relative z-10">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center">
                      <div class="space-y-12">
                          <div class="space-y-6">
                              <span class="inline-block text-[10px] font-black text-[#1B5E34] uppercase tracking-[0.4em] mb-2 border-l-4 border-[#1B5E34] pl-4">Soluciones Corporativas</span>
                              <h2 class="text-5xl sm:text-7xl font-black text-on-background tracking-tighter italic font-display leading-[0.9]">Servicio de <span class="text-[#1B5E34]">Pensión</span></h2>
                              <p class="text-lg sm:text-xl text-on-surface-variant/60 font-medium leading-relaxed italic max-w-xl">
                                Alimentamos el motor de su empresa con la sazón y calidad que nos caracteriza. Una alianza estratégica para el bienestar de su equipo.
                              </p>
                          </div>
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              <div class="flex gap-4 group">
                                  <div class="h-12 w-12 rounded-2xl bg-[#1B5E34]/5 text-[#1B5E34] flex items-center justify-center shrink-0 group-hover:bg-[#1B5E34] group-hover:text-white transition-all duration-500">
                                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                                  </div>
                                  <div>
                                      <h4 class="text-xs font-black uppercase tracking-widest text-on-background mb-1">Inocuidad Total</h4>
                                      <p class="text-[10px] font-bold text-stone-400 uppercase leading-relaxed tracking-tighter">Estrictos protocolos de higiene en cada preparación.</p>
                                  </div>
                              </div>
                              <div class="flex gap-4 group">
                                  <div class="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500">
                                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                  </div>
                                  <div>
                                      <h4 class="text-xs font-black uppercase tracking-widest text-on-background mb-1">Nutrición & Sabor</h4>
                                      <p class="text-[10px] font-bold text-stone-400 uppercase leading-relaxed tracking-tighter">Menús balanceados con el auténtico toque regional.</p>
                                  </div>
                              </div>
                          </div>
                          <div class="pt-6">
                            <a href="${whatsappLink}" target="_blank" class="group relative inline-flex items-center gap-8 bg-[#1B5E34] text-white px-10 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 shadow-[0_20px_40px_rgba(27,94,52,0.2)]">
                                <span class="relative z-10">Cotizar Convenio</span>
                                <svg class="h-5 w-5 relative z-10 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                                <div class="absolute inset-0 bg-amber-500 transform scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
                            </a>
                          </div>
                      </div>
                      <div class="relative">
                          <div class="relative bg-white rounded-[3rem] p-10 sm:p-14 border-2 border-stone-50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] group overflow-hidden">
                              <div class="text-center mb-12">
                                  <h3 class="text-[10px] font-black text-[#1B5E34] uppercase tracking-[0.4em] italic mb-2">Avalan nuestra experiencia</h3>
                                  <div class="h-1 w-12 bg-amber-400 mx-auto rounded-full"></div>
                              </div>
                              <div class="grid grid-cols-2 gap-x-10 gap-y-16 items-center">
                                  ${corporateLogos.map(logo => `
                                    <div class="flex flex-col items-center gap-4 group/logo">
                                        <div class="h-20 w-full flex items-center justify-center filter grayscale opacity-40 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 transition-all duration-700">
                                            <img src="${logo.url}" alt="${logo.name}" class="max-h-full max-w-full object-contain transform group-hover/logo:scale-110 transition-transform" />
                                        </div>
                                        <span class="text-[8px] font-black text-center uppercase tracking-widest text-stone-300 group-hover/logo:text-[#1B5E34] transition-colors">${logo.name}</span>
                                    </div>
                                  `).join('')}
                              </div>
                          </div>
                      </div>
                  </div>
              </div>
           </section>`;
    }

    _renderContact(restaurantInfo) {
        return `
           <section id="contacto" class="relative pt-10 pb-20 sm:pt-12 sm:pb-28 bg-white overflow-hidden scroll-mt-20">
              <!-- Glow Decorativo de fondo -->
              <div class="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#1B5E34]/5 rounded-full blur-[120px] opacity-40 pointer-events-none"></div>
              
              <div class="${layout.container} relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                   
                   <!-- Información de Contacto -->
                   <div class="lg:col-span-5 space-y-8">
                      <div class="space-y-2">
                        <span class="inline-block text-[9px] font-black text-[#1B5E34] uppercase tracking-[0.4em] mb-1 border-l-4 border-[#1B5E34] pl-4">Encuéntranos</span>
                        <h2 class="text-4xl sm:text-6xl font-black text-on-background tracking-tighter italic font-display leading-[0.9]">Nuestra <span class="text-[#1B5E34]">Casa</span></h2>
                      </div>

                      <div class="space-y-4">
                        <!-- Card Dirección Compacta -->
                        <div class="group flex items-center gap-4 p-4 sm:p-5 rounded-[2rem] bg-stone-50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl hover:border-emerald-100">
                            <div class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#1B5E34] text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <div class="min-w-0">
                                <p class="text-[8px] font-black text-[#1B5E34]/40 uppercase tracking-widest mb-0.5">Visítanos</p>
                                <p class="text-xs sm:text-sm font-bold text-on-background leading-tight truncate">${restaurantInfo.address}</p>
                            </div>
                        </div>

                        <!-- Card Teléfono Compacta -->
                        <div class="group flex items-center gap-4 p-4 sm:p-5 rounded-[2rem] bg-stone-50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl hover:border-emerald-100">
                            <div class="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 011.94.445l-.992 2.985a1 1 0 01-1.16.674l-3.38-.73a1 1 0 00-1.037.495l-1.332 2.332a1 1 0 00.122 1.258l4.13 4.13a1 1 0 001.258.122l2.332-1.332a1 1 0 00.495-1.037l-.73-3.38a1 1 0 01.674-1.16l2.985-.992A1 1 0 0121 8.06V11a2 2 0 01-2 2h-1M3 20a2 2 0 012-2h.01"></path></svg>
                            </div>
                            <div>
                                <p class="text-[8px] font-black text-amber-600/40 uppercase tracking-widest mb-0.5">Llámanos</p>
                                <p class="text-xs sm:text-sm font-bold text-on-background leading-tight">${restaurantInfo.phone}</p>
                            </div>
                        </div>
                      </div>

                      <div class="pt-2">
                        <a href="${restaurantInfo.mapsUrl}" target="_blank" class="inline-flex items-center gap-4 bg-[#1B5E34] text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-lg">
                            Ver Mapa Completo
                            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                        </a>
                      </div>
                   </div>

                   <!-- Mapa Flotante Compacto -->
                   <div class="lg:col-span-7 relative h-[350px] sm:h-[420px] w-full">
                      <!-- Capas decorativas de fondo -->
                      <div class="absolute inset-0 bg-[#1B5E34]/5 rounded-[2.5rem] -rotate-1 scale-[1.01] -z-10"></div>
                      
                      <!-- Contenedor del Mapa -->
                      <div class="h-full w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group relative">
                        <iframe src="${restaurantInfo.mapsEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" class="grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-1000"></iframe>
                        <div class="absolute inset-0 bg-transparent pointer-events-none group-hover:pointer-events-auto"></div>
                        
                        <!-- Mini Sello -->
                        <div class="absolute top-4 right-4 h-12 w-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border border-white/50 z-20">
                            <span class="text-[#1B5E34] font-black italic text-sm">R</span>
                        </div>
                      </div>
                   </div>

                </div>
              </div>
           </section>`;
    }

    _renderFooter(restaurantInfo) {
        const LOGO_HORIZONTAL = "https://res.cloudinary.com/dhcgrkrdc/image/upload/v1777604357/Logo_Rest_Rocoto_Horizontal_bgslwf.png";
        const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola Rocoto! Deseo información sobre el servicio de pensión y reservas.')}`;
        return `
           <footer class="bg-stone-900 text-white pt-24 pb-12 overflow-hidden relative">
             <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#1B5E34]/50 to-transparent"></div>
             <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-[#1B5E34]/10 blur-[80px] rounded-full"></div>
             <div class="${layout.container} relative z-10">
               <div class="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20">
                 <div class="md:col-span-5 space-y-10">
                   <div class="space-y-6">
                      <img alt="Logo" class="h-14 w-auto brightness-0 invert" src="${LOGO_HORIZONTAL}" />
                      <p class="text-stone-400 text-sm sm:text-base leading-relaxed max-w-sm italic font-medium">
                        Fusión de tradición chifa y vanguardia culinaria en el corazón de la selva central. Sabores que trascienden el paladar.
                      </p>
                   </div>
                   <div class="flex gap-4">
                     <a href="#" class="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1B5E34] hover:border-[#1B5E34] transition-all duration-500 group">
                        <svg class="h-5 w-5 text-stone-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.656 10.127 8.812 11.235v-7.94h-2.886v-3.295h2.886V9.456c0-2.847 1.696-4.42 4.127-4.42 1.163 0 2.38.207 2.38.207v2.617h-1.34c-1.41 0-1.85.876-1.85 1.776v2.13h2.95l-.472 3.295h-2.478v7.94c5.156-1.108 8.812-6.145 8.812-11.235z"/></svg>
                     </a>
                     <a href="#" class="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1B5E34] hover:border-[#1B5E34] transition-all duration-500 group">
                        <svg class="h-5 w-5 text-stone-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 3.174 4.919 4.851.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 1.679-1.667 4.705-4.92 4.85-.129.053-3.585.069-4.849.069-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-3.174-4.919-4.85-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-1.677 1.667-4.705 4.919-4.85 1.266-.058 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                     </a>
                   </div>
                 </div>
                 <div class="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                    <div>
                      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#1B5E34] mb-8">Navegación</h4>
                      <ul class="space-y-4">
                        <li><a href="#menu-del-dia" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Menú Diario</a></li>
                        <li><a href="#menu" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">La Carta</a></li>
                        <li><a href="#contacto" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Visítanos</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#1B5E34] mb-8">Pensión</h4>
                      <ul class="space-y-4">
                        <li><a href="#pension" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Empresas</a></li>
                        <li><a href="${whatsappLink}" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Cotizar Plan</a></li>
                        <li><a href="#asistencia" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Asistencia</a></li>
                      </ul>
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-[#1B5E34] mb-8">Contacto</h4>
                      <ul class="space-y-6">
                        <li><span class="text-stone-600 text-[10px] block uppercase font-black mb-1">Teléfono</span><a href="tel:${restaurantInfo.phone}" class="text-stone-300 text-sm font-bold hover:text-white transition-colors">${restaurantInfo.phone}</a></li>
                        <li><span class="text-stone-600 text-[10px] block uppercase font-black mb-1">Local</span><span class="text-stone-300 text-sm font-bold leading-snug block">${restaurantInfo.address}</span></li>
                      </ul>
                    </div>
                 </div>
               </div>
               <div class="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-stone-500">
                 <p>&copy; 2026 ${restaurantInfo.name.toUpperCase()}. TODOS LOS DERECHOS RESERVADOS.</p>
                 <div class="flex items-center gap-8">
                    <a href="#" class="hover:text-[#1B5E34] transition-colors">Privacidad</a>
                    <a href="#" class="hover:text-[#1B5E34] transition-colors">Términos</a>
                    <span class="text-[#1B5E34]/20 px-4 py-1 border border-white/5 rounded-full italic">Rocoto Experience</span>
                 </div>
               </div>
             </div>
           </footer>`;
    }

    _renderStyles() {
        return `
         <style>
            .admin-panel-btn-new { 
                @apply flex items-center gap-4 w-full p-3 rounded-2xl text-stone-500 transition-all duration-300 hover:bg-white hover:shadow-xl hover:shadow-black/[0.03] active:scale-[0.98] text-left border border-transparent hover:border-stone-100;
            }
            .admin-panel-btn-new .icon-box {
                @apply h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 shadow-sm;
            }
            .admin-panel-btn-new:hover {
                @apply text-on-background;
            }
            .admin-panel-btn-new[data-color="emerald"]:hover .icon-box { @apply bg-[#1B5E34] shadow-[#1B5E34]/20; }
            .admin-panel-btn-new[data-color="blue"]:hover .icon-box { @apply bg-blue-600 shadow-blue-500/20; }
            .admin-panel-btn-new[data-color="purple"]:hover .icon-box { @apply bg-purple-600 shadow-purple-500/20; }
            
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
         </style>`;
    }

    initSwiper() {
        if (this.swiper) { this.swiper.destroy(true, true); }
        const swiperEl = document.querySelector('.hero-swiper');
        if (!swiperEl) return;
        this.swiper = new Swiper('.hero-swiper', {
            modules: [Navigation, Pagination, Autoplay],
            loop: true, speed: 1000, autoplay: { delay: 6000, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
    }
}
