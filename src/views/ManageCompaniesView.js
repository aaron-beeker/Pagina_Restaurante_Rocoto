import { html, render } from "lit-html";
import { button, form, layout } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageCompaniesView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.companies = [];
    this.acciones = null;
    this.currentSearchQuery = "";
  }

  /**
   * Renderizado principal: Ajustado a 1400px con Inventario en Grid para minimizar scroll.
   */
  render(companies, acciones) {
    this.companies = companies;
    this.acciones = acciones;

    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans pb-32 text-stone-900">
        <div class="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
          <!-- Cabecera Editorial -->
          ${this._renderHeader(acciones.onBack)}

          <div class="space-y-10">
            <!-- BLOQUE MAESTRO: Gestión de Alianzas -->
            <section class="space-y-6">
              <div class="flex items-center gap-4">
                <h3
                  class="text-xs sm:text-sm font-black uppercase tracking-[0.4em] sm:tracking-[0.5em]"
                >
                  Alianzas Corporativas
                </h3>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <!-- Listado Izquierda (Empresas en GRID para ver más sin scroll) -->
                <div class="lg:col-span-7 order-2 lg:order-1 space-y-8">
                  <!-- Buscador Compacto -->
                  <div class="relative w-full group">
                    <input
                      type="search"
                      id="search-company"
                      .value=${this.currentSearchQuery}
                      @input=${(e) => this._handleFilter(e.target.value)}
                      placeholder="Buscar por nombre o RUC..."
                      class="w-full bg-white border-2 border-stone-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:border-primary outline-none transition-all shadow-sm placeholder:text-stone-300"
                    />
                    <svg
                      class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-300 group-focus-within:text-primary transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5" />
                    </svg>
                  </div>

                  <div class="flex items-center gap-4 ml-2 mb-2">
                    <div class="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"></div>
                    <span class="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900"
                      >Empresas en el Sistema (${companies.length})</span
                    >
                  </div>

                  <!-- Grid de 2 columnas en Desktop para optimizar espacio -->
                  <div id="companies-list-container" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    ${this._renderCompanyList(companies)}
                  </div>
                </div>

                <!-- Editor Derecha (Sticky - Blanco Premium) -->
                <div class="lg:col-span-5 order-1 lg:order-2">
                  <div
                    class="bg-white p-7 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-stone-100 shadow-xl lg:sticky lg:top-10 overflow-hidden"
                    id="company-editor-container"
                  >
                    <div class="relative z-10">
                      <div class="mb-8 border-b border-stone-50 pb-6">
                        <h4
                          class="text-stone-900 font-display italic text-xl sm:text-2xl"
                          id="form-title"
                        >
                          Registrar Empresa
                        </h4>
                        <p class="text-[9px] text-stone-400 uppercase tracking-widest mt-2">
                          Introduce los datos comerciales
                        </p>
                      </div>

                      <form
                        id="company-form"
                        @submit=${(e) => this._handleSubmit(e)}
                        class="space-y-8"
                      >
                        <input type="hidden" id="edit-company-id" value="" />

                        <div class="space-y-6">
                          <div>
                            <label
                              class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1"
                              >Nombre Comercial</label
                            >
                            <input
                              type="text"
                              id="company-name"
                              placeholder="Nombre de la empresa"
                              class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-lg sm:text-xl font-display italic focus:border-primary outline-none transition-all placeholder:text-stone-200"
                              required
                            />
                          </div>

                          <div>
                            <label
                              class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1"
                              >RUC</label
                            >
                            <input
                              type="text"
                              id="company-ruc"
                              placeholder="Opcional"
                              maxlength="11"
                              class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-base focus:border-primary outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label
                              class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1"
                              >Foto del Logo</label
                            >
                            <input
                              type="url"
                              id="company-logo"
                              placeholder="URL de la imagen"
                              class="w-full bg-stone-50 border-none rounded-xl py-4 px-6 text-sm text-stone-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div class="flex flex-col gap-4 pt-6 border-t border-stone-50">
                          <button
                            type="submit"
                            id="submit-company-btn"
                            class="w-full bg-stone-950 text-white py-8 sm:py-7 rounded-3xl text-sm sm:text-base uppercase tracking-[0.5em] font-black shadow-2xl hover:bg-primary transition-all duration-500 active:scale-[0.97] transform"
                          >
                            Guardar Empresa
                          </button>
                          <button
                            type="button"
                            @click=${() => this.resetForm()}
                            class="w-full text-stone-500 py-3 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-all italic text-center border-2 border-dashed border-transparent hover:border-stone-100 rounded-2xl"
                          >
                            Cancelar / Limpiar
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;

    this._safeRender(template);

    if (this.currentSearchQuery) {
      this._handleFilter(this.currentSearchQuery);
    }
  }

  _renderCompanyList(companies) {
    if (companies.length === 0) {
      return html`<div
        class="col-span-full py-24 text-center border-2 border-dashed border-stone-100 rounded-[3rem] text-stone-300 uppercase tracking-[0.4em] text-[10px] font-bold italic bg-white"
      >
        Sin empresas registradas
      </div>`;
    }
    return html`${companies.map((c) => this._renderCompanyCard(c))}`;
  }

  _renderCompanyCard(c) {
    return html`
      <div
        class="group relative overflow-hidden rounded-[2.5rem] border-2 border-stone-50 bg-white p-6 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col gap-6"
        data-company-card
        data-name="${c.nombre.toLowerCase()}"
        data-ruc="${c.ruc || ""}"
      >
        <div class="flex items-center gap-4 relative z-10">
          <!-- Logo Empresa (Más compacto) -->
          <div
            class="h-14 w-14 rounded-2xl bg-stone-50 flex items-center justify-center border border-stone-100 overflow-hidden shadow-inner shrink-0"
          >
            ${c.logo
              ? html`<img
                  src="${c.logo}"
                  class="h-[75%] w-[75%] object-contain"
                  @error=${(e) =>
                    (e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(c.nombre)}&background=1B5E34&color=fff`)}
                />`
              : html`<span class="text-xl font-black text-primary/30"
                  >${c.nombre.charAt(0).toUpperCase()}</span
                >`}
          </div>

          <div class="flex-1 min-w-0">
            <h4
              class="text-sm font-sans font-bold text-stone-900 uppercase tracking-tight truncate mb-1"
            >
              ${c.nombre}
            </h4>
            <p class="text-[9px] font-mono text-stone-400 font-bold">
              RUC: ${c.ruc || "S. REGISTRO"}
            </p>
          </div>
        </div>

        <!-- Acciones Integradas -->
        <div class="flex gap-2 pt-4 border-t border-stone-50 mt-auto relative z-20">
          <button
            @click=${() => this.acciones.onEdit(c.id)}
            class="flex-1 py-2.5 rounded-xl bg-stone-50 text-stone-600 text-[10px] font-black uppercase tracking-widest hover:bg-stone-950 hover:text-white transition-all active:scale-95 border border-stone-100"
          >
            Editar
          </button>
          <button
            @click=${() => this._handleDelete(c.id)}
            class="p-2.5 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2.5"
            >
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  _handleFilter(query) {
    this.currentSearchQuery = query;
    const q = query.toLowerCase().trim();
    const cards = this.rootElement.querySelectorAll("[data-company-card]");

    cards.forEach((card) => {
      const name = card.getAttribute("data-name");
      const ruc = card.getAttribute("data-ruc");
      const matches = name.includes(q) || ruc.includes(q);
      card.classList.toggle("hidden", !matches);
    });
  }

  _handleSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("edit-company-id").value;
    const data = {
      nombre: document.getElementById("company-name").value.trim(),
      ruc: document.getElementById("company-ruc").value.trim(),
      logo: document.getElementById("company-logo").value.trim(),
    };
    this.acciones.onSave(id, data);
    this.resetForm();
  }

  prepareEdit(company) {
    const container = document.getElementById("company-editor-container");
    document.getElementById("edit-company-id").value = company.id;
    document.getElementById("company-name").value = company.nombre;
    document.getElementById("company-ruc").value = company.ruc || "";
    document.getElementById("company-logo").value = company.logo || "";

    document.getElementById("form-title").textContent = "Editar Empresa";
    document.getElementById("submit-company-btn").textContent = "Actualizar Datos";

    container.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    container.classList.add("ring-8", "ring-primary/10", "duration-500");
    setTimeout(() => container.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  resetForm() {
    const form = document.getElementById("company-form");
    if (form) form.reset();
    document.getElementById("edit-company-id").value = "";
    document.getElementById("form-title").textContent = "Registrar Empresa";
    document.getElementById("submit-company-btn").textContent = "Guardar Empresa";
    const container = document.getElementById("company-editor-container");
    if (container) container.classList.remove("ring-8", "ring-primary/10");
  }

  async _handleDelete(id) {
    if (await dialog.confirm("Eliminar Empresa", "¿Está seguro?")) {
      this.acciones.onDelete(id);
    }
  }

  _renderHeader(onBack) {
    return html`
      <header
        class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-20 pb-8 border-b border-stone-200"
      >
        <div class="space-y-4 sm:space-y-6">
          <button
            @click=${onBack}
            class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] transition-all group"
          >
            <svg
              class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-width="3" d="M15 19l-7-7 7-7"></path>
            </svg>
            Volver al Panel
          </button>
          <div class="flex flex-col gap-2">
            <span
              class="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400 font-bold"
              >Alianzas Estratégicas</span
            >
            <h2 class="text-3xl sm:text-6xl font-display italic text-stone-950 leading-none">
              Gestión
              <span
                class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8"
                >Empresas</span
              >
            </h2>
          </div>
        </div>
      </header>
    `;
  }

  _safeRender(template) {
    try {
      render(template, this.rootElement);
    } catch (e) {
      this.rootElement.innerHTML = "";
      render(template, this.rootElement);
    }
  }
}
