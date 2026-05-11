import { html, render } from 'lit-html';
import { button, form, layout } from "../ui/layout.js";

export class AdminMenuView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.data = { segundos: [], entradas: [], refrescos: [] };
  }

  render(segundos, entradas, refrescos, acciones) {
    const { onSave, onBack } = acciones;
    
    const sortFn = (a, b) => a.name.localeCompare(b.name);
    this.data = {
      segundos: [...segundos].sort(sortFn),
      entradas: [...entradas].sort(sortFn),
      refrescos: [...refrescos].sort(sortFn)
    };

    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans">
        <div class="max-w-6xl mx-auto px-4 py-8 sm:py-16">
          
          <!-- Cabecera Editorial Minimalista -->
          <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 pb-8 border-b border-stone-200">
            <div class="space-y-6">
                <button @click=${onBack} class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[10px] uppercase tracking-[0.5em] transition-all group">
                    <svg class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                    Volver al Inicio
                </button>
                <div class="flex flex-col gap-2">
                    <span class="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-bold">Gestión de Restaurante</span>
                    <h2 class="text-4xl sm:text-6xl font-display italic text-stone-950 leading-none">
                        Configuración <span class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8">Menú</span>
                    </h2>
                </div>
            </div>
            
            <div class="flex items-center gap-4 w-full sm:w-auto">
                <div class="relative flex-1 sm:w-72 group">
                    <input type="text" id="menu-search" @input=${(e) => this._handleSearch(e)} 
                           placeholder="Buscar plato..." 
                           class="w-full bg-white border-2 border-stone-100 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary focus:ring-0 transition-all outline-none shadow-sm" />
                    <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5"/></svg>
                </div>
                <button id="download-pdf-carta" class="h-14 px-6 flex items-center gap-3 bg-stone-950 text-white rounded-2xl hover:bg-primary transition-all shadow-xl group">
                    <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /><path d="M13 3v5h5" /></svg>
                    <span class="text-[10px] font-black uppercase tracking-[0.2em]">PDF</span>
                </button>
            </div>
          </header>

          <!-- Formulario de Selección -->
          <form id="admin-menu-form" @submit=${(e) => this._handleSubmit(e, onSave)} class="space-y-20 pb-32">
            <div id="steps-container" class="space-y-24">
                ${this._renderAllSteps("")}
            </div>

            <!-- Acción Principal Flotante -->
            <div class="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50">
              <button type="submit" class="w-full bg-stone-950 text-white py-6 rounded-full text-[10px] uppercase tracking-[0.5em] font-black shadow-2xl hover:bg-primary transition-all duration-500 active:scale-95 group">
                 Actualizar Menú Público
                 <span class="inline-block ml-4 group-hover:translate-x-1 transition-transform">&rarr;</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    this._safeRender(template);
  }

  // Renderización segura para evitar errores de ChildPart
  _safeRender(template) {
    try {
        render(template, this.rootElement);
    } catch (error) {
        console.warn("Lit-html markers lost in AdminMenu, forcing clean render...");
        this.rootElement.innerHTML = "";
        render(template, this.rootElement);
    }
  }

  _handleSearch(e) {
      const query = e.target.value.toLowerCase().trim();
      const sections = this.rootElement.querySelectorAll("section");
      
      sections.forEach(section => {
          let hasVisible = false;
          const labels = section.querySelectorAll("label[data-name]");
          
          labels.forEach(label => {
              const name = label.getAttribute("data-name").toLowerCase();
              if (name.includes(query)) {
                  label.classList.remove("hidden");
                  hasVisible = true;
              } else {
                  label.classList.add("hidden");
              }
          });

          // Ocultar sección si no hay platos que coincidan
          if (!hasVisible && query !== "") {
              section.classList.add("hidden");
          } else {
              section.classList.remove("hidden");
          }
      });
  }

  _handleSubmit(e, onSave) {
      e.preventDefault();
      const formData = new FormData(e.target);
      
      const entradas = formData.getAll("entradas");
      const segundos = formData.getAll("segundos");
      const refrescos = formData.getAll("refrescos");

      // VALIDACIÓN: Mínimo uno de cada categoría
      if (entradas.length === 0 || segundos.length === 0 || refrescos.length === 0) {
          import("../utils/notifications.js").then(({ toast }) => {
              toast.info("Para actualizar, debes seleccionar al menos una Entrada, un Plato de Fondo y un Refresco.");
          });
          return;
      }

      onSave({
        entradas,
        segundos,
        refrescos,
        ultimaActualizacion: new Date().toISOString()
      });
  }

  _renderAllSteps(query) {
    return html`
        ${this._renderStep("01. Entradas", this.data.entradas, "entradas", query)}
        ${this._renderStep("02. Platos de Fondo", this.data.segundos, "segundos", query)}
        ${this._renderStep("03. Refrescos", this.data.refrescos, "refrescos", query)}
    `;
  }

  _renderStep(title, list, name, query) {
    return html`
      <section class="space-y-8">
        <div class="flex items-center gap-6">
            <h3 class="text-[11px] font-black uppercase tracking-[0.4em] text-stone-300 whitespace-nowrap">${title}</h3>
            <div class="h-px w-full bg-stone-100"></div>
            <span class="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">${list.length}</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          ${list.map(plato => this.renderCheckbox(plato, name))}
        </div>
      </section>
    `;
  }

  renderCheckbox(plato, name) {
    // Definir colores por categoría para fácil identificación
    const colors = {
        entradas: "border-l-amber-500 bg-amber-50/10 has-[:checked]:bg-amber-50/30",
        segundos: "border-l-primary bg-primary/[0.02] has-[:checked]:bg-primary/[0.05]",
        refrescos: "border-l-blue-500 bg-blue-50/10 has-[:checked]:bg-blue-50/30"
    };
    const colorClass = colors[name] || "border-l-stone-200";

    return html`
      <label data-name="${plato.name}" class="group relative flex cursor-pointer items-center justify-between p-6 rounded-2xl rounded-l-none bg-white border-2 border-stone-50 ${colorClass} border-l-4 hover:border-primary/20 hover:shadow-xl transition-all duration-500 active:scale-[0.98] has-[:checked]:border-primary">
        <input type="checkbox" name="${name}" value="${plato.name}" class="peer sr-only" .checked=${plato.selected} />
        
        <div class="flex-1 min-w-0 pr-4">
            <p class="text-xs sm:text-sm font-sans font-bold text-stone-800 group-hover:text-primary transition-colors leading-tight uppercase">
                ${plato.name}
            </p>
        </div>

        <!-- Indicador Minimalista -->
        <div class="flex h-8 w-8 items-center justify-center rounded-2xl border border-stone-100 bg-stone-50 text-white peer-checked:bg-primary peer-checked:border-primary transition-all duration-500 shadow-inner group-hover:scale-110">
          <svg class="h-4 w-4 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M5 13l4 4L19 7"/></svg>
        </div>
      </label>
    `;
  }
}
