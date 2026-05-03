import { escapeHtml } from "../utils/html.js";

const DEFAULT_HERO_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCHwOqzjB_U5Yp4IlQCBVwV6QcHZqbFjpNs1YpRhCuSNC534ocmEhlErhwaD80bTGJt4F-RnCrAfsoLk20WZnqlHgkL5GGlXyBUJnPRdxuoXCYNF-Tj5wLCdGpaEYrqFq_oIDEZf4T-rGEeoI0riQIzw05ob90qSppsfx-yEKuXzuDN7sQtGJO0CkvqtIaiydxq3eh9EIFbEoMcbegi_JsOsY25ysM8fYo5PJMiW09g2F38dfx17pY9JAwAZ0CWVTjYVHIn2HJEllAl";

const DEFAULT_HERO_SUB =
  "La mejor experiencia gastronomica en Lima. Fusion perfecta de herencia milenaria y sabor peruano.";

export class HomeView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  renderShell(restaurantInfo, user = null, dailyMenu, heroPromo = null) {
    const promoOn = heroPromo?.activo === true && heroPromo?.imageUrl && String(heroPromo.imageUrl).trim() !== "";
    const heroBg = promoOn ? String(heroPromo.imageUrl).trim() : DEFAULT_HERO_BG;
    const heroTitle = promoOn
      ? heroPromo.titulo?.trim() || restaurantInfo.slogan
      : restaurantInfo.slogan;
    const heroSub = promoOn ? heroPromo.subtitulo?.trim() || DEFAULT_HERO_SUB : DEFAULT_HERO_SUB;
    const authSection = user 
    ? `<div class="flex min-w-0 shrink-0 items-center justify-end gap-1 sm:gap-2 md:gap-3">
            ${user.role === 'admin' ? `
              <button id="admin-daily-menu-btn" type="button" class="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2 py-2 font-button text-[10px] text-white shadow-md transition-all hover:bg-primary-container sm:gap-1.5 sm:px-2.5 sm:text-xs" title="Actualizar menú diario">
                <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                <span class="hidden sm:inline">Menú diario</span>
              </button>
              <button id="admin-manage-carta-btn" type="button" class="flex shrink-0 items-center gap-1 rounded-lg bg-secondary px-2 py-2 font-button text-[10px] font-semibold uppercase text-white shadow-md transition-all hover:opacity-90 sm:px-2.5 sm:text-xs" title="Gestionar carta">
                <svg class="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                <span class="hidden min-[400px]:inline">Carta</span>
              </button>
              <button id="admin-hero-promo-btn" type="button" class="flex shrink-0 items-center gap-1 rounded-lg border border-amber-800/40 bg-amber-500 px-2 py-2 font-button text-[10px] font-semibold text-amber-950 shadow-md transition-all hover:bg-amber-400 sm:gap-1.5 sm:px-2.5 sm:text-xs" title="Promoción en la página de inicio">
                <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                <span class="hidden sm:inline">Destacado</span>
              </button>
            ` : ''}
         <div class="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
           <svg class="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
           <div class="min-w-0 leading-tight">
             <span class="block text-[10px] font-bold uppercase text-stone-500 sm:text-xs">Hola,</span>
             <span class="block max-w-[4.5rem] truncate text-xs font-bold uppercase text-primary sm:max-w-[7rem] sm:text-sm md:max-w-none">${user.name}</span>
           </div>
           <button id="logout-btn" type="button" class="ml-0.5 shrink-0 p-1.5 text-stone-400 transition-colors hover:text-secondary sm:ml-1 sm:p-2" title="Cerrar sesión">
             <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
           </button>
         </div>
       </div>`


    : `<button type="button" id="login-btn" class="flex items-center gap-2 font-button text-stone-600 hover:text-primary">
         <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
         Iniciar Sesión
       </button>`;

  this.rootElement.innerHTML = `
      <nav class="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-stone-50/95 shadow-sm backdrop-blur-md dark:bg-stone-950/90">
        <div class="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-3 sm:px-6">
          <div class="flex min-w-0 min-h-[2.5rem] flex-1 items-center gap-2 sm:gap-8">
            <a href="#hero" class="inline-flex shrink-0 items-center self-center no-underline" aria-label="Ir al inicio">
              <img
                alt="Logo — ${restaurantInfo.name}"
                class="pointer-events-none block h-9 w-auto max-h-9 max-w-[min(7.5rem,42vw)] object-contain object-left sm:h-10 sm:max-h-10 sm:max-w-[9rem] md:max-w-none"
                src="${restaurantInfo.logoUrl}"
              />
            </a>
            <div class="hidden items-center gap-4 lg:gap-6 md:flex">
              <a class="flex items-center gap-1 text-sm font-button text-primary" href="#hero">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                Home
              </a>
              <a class="flex items-center gap-1 text-sm font-button text-stone-600 hover:text-primary" href="#daily-menu">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Menú del día
              </a>
              <a class="flex items-center gap-1 text-sm font-button text-stone-600 hover:text-primary" href="#menu">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                La carta
              </a>
              <a class="flex items-center gap-1 text-sm font-button text-stone-600 hover:text-primary" href="#location">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                Contacto
              </a>
            </div>
          </div>
          <div class="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
            <button type="button" id="mobile-nav-toggle" class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 shadow-sm md:hidden" aria-expanded="false" aria-controls="mobile-nav-panel" aria-label="Abrir menú">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            ${authSection}
          </div>
        </div>
        <div id="mobile-nav-panel" class="hidden border-t border-stone-200 bg-stone-50 px-4 py-3 md:hidden">
          <div class="flex flex-col gap-1">
            <a class="mobile-nav-link flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-button text-primary hover:bg-stone-100" href="#hero">Home</a>
            <a class="mobile-nav-link flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-button text-stone-700 hover:bg-stone-100" href="#daily-menu">Menú del día</a>
            <a class="mobile-nav-link flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-button text-stone-700 hover:bg-stone-100" href="#menu">La carta</a>
            <a class="mobile-nav-link flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-button text-stone-700 hover:bg-stone-100" href="#location">Contacto</a>
          </div>
        </div>
      </nav>    

      <main class="pt-14 sm:pt-16">
        <section class="relative flex min-h-[85dvh] items-center justify-center overflow-hidden sm:min-h-screen" id="hero">
          <div class="absolute inset-0 z-0">
            <img class="h-full w-full object-cover" src="${escapeHtml(heroBg)}" alt="" />
            <div class="absolute inset-0 bg-black/40"></div>
          </div>
          <div class="relative z-10 max-w-4xl px-4 text-center sm:px-6">
            <h1 class="mb-4 font-display text-3xl font-bold leading-tight text-white sm:mb-6 sm:text-4xl md:text-5xl lg:text-display">${escapeHtml(heroTitle)}</h1>
            <p class="mx-auto mb-8 max-w-2xl font-body-md text-white/90 sm:mb-10 sm:font-body-lg">
              ${escapeHtml(heroSub)}
            </p>
            <div class="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <a class="rounded-full bg-secondary px-6 py-3.5 text-center font-button text-sm text-white transition-all hover:opacity-90 active:scale-95 sm:px-8 sm:py-4 sm:text-button" href="#menu">Ver carta completa</a>
              <a class="rounded-full border-2 border-white px-6 py-3.5 text-center font-button text-sm text-white transition-all hover:bg-white/10 active:scale-95 sm:px-8 sm:py-4 sm:text-button" href="#daily-menu">Menú del día</a>
            </div>
          </div>
        </section>

        <section class="bg-surface-container-lowest py-12 sm:py-xl" id="daily-menu">
          <div class="mx-auto max-w-7xl px-4 sm:px-6">
            <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div>
                <span class="mb-3 block font-label-caps uppercase tracking-widest text-secondary">Especial del Dia</span>
                <h2 class="mb-4 font-h1 text-2xl text-on-background sm:text-h1">Menú diario</h2>
                <p class="mb-8 max-w-xl font-body-lg text-on-surface-variant">
                  Disfruta una seleccion especial para el almuerzo, preparada con sabor casero.
                </p>

                <div class="space-y-6">
                  <!-- ENTRADAS -->
                  <div class="flex items-start gap-4">
                    <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-button text-white text-sm">1</span>
                    <div>
                      <h3 class="font-h3 text-h3 text-on-background">Entradas</h3>
                      <ul class="mt-2 list-disc space-y-1 pl-5 font-body-md text-on-surface-variant">
                        ${dailyMenu.entradas.map(e => `<li>${e}</li>`).join('')}
                      </ul>
                    </div>
                  </div>

                  <!-- SEGUNDOS -->
                  <div class="flex items-start gap-4">
                    <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-button text-white text-sm">2</span>
                    <div>
                      <h3 class="font-h3 text-h3 text-on-background">Segundos</h3>
                      <ul class="mt-2 list-disc space-y-1 pl-5 font-body-md text-on-surface-variant">
                        ${dailyMenu.segundos.map(s => `<li>${s}</li>`).join('')}
                      </ul>
                    </div>
                  </div>

                  <!-- REFRESCO -->
                  <div class="flex items-start gap-4">
                    <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-button text-white text-sm">3</span>
                    <div>
                      <h3 class="font-h3 text-h3 text-on-background">Bebidas</h3>
                      <ul class="mt-2 list-disc space-y-1 pl-5 font-body-md text-on-surface-variant">              
                        ${dailyMenu.refrescos.map(r => `<li>${r}</li>`).join('')}
                      </ul>
                    </div>
                  </div>
                </div>

                <div class="mt-8 inline-block rounded-xl border-l-4 border-secondary bg-surface-container p-6">
                  <span class="font-label-caps text-on-surface-variant">Precio del Dia</span>
                  <p class="mt-1 font-display text-3xl text-primary">S/ 8.00</p>
                </div>
              </div>

              <div class="relative">
                <div class="overflow-hidden rounded-3xl shadow-2xl">
                  <img
                    alt="Menú diario Rocoto"
                    class="h-64 w-full object-cover sm:h-80 md:h-[420px] lg:h-[520px]"
                    src="https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1600&auto=format&fit=crop"
                  />
                </div>
                <div class="absolute -bottom-5 left-6 rounded-xl bg-white px-5 py-3 shadow-lg">
                  <p class="font-label-caps text-secondary">Disponible Hoy</p>
                  <p class="font-body-sm text-on-surface-variant">12:00 PM - 3:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-xl" id="menu">
          <div class="mb-8 text-center sm:mb-10">
            <span class="mb-3 block font-label-caps uppercase tracking-widest text-secondary sm:mb-4">Nuestra carta</span>
            <h2 class="font-h1 text-2xl text-on-background sm:text-h1">Sabores que cuentan historias</h2>
            <div class="mx-auto mt-4 h-1 w-16 bg-secondary sm:mt-6"></div>
          </div>
          <div class="mb-8 flex flex-wrap justify-center gap-2 sm:mb-12 sm:gap-3" id="menu-filters"></div>
          <div class="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3" id="menu-grid"></div>
        </section>

        <section class="bg-surface-container-low px-4 py-12 sm:px-6 sm:py-xl" id="location">
          <div class="mx-auto max-w-7xl">
            <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div class="order-2 lg:order-1">
                <div class="relative h-[240px] w-full overflow-hidden rounded-xl bg-surface-variant shadow-inner sm:h-[320px] md:h-[400px] lg:h-[450px]">
                  <iframe
                    class="h-full w-full"
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade"
                    src="${restaurantInfo.mapsEmbedUrl}"
                    title="Ubicacion de ${restaurantInfo.name} en Google Maps"
                  ></iframe>
                </div>
              </div>
              <div class="order-1 space-y-8 lg:order-2">
                <div>
                  <span class="mb-4 block font-label-caps uppercase tracking-widest text-secondary">Visitanos</span>
                  <h2 class="mb-6 font-h1 text-2xl sm:text-h1">Tu mesa del día te espera aquí</h2>
                </div>
                <div class="space-y-3 text-on-surface-variant">
                  <p><strong>Direccion:</strong> ${restaurantInfo.address}</p>
                  <p><strong>Horarios:</strong> ${restaurantInfo.schedule}</p>
                  <p>
                    <strong>Contacto:</strong>
                    <a
                      class="text-primary underline-offset-2 hover:underline"
                      href="https://wa.me/${restaurantInfo.phone.replace(/\D/g, "")}"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      ${restaurantInfo.phone}
                    </a>
                  </p>
                  <p><strong>Email:</strong> ${restaurantInfo.email}</p>
                  <a
                    class="inline-flex items-center rounded-lg bg-primary px-4 py-2 font-button text-white transition-all hover:brightness-110"
                    href="${restaurantInfo.mapsUrl}"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Ver en Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="bg-primary-container py-12 text-center text-white sm:py-xl">
          <div class="mx-auto max-w-4xl px-4 sm:px-6">
            <h2 class="mb-4 font-display text-2xl sm:mb-6 sm:text-h1">¿Listo para una explosión de sabor?</h2>
            <p class="mb-8 font-body-md text-white/80 sm:mb-10 sm:font-body-lg">Pide ahora por delivery o ven a visitarnos para una experiencia inolvidable.</p>
            <div class="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-6">
              <button type="button" class="rounded-lg bg-secondary px-8 py-3.5 font-button text-white shadow-lg transition-all hover:brightness-110 sm:px-10 sm:py-4">Pedir delivery</button>
              <button type="button" class="rounded-lg bg-white px-8 py-3.5 font-button text-primary shadow-lg transition-all hover:bg-stone-100 sm:px-10 sm:py-4">Ver menú completo</button>
            </div>
          </div>
        </section>

        <footer class="w-full border-t border-stone-200 bg-stone-100 px-4 py-10 dark:border-stone-800 dark:bg-stone-900 sm:px-6 sm:py-12">
          <div class="mx-auto grid max-w-7xl grid-cols-1 gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <img alt="Rocoto" class="mb-4 h-16 w-auto" src="${restaurantInfo.logoUrl}" />
              <p class="max-w-xs font-body-sm text-body-sm text-stone-500">Tu parada diaria para disfrutar de la riqueza gastronomica peruana y el toque unico del chifa tradicional.</p>
            </div>
            <div class="flex flex-col gap-3">
              <h4 class="mb-2 font-h3 text-body-md text-green-900 dark:text-green-500">Enlaces</h4>
              <a class="font-body-sm text-body-sm text-stone-500 transition-all hover:text-green-700 dark:hover:text-green-300" href="#">Facebook</a>
              <a class="font-body-sm text-body-sm text-stone-500 transition-all hover:text-green-700 dark:hover:text-green-300" href="#">Instagram</a>
              <a
                class="font-body-sm text-body-sm text-stone-500 transition-all hover:text-green-700 dark:hover:text-green-300"
                href="https://wa.me/${restaurantInfo.phone.replace(/\D/g, "")}"
                rel="noopener noreferrer"
                target="_blank"
              >
                WhatsApp
              </a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="mb-2 font-h3 text-body-md text-green-900 dark:text-green-500">Newsletter</h4>
              <p class="font-body-sm text-body-sm text-stone-500">Suscribete para recibir ofertas y noticias.</p>
              <form class="flex flex-col gap-2 sm:flex-row">
                <input class="min-w-0 flex-1 rounded-lg border-stone-300 bg-white p-2.5 font-body-sm text-body-sm focus:border-primary focus:ring-primary" placeholder="Email" type="email" />
                <button type="submit" class="rounded-lg bg-primary-container px-4 py-2.5 font-button text-button text-white shrink-0 hover:brightness-110">Unirme</button>
              </form>
            </div>
          </div>
        </footer>
      </main>
    `;
  }
}
