export class HomeView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  renderDailyMenuSteps(dailyMenu) {
    return (dailyMenu.steps || [])
      .map(
        (step, index) => `
          <div class="flex items-start gap-4">
            <span class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary font-button text-white">${index + 1}</span>
            <div>
              <h3 class="font-h3 text-h3 text-on-background">${step.title}</h3>
              <ul class="mt-2 list-disc space-y-1 pl-5 font-body-md text-on-surface-variant">
                ${(step.items || []).map((item) => `<li>${item}</li>`).join("")}
              </ul>
            </div>
          </div>
        `,
      )
      .join("");
  }

  renderShell(restaurantInfo) {
    this.rootElement.innerHTML = `
      <nav class="fixed top-0 z-50 w-full border-b border-stone-200/50 bg-stone-50/90 shadow-sm backdrop-blur-md dark:border-stone-800/50 dark:bg-stone-950/90">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div class="text-2xl font-bold tracking-tighter text-green-900 font-h1 dark:text-green-500">
            <img alt="Rocoto Logo" class="h-14 w-auto" src="${restaurantInfo.logoUrl}" />
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
            <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
              <div>
                <span class="mb-3 block font-label-caps uppercase tracking-widest text-secondary">Especial del Dia</span>
                <h2 class="mb-4 font-h1 text-h1 text-on-background" id="daily-menu-title">${restaurantInfo.dailyMenu.title}</h2>
                <p class="mb-8 max-w-xl font-body-lg text-on-surface-variant" id="daily-menu-description">
                  ${restaurantInfo.dailyMenu.description}
                </p>

                <div class="space-y-6" id="daily-menu-steps">
                  ${this.renderDailyMenuSteps(restaurantInfo.dailyMenu)}
                </div>

                <div class="mt-8 inline-block rounded-xl border-l-4 border-secondary bg-surface-container p-6" id="daily-menu-price-box">
                  <span class="font-label-caps text-on-surface-variant">Precio del Dia</span>
                  <p class="mt-1 font-display text-3xl text-primary" id="daily-menu-price">S/ ${restaurantInfo.dailyMenu.price}</p>
                </div>
                <div class="mt-6 rounded-xl border border-surface-variant bg-surface-container-low p-4">
                  <p class="mb-3 font-body-sm text-on-surface-variant">
                    Sube una foto del menu escrito a mano para extraer el contenido y actualizar esta seccion automaticamente.
                  </p>
                  <div class="flex flex-wrap items-center gap-3">
                    <label class="cursor-pointer rounded-lg bg-primary px-4 py-2 font-button text-button text-white transition-all hover:brightness-110">
                      Tomar/Subir foto
                      <input accept="image/*" capture="environment" class="hidden" id="daily-menu-photo-input" type="file" />
                    </label>
                    <span class="font-body-sm text-on-surface-variant" id="daily-menu-ocr-status">Sincronizado con datos actuales.</span>
                  </div>
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
                  <p class="font-body-sm text-on-surface-variant" id="daily-menu-time">${restaurantInfo.dailyMenu.availableTime}</p>
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

  bindDailyMenuPhotoInput(onFileSelected) {
    const photoInput = document.getElementById("daily-menu-photo-input");
    if (!photoInput) return;
    photoInput.addEventListener("change", () => {
      const file = photoInput.files?.[0];
      if (!file) return;
      this.setDailyMenuOcrStatus(`Foto cargada: ${file.name}. Iniciando analisis...`);
      onFileSelected(file);
      photoInput.value = "";
    });
  }

  setDailyMenuOcrStatus(message, tone = "normal") {
    const statusElement = document.getElementById("daily-menu-ocr-status");
    if (!statusElement) return;
    statusElement.textContent = message;
    statusElement.className = "font-body-sm";

    if (tone === "error") {
      statusElement.classList.add("text-red-700");
      return;
    }
    if (tone === "success") {
      statusElement.classList.add("text-green-700");
      return;
    }
    statusElement.classList.add("text-on-surface-variant");
  }

  updateDailyMenuSection(dailyMenu) {
    const title = document.getElementById("daily-menu-title");
    const description = document.getElementById("daily-menu-description");
    const steps = document.getElementById("daily-menu-steps");
    const price = document.getElementById("daily-menu-price");
    const availableTime = document.getElementById("daily-menu-time");

    if (title) title.textContent = dailyMenu.title;
    if (description) description.textContent = dailyMenu.description;
    if (steps) steps.innerHTML = this.renderDailyMenuSteps(dailyMenu);
    if (price) price.textContent = `S/ ${dailyMenu.price}`;
    if (availableTime) availableTime.textContent = dailyMenu.availableTime;
  }
}
