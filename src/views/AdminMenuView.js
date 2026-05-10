import { adminShell, button, form } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { dialog } from "../utils/notifications.js";

export class AdminMenuView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.data = { segundos: [], entradas: [], refrescos: [] };
  }

  render(segundos, entradas, refrescos, acciones) {
    const { onSave, onBack } = acciones;
    
    // Ordenar alfabéticamente una sola vez al recibir los datos
    const sortFn = (a, b) => a.name.localeCompare(b.name);
    this.data = {
      segundos: [...segundos].sort(sortFn),
      entradas: [...entradas].sort(sortFn),
      refrescos: [...refrescos].sort(sortFn)
    };

    this.rootElement.innerHTML = `
      <div class="min-h-screen bg-background px-2 py-4 sm:px-6 sm:py-8 pb-24">
        <div class="mx-auto w-full max-w-6xl rounded-3xl border border-surface-variant bg-surface p-4 sm:p-10 shadow-xl">
          <!-- Header Optimizado -->
          <div class="z-40 -mx-4 -mt-4 mb-8 border-b border-surface-variant bg-surface/95 p-4 backdrop-blur-md sm:sticky sm:top-0 sm:-mx-10 sm:-mt-10 sm:px-10 sm:pt-10 sm:pb-8 flex flex-col sm:flex-row sm:items-center justify-start gap-4 sm:gap-6">
            <button type="button" id="admin-menu-back" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition-all hover:bg-stone-200 active:scale-95">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>

            <div class="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-4">
              <div class="flex-1 min-w-0">
                  <h2 class="text-xl sm:text-3xl font-black tracking-tight text-primary leading-tight">Configuración Menú</h2>
                  <p class="hidden sm:block text-sm text-on-surface-variant/60 font-medium">Seleccione los platos del día.</p>
              </div>
              
              <div class="flex items-center gap-3 w-full sm:w-auto">
                <div class="relative flex-1 sm:w-64">
                    <input type="text" id="menu-search" placeholder="Buscar plato..." class="${form.input} pl-10 h-12 sm:h-11 shadow-sm" />
                    <svg class="absolute left-3 top-3.5 sm:top-3.5 h-5 w-5 text-on-surface-variant opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5"/></svg>
                </div>
                <button id="download-pdf-carta" class="${button.base} ${button.outlineDark} hidden sm:flex h-11 px-4 shrink-0 bg-stone-50 border-stone-200">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5"/></svg>
                    <span class="ml-2">PDF Menú</span>
                </button>
                <!-- Botón PDF Móvil -->
                <button id="download-pdf-carta-mobile" class="flex sm:hidden items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl border border-emerald-100 shadow-sm active:scale-95 transition-all w-fit">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    <span class="text-[10px] font-black uppercase tracking-widest">PDF</span>
                </button>
              </div>
            </div>
          </div>

          <form id="admin-menu-form" class="space-y-10">
            <div id="steps-container" class="space-y-8 sm:space-y-12">
                ${this._renderAllSteps("")}
            </div>

            <!-- Botón Guardar Flotante / Pegajoso -->
            <div class="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-stone-100 z-50 sm:relative sm:bg-transparent sm:border-0 sm:p-0 sm:pt-8">
              <button type="submit" class="${button.base} ${button.primary} w-full py-5 text-base sm:text-lg shadow-2xl shadow-primary/40 uppercase tracking-widest font-black">
                Actualizar Menú Público
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this._setupEvents(onBack, onSave);
  }

  _setupEvents(onBack, onSave) {
    const backBtn = this.rootElement.querySelector("#admin-menu-back");
    if (backBtn) backBtn.onclick = onBack;
    
    const searchInput = document.getElementById("menu-search");
    searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.getElementById("steps-container").innerHTML = this._renderAllSteps(query);
    };

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

    const pdfBtn = document.getElementById("download-pdf-a3");
    if (pdfBtn) {
        pdfBtn.onclick = async () => {
            // Esta acción se maneja en el controlador, pero mantenemos el ID
        };
    }
  }

  _renderAllSteps(query) {
    return `
        ${this._renderStep("Paso 1: Entradas", this.data.entradas, "entradas", query)}
        ${this._renderStep("Paso 2: Segundos", this.data.segundos, "segundos", query)}
        ${this._renderStep("Paso 3: Refrescos", this.data.refrescos, "refrescos", query)}
    `;
  }

  _renderStep(title, list, name, query) {
    const filtered = list.filter(p => p.name.toLowerCase().includes(query));
    if (filtered.length === 0 && query !== "") return ""; 

    return `
      <section class="animate-fade-in">
        <div class="flex items-center justify-between mb-4 border-b border-stone-100 pb-2">
            <h3 class="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">${title}</h3>
            <span class="text-[9px] font-black bg-stone-100 px-2 py-0.5 rounded-full text-stone-400">${filtered.length}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          ${filtered.map(plato => this.renderCheckbox(plato, name)).join('')}
        </div>
      </section>
    `;
  }

  renderCheckbox(plato, name) {
    return `
      <label class="group relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-stone-100 bg-stone-50/20 p-3 sm:p-4 transition-all hover:border-primary/30 has-[:checked]:border-primary has-[:checked]:bg-primary/5 active:scale-[0.98]">
        <input type="checkbox" name="${name}" value="${escapeHtml(plato.name)}" class="peer sr-only" ${plato.selected ? 'checked' : ''} />
        <div class="flex-1 min-w-0">
            <p class="text-left text-[11px] sm:text-xs font-black uppercase tracking-tight text-stone-500 peer-checked:text-primary truncate">
                ${escapeHtml(plato.name)}
            </p>
        </div>
        <div class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-stone-200 bg-white text-white peer-checked:bg-primary peer-checked:border-primary shrink-0 transition-all shadow-sm">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path d="M5 13l4 4L19 7"/></svg>
        </div>
      </label>
    `;
  }
}
