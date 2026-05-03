import { escapeHtml } from "../utils/html.js";

// URL de respaldo si la promoción está desactivada
const DEFAULT_HERO_BG = "https://lh3.googleusercontent.com/p/AF1QipOX8DWrfF3cdq5kgcHL-HxXdlpZLZZ7KAe9CrQn=s1360-w1360-h1020-rw";
const DEFAULT_HERO_SUB = "La mejor experiencia gastronómica en Lima. Fusión perfecta de herencia milenaria y sabor peruano.";

export class HomeView {
    constructor(rootElement) {
        this.rootElement = rootElement;
    }

    renderShell(restaurantInfo, user = null, dailyMenu, heroPromo = null) {
      const promoOn = heroPromo?.activo === true && heroPromo?.imageUrl;
      const heroBg = promoOn ? heroPromo.imageUrl : DEFAULT_HERO_BG;
      const heroTitle = promoOn ? heroPromo.titulo || restaurantInfo.slogan : restaurantInfo.slogan;
      const heroSub = promoOn ? heroPromo.subtitulo || DEFAULT_HERO_SUB : DEFAULT_HERO_SUB;
  
      const userColorClass = user ? "text-primary" : "text-stone-400";
      const userBgClass = user ? "bg-primary/10" : "bg-stone-100";
  
      this.rootElement.innerHTML = `
         <nav class="fixed top-0 z-50 w-full border-b border-stone-200 bg-white shadow-sm">
           <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
              <a href="/" onclick="window.location.reload();" class="flex shrink-0 items-center">
                 <img alt="Logo" class="h-10 w-auto" src="${restaurantInfo.logoUrl}" />
              </a>
              <div class="hidden items-center gap-8 md:flex">
                 <a class="text-sm font-bold text-stone-600 hover:text-primary transition-colors" href="#daily-menu">Menú del día</a>
                 <a class="text-sm font-bold text-stone-600 hover:text-primary transition-colors" href="#menu">La carta</a>
                 <a class="text-sm font-bold text-stone-600 hover:text-primary transition-colors" href="#location">Contacto</a>
              </div>
              <div class="flex items-center gap-2 sm:gap-4">
                 <button id="user-menu-toggle" class="flex items-center p-1">
                    <div class="flex h-10 w-10 items-center justify-center rounded-full ${userBgClass} border border-stone-200">
                        <svg class="h-6 w-6 ${userColorClass}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                 </button>
                 <button id="mobile-nav-toggle" class="p-2 text-stone-700 md:hidden">
                    <svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                 </button>
              </div>
           </div>
  
           <!-- PANEL NAVEGACIÓN MÓVIL -->
          <div id="mobile-nav-panel" class="hidden fixed inset-0 z-[100] flex">
            <div class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110]">
                <div class="flex items-center justify-between p-6 border-b border-stone-100">
                  <img src="${restaurantInfo.logoUrl}" class="h-8 w-auto">
                  <button class="close-nav p-2 text-stone-400 hover:text-secondary">
                      <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
                <div class="flex flex-col gap-1 p-4 bg-white">
                  <a class="mobile-nav-link flex items-center gap-4 p-4 rounded-xl text-lg font-bold text-stone-800 hover:bg-stone-50" href="#daily-menu">
                      <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      Menú del día
                  </a>
                  <a class="mobile-nav-link flex items-center gap-4 p-4 rounded-xl text-lg font-bold text-stone-800 hover:bg-stone-50" href="#menu">
                      <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      La carta
                  </a>
                  <a class="mobile-nav-link flex items-center gap-4 p-4 rounded-xl text-lg font-bold text-stone-800 hover:bg-stone-50" href="#location">
                      <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      Contacto
                  </a>
                </div>
            </div>
            <div class="flex-1 relative z-[105]" onclick="document.getElementById('mobile-nav-panel').classList.add('hidden')"></div>
          </div>
  
           <!-- PANEL MI CUENTA / ADMIN -->
          <div id="user-menu-panel" class="hidden fixed inset-0 z-[100] flex justify-end">
            <div class="fixed inset-0 bg-black/60 backdrop-blur-sm"></div>
            <div class="flex-1 relative z-[105]" onclick="document.getElementById('user-menu-panel').classList.add('hidden')"></div>
            <div class="relative h-full w-80 bg-white shadow-2xl flex flex-col z-[110]">
                <div class="bg-primary p-8 text-white">
                  <div class="flex items-center justify-between mb-4">
                      <h2 class="text-xl font-bold uppercase tracking-tight">Mi cuenta</h2>
                      <button class="close-user-menu p-1 text-white/70 hover:text-white">
                        <svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                  </div>
                  <p class="text-sm font-semibold opacity-90">${user ? user.name : 'Invitado'}</p>
                </div>
                <div class="p-4 flex flex-col gap-1 bg-white h-full overflow-y-auto">
                  ${!user ? `
                      <button id="login-btn-panel" class="flex items-center justify-center gap-3 w-full rounded-xl bg-primary py-4 text-white font-bold shadow-lg transition-all hover:brightness-110">
                        <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-2.21 5.42-7.84 5.42-4.86 0-8.83-4.02-8.83-8.98s3.97-8.98 8.83-8.98c2.76 0 4.61 1.17 5.67 2.18l2.59-2.5c-1.66-1.55-3.82-2.5-8.26-2.5C5.49 1.18 0 6.67 0 13.38s5.49 12.2 12.48 12.2c7.31 0 12.16-5.14 12.16-12.38 0-.83-.09-1.46-.2-2.08h-11.96z"/></svg>
                        Iniciar Sesión
                      </button>` : ''}
                  
                  ${user?.role === 'admin' ? `
                      <span class="px-3 py-4 text-[11px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-50 mb-2">Administración</span>
                      <button id="admin-daily-menu-btn" class="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-all text-left">
                        <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                        Actualizar Menú Diario
                      </button>
                      <button id="admin-manage-carta-btn" class="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-all text-left">
                        <svg class="h-6 w-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        Gestionar Carta
                      </button>
                      <button id="admin-hero-promo-btn" class="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold text-stone-700 hover:bg-stone-50 transition-all text-left">
                        <svg class="h-6 w-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        Banner Destacado
                      </button>
                      <div class="my-4 border-t border-stone-100"></div>
                  ` : ''}
                  
                  ${user ? `
                      <button id="logout-btn" class="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-bold text-secondary hover:bg-red-50 transition-all text-left">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                        Cerrar Sesión
                      </button>` : ''}
                </div>
            </div>
          </div>

         </nav>
  
         <main class="pt-16">
           <!-- HERO (MANTENIDO) -->
           <section class="relative flex min-h-[80dvh] items-center justify-center overflow-hidden sm:min-h-screen" id="hero">
             <div class="absolute inset-0 z-0">
               <img class="h-full w-full object-cover" src="${escapeHtml(heroBg)}" alt="" />
               <div class="absolute inset-0 bg-black/45"></div>
             </div>
             <div class="relative z-10 max-w-5xl px-4 text-center">
               <h1 class="mb-6 font-display text-4xl font-bold text-white sm:text-7xl">${escapeHtml(heroTitle)}</h1>
               <p class="mx-auto mb-10 max-w-2xl text-lg text-white/95 sm:text-xl">${escapeHtml(heroSub)}</p>
               <div class="flex flex-wrap justify-center gap-4">
                 <a class="rounded-full bg-secondary px-10 py-4 text-sm font-bold text-white" href="#menu">Ver carta completa</a>
                 <a class="rounded-full border-2 border-white px-10 py-4 text-sm font-bold text-white" href="#daily-menu">Menú del día</a>
               </div>
             </div>
           </section>
  
           <!-- MENÚ DIARIO (Diseño Restaurado de la Imagen) -->
           <section class="bg-surface-container-lowest py-12 sm:py-24" id="daily-menu">
             <div class="mx-auto max-w-7xl px-4 sm:px-6">
               <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
                 <div>
                   <span class="mb-3 block font-label-caps uppercase tracking-widest text-secondary">ESPECIAL DEL DIA</span>
                   <h2 class="mb-4 font-h1 text-3xl text-on-background sm:text-5xl">Menú diario</h2>
                   <p class="mb-8 max-w-xl font-body-lg text-on-surface-variant">Disfruta una seleccion especial para el almuerzo, preparada con sabor casero.</p>
                   
                   <div class="space-y-6">
                     <div class="flex items-start gap-4">
                       <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-white text-sm">1</span>
                       <div>
                         <h3 class="font-h3 text-xl font-bold text-on-background">Entradas</h3>
                         <ul class="mt-2 list-disc space-y-1 pl-5 text-on-surface-variant font-medium">
                           ${dailyMenu.entradas.map(e => `<li>${e}</li>`).join('')}
                         </ul>
                       </div>
                     </div>
                     <div class="flex items-start gap-4">
                       <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-white text-sm">2</span>
                       <div>
                         <h3 class="font-h3 text-xl font-bold text-on-background">Segundos</h3>
                         <ul class="mt-2 list-disc space-y-1 pl-5 text-on-surface-variant font-medium">
                           ${dailyMenu.segundos.map(s => `<li>${s}</li>`).join('')}
                         </ul>
                       </div>
                     </div>
                     <div class="flex items-start gap-4">
                       <span class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-white text-sm">3</span>
                       <div>
                         <h3 class="font-h3 text-xl font-bold text-on-background">Bebidas</h3>
                         <ul class="mt-2 list-disc space-y-1 pl-5 text-on-surface-variant font-medium">
                           ${dailyMenu.refrescos.map(r => `<li>${r}</li>`).join('')}
                         </ul>
                       </div>
                     </div>
                   </div>
                   
                   <div class="mt-8 inline-block rounded-xl border-l-4 border-secondary bg-stone-100 p-6">
                     <span class="text-xs font-bold text-stone-500 uppercase">Precio del Dia</span>
                     <p class="mt-1 font-display text-4xl text-primary font-bold">S/ 8.00</p>
                   </div>
                 </div>
  
                 <div class="relative">
                   <div class="overflow-hidden rounded-3xl shadow-2xl">
                     <img alt="Menú diario" class="h-64 w-full object-cover sm:h-[500px]" src="https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1600&auto=format&fit=crop" />
                   </div>
                   <div class="absolute -bottom-5 left-6 rounded-xl bg-white px-6 py-4 shadow-xl border border-stone-100">
                     <p class="font-bold text-secondary text-sm">Disponible Hoy</p>
                     <p class="text-xs text-stone-500 font-medium">12:00 PM - 3:00 PM</p>
                   </div>
                 </div>
               </div>
             </div>
           </section>
  
           <!-- LA CARTA (MANTENIDA) -->
           <section class="mx-auto max-w-7xl px-4 py-16 sm:px-6" id="menu">
             <div class="mb-14 text-center">
               <span class="text-secondary font-bold uppercase tracking-widest text-xs">Nuestra selección</span>
               <h2 class="mt-2 font-h1 text-4xl font-bold">Carta General</h2>
             </div>
             <div class="mb-10 flex flex-wrap justify-center gap-3" id="menu-filters"></div>
             <div class="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3" id="menu-grid"></div>
           </section>
  
           <!-- BANNER CTA (Diseño de la imagen) -->
           <section class="bg-primary-container py-16 text-center text-white">
             <div class="mx-auto max-w-4xl px-4">
               <h2 class="mb-4 font-display text-3xl font-bold sm:text-5xl">¿Listo para una explosión de sabor?</h2>
               <p class="mb-10 text-lg opacity-80">Pide ahora por delivery o ven a visitarnos para una experiencia inolvidable.</p>
               <div class="flex flex-col justify-center gap-4 sm:flex-row">
                 <button class="rounded-lg bg-secondary px-10 py-4 font-bold shadow-lg">Pedir delivery</button>
                 <button class="rounded-lg bg-white px-10 py-4 font-bold text-primary shadow-lg">Ver menú completo</button>
               </div>
             </div>
           </section>
  
           <!-- FOOTER (Diseño de la imagen) -->
           <footer class="bg-stone-50 pt-16 pb-8 border-t border-stone-200">
             <div class="mx-auto max-w-7xl px-4 sm:px-6">
               <div class="grid grid-cols-1 gap-12 md:grid-cols-3">
                 <div>
                   <img alt="Rocoto" class="mb-6 h-12 w-auto" src="${restaurantInfo.logoUrl}" />
                   <p class="text-sm text-stone-500 leading-relaxed">Tu parada diaria para disfrutar de la riqueza gastronomica peruana y el toque unico del chifa tradicional.</p>
                 </div>
                 <div>
                   <h4 class="font-bold text-primary mb-6">Enlaces</h4>
                   <ul class="space-y-4 text-sm text-stone-600 font-medium">
                     <li><a href="#" class="hover:text-primary">Facebook</a></li>
                     <li><a href="#" class="hover:text-primary">Instagram</a></li>
                     <li><a href="#" class="hover:text-primary">WhatsApp</a></li>
                   </ul>
                 </div>
                 <div>
                   <h4 class="font-bold text-primary mb-6">Newsletter</h4>
                   <p class="text-sm text-stone-500 mb-6">Suscribete para recibir ofertas y noticias.</p>
                   <form class="flex gap-2">
                     <input type="email" placeholder="Email" class="min-w-0 flex-1 rounded-lg border-stone-200 p-3 text-sm focus:ring-primary focus:border-primary" />
                     <button class="rounded-lg bg-primary-container px-6 py-3 text-sm font-bold text-white">Unirme</button>
                   </form>
                 </div>
               </div>
               <div class="mt-16 border-t border-stone-100 pt-8 text-center text-xs text-stone-400">
                 <p>&copy; 2026 ${restaurantInfo.name}. Todos los derechos reservados.</p>
               </div>
             </div>
           </footer>
         </main>
      `;
  }
}