export class HomeView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  renderShell(restaurantInfo, user = null, dailyMenu) {
    const authSection = user 
    ? `<div class="flex items-center gap-4">
         <div class="flex items-center gap-2">
           <svg class="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
           <div class="flex flex-col leading-tight">
             <span class="text-xs font-bold text-stone-500 uppercase">Hola,</span>
             <span class="text-sm font-bold text-primary uppercase">${user.name}</span>
           </div>          
         </div>
         <!-- Botón de Salir -->
        <button id="logout-btn" class="ml-2 p-2 text-stone-400 hover:text-secondary transition-colors" title="Cerrar Sesión">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
        </button>
         <div class="flex items-center rounded-full bg-[#d4f500] px-4 py-2 font-bold text-primary shadow-sm">
           <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-8 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"></path></svg>
           S/ 0.00
         </div>
       </div>`
    : `<button id="login-btn" class="flex items-center gap-2 font-button text-stone-600 hover:text-primary">
         <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
         Iniciar Sesión
       </button>`;

  this.rootElement.innerHTML = `
      <nav class="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-stone-50/90 shadow-sm backdrop-blur-md dark:bg-stone-950/90">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
          <div class="flex items-center gap-8">
            <img alt="Logo" class="h-10 w-auto" src="${restaurantInfo.logoUrl}" />
            <div class="hidden items-center space-x-6 md:flex">
              <a class="flex items-center gap-1 text-sm font-button text-primary" href="#hero">
                <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                Home
              </a>
              <a class="flex items-center gap-1 text-sm font-button text-stone-600 hover:text-primary" href="#daily-menu">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Menu Diario
              </a>
              <a class="flex items-center gap-1 text-sm font-button text-stone-600 hover:text-primary" href="#menu">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                La Carta
              </a>
              <a class="flex items-center gap-1 text-sm font-button text-stone-600 hover:text-primary" href="#location">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                Contacto
              </a>
            </div>
          </div>
          ${authSection}
        </div>
      </nav>    

      <main class="pt-16">
        <section class="relative flex h-screen items-center justify-center overflow-hidden" id="hero">
          <div class="absolute inset-0 z-0">
            <img class="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHwOqzjB_U5Yp4IlQCBVwV6QcHZqbFjpNs1YpRhCuSNC534ocmEhlErhwaD80bTGJt4F-RnCrAfsoLk20WZnqlHgkL5GGlXyBUJnPRdxuoXCYNF-Tj5wLCdGpaEYrqFq_oIDEZf4T-rGEeoI0riQIzw05ob90qSppsfx-yEKuXzuDN7sQtGJO0CkvqtIaiydxq3eh9EIFbEoMcbegi_JsOsY25ysM8fYo5PJMiW09g2F38dfx17pY9JAwAZ0CWVTjYVHIn2HJEllAl" />
            <div class="absolute inset-0 bg-black/40"></div>
          </div>
          <div class="relative z-10 max-w-4xl px-6 text-center">
            <h1 class="mb-6 font-display text-display text-white">${restaurantInfo.slogan}</h1>
            <p class="mx-auto mb-10 max-w-2xl font-body-lg text-white/90">
              La mejor experiencia gastronomica en Lima. Fusion perfecta de herencia milenaria y sabor peruano.
            </p>
            <div class="flex flex-col justify-center gap-4 sm:flex-row">
              <a class="rounded-full bg-secondary px-8 py-4 text-center font-button text-white transition-all hover:opacity-90 active:scale-95" href="#menu">Ver Carta Completa</a>
              <a class="rounded-full border-2 border-white px-8 py-4 text-center font-button text-white transition-all hover:bg-white/10 active:scale-95" href="#daily-menu">Menu del Dia</a>
            </div>
          </div>
        </section>

        <section class="bg-surface-container-lowest py-xl" id="daily-menu">
          <div class="mx-auto max-w-7xl px-6">
            <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div>
                <span class="mb-3 block font-label-caps uppercase tracking-widest text-secondary">Especial del Dia</span>
                <h2 class="mb-4 font-h1 text-h1 text-on-background">Menu Diario</h2>
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
                    alt="Menu diario Rocoto"
                    class="h-[520px] w-full object-cover"
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

        <section class="mx-auto max-w-7xl px-6 py-xl" id="menu">
          <div class="mb-10 text-center">
            <span class="mb-4 block font-label-caps uppercase tracking-widest text-secondary">Nuestra Carta</span>
            <h2 class="font-h1 text-h1 text-on-background">Sabores que Cuentan Historias</h2>
            <div class="mx-auto mt-6 h-1 w-16 bg-secondary"></div>
          </div>
          <div class="mb-12 flex flex-wrap justify-center gap-4" id="menu-filters"></div>
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" id="menu-grid"></div>
        </section>

        <section class="bg-surface-container-low px-6 py-xl" id="location">
          <div class="mx-auto max-w-7xl">
            <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div class="order-2 lg:order-1">
                <div class="relative h-[450px] w-full overflow-hidden rounded-xl bg-surface-variant shadow-inner">
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
                  <h2 class="mb-6 font-h1 text-h1">Tu Mesa de Diario te Espera Aquí.</h2>
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

        <section class="bg-primary-container py-xl text-center text-white">
          <div class="mx-auto max-w-4xl px-6">
            <h2 class="mb-6 font-display text-h1">Listo para una explosion de sabor?</h2>
            <p class="mb-10 font-body-lg text-white/80">Pide ahora por delivery o ven a visitarnos para una experiencia inolvidable.</p>
            <div class="flex flex-wrap justify-center gap-6">
              <button class="rounded-lg bg-secondary px-10 py-4 font-button text-white shadow-lg transition-all hover:brightness-110">Pide Delivery</button>
              <button class="rounded-lg bg-white px-10 py-4 font-button text-primary shadow-lg transition-all hover:bg-stone-100">Ver Menu Completo</button>
            </div>
          </div>
        </section>

        <footer class="w-full border-t border-stone-200 bg-stone-100 px-6 py-12 dark:border-stone-800 dark:bg-stone-900">
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
              <form class="flex gap-2">
                <input class="flex-grow rounded-lg border-outline-variant bg-white p-2 font-body-sm text-body-sm focus:border-primary-container focus:ring-primary-container" placeholder="Email" type="email" />
                <button class="rounded-lg bg-primary-container px-4 py-2 font-button text-button text-white">Unirme</button>
              </form>
            </div>
          </div>
        </footer>
      </main>
    `;
  }
}
