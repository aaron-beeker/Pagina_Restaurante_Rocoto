import { escapeHtml } from "../utils/html.js";
import { layout, typography, button, card, form } from "../ui/layout.js";
import Swiper from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const DEFAULT_HERO_BG = "https://lh3.googleusercontent.com/p/AF1QipOX8DWrfF3cdq5kgcHL-HxXdlpZLZZ7KAe9CrQn=s1360-w1360-h1020-rw";

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
              <div id="hero-container" class="relative"></div>
              
              <!-- SECCIÓN MENÚ DEL DÍA CON FONDO VIBRANTE -->
              <div id="daily-menu-container" class="relative bg-gradient-to-b from-white to-emerald-50/30"></div>
              
              <!-- SECCIÓN CARTA CON FONDO GRADIENTE Y GLOW -->
              <section class="relative py-24 sm:py-32 overflow-hidden scroll-mt-20 bg-white" id="menu">
                <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-50/30 to-transparent pointer-events-none"></div>
                <div class="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-stone-100/50 to-transparent pointer-events-none"></div>
                
                <!-- Glow Decorativo de Color -->
                <div class="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-200/20 blur-[120px] rounded-full pointer-events-none animate-pulse"></div>
                <div class="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-amber-100/20 blur-[100px] rounded-full pointer-events-none"></div>

                <div class="${layout.container} relative z-10">
                  <div class="max-w-3xl mb-16 sm:mb-24">
                    <span class="inline-block text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 border-l-4 border-primary pl-4">Sabores que Enamoran</span>
                    <h2 class="text-6xl sm:text-8xl font-black text-on-background tracking-tighter italic font-display leading-[0.85] mb-8">Nuestra <span class="text-primary">Carta</span></h2>
                    <p class="text-base sm:text-xl text-on-surface-variant/60 font-medium max-w-xl leading-relaxed italic">
                      Explora una selección única donde la tradición chifa se encuentra con el corazón de la selva.
                    </p>
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
        
        return `
         <nav class="fixed top-0 z-50 w-full border-b border-surface-variant bg-surface/90 backdrop-blur-md shadow-sm">
           <div class="${layout.container} flex h-16 items-center justify-between">
              <a href="#/" class="flex shrink-0 items-center">
                 <img alt="Logo" class="h-10 w-auto" src="${restaurantInfo.logoUrl}" />
              </a>
              <div class="hidden items-center gap-8 md:flex">
                 <a class="${button.base} ${button.ghost}" href="#menu-del-dia">Menú del día</a>
                 <a class="${button.base} ${button.ghost}" href="#menu">La carta</a>
                 <a class="${button.base} ${button.ghost}" href="#pension">Servicio Pensión</a>
                 <a class="${button.base} ${button.ghost}" href="#contacto">Contacto</a>
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
        return `
          <div id="mobile-nav-panel" class="hidden fixed inset-0 z-[100] h-screen w-full">
            <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onclick="document.getElementById('mobile-nav-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110] animate-slide-in-left">
                
                <!-- Cabecera del Panel Móvil -->
                <div class="flex items-center justify-between p-8 border-b border-stone-100 bg-white shrink-0 relative overflow-hidden">
                  <div class="absolute top-0 left-0 w-24 h-24 bg-emerald-50 rounded-full -ml-12 -mt-12 opacity-40"></div>
                  <img src="${restaurantInfo.logoUrl}" class="h-10 w-auto relative z-10 brightness-0">
                  <button class="close-nav p-2 text-stone-300 hover:text-primary transition-colors relative z-10">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>

                <!-- Enlaces de Navegación (Premium List) -->
                <div class="flex-1 flex flex-col gap-2 p-6 bg-white overflow-y-auto scrollbar-hide">
                  <div class="mb-6 px-4">
                    <h3 class="text-[9px] font-black text-stone-300 uppercase tracking-[0.4em]">Explorar</h3>
                  </div>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-emerald-50" href="#menu-del-dia">
                      <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-emerald-700 transition-colors">Menú del día</span>
                  </a>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-emerald-50" href="#menu">
                      <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-emerald-700 transition-colors">Nuestra Carta</span>
                  </a>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-emerald-50" href="#pension">
                      <div class="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                      </div>
                      <span class="text-base font-black text-stone-800 uppercase tracking-tighter group-hover:text-emerald-700 transition-colors">Servicio Pensión</span>
                  </a>

                  <a class="mobile-nav-link group flex items-center gap-5 p-5 rounded-[2rem] transition-all active:scale-95 hover:bg-emerald-50" href="#contacto">
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
                  <div class="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -mr-16 -mt-16 opacity-40"></div>
                  <button class="close-user-menu absolute top-6 right-6 p-2 text-stone-300 hover:text-primary transition-colors z-20">
                    <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                  <div class="flex items-center gap-5 relative z-10">
                    <div class="h-16 w-16 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100 shadow-inner shrink-0">
                      <svg class="h-8 w-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="1.5" d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div class="min-w-0">
                      <p class="text-lg font-black text-on-background truncate uppercase tracking-tighter">${user ? user.name : 'Invitado'}</p>
                      <p class="text-[9px] uppercase tracking-[0.3em] text-emerald-600 font-black opacity-60">${user ? user.role : 'Visitante'}</p>
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
                                <div class="icon-box bg-emerald-50 text-emerald-600 group-hover/btn:bg-emerald-600 group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Menú del Día</span>
                            </button>
                            <button id="admin-manage-carta-btn" class="admin-panel-btn-new group/btn" data-color="emerald">
                                <div class="icon-box bg-emerald-50 text-emerald-600 group-hover/btn:bg-emerald-600 group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></div>
                                <span class="text-sm font-black uppercase tracking-tighter">Gestionar Carta</span>
                            </button>
                            <button id="admin-hero-promo-btn" class="admin-panel-btn-new group/btn" data-color="emerald">
                                <div class="icon-box bg-emerald-50 text-emerald-600 group-hover/btn:bg-emerald-600 group-hover/btn:text-white"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>
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
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
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
                        <div class="swiper-slide w-full">
                            <img src="${DEFAULT_HERO_BG}" class="w-full h-auto block" alt="Banner" />
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

    _renderDailyMenu(dailyMenu) {
        return `
           <section class="relative py-24 sm:py-32 overflow-hidden scroll-mt-20 border-b border-emerald-100/50 bg-emerald-50/20" id="menu-del-dia">
             <!-- Patrón de Fondo Suave -->
             <div class="absolute inset-0 opacity-[0.03] pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23064e3b\" fill-opacity=\"0.4\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2v-4h4v-2H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
             
             <div class="${layout.container} relative z-10">
               <div class="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                 
                 <!-- IMAGEN DESKTOP: Estilo STICKER FINO -->
                 <div class="hidden lg:block flex-1 relative order-1">
                    <div class="relative p-1.5 bg-white rounded-[3.2rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] rotate-[-2deg] hover:rotate-0 hover:scale-[1.03] transition-all duration-700 ease-out cursor-default select-none group/sticker">
                       <div class="relative rounded-[2.8rem] overflow-hidden">
                          <img alt="Nuestra entrada" class="w-full aspect-[4/5] object-cover" src="https://lh3.googleusercontent.com/p/AF1QipOX8DWrfF3cdq5kgcHL-HxXdlpZLZZ7KAe9CrQn=s1360" />
                          <!-- Brillo de Sticker (Glossy) muy tenue -->
                          <div class="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-20"></div>
                       </div>
                       <!-- Sombra de "Recorte" Fina -->
                       <div class="absolute inset-0 border border-emerald-950/5 rounded-[3.2rem] -z-10"></div>
                       
                       <!-- Sello Decorativo más sutil -->
                       <div class="absolute -top-4 -right-4 h-16 w-16 bg-amber-400 text-amber-950 rounded-full flex items-center justify-center shadow-lg border-2 border-white rotate-[15deg] group-hover/sticker:rotate-[-5deg] transition-transform duration-700">
                          <span class="text-[8px] font-black uppercase tracking-tighter text-center leading-none italic">Sabor<br>Real</span>
                       </div>
                    </div>
                 </div>

                 <div class="flex-1 w-full order-2">
                   <div class="mb-16">
                     <div class="flex items-center gap-4 mb-6">
                        <div class="h-px w-12 bg-emerald-600"></div>
                        <span class="text-[11px] font-black text-emerald-700 uppercase tracking-[0.4em]">Experiencia Diaria</span>
                     </div>
                     <h2 class="text-6xl sm:text-8xl font-black text-on-background tracking-tighter italic font-display leading-tight mb-8">Menú del <span class="text-emerald-600 underline decoration-amber-400 underline-offset-8">Día</span></h2>
                   </div>

                   <div class="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-16">
                     <div class="space-y-6">
                       <h3 class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-800">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Entradas
                       </h3>
                       <ul class="space-y-3">
                         ${dailyMenu.entradas.map(e => `<li class="text-sm sm:text-base font-bold text-on-background/70 hover:text-emerald-700 transition-colors uppercase tracking-tight list-none">${e}</li>`).join('')}
                       </ul>
                     </div>
                     <div class="space-y-6">
                       <h3 class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-800">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Segundos
                       </h3>
                       <ul class="space-y-3">
                         ${dailyMenu.segundos.map(s => `<li class="text-sm sm:text-base font-bold text-on-background/70 hover:text-emerald-700 transition-colors uppercase tracking-tight list-none">${s}</li>`).join('')}
                       </ul>
                     </div>
                     <div class="space-y-6">
                       <h3 class="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-800">
                          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span> Bebida
                       </h3>
                       <ul class="space-y-3">
                         ${dailyMenu.refrescos.map(r => `<li class="text-sm sm:text-base font-bold text-on-background/70 hover:text-emerald-700 transition-colors uppercase tracking-tight list-none">${r}</li>`).join('')}
                       </ul>
                     </div>
                   </div>

                   <!-- PRECIO Y STATUS -->
                   <div class="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                      <div class="inline-flex items-center gap-8 p-2 bg-white rounded-full shadow-xl border border-emerald-100 pr-10">
                        <div class="bg-emerald-600 text-white px-8 py-4 rounded-full shadow-lg flex items-center gap-4">
                          <span class="text-2xl sm:text-3xl font-black italic font-display">S/ 8.00</span>
                        </div>
                        <div class="flex flex-col">
                            <div class="flex items-center gap-2">
                                <span class="relative flex h-2 w-2">
                                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span class="text-[10px] font-black uppercase tracking-widest text-emerald-900">Disponible</span>
                            </div>
                            <span class="text-[9px] font-bold text-emerald-900/30 uppercase tracking-tighter">12:00 PM - 3:30 PM</span>
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
           <section id="pension" class="relative py-24 sm:py-32 overflow-hidden bg-gradient-to-b from-[#fafafa] to-[#f0f4ff]/50">
              <!-- Glow Decorativo Indigo -->
              <div class="absolute top-1/4 right-0 w-[500px] h-[500px] bg-blue-100/20 blur-[120px] rounded-full pointer-events-none"></div>

              <div class="${layout.container} relative z-10">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                      
                      <!-- Columna de Información -->
                      <div class="space-y-12">
                          <div class="max-w-xl">
                              <span class="inline-block text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4 border-l-4 border-indigo-600 pl-4">Alianzas Estratégicas</span>
                              <h2 class="text-6xl sm:text-7xl font-black text-on-background tracking-tighter italic font-display leading-[0.9] mb-8">Servicio de <span class="text-indigo-600">Pensión</span></h2>
                              <p class="text-base sm:text-xl text-on-surface-variant/60 font-medium leading-relaxed italic">
                                Sabor norteño y nutrición balanceada para el motor de tu empresa. Somos el socio gastronómico que tu equipo merece.
                              </p>
                          </div>

                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                              <!-- Card Local -->
                              <div class="group p-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                  <div class="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                  </div>
                                  <h4 class="font-black text-on-background mb-3 text-sm uppercase tracking-widest">Atención Local</h4>
                                  <p class="text-[11px] text-on-surface-variant/40 font-medium leading-relaxed uppercase tracking-tight">Comodidad y rapidez en nuestro establecimiento para tu personal.</p>
                              </div>

                              <!-- Card WhatsApp -->
                              <div class="group p-8 bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                  <div class="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform">
                                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  </div>
                                  <h4 class="font-black text-on-background mb-3 text-sm uppercase tracking-widest">Reservas App</h4>
                                  <p class="text-[11px] text-emerald-600/60 font-black italic uppercase tracking-tight">Gestión exclusiva vía mensaje para mayor eficiencia y control.</p>
                              </div>
                          </div>

                          <div class="pt-4">
                            <a href="${whatsappLink}" target="_blank" class="inline-flex items-center gap-6 bg-indigo-600 text-white px-12 py-6 rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(79,70,229,0.3)]">
                                Consultar Plan Corporativo
                            </a>
                          </div>
                      </div>

                      <!-- Columna de Logos (Social Proof) -->
                      <div class="relative">
                          <div class="bg-white/40 backdrop-blur-sm rounded-[3.5rem] p-10 sm:p-16 border border-white shadow-2xl overflow-hidden group">
                              <div class="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full opacity-50"></div>
                              <h3 class="relative z-10 font-black text-xs text-center mb-16 uppercase tracking-[0.4em] text-indigo-900/30 italic">Confían en nosotros</h3>
                              <div class="grid grid-cols-2 gap-x-12 gap-y-16 items-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                                  ${corporateLogos.map(logo => `
                                    <div class="flex flex-col items-center gap-5 group/logo">
                                        <div class="h-16 w-full flex items-center justify-center">
                                            <img src="${logo.url}" alt="${logo.name}" class="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover/logo:scale-110 transition-transform duration-500" />
                                        </div>
                                        <span class="text-[8px] font-black text-center uppercase tracking-widest text-on-surface-variant/20 group-hover/logo:text-indigo-600 transition-colors">${logo.name}</span>
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
           <section id="contacto" class="relative py-24 sm:py-32 bg-white overflow-hidden scroll-mt-20">
              <div class="absolute top-1/2 left-0 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
              <div class="${layout.container} relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
                   <div class="lg:col-span-5 space-y-10">
                      <div>
                        <span class="inline-block text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-4 border-l-4 border-emerald-600 pl-4">Ubicación</span>
                        <h2 class="text-6xl sm:text-7xl font-black text-on-background tracking-tighter italic font-display leading-[0.9] mb-8">Nuestra <span class="text-emerald-600">Casa</span></h2>
                        <div class="space-y-8 mt-12">
                            <div class="group flex items-start gap-6 p-6 rounded-[2rem] bg-stone-50/50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl hover:border-emerald-100">
                                <div class="h-14 w-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-900/20 group-hover:scale-110 transition-transform">
                                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-[10px] font-black text-emerald-900/30 uppercase tracking-widest leading-none">Dirección</p>
                                    <p class="text-base sm:text-lg font-bold text-on-background leading-snug">${restaurantInfo.address}</p>
                                </div>
                            </div>
                            <div class="group flex items-start gap-6 p-6 rounded-[2rem] bg-stone-50/50 border border-stone-100 transition-all hover:bg-white hover:shadow-xl hover:border-emerald-100">
                                <div class="h-14 w-14 rounded-2xl bg-primary text-white flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 011.94.445l-.992 2.985a1 1 0 01-1.16.674l-3.38-.73a1 1 0 00-1.037.495l-1.332 2.332a1 1 0 00.122 1.258l4.13 4.13a1 1 0 001.258.122l2.332-1.332a1 1 0 00.495-1.037l-.73-3.38a1 1 0 01.674-1.16l2.985-.992A1 1 0 0121 8.06V11a2 2 0 01-2 2h-1M3 20a2 2 0 012-2h.01"></path></svg>
                                </div>
                                <div class="space-y-1">
                                    <p class="text-base sm:text-lg font-bold text-on-background leading-snug">${restaurantInfo.phone}</p>
                                </div>
                            </div>
                        </div>
                      </div>
                      <div class="pt-6 pl-2">
                        <a href="${restaurantInfo.mapsUrl}" target="_blank" class="inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] border-b-2 border-emerald-600 pb-2 hover:text-emerald-600 transition-all hover:gap-6">
                            Cómo llegar ahora <span class="text-lg">&rarr;</span>
                        </a>
                      </div>
                   </div>
                   <div class="lg:col-span-7 h-[450px] sm:h-[600px] w-full relative">
                      <div class="absolute inset-0 bg-emerald-900/5 rounded-[3.5rem] -rotate-2 -z-10 translate-x-4 translate-y-4"></div>
                      <div class="h-full w-full rounded-[3.5rem] overflow-hidden shadow-2xl border-8 border-white group relative">
                        <iframe src="${restaurantInfo.mapsEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" class="grayscale-[0.2] contrast-[1.1] hover:grayscale-0 transition-all duration-1000"></iframe>
                        <div class="absolute inset-0 bg-transparent pointer-events-none group-hover:pointer-events-auto"></div>
                      </div>
                   </div>
                </div>
              </div>
           </section>`;
    }

    _renderFooter(restaurantInfo) {
        const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola Rocoto! Deseo información sobre el servicio de pensión y reservas.')}`;
        return `
           <footer class="bg-stone-900 text-white pt-24 pb-12 overflow-hidden relative">
             <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
             <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full"></div>
             <div class="${layout.container} relative z-10">
               <div class="grid grid-cols-1 md:grid-cols-12 gap-16 lg:gap-20">
                 <div class="md:col-span-5 space-y-10">
                   <div class="space-y-6">
                      <img alt="Logo" class="h-14 w-auto brightness-0 invert" src="${restaurantInfo.logoUrl}" />
                      <p class="text-stone-400 text-sm sm:text-base leading-relaxed max-w-sm italic font-medium">
                        Fusión de tradición chifa y vanguardia culinaria en el corazón de la selva central. Sabores que trascienden el paladar.
                      </p>
                   </div>
                   <div class="flex gap-4">
                     <a href="#" class="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 transition-all duration-500 group">
                        <svg class="h-5 w-5 text-stone-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 3.656 10.127 8.812 11.235v-7.94h-2.886v-3.295h2.886V9.456c0-2.847 1.696-4.42 4.127-4.42 1.163 0 2.38.207 2.38.207v2.617h-1.34c-1.41 0-1.85.876-1.85 1.776v2.13h2.95l-.472 3.295h-2.478v7.94c5.156-1.108 8.812-6.145 8.812-11.235z"/></svg>
                     </a>
                     <a href="#" class="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-emerald-600 hover:border-emerald-500 transition-all duration-500 group">
                        <svg class="h-5 w-5 text-stone-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 3.174 4.919 4.851.058 1.266.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 1.679-1.667 4.705-4.92 4.85-.129.053-3.585.069-4.849.069-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-3.174-4.919-4.85-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-1.677 1.667-4.705 4.919-4.85 1.266-.058 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                     </a>
                   </div>
                 </div>
                 <div class="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12">
                    <div>
                      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Navegación</h4>
                      <ul class="space-y-4">
                        <li><a href="#menu-del-dia" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Menú Diario</a></li>
                        <li><a href="#menu" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">La Carta</a></li>
                        <li><a href="#contacto" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Visítanos</a></li>
                      </ul>
                    </div>
                    <div>
                      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Pensión</h4>
                      <ul class="space-y-4">
                        <li><a href="#pension" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Empresas</a></li>
                        <li><a href="${whatsappLink}" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Cotizar Plan</a></li>
                        <li><a href="#asistencia" class="text-stone-300 hover:text-white transition-colors text-sm font-bold uppercase tracking-tight">Asistencia</a></li>
                      </ul>
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                      <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-8">Contacto</h4>
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
                    <a href="#" class="hover:text-emerald-500 transition-colors">Privacidad</a>
                    <a href="#" class="hover:text-emerald-500 transition-colors">Términos</a>
                    <span class="text-emerald-500/20 px-4 py-1 border border-white/5 rounded-full italic">Rocoto Experience</span>
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
            .admin-panel-btn-new[data-color="emerald"]:hover .icon-box { @apply bg-emerald-600 shadow-emerald-500/20; }
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

    _renderHero(heroPromo) {
        const banners = heroPromo?.banners?.filter(b => b.activo) || [];
        return `
           <section class="relative w-full overflow-hidden bg-background" id="hero">
             <div class="swiper hero-swiper h-full w-full">
                <div class="swiper-wrapper">
                    ${banners.length === 0 ? `
                        <div class="swiper-slide w-full">
                            <img src="${DEFAULT_HERO_BG}" class="w-full h-auto block" alt="Banner" />
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
}
