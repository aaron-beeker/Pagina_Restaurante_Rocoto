import { adminShell, button, form } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { dialog } from "../utils/notifications.js";

export class AdminMenuView {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  render(segundos, entradas, refrescos, acciones) {
    const { onSave, onBack } = acciones;
    this.rootElement.innerHTML = `
      <div class="${adminShell.page}">
        <div class="${adminShell.card}">
          <div class="${adminShell.header}">
            <div>
              <h2 class="${adminShell.title}">Configuración de Menú Ejecutivo</h2>
              <p class="${adminShell.subtitle}">Seleccione los platos disponibles para el menú del día.</p>
            </div>
            <div class="flex flex-wrap gap-2">
              <button id="download-pdf-a3" class="${button.base} ${button.outlineDark} ${button.small}">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5"/></svg>
                  Menú PDF (A2)
              </button>
              <button type="button" id="admin-menu-back" class="${adminShell.backBtn}">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  Cerrar panel
              </button>
            </div>
          </div>

          <form id="admin-menu-form" class="space-y-12">
            <section>
              <h3 class="${adminShell.sectionTitle}">Paso 1: Entradas del Día</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                ${entradas.map(plato => this.renderCheckbox(plato, "entradas")).join('')}
              </div>
            </section>

            <section>
              <h3 class="${adminShell.sectionTitle}">Paso 2: Segundos del Día</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                ${segundos.map(plato => this.renderCheckbox(plato, "segundos")).join('')}
              </div>
            </section>

            <section>
              <h3 class="${adminShell.sectionTitle}">Paso 3: Refrescos del Día</h3>
              <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                ${refrescos.map(plato => this.renderCheckbox(plato, "refrescos")).join('')}
              </div>
            </section>

            <div class="pt-6 border-t border-stone-100">
              <button type="submit" class="${button.base} ${button.primary} w-full py-5 text-lg shadow-xl shadow-primary/20">
                Actualizar Menú Público
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.getElementById("admin-menu-back").onclick = onBack;
    document.getElementById("admin-menu-form").onsubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      onSave({
        entradas: formData.getAll("entradas"),
        segundos: formData.getAll("segundos"),
        refrescos: formData.getAll("refrescos"),
        ultimaActualizacion: new Date().toISOString()
      });
    };
  }

  renderCheckbox(plato, name) {
    return `
      <label class="group relative flex cursor-pointer flex-col rounded-2xl border-2 border-stone-100 bg-stone-50/30 p-3 transition-all hover:border-primary/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <input type="checkbox" name="${name}" value="${escapeHtml(plato.name)}" class="peer sr-only" ${plato.selected ? 'checked' : ''} />
        <div class="mb-2 aspect-square overflow-hidden rounded-xl bg-stone-200">
            <img src="${escapeHtml(plato.image)}" alt="${escapeHtml(plato.name)}" class="h-full w-full object-cover grayscale group-hover:grayscale-0 peer-checked:grayscale-0" onerror="this.src='https://placehold.co/400x400?text=No+Image'"/>
        </div>
        <p class="text-center text-[10px] font-black uppercase leading-tight text-stone-500 peer-checked:text-primary">${escapeHtml(plato.name)}</p>
        <div class="absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-primary text-white shadow-sm peer-checked:flex">
          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke-width="3"/></svg>
        </div>
      </label>
    `;
  }
}
