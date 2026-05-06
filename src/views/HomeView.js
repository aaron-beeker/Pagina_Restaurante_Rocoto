import { escapeHtml } from "../utils/html.js";
import { layout, typography, button, card } from "../ui/layout.js";

const DEFAULT_HERO_BG = "https://lh3.googleusercontent.com/p/AF1QipOX8DWrfF3cdq5kgcHL-HxXdlpZLZZ7KAe9CrQn=s1360-w1360-h1020-rw";

export class HomeView {
    constructor(rootElement) {
        this.rootElement = rootElement;
        this.swiper = null;
    }

    renderShell(restaurantInfo, user = null, dailyMenu, heroPromo = null) {
      const banners = heroPromo?.banners?.filter(b => b.activo) || [];
      const userColorClass = user ? "text-primary" : "text-stone-400";
      const userBgClass = user ? "bg-primary/5" : "bg-surface-container-low";

      // Links de Acción
      const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, '')}?text=${encodeURIComponent('¡Hola Rocoto! Deseo información sobre el servicio de pensión y reservas.')}`;
      const mapsLink = restaurantInfo.mapsUrl;

      const corporateLogos = [
        { name: "Amilla Ingenieros S.A.C", url: "https://media.licdn.com/dms/image/v2/C4E0BAQHpbgzuL4Yyhg/company-logo_200_200/company-logo_200_200/0/1645142150214?e=2147483647&v=beta&t=W71Ha6_i-j3xxJRx8VEKwBmiknXLU7Oa0c8Jv3o2ubo" },
        { name: "Corporación Maya", url: "https://scontent-lim1-1.xx.fbcdn.net/v/t39.30808-6/300627995_760722825269522_8609167061658823472_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=NnGWRxjaPeEQ7kNvwG_Hfkr&_nc_oc=AdqAdqXTxz8sFWCFGddYyepT37oIyx0yjxoDy0x71W95fd8Tb4Tqa4GO-pkxHcvZiuEOP45RJUvg2vMsQhvx7_4K&_nc_zt=23&_nc_ht=scontent-lim1-1.xx&_nc_gid=wqQs-7r2AUL2bAO132fPWg&_nc_ss=7b289&oh=00_Af47HYCc6Nhd2P6ba4Ww6nlJVQJ2pxaZSmQ6l3_Tx0bN0w&oe=69FDE9AA" },
        { name: "Ecologas", url: "https://ecologascanta.com/wp-content/uploads/2021/03/Logo-600x440.png" },
        { name: "SIMSA", url: "https://www.simsa.com.pe/assets/images/logo.png" }
      ];

      this.rootElement.innerHTML = `
         <nav class="fixed top-0 z-50 w-full border-b border-surface-variant bg-surface/90 backdrop-blur-md shadow-sm">
           <div class="${layout.container} flex h-16 items-center justify-between">
              <a href="/" onclick="window.location.reload();" class="flex shrink-0 items-center">
                 <img alt="Logo" class="h-10 w-auto" src="${restaurantInfo.logoUrl}" />
              </a>
              <div class="hidden items-center gap-8 md:flex">
                 <a class="${button.base} ${button.ghost}" href="#daily-menu">Menú del día</a>
                 <a class="${button.base} ${button.ghost}" href="#menu">La carta</a>
                 <a class="${button.base} ${button.ghost}" href="#pension">Servicio Pensión</a>
                 <a class="${button.base} ${button.ghost}" href="#location">Contacto</a>
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

           <!-- PANEL NAVEGACIÓN MÓVIL (IZQUIERDO) -->
          <div id="mobile-nav-panel" class="hidden fixed inset-0 z-[100] h-screen w-full">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="document.getElementById('mobile-nav-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-surface shadow-2xl flex flex-col z-[110] animate-slide-in-left">
                <div class="flex items-center justify-center p-10 border-b border-surface-variant bg-surface shrink-0">
                  <img src="${restaurantInfo.logoUrl}" class="h-12 w-auto">
                </div>
                <div class="flex-1 flex flex-col gap-2 p-6 bg-surface overflow-y-auto">
                  <a class="mobile-nav-link flex items-center gap-5 p-5 rounded-3xl text-xl font-extrabold text-on-background hover:bg-background active:bg-primary/5 transition-colors" href="#daily-menu">
                      <div class="p-3 rounded-2xl bg-primary/5 text-primary">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      </div>
                      Menú del día
                  </a>
                  <a class="mobile-nav-link flex items-center gap-5 p-5 rounded-3xl text-xl font-extrabold text-on-background hover:bg-background active:bg-primary/5 transition-colors" href="#menu">
                      <div class="p-3 rounded-2xl bg-secondary/5 text-secondary">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      La carta
                  </a>
                  <a class="mobile-nav-link flex items-center gap-5 p-5 rounded-3xl text-xl font-extrabold text-on-background hover:bg-background active:bg-primary/5 transition-colors" href="#pension">
                      <div class="p-3 rounded-2xl bg-primary/5 text-primary">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      </div>
                      Servicio Pensión
                  </a>
                  <a class="mobile-nav-link flex items-center gap-5 p-5 rounded-3xl text-xl font-extrabold text-on-background hover:bg-background active:bg-primary/5 transition-colors" href="#location">
                      <div class="p-3 rounded-2xl bg-amber-50 text-amber-600">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      Contacto
                  </a>
                </div>
                <div class="p-10 border-t border-surface-variant bg-surface-container-low">
                   <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/40 text-center">Rocoto Restaurante &copy; 2026</p>
                </div>
            </div>
          </div>

           <!-- PANEL MI CUENTA (DERECHO) -->
          <div id="user-menu-panel" class="hidden fixed inset-0 z-[100] h-screen w-full flex justify-end">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="document.getElementById('user-menu-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-surface shadow-2xl flex flex-col z-[110] animate-slide-in-right">
                <div class="bg-primary p-10 text-white shrink-0">
                  <div class="flex items-center justify-between mb-8">
                      <h2 class="text-2xl font-black uppercase tracking-tight">Mi cuenta</h2>
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                      <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <div>
                      <p class="text-lg font-bold">${user ? user.name : 'Invitado'}</p>
                      <p class="text-[10px] uppercase tracking-widest opacity-60 font-bold">${user ? user.role : 'Visitante'}</p>
                    </div>
                  </div>
                </div>
                <div class="flex-1 p-6 flex flex-col gap-3 bg-surface overflow-y-auto">
                  ${!user ? `
                      <button id="login-btn-panel" class="${button.base} ${button.primary} w-full rounded-[2rem] py-6 shadow-xl">
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.42-7.84 5.42-4.86 0-8.83-4.02-8.83-8.98s3.97-8.98 8.83-8.98c2.76 0 4.61 1.17 5.67 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.26-2.5C5.49 1.18 0 6.67 0 13.38s5.49 12.2 12.48 12.2c7.31 0 12.16-5.14 12.16-12.38 0-.83-.09-1.46-.2-2.08h-11.96z"/></svg>
                        Acceder con Google
                      </button>` : ''}

                  ${user?.role === 'admin' ? `
                      <span class="${layout.label} border-b border-surface-variant pb-3 mb-4 mt-2">Administración</span>
                      <button id="admin-daily-menu-btn" class="flex items-center gap-5 rounded-[2rem] px-5 py-5 text-base font-bold text-on-surface-variant hover:bg-background hover:text-primary transition-all text-left">
                        <div class="p-3 rounded-2xl bg-primary/5 text-primary">
                          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        </div>
                        Actualizar Menú Diario
                      </button>
                      <button id="admin-manage-carta-btn" class="flex items-center gap-5 rounded-[2rem] px-5 py-5 text-base font-bold text-on-surface-variant hover:bg-background hover:text-primary transition-all text-left">
                        <div class="p-3 rounded-2xl bg-secondary/5 text-secondary">
                          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </div>
                        Gestionar Carta
                      </button>
                      <button id="admin-hero-promo-btn" class="flex items-center gap-5 rounded-[2rem] px-5 py-5 text-base font-bold text-on-surface-variant hover:bg-background hover:text-primary transition-all text-left">
                        <div class="p-3 rounded-2xl bg-amber-50 text-amber-600">
                          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        </div>
                        Banner Destacado
                      </button>
                      <div class="my-6 border-t border-surface-variant"></div>
                  ` : ''}

                  ${user ? `
                      <button id="logout-btn" class="flex items-center gap-5 rounded-[2rem] px-5 py-5 text-base font-bold text-secondary hover:bg-red-50 transition-all text-left">
                        <div class="p-3 rounded-2xl bg-red-50 text-red-500">
                          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                        </div>
                        Cerrar Sesión
                      </button>` : ''}
                </div>
            </div>
          </div>

         </nav>

         <main>
           <!-- HERO CAROUSEL -->
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
           </section>

           <!-- MENÚ DIARIO -->
           <section class="${layout.section} bg-surface relative overflow-hidden" id="daily-menu">
             <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
             <div class="${layout.container}">
               <div class="grid grid-cols-1 items-center gap-12 lg:gap-20 lg:grid-cols-2">
                 <div class="relative z-10 order-2 lg:order-1">
                   <span class="${layout.label}">ESPECIAL DEL DÍA</span>
                   <h2 class="${typography.h2} mb-8">Menú Ejecutivo</h2>
                   <p class="${typography.bodyLg} mb-12 max-w-xl text-balance">
                    Disfruta de nuestra selección diaria, preparada con los ingredientes más frescos y el auténtico sabor que nos caracteriza.
                   </p>

                   <div class="space-y-8 sm:space-y-10 mb-12">
                     <div class="flex items-start gap-6 group">

                     <!-- Icono de Entradas -->
                       <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-all group-hover:bg-primary group-hover:scale-110">
                          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNha2Utc2xpY2UtaWNvbiBsdWNpZGUtY2FrZS1zbGljZSI+PHBhdGggZD0iTTE2IDEzSDMiLz48cGF0aCBkPSJNMTYgMTdIMyIvPjxwYXRoIGQ9Im03LjIgNy45LTMuMzg4IDIuNUEyIDIgMCAwIDAgMyAxMi4wMVYyMGExIDEgMCAwIDAgMSAxaDE2YTEgMSAwIDAgMCAxLTF2LTguNjU0YzAtMi0yLjQ0LTYuMDI2LTYuNDQtOC4wMjZhMSAxIDAgMCAwLTEuMDgyLjA1N0wxMC40IDUuNiIvPjxjaXJjbGUgY3g9IjkiIGN5PSI3IiByPSIyIi8+PC9zdmc+" class="h-7 w-7 object-contain transition-all group-hover:brightness-0 group-hover:invert" alt="Icono" />
                      </span>
                       <div>
                         <h3 class="${typography.h3} mb-4 text-primary/80 font-bold">Entradas</h3>
                         <ul class="space-y-3 text-on-surface-variant font-medium">
                           ${dailyMenu.entradas.map(e => `
                            <li class="flex items-center gap-4">
                              <span class="h-2 w-2 rounded-full bg-secondary"></span>
                              <span class="text-base sm:${typography.bodyMd}">${e}</span>
                            </li>`).join('')}
                         </ul>
                       </div>
                     </div>
                     <div class="flex items-start gap-6 group">
                       
                       <!-- Icono de Segundos -->
                       <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-all group-hover:bg-primary group-hover:scale-110">
                          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWJlZWYtaWNvbiBsdWNpZGUtYmVlZiI+PHBhdGggZD0iTTE2LjQgMTMuN0E2LjUgNi41IDAgMSAwIDYuMjggNi42Yy0xLjEgMy4xMy0uNzggMy45LTMuMTggNi4wOEEzIDMgMCAwIDAgNSAxOGM0IDAgOC40LTEuOCAxMS40LTQuMyIvPjxwYXRoIGQ9Im0xOC41IDYgMi4xOSA0LjVhNi40OCA2LjQ4IDAgMCAxLTIuMjkgNy4yQzE1LjQgMjAuMiAxMSAyMiA3IDIyYTMgMyAwIDAgMS0yLjY4LTEuNjZMMi40IDE2LjUiLz48Y2lyY2xlIGN4PSIxMi41IiBjeT0iOC41IiByPSIyLjUiLz48L3N2Zz4=" class="h-7 w-7 object-contain transition-all group-hover:brightness-0 group-hover:invert" alt="Icono" />
                      </span>

                       <div>
                         <h3 class="${typography.h3} mb-4 text-primary/80 font-bold">Segundos</h3>
                         <ul class="space-y-3 text-on-surface-variant font-medium">
                           ${dailyMenu.segundos.map(s => `
                            <li class="flex items-center gap-4">
                              <span class="h-2 w-2 rounded-full bg-secondary"></span>
                              <span class="text-base sm:${typography.bodyMd}">${s}</span>
                            </li>`).join('')}
                         </ul>
                       </div>
                     </div>
                     <div class="flex items-start gap-6 group">

                     <!-- Icono de Bebidas -->
                       <span class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/5 transition-all group-hover:bg-primary group-hover:scale-110">
                          <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWN1cC1zb2RhLWljb24gbHVjaWRlLWN1cC1zb2RhIj48cGF0aCBkPSJtNiA4IDEuNzUgMTIuMjhhMiAyIDAgMCAwIDIgMS43Mmg0LjU0YTIgMiAwIDAgMCAyLTEuNzJMMTggOCIvPjxwYXRoIGQ9Ik01IDhoMTQiLz48cGF0aCBkPSJNNyAxNWE2LjQ3IDYuNDcgMCAwIDEgNSAwIDYuNDcgNi40NyAwIDAgMCA1IDAiLz48cGF0aCBkPSJtMTIgOCAxLTZoMiIvPjwvc3ZnPg==" class="h-7 w-7 object-contain transition-all group-hover:brightness-0 group-hover:invert" alt="Icono" />
                      </span>
                       <div>

                         <h3 class="${typography.h3} mb-4 text-primary/80 font-bold">Bebidas</h3>
                         <ul class="space-y-3 text-on-surface-variant font-medium">
                           ${dailyMenu.refrescos.map(r => `
                            <li class="flex items-center gap-4">
                              <span class="h-2 w-2 rounded-full bg-secondary"></span>
                              <span class="text-base sm:${typography.bodyMd}">${r}</span>
                            </li>`).join('')}
                         </ul>
                       </div>
                     </div>
                   </div>

                   <div class="inline-flex flex-col items-start rounded-[2.5rem] bg-surface-container-low border border-surface-variant p-8 sm:p-10 shadow-sm">
                     <span class="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3 opacity-60">Precio del Menú</span>
                     <p class="font-display text-5xl sm:text-6xl text-primary font-black leading-none">S/ 8.00</p>
                   </div>
                 </div>

                 <div class="relative lg:pl-10 order-1 lg:order-2 mb-16 lg:mb-0">
                   <div class="relative z-10 overflow-hidden rounded-[3rem] sm:rounded-[3.5rem] shadow-2xl transform lg:rotate-2 hover:rotate-0 transition-transform duration-700">
                     <img alt="Menú diario" class="h-80 w-full object-cover sm:h-[550px] lg:h-[650px]" src="https://lh3.googleusercontent.com/p/AF1QipOX8DWrfF3cdq5kgcHL-HxXdlpZLZZ7KAe9CrQn=s1360-w1360-h1020-rw" />
                   </div>
                   <!-- Decoración -->
                   <div class="absolute -bottom-8 -left-8 z-20 rounded-[2rem] bg-surface px-8 py-6 sm:px-10 sm:py-8 shadow-2xl border border-surface-variant animate-bounce-slow">
                     <div class="flex items-center gap-5">
                       <div class="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                        <svg class="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       <div>
                        <p class="font-black text-secondary text-base sm:text-lg">Disponible Hoy</p>
                        <p class="text-[10px] sm:text-xs text-on-surface-variant font-bold uppercase tracking-wider opacity-60">12:00 PM - 3:00 PM</p>
                       </div>
                     </div>
                   </div>
                   <div class="absolute -top-12 -right-12 w-48 h-48 bg-secondary/5 rounded-full blur-3xl"></div>
                 </div>
               </div>
             </div>
           </section>

           <!-- LA CARTA -->
           <section class="${layout.section} bg-background" id="menu">
             <div class="${layout.container}">
               <div class="${layout.sectionHeader}">
                 <span class="${layout.label}">Nuestra selección</span>
                 <h2 class="${layout.sectionTitle}">Carta General</h2>
                 <p class="${layout.sectionSubtitle}">Explora nuestra variedad de platos con el toque especial de Rocoto.</p>
               </div>
               <div class="mb-10 flex flex-wrap justify-center gap-4" id="menu-filters"></div>
               <div class="grid grid-cols-1 gap-10" id="menu-grid"></div>
             </div>
           </section>

           <!-- BANNER CTA -->
           <section class="${layout.section} bg-primary relative overflow-hidden">
             <div class="absolute inset-0 opacity-10">
               <svg class="h-full w-full" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none">
                 <path d="M0 100 C 20 0 50 0 100 100 Z"></path>
               </svg>
             </div>
             <div class="${layout.container} relative z-10 text-center text-white">
               <h2 class="mb-10 font-display text-4xl font-black sm:text-6xl lg:text-7xl text-balance tracking-tight">¿Listo para una explosión de sabor?</h2>
               <p class="mx-auto mb-14 max-w-2xl text-lg sm:text-xl font-normal opacity-80 text-balance leading-relaxed">Atención exclusivamente en el local o reservas por WhatsApp (solo mensajes).</p>
               <div class="flex flex-col justify-center gap-5 sm:flex-row sm:gap-8">
                 <a href="${whatsappLink}" target="_blank" class="${button.base} ${button.secondary} px-12 py-5 text-base shadow-xl">Pedir por WhatsApp</a>
                 <a href="${mapsLink}" target="_blank" class="${button.base} bg-surface text-primary px-12 py-5 text-base shadow-xl hover:bg-background">Ver ubicación</a>
               </div>
             </div>
           </section>

           <!-- SERVICIO PENSIÓN Y EXPERIENCIA CORPORATIVA -->
           <section id="pension" class="${layout.section} bg-background">
              <div class="${layout.container}">
                  <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                      <div class="space-y-10 lg:space-y-12">
                          <div>
                              <span class="${layout.label}">SOLUCIONES CORPORATIVAS</span>
                              <h2 class="${typography.h2} mb-8">Servicio de Pensión para Trabajadores</h2>
                              <p class="${typography.bodyLg} text-on-surface-variant max-w-xl text-balance">
                                Ofrecemos una alimentación balanceada y con el auténtico sabor norteño para el personal de tu empresa. 
                                Nuestra experiencia nos avala como socios estratégicos en bienestar alimenticio.
                              </p>
                          </div>
                          
                          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
                              <div class="p-8 sm:p-10 bg-surface rounded-[2.5rem] border border-surface-variant shadow-sm hover:shadow-lg transition-shadow">
                                  <div class="h-14 w-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-8">
                                      <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                  </div>
                                  <h4 class="font-bold text-on-background mb-4 text-base uppercase tracking-tight">Atención en Local</h4>
                                  <p class="${typography.bodySm} text-base">Disfruta de nuestra sazón directamente en nuestro establecimiento con total comodidad.</p>
                              </div>
                              <div class="p-8 sm:p-10 bg-surface rounded-[2.5rem] border border-surface-variant shadow-sm hover:shadow-lg transition-shadow">
                                  <div class="h-14 w-14 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary mb-8">
                                      <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                  </div>
                                  <h4 class="font-bold text-on-background mb-4 text-base uppercase tracking-tight">Reservas WhatsApp</h4>
                                  <p class="${typography.bodySm} text-base font-bold text-primary italic">Atención solo por mensaje (no se reciben llamadas telefónicas).</p>
                              </div>
                          </div>

                          <div class="pt-6">
                              <a href="${whatsappLink}" target="_blank" class="${button.base} ${button.primary} px-12 py-5 text-base shadow-xl w-full sm:w-auto">
                                  Consultar por Pensión Empresarial
                              </a>
                          </div>
                      </div>

                      <div class="relative">
                          <div class="bg-surface rounded-[3rem] sm:rounded-[4rem] p-10 sm:p-16 lg:p-20 shadow-xl border border-surface-variant">
                              <h3 class="font-display text-3xl sm:text-4xl font-black text-on-background mb-12 text-center uppercase tracking-tight">Nuestra Experiencia</h3>
                              <p class="text-center text-on-surface-variant text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-16 opacity-60">Empresas que confían en nosotros</p>
                              
                              <div class="grid grid-cols-2 gap-x-10 gap-y-16 items-center grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                                  ${corporateLogos.map(logo => `
                                      <div class="flex flex-col items-center group">
                                          <div class="h-20 sm:h-24 w-full flex items-center justify-center mb-6">
                                              <img src="${logo.url}" alt="${logo.name}" class="max-h-full max-w-[130px] sm:max-w-[150px] object-contain transition-transform group-hover:scale-110" />
                                          </div>
                                          <span class="text-[9px] sm:text-[10px] font-bold text-on-surface-variant text-center uppercase tracking-widest opacity-60">${logo.name}</span>
                                      </div>
                                  `).join('')}
                              </div>
                              
                              <div class="mt-20 p-8 sm:p-10 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                                  <p class="text-primary text-center text-sm sm:text-base font-bold leading-relaxed italic">
                                      "Comprometidos con la calidad y puntualidad para los equipos de trabajo más exigentes de la región."
                                  </p>
                              </div>
                          </div>
                          <!-- Decoración -->
                          <div class="absolute -top-8 -right-8 h-32 w-32 bg-secondary/10 rounded-full blur-3xl"></div>
                          <div class="absolute -bottom-8 -left-8 h-40 w-40 bg-primary/10 rounded-full blur-[80px]"></div>
                      </div>
                  </div>
              </div>
           </section>

           <!-- UBICACIÓN -->
           <section id="location" class="${layout.section} bg-surface">
              <div class="${layout.container}">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-16 lg:gap-20">
                   <div class="lg:col-span-1 space-y-8">
                      <div>
                        <span class="${layout.label}">DÓNDE ESTAMOS</span>
                        <h2 class="${typography.h2} mb-6">Visítanos</h2>
                        <div class="flex items-start gap-5 mb-8">
                            <div class="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                                <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <p class="${typography.bodyMd} text-base pt-1">${restaurantInfo.address}</p>
                        </div>
                      </div>
                      <div class="flex flex-col gap-5">
                        <a href="${mapsLink}" target="_blank" class="${button.base} ${button.outlineDark} w-full py-5 uppercase text-xs tracking-[0.2em] font-bold shadow-sm">Cómo llegar ahora</a>
                        <p class="text-[11px] text-on-surface-variant font-bold uppercase tracking-widest text-center italic leading-relaxed opacity-60">Atención en local y reservas solo por mensaje de WhatsApp</p>
                      </div>
                   </div>
                   <div class="lg:col-span-2 h-[400px] sm:h-[500px] lg:h-[600px] rounded-[3rem] sm:rounded-[4rem] overflow-hidden shadow-2xl ring-1 ring-surface-variant">
                      <iframe src="${restaurantInfo.mapsEmbedUrl}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>
                   </div>
                </div>
              </div>
           </section>

           <!-- FOOTER -->
           <footer class="bg-background pt-20 pb-12 border-t border-surface-variant">
             <div class="${layout.container}">
               <div class="grid grid-cols-1 gap-16 md:grid-cols-4">
                 <div class="md:col-span-2">
                   <img alt="Rocoto" class="mb-8 h-12 w-auto" src="${restaurantInfo.logoUrl}" />
                   <p class="${typography.bodyMd} text-base max-w-sm mb-8 leading-relaxed">
                    Tu parada diaria para disfrutar de la riqueza gastronómica peruana y el toque único del chifa tradicional en el corazón de San Ramón.
                   </p>
                 </div>
                 <div>
                   <h4 class="font-bold text-primary mb-8 uppercase tracking-widest text-xs">Nuestra Carta</h4>
                   <ul class="space-y-4 text-base text-on-surface-variant font-bold">
                     <li><a href="#daily-menu" class="hover:text-primary transition-colors">Especial del día</a></li>
                     <li><a href="#menu" class="hover:text-primary transition-colors">Carta completa</a></li>
                   </ul>
                 </div>
                 <div>
                   <h4 class="font-bold text-primary mb-8 uppercase tracking-widest text-xs">Contacto</h4>
                   <ul class="space-y-4 text-base text-on-surface-variant font-bold">
                     <li class="flex items-start gap-3">
                        <svg class="h-5 w-5 text-primary shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>${restaurantInfo.address}</span>
                     </li>
                     <li class="flex items-center gap-3">
                        <a href="${whatsappLink}" target="_blank" class="hover:text-primary transition-colors flex items-center gap-3">
                            <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            ${restaurantInfo.phone}
                        </a>
                     </li>
                   </ul>
                 </div>
               </div>
               <div class="mt-16 border-t border-surface-variant pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">
                 <p>&copy; 2026 ${restaurantInfo.name}. San Ramón, Chanchamayo.</p>
               </div>
             </div>
           </footer>
         </main>
      `;
    }

    initSwiper() {
        if (this.swiper) {
            this.swiper.destroy(true, true);
        }

        const swiperEl = document.querySelector('.hero-swiper');
        if (!swiperEl) return;

        this.swiper = new Swiper('.hero-swiper', {
            loop: true,
            speed: 1000,
            autoplay: {
                delay: 6000,
                disableOnInteraction: false,
            },
            effect: 'fade',
            fadeEffect: {
                crossFade: true
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }
}
