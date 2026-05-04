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
      const userBgClass = user ? "bg-primary/10" : "bg-stone-50";

      // Links de Acción
      const whatsappLink = `https://wa.me/${restaurantInfo.phone.replace(/\D/g, "")}?text=${encodeURIComponent("¡Hola Rocoto! Deseo información sobre el servicio de pensión y reservas.")}`;
      const mapsLink = restaurantInfo.mapsUrl;

      const corporateLogos = [
        { name: "Amilla Ingenieros S.A.C", url: "https://media.licdn.com/dms/image/v2/C4E0BAQHpbgzuL4Yyhg/company-logo_200_200/company-logo_200_200/0/1645142150214?e=2147483647&v=beta&t=W71Ha6_i-j3xxJRx8VEKwBmiknXLU7Oa0c8Jv3o2ubo" },
        { name: "Corporación Maya", url: "https://scontent-lim1-1.xx.fbcdn.net/v/t39.30808-6/300627995_760722825269522_8609167061658823472_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=NnGWRxjaPeEQ7kNvwG_Hfkr&_nc_oc=AdqAdqXTxz8sFWCFGddYyepT37oIyx0yjxoDy0x71W95fd8Tb4Tqa4GO-pkxHcvZiuEOP45RJUvg2vMsQhvx7_4K&_nc_zt=23&_nc_ht=scontent-lim1-1.xx&_nc_gid=wqQs-7r2AUL2bAO132fPWg&_nc_ss=7b289&oh=00_Af47HYCc6Nhd2P6ba4Ww6nlJVQJ2pxaZSmQ6l3_Tx0bN0w&oe=69FDE9AA" },
        { name: "Ecologas", url: "https://ecologascanta.com/wp-content/uploads/2021/03/Logo-600x440.png" },
        { name: "SIMSA", url: "https://www.simsa.com.pe/assets/images/logo.png" }
      ];

      this.rootElement.innerHTML = `
         <nav class="fixed top-0 z-50 w-full border-b border-stone-100 bg-white/90 backdrop-blur-md shadow-sm">
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
                    <div class="flex h-10 w-10 items-center justify-center rounded-full ${userBgClass} border border-stone-100 transition-colors group-hover:border-primary/30">
                        <svg class="h-6 w-6 ${userColorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                 </button>
                 <button id="mobile-nav-toggle" class="p-2 text-stone-700 md:hidden transition-transform active:scale-95">
                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                 </button>
              </div>
           </div>

           <!-- PANEL NAVEGACIÓN MÓVIL (IZQUIERDO) -->
          <div id="mobile-nav-panel" class="hidden fixed inset-0 z-[100] h-screen w-full">
            <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="document.getElementById('mobile-nav-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110]">
                <div class="flex items-center justify-between p-6 border-b border-stone-100 bg-white shrink-0">
                  <img src="${restaurantInfo.logoUrl}" class="h-8 w-auto">
                  <button class="close-nav p-2 text-stone-400 hover:text-secondary transition-colors">
                      <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div class="flex-1 flex flex-col gap-1 p-4 bg-white overflow-y-auto">
                  <a class="mobile-nav-link flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-stone-800 hover:bg-stone-50 transition-colors" href="#daily-menu">
                      <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Menú del día
                  </a>
                  <a class="mobile-nav-link flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-stone-800 hover:bg-stone-50 transition-colors" href="#menu">
                      <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      La carta
                  </a>
                  <a class="mobile-nav-link flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-stone-800 hover:bg-stone-50 transition-colors" href="#pension">
                      <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                      Servicio Pensión
                  </a>
                  <a class="mobile-nav-link flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-stone-800 hover:bg-stone-50 transition-colors" href="#location">
                      <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Contacto
                  </a>
                </div>
            </div>
          </div>
