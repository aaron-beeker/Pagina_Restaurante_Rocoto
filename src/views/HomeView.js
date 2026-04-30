export class HomeView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  renderShell(restaurantInfo) {
    this.rootElement.innerHTML = `
      <nav class="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-stone-50/90 shadow-sm backdrop-blur-md dark:border-stone-800/50 dark:bg-stone-950/90">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div class="text-2xl font-bold tracking-tighter text-green-900 font-h1 dark:text-green-500">
            <img alt="Rocoto Logo" class="h-12 w-auto" src="${restaurantInfo.logoUrl}" />
          </div>
          <div class="flex items-center space-x-8">
            <a class="border-b-2 border-green-900 pb-1 font-button text-green-900 dark:border-green-400 dark:text-green-400" href="#hero">Home</a>
            <a class="font-button text-stone-600 transition-colors hover:text-green-800 dark:text-stone-400 dark:hover:text-green-300" href="#daily-menu">Menu Diario</a>
            <a class="font-button text-stone-600 transition-colors hover:text-green-800 dark:text-stone-400 dark:hover:text-green-300" href="#menu">La Carta</a>
            <a class="font-button text-stone-600 transition-colors hover:text-green-800 dark:text-stone-400 dark:hover:text-green-300" href="#location">Contacto</a>
          </div>
        </div>
      </nav>

      <main>
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
            <div class="flex flex-col items-center gap-12 md:flex-row">
              <div class="md:w-1/2">
                <span class="mb-4 block font-label-caps uppercase tracking-widest text-secondary">Especial del Dia</span>
                <h2 class="mb-6 font-h1 text-h1 text-on-background">Menu Ejecutivo</h2>
                <p class="mb-8 font-body-lg text-on-surface-variant">Disfruta de nuestra seleccion especial de lunes a viernes.</p>
                <div class="mt-10 inline-block rounded-xl border-l-4 border-secondary bg-surface-container p-6">
                  <span class="font-label-caps text-on-surface-variant">PRECIO EXCLUSIVO</span>
                  <p class="mt-1 font-display text-3xl text-primary">S/ 24.90</p>
                </div>
              </div>
              <div class="relative md:w-1/2">
                <div class="overflow-hidden rounded-2xl shadow-2xl transition-transform duration-500 hover:rotate-0 md:rotate-2">
                  <img class="h-[550px] w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEhvAaQwChvkGXG7Y_POsJKhTdmB-TFIpuySwsveejZLToQ0MuEeLfqoPpsXZxkkBGHWOVKZtFVJrCSTJouTJMev_JpS-DzB3l9Fqm2vyzWczKT_ygbKgelkETIzel2JMBFoA21s62zB8MOu4D9n5RxtoOynl32Of1xqyue2nxUxZWN2QXYz3W9xKo5DtV7RqDGx7w9LBKNWkpc2M9CgqCaWrLcagVVwoYGj88bUn_FcxW_F8i9qApz2i71oxtf3jpzuNpLG_L7m-D" />
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
                  <img class="h-full w-full object-cover opacity-80 grayscale transition-all duration-700 hover:grayscale-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAAJ2r3-jV6aZcO24HOJHB7H-Qk5ADzXO5PkwE5qScslOl4cW6pGkKVqGH2qq3U-p1coxOpSGaRzkt1fBSr8o9tdqDOcTDJMd8nBmuJfa2eDnMumgez_fB0qHBe6wJxGVl6WLChoV1KM7I76UbBQMJbBiy68gGtXxKahJdTdWyJ_D-xYiXE1ANFzMUOE0PfffF7Hji02AmCqOxLEdF4OQO-ylHsCOx2vqw9LXiVrpL6WzGl4DhZouzHm8RuiOtOs5ek74vCJLf97SZL" />
                </div>
              </div>
              <div class="order-1 space-y-8 lg:order-2">
                <div>
                  <span class="mb-4 block font-label-caps uppercase tracking-widest text-secondary">Visitanos</span>
                  <h2 class="mb-6 font-h1 text-h1">Encuentranos en el Corazon de Lima</h2>
                </div>
                <div class="space-y-3 text-on-surface-variant">
                  <p><strong>Direccion:</strong> ${restaurantInfo.address}</p>
                  <p><strong>Horarios:</strong> ${restaurantInfo.schedule}</p>
                  <p><strong>Contacto:</strong> ${restaurantInfo.phone}</p>
                  <p><strong>Email:</strong> ${restaurantInfo.email}</p>
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
              <img alt="Rocoto Logo" class="mb-4 h-10 w-auto" src="${restaurantInfo.logoUrl}" />
              <p class="max-w-xs font-serif text-sm text-stone-500">Explorando la riqueza de la cocina peruano-china desde el corazon de Lima.</p>
            </div>
            <div class="flex flex-col gap-3">
              <h4 class="mb-2 font-h3 text-body-md font-bold text-green-900 dark:text-green-500">Enlaces</h4>
              <a class="text-sm text-stone-500 transition-all hover:text-green-700 dark:hover:text-green-300" href="#">Facebook</a>
              <a class="text-sm text-stone-500 transition-all hover:text-green-700 dark:hover:text-green-300" href="#">Instagram</a>
              <a class="text-sm text-stone-500 transition-all hover:text-green-700 dark:hover:text-green-300" href="#">WhatsApp</a>
            </div>
            <div class="flex flex-col gap-4">
              <h4 class="mb-2 font-h3 text-body-md font-bold text-green-900 dark:text-green-500">Newsletter</h4>
              <p class="text-sm text-stone-500">Suscribete para recibir ofertas y noticias.</p>
              <form class="flex gap-2">
                <input class="flex-grow rounded-lg border-outline-variant bg-white p-2 text-sm focus:border-primary-container focus:ring-primary-container" placeholder="Email" type="email" />
                <button class="rounded-lg bg-primary-container px-4 py-2 text-sm font-bold text-white">Unirme</button>
              </form>
            </div>
          </div>
        </footer>
      </main>
    `;
  }
}
