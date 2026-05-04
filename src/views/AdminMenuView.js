import { adminShell, button, form, typography } from "../ui/layout.js";

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

          <div class="mb-10 flex flex-col sm:flex-row gap-4">
              <button type="button" id="save-menu-top" class="${button.base} ${button.primary} flex-1 py-5">
                  Publicar actualización de menú
              </button>
              <button type="button" id="download-pdf-a3" class="${button.base} ${button.outlineDark} flex-1 py-5">
                  Descargar Carta PDF (Tamaño A2)
              </button>
          </div>

          <div class="space-y-12">
            <div>
              <h3 class="${adminShell.sectionTitle}">1. Entradas disponibles</h3>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                ${entradas.map((e) => this.createCheckboxCard("entrada-check", e.name || e)).join("")}
              </div>
            </div>

            <div>
              <h3 class="${adminShell.sectionTitle}">2. Plato del menú del día</h3>
              <p class="mb-4 text-xs font-medium text-stone-400">Productos con categoría <strong class="text-primary">Menú del Día</strong> en la carta.</p>
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

            <div class="border-t border-stone-100 pt-10">
              <button type="button" id="save-menu" class="${button.base} ${button.primary} w-full py-5 text-lg">
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
      <label class="group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-stone-100 bg-white p-4 transition-all hover:border-primary/30 hover:shadow-md active:scale-[0.98]">
        <input type="checkbox" name="${name}" value="${safe}" class="${form.checkbox}" />
        <span class="text-sm font-bold text-stone-700 group-hover:text-primary transition-colors">${label}</span>
      </label>
    `;
  }

  setupEventListeners(onSave) {
    const backBtn = document.getElementById("back-to-home");
    if (backBtn) {
      backBtn.onclick = () => window.location.reload();
    }

    const saveActions = () => {
      const config = {
        entradas: Array.from(document.querySelectorAll('input[name="entrada-check"]:checked')).map((el) => el.value),
        segundos: Array.from(document.querySelectorAll('input[name="segundo-check"]:checked')).map((el) => el.value),
        refrescos: Array.from(document.querySelectorAll('input[name="refresco-check"]:checked')).map((el) => el.value),
      };
      onSave(config);
    };

    document.getElementById("save-menu").onclick = saveActions;
    document.getElementById("save-menu-top").onclick = saveActions;
  }
}
