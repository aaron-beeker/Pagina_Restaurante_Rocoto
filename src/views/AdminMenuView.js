import { adminShell } from "../ui/layout.js";

export class AdminMenuView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(segundos, entradas, refrescos, onSave) {
    this.rootElement.innerHTML = `
      <div class="${adminShell.page}">
        <div class="${adminShell.card}">
          <div class="${adminShell.header}">
            <div>
              <h2 class="${adminShell.title}">Menú ejecutivo del día</h2>
              <p class="${adminShell.subtitle}">Marca las opciones disponibles para hoy y publica los cambios.</p>
            </div>
            <button type="button" id="back-to-home" class="${adminShell.backBtn}" aria-label="Cerrar panel">
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              Cerrar panel
            </button>
          </div>

          <div class="border-t border-stone-200 pt-6 sm:pt-8 flex flex-col gap-4">
              <button type="button" id="save-menu" class="w-full rounded-xl bg-primary py-4 font-button text-sm font-bold text-white shadow-lg transition-all hover:brightness-110">
                  Publicar actualización de menú
              </button>
              <button type="button" id="download-pdf-a3" class="w-full rounded-xl border-2 border-primary py-4 font-button text-sm font-bold text-primary transition-all hover:bg-stone-50">
                  Descargar Carta PDF (Tamaño A3)
              </button>
          </div>

          <div class="space-y-8 sm:space-y-10">
            <div>
              <h3 class="${adminShell.sectionTitle}">1. Entradas disponibles</h3>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                ${entradas.map((e) => this.createCheckboxCard("entrada-check", e.name || e)).join("")}
              </div>
            </div>

            <div>
              <h3 class="${adminShell.sectionTitle}">2. Plato del menú del día</h3>
              <p class="mb-3 text-xs text-stone-500">Productos con categoría <strong>Menú del Día</strong> en la carta.</p>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                ${segundos.map((s) => this.createCheckboxCard("segundo-check", s.name || s)).join("")}
              </div>
            </div>

            <div>
              <h3 class="${adminShell.sectionTitle}">3. Bebidas del día</h3>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                ${refrescos.map((r) => this.createCheckboxCard("refresco-check", r.name || r)).join("")}
              </div>
            </div>

            <div class="border-t border-stone-200 pt-6 sm:pt-8">
              <button type="button" id="save-menu" class="w-full rounded-xl bg-primary py-4 font-button text-sm font-bold text-white shadow-lg transition-all hover:brightness-110 sm:py-5 sm:text-button">
                Publicar actualización de menú
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    this.setupEventListeners(onSave);
  }

  createCheckboxCard(name, label) {
    const safe = String(label).replace(/"/g, "&quot;");
    return `
      <label class="group relative flex cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-white p-3 transition-colors hover:border-primary/40 hover:bg-surface-container-low sm:p-4">
        <input type="checkbox" name="${name}" value="${safe}" class="h-5 w-5 shrink-0 rounded border-stone-300 text-primary focus:ring-primary" />
        <span class="text-sm font-medium text-stone-800">${label}</span>
      </label>
    `;
  }

  setupEventListeners(onSave) {
    const backBtn = document.getElementById("back-to-home");
    if (backBtn) {
      backBtn.onclick = () => window.location.reload();
    }

    document.getElementById("save-menu").onclick = () => {
      const config = {
        entradas: Array.from(document.querySelectorAll('input[name="entrada-check"]:checked')).map((el) => el.value),
        segundos: Array.from(document.querySelectorAll('input[name="segundo-check"]:checked')).map((el) => el.value),
        refrescos: Array.from(document.querySelectorAll('input[name="refresco-check"]:checked')).map((el) => el.value),
      };
      onSave(config);
    };
  }
}
