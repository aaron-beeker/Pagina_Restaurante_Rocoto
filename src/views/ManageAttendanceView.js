import { html, render } from "lit-html";
import { button, form, layout } from "../ui/layout.js";
import { escapeHtml } from "../utils/html.js";
import { getLocalDateString } from "../utils/dateUtils.js";
import { toast, dialog } from "../utils/notifications.js";

export class ManageAttendanceView {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.allAttendances = [];
    this.monthAttendances = [];
    this.allWorkers = [];
    this.companies = [];
    this.acciones = null;

    // Estado de filtros acumulativo
    this.filters = {
      query: "",
      company: "",
      date: getLocalDateString(),
    };
  }

  /**
   * Renderizado principal - Reconstruye la estructura base.
   */
  render(data, workers, companies, acciones) {
    this.allAttendances = data.day || [];
    this.monthAttendances = data.month || [];
    this.allWorkers = workers || [];
    this.companies = companies || [];
    this.acciones = acciones;

    const filtered = this._getFilteredData();

    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans pb-32 text-stone-900">
        <div class="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
          <!-- Cabecera -->
          <header
            class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-20 pb-8 border-b border-stone-200"
          >
            <div class="space-y-4 sm:space-y-6">
              <button
                @click=${acciones.onBack}
                class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[9px] uppercase tracking-[0.5em] transition-all group"
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
                <span class="text-[8px] uppercase tracking-[0.4em] text-stone-400 font-bold"
                  >Control de Alimentación</span
                >
                <h2 class="text-3xl sm:text-6xl font-display italic text-stone-950 leading-none">
                  Gestión
                  <span
                    class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8"
                    >Asistencias</span
                  >
                </h2>
              </div>
            </div>
          </header>

          <div class="space-y-12">
            <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">
              <!-- COLUMNA IZQUIERDA: Exploración y Listado (Lista Única) -->
              <div class="xl:col-span-8 order-2 xl:order-1 space-y-10">
                <div
                  class="space-y-8 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-stone-100 shadow-sm"
                >
                  <div class="flex items-center gap-4 mb-2">
                    <h3 class="text-xs font-black uppercase tracking-[0.4em]">
                      Explorar Registros
                    </h3>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Buscador Único (Nombre/DNI) -->
                    <div class="relative group">
                      <input
                        type="text"
                        id="search-attendance-list"
                        .value=${this.filters.query}
                        @input=${(e) => this._handleFilterChange("query", e.target.value)}
                        placeholder="Buscar trabajador o DNI..."
                        class="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary focus:bg-white outline-none transition-all"
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

                    <!-- Filtros de Fecha y Empresa -->
                    <div class="grid grid-cols-2 gap-3">
                      <input
                        type="date"
                        id="filter-date"
                        .value=${this.filters.date}
                        @change=${(e) => this._handleFilterChange("date", e.target.value)}
                        class="bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 px-4 text-sm focus:border-primary focus:bg-white outline-none transition-all"
                      />

                      <select
                        id="filter-company-list"
                        @change=${(e) => this._handleFilterChange("company", e.target.value)}
                        class="bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 px-4 text-sm focus:border-primary focus:bg-white outline-none transition-all appearance-none font-bold text-stone-600"
                      >
                        <option value="" ?selected=${this.filters.company === ""}>
                          Todas las empresas
                        </option>
                        ${this.companies.map(
                          (c) => html`
                            <option
                              value="${c.nombre}"
                              ?selected=${this.filters.company === c.nombre}
                            >
                              ${c.nombre}
                            </option>
                          `
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Única Lista de Resultados -->
                <div
                  id="table-container"
                  class="lg:max-h-[850px] lg:overflow-y-auto lg:pr-4 custom-scrollbar"
                >
                  ${this._renderAttendanceTable(filtered)}
                </div>
              </div>

              <!-- COLUMNA DERECHA: Formulario de Registro -->
              <div class="xl:col-span-4 order-1 xl:order-2 space-y-8 lg:sticky lg:top-10">
                <div
                  class="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-stone-100 shadow-xl relative overflow-hidden"
                  id="attendance-form-section"
                >
                  <div
                    class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"
                  ></div>
                  <div class="relative z-10 mb-8 border-b border-stone-50 pb-6">
                    <h4 class="text-stone-900 font-display italic text-xl" id="form-title">
                      Registro de Asistencia
                    </h4>
                    <p class="text-[9px] text-stone-400 uppercase tracking-widest mt-1">
                      Ingreso manual de consumo
                    </p>
                  </div>

                  <form
                    id="attendance-form"
                    @submit=${(e) => this._handleFormSubmit(e)}
                    class="relative z-10 space-y-6"
                  >
                    <input type="hidden" id="edit-attendance-id" value="" />
                    <div class="space-y-5">
                      <div>
                        <label
                          class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1"
                          >Seleccionar Trabajador</label
                        >
                        <select
                          id="attendance-worker-dni"
                          @change=${(e) => this._handleWorkerChange(e)}
                          class="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl py-4 px-5 text-stone-900 text-sm focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                          required
                        >
                          <option value="">Seleccionar Trabajador</option>
                          ${this.allWorkers
                            .sort((a, b) => a.apellidos.localeCompare(b.apellidos))
                            .map(
                              (w) => html`
                                <option value="${w.dni}">
                                  ${w.apellidos}, ${w.nombre} (${w.dni})
                                </option>
                              `
                            )}
                        </select>
                      </div>

                      <div
                        id="local-consumption-toggle"
                        class="hidden bg-stone-50/50 p-4 rounded-2xl border border-stone-100 flex items-center justify-between"
                      >
                        <div class="flex flex-col">
                          <span class="text-[10px] font-black uppercase text-stone-700"
                            >Consumo Local</span
                          >
                          <span class="text-[8px] text-stone-400 uppercase tracking-tighter italic"
                            >¿Comerá aquí?</span
                          >
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            id="attendance-also-eats"
                            checked
                            @change=${() => this._updateCampoUI()}
                            class="sr-only peer"
                          />
                          <div
                            class="w-11 h-6 bg-stone-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"
                          ></div>
                        </label>
                      </div>

                      <div class="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block"
                            >Fecha</label
                          >
                          <input
                            type="date"
                            id="attendance-date"
                            .value=${getLocalDateString()}
                            class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-sm focus:border-primary outline-none transition-all"
                            required
                          />
                        </div>
                        <div>
                          <label
                            class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block"
                            >Servicio</label
                          >
                          <select
                            id="attendance-type"
                            class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-sm focus:border-primary outline-none transition-all appearance-none disabled:opacity-30 disabled:grayscale"
                          >
                            <option value="Desayuno">Desayuno</option>
                            <option value="Almuerzo" selected>Almuerzo</option>
                            <option value="Cena">Cena</option>
                          </select>
                        </div>
                      </div>

                      <div
                        id="field-manager-options"
                        class="hidden p-6 bg-amber-50/40 rounded-3xl border border-amber-100 space-y-4 text-center"
                      >
                        <label
                          class="text-[9px] uppercase tracking-[0.3em] text-amber-700 font-black mb-1 block"
                          >Raciones a Campo</label
                        >
                        <input
                          type="number"
                          id="attendance-field-qty"
                          placeholder="0"
                          min="0"
                          value="0"
                          class="w-full bg-transparent border-b-2 border-amber-200 py-2 text-stone-900 text-2xl text-center font-black outline-none focus:border-primary transition-all"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col gap-4 pt-4 border-t border-stone-50">
                      <button
                        type="submit"
                        id="submit-attendance-btn"
                        class="w-full bg-stone-950 text-white py-6 rounded-3xl text-sm uppercase tracking-[0.5em] font-black shadow-2xl hover:bg-primary transition-all active:scale-[0.97]"
                      >
                        Guardar Registro
                      </button>
                      <button
                        type="button"
                        @click=${() => this.resetForm()}
                        class="w-full text-stone-400 py-3 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-all italic text-center"
                      >
                        Limpiar Formulario
                      </button>
                    </div>
                  </form>
                </div>

                <!-- Panel Exportación -->
                <div
                  class="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-stone-100 shadow-xl space-y-8"
                >
                  <div class="pb-4 border-b border-stone-50 text-center lg:text-left">
                    <h4 class="text-stone-900 font-display italic text-xl">Exportar Reportes</h4>
                  </div>

                  <div class="space-y-6">
                    <div>
                      <label
                        class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block"
                        >Empresa</label
                      >
                      <select
                        id="report-company"
                        class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-sm font-bold text-stone-900 outline-none"
                      >
                        <option value="">Consolidado General</option>
                        ${this.companies.map(
                          (c) => html`<option value="${c.nombre}">${c.nombre}</option>`
                        )}
                      </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block"
                          >Desde</label
                        ><input
                          type="date"
                          id="report-start-date"
                          class="w-full bg-stone-50 border-b-2 border-stone-100 py-2 text-xs font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label
                          class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-2 block"
                          >Hasta</label
                        ><input
                          type="date"
                          id="report-end-date"
                          class="w-full bg-stone-50 border-b-2 border-stone-100 py-2 text-xs font-bold outline-none"
                        />
                      </div>
                    </div>
                    <div class="p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-4">
                      <span
                        class="text-[8px] font-black uppercase text-stone-300 tracking-[0.3em] block text-center"
                        >Precios Liquidación (S/)</span
                      >
                      <div class="grid grid-cols-3 gap-3">
                        <div class="text-center bg-white p-2 rounded-xl border border-stone-100">
                          <span class="text-[7px] font-bold text-stone-400 uppercase block mb-1"
                            >Des.</span
                          ><input
                            type="number"
                            id="price-d"
                            value="10.00"
                            step="0.10"
                            class="w-full bg-transparent py-1 text-xs text-center font-black text-primary outline-none"
                          />
                        </div>
                        <div class="text-center bg-white p-2 rounded-xl border border-stone-100">
                          <span class="text-[7px] font-bold text-stone-400 uppercase block mb-1"
                            >Alm.</span
                          ><input
                            type="number"
                            id="price-a"
                            value="12.00"
                            step="0.10"
                            class="w-full bg-transparent py-1 text-xs text-center font-black text-primary outline-none"
                          />
                        </div>
                        <div class="text-center bg-white p-2 rounded-xl border border-stone-100">
                          <span class="text-[7px] font-bold text-stone-400 uppercase block mb-1"
                            >Cena</span
                          ><input
                            type="number"
                            id="price-c"
                            value="10.00"
                            step="0.10"
                            class="w-full bg-transparent py-1 text-xs text-center font-black text-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div class="flex flex-col gap-4 pt-4 border-t border-stone-50">
                      <button
                        @click=${() => this._handleExport("pdf")}
                        class="w-full bg-stone-950 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:bg-primary transition-all"
                      >
                        Exportar PDF
                      </button>
                      <button
                        @click=${() => this._handleExport("excel")}
                        class="w-full bg-stone-50 text-emerald-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-100 transition-all border border-emerald-100"
                      >
                        Exportar Excel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this._safeRender(template);
  }

  // --- LÓGICA DE FILTRADO (UNIFICADA) ---

  _getFilteredData() {
    const q = (this.filters.query || "").toLowerCase().trim();
    const c = (this.filters.company || "").toLowerCase().trim();

    return this.allAttendances.filter((a) => {
      const matchesQuery =
        !q || (a.nombreCompleto || "").toLowerCase().includes(q) || (a.dni || "").includes(q);

      const workerEmpresa = (a.empresa || "Particular").toLowerCase().trim();
      const matchesCompany = !c || workerEmpresa === c;

      return matchesQuery && matchesCompany;
    });
  }

  _handleFilterChange(type, value) {
    this.filters[type] = value;

    if (type === "date") {
      this.acciones.onRefresh(value);
    } else {
      // Solo vuelve a renderizar la vista completa.
      // Lit-html se encargará de actualizar solo la tabla eficientemente.
      this.render(
        { day: this.allAttendances, month: this.monthAttendances },
        this.allWorkers,
        this.companies,
        this.acciones
      );
    }
  }

  // --- MÉTODOS DE TABLA ---

  _renderAttendanceTable(attendances) {
    if (!attendances || attendances.length === 0) {
      return html`<div
        class="py-24 text-center border-2 border-dashed border-stone-100 rounded-[3rem] text-stone-300 uppercase tracking-[0.4em] text-[10px] font-bold italic bg-white"
      >
        Sin registros
      </div>`;
    }
    return html`<div class="space-y-4">
      ${attendances.map((a) => this._renderAttendanceRow(a))}
    </div>`;
  }

  _renderAttendanceRow(a) {
    const hasLocal = !a.soloCampo;
    const hasField = (a.cantidadCampo || 0) > 0;
    const status =
      a.registroStatus || (a.updatedBy ? "editado" : a.createdBy ? "manual" : "sistema");
    const statusLabel =
      status === "editado" ? "Editado" : status === "manual" ? "Manual" : "Sistema";
    const statusColor =
      status === "editado"
        ? "bg-blue-50 text-blue-600 border-blue-100"
        : status === "manual"
          ? "bg-amber-50 text-amber-600 border-amber-100"
          : "bg-emerald-50 text-emerald-600 border-emerald-100";

    const formatTimestamp = (val) => {
      if (!val) return "";
      const d = val.toDate ? val.toDate() : new Date(val);
      return `@ ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    };

    return html`
      <div
        class="group relative rounded-[2.5rem] border-2 border-stone-100 bg-white p-6 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col xl:flex-row items-center gap-8"
      >
        <div class="flex-1 min-w-0 w-full">
          <div class="flex flex-wrap items-center gap-4 mb-4">
            <div
              class="h-3 w-3 rounded-full ${a.tipo === "Almuerzo"
                ? "bg-primary"
                : a.tipo === "Desayuno"
                  ? "bg-amber-500"
                  : "bg-indigo-600"}"
            ></div>
            <h4
              class="text-base sm:text-lg font-black text-stone-900 uppercase tracking-tight truncate"
            >
              ${a.nombreCompleto}
            </h4>
            <span
              class="px-4 py-1.5 rounded-full bg-stone-950 text-white text-[9px] font-black uppercase tracking-[0.2em] ml-auto xl:ml-0"
              >${a.tipo}</span
            >
          </div>
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2 ml-7">
            <span class="text-xs font-mono text-stone-500 font-bold">${a.dni}</span>
            <span class="text-[10px] font-black uppercase text-primary/70 tracking-widest"
              >${a.empresa || "Particular"}</span
            >
          </div>
        </div>

        <div
          class="flex flex-col gap-2 min-w-[200px] w-full xl:w-auto bg-stone-50/50 p-4 rounded-[1.5rem] border border-stone-100"
        >
          <div class="flex items-center gap-2 mb-1">
            <span
              class="px-2 py-1 rounded-md ${statusColor} text-[7px] font-black uppercase border tracking-widest"
              >${statusLabel}</span
            >
            <span class="text-[9px] text-stone-400 font-bold uppercase tracking-widest italic"
              >${a.fecha}</span
            >
          </div>
          <div class="text-[10px] font-bold text-stone-700">
            ${(a.updatedBy || a.createdBy || "Sistema").split("@")[0]}
            <span class="text-stone-400 font-mono font-normal ml-1"
              >${formatTimestamp(a.updatedAt || a.createdAt || a.timestamp)}</span
            >
          </div>
        </div>

        <div
          class="flex items-center gap-6 w-full xl:w-auto justify-between border-t xl:border-t-0 xl:border-l border-stone-100 pt-6 xl:pt-0 xl:pl-8"
        >
          <div class="flex flex-col items-end gap-2">
            ${hasLocal
              ? html`<span
                  class="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-tighter border border-emerald-100"
                  >Local</span
                >`
              : ""}
            ${hasField
              ? html`<span
                  class="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-tighter border border-amber-100"
                  >Campo: ${a.cantidadCampo}</span
                >`
              : ""}
          </div>
          <div class="flex gap-2">
            <button
              @click=${() => this.acciones.onEdit(a.id)}
              class="p-4 rounded-[1.25rem] bg-stone-50 text-stone-400 hover:bg-stone-950 hover:text-white transition-all border border-stone-100 shadow-sm"
            >
              <svg
                class="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="2.5"
              >
                <path
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
            <button
              @click=${() => this._handleDelete(a.id)}
              class="p-4 rounded-[1.25rem] bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
            >
              <svg
                class="h-5 w-5"
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
      </div>
    `;
  }

  // --- FORMULARIO Y SOPORTE ---

  _handleWorkerChange(e) {
    this._updateCampoUI();
  }

  _updateCampoUI() {
    const eatsCheck = document.getElementById("attendance-also-eats");
    const serviceSelect = document.getElementById("attendance-type");
    const options = document.getElementById("field-manager-options");
    const toggleContainer = document.getElementById("local-consumption-toggle");
    const workerDni = document.getElementById("attendance-worker-dni").value;
    const worker = this.allWorkers.find((w) => w.dni === workerDni);
    const isManager = worker && worker.esEncargadoCampo;

    if (isManager) {
      toggleContainer.classList.remove("hidden");
      options.classList.remove("hidden");

      // CAMBIO: Ya no desactivamos el select ni aplicamos clases de opacidad
      if (serviceSelect) {
        serviceSelect.disabled = false;
        serviceSelect.classList.remove("opacity-30", "grayscale");
      }
    } else {
      toggleContainer.classList.add("hidden");
      options.classList.add("hidden");

      if (serviceSelect) {
        serviceSelect.disabled = false;
        serviceSelect.classList.remove("opacity-30", "grayscale");
      }

      if (eatsCheck) eatsCheck.checked = true;
      const fieldQty = document.getElementById("attendance-field-qty");
      if (fieldQty) fieldQty.value = 0;
    }
  }

  // src/views/ManageAttendanceView.js

  async _handleFormSubmit(e) {
    e.preventDefault();
    const dni = document.getElementById("attendance-worker-dni").value;
    const type = document.getElementById("attendance-type").value;
    const worker = this.allWorkers.find((w) => w.dni === dni);
    const qtyCampo = parseInt(document.getElementById("attendance-field-qty").value) || 0;
    const alsoEats = document.getElementById("attendance-also-eats").checked;

    if (!dni) {
      toast.error("Seleccione un trabajador");
      return;
    }

    const data = {
      dni,
      nombreCompleto: worker ? `${worker.apellidos}, ${worker.nombre}` : "Desconocido",
      empresa: worker ? worker.empresa || "Particular" : "Particular",
      fecha: document.getElementById("attendance-date").value,
      tipo: type,
      esEncargadoCampo: !!worker?.esEncargadoCampo,
      cantidadCampo: qtyCampo,
      soloCampo: !alsoEats,
    };

    await this.acciones.onSave(document.getElementById("edit-attendance-id").value, data);
  }

  async _handleExport(format) {
    const company = document.getElementById("report-company").value;
    const start = document.getElementById("report-start-date").value;
    const end = document.getElementById("report-end-date").value;
    const prices = {
      d: parseFloat(document.getElementById("price-d").value) || 10,
      a: parseFloat(document.getElementById("price-a").value) || 12,
      c: parseFloat(document.getElementById("price-c").value) || 10,
    };
    if (!start || !end) return toast.info("Faltan fechas.");
    try {
      if (format === "pdf") await this.acciones.onDownloadGroupPdf(company, start, end, prices);
      else await this.acciones.onDownloadGroupExcel(company, start, end, prices);
    } catch (e) {
      toast.error("Error al exportar");
    }
  }

  prepareEdit(attendance) {
    const container = document.getElementById("attendance-form-section");
    document.getElementById("edit-attendance-id").value = attendance.id;
    document.getElementById("attendance-worker-dni").value = attendance.dni;
    document.getElementById("attendance-date").value = attendance.fecha;
    document.getElementById("attendance-type").value = attendance.tipo;
    const worker = this.allWorkers.find((w) => w.dni === attendance.dni);
    if (worker && worker.esEncargadoCampo) {
      document.getElementById("field-manager-options").classList.remove("hidden");
      document.getElementById("local-consumption-toggle").classList.remove("hidden");
      document.getElementById("attendance-field-qty").value = attendance.cantidadCampo || 0;
      document.getElementById("attendance-also-eats").checked = !attendance.soloCampo;
    } else {
      document.getElementById("field-manager-options").classList.add("hidden");
      document.getElementById("local-consumption-toggle").classList.add("hidden");
    }
    document.getElementById("form-title").textContent = "Editar Registro";
    document.getElementById("submit-attendance-btn").textContent = "Actualizar Registro";
    container.scrollIntoView({ behavior: "smooth", block: "start" });
    container.classList.add("ring-8", "ring-primary/10");
    setTimeout(() => container.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  resetForm() {
    const form = document.getElementById("attendance-form");
    if (form) form.reset();
    document.getElementById("edit-attendance-id").value = "";
    document.getElementById("form-title").textContent = "Registro de Asistencia";
    document.getElementById("submit-attendance-btn").textContent = "Guardar Registro";
    document.getElementById("field-manager-options").classList.add("hidden");
    document.getElementById("local-consumption-toggle").classList.add("hidden");
    const serviceSelect = document.getElementById("attendance-type");
    if (serviceSelect) {
      serviceSelect.disabled = false;
      serviceSelect.classList.remove("opacity-30", "grayscale");
    }
  }

  async _handleDelete(id) {
    if (await dialog.confirm("Eliminar", "¿Está seguro?")) this.acciones.onDelete(id);
  }

  _safeRender(template) {
    try {
      render(template, this.rootElement);
    } catch (e) {
      this.rootElement.innerHTML = "";
      render(template, this.rootElement);
    }
  }

  updateList(dayAttendances, monthList) {
    this.render(
      { day: dayAttendances, month: monthList },
      this.allWorkers,
      this.companies,
      this.acciones
    );
  }
}
