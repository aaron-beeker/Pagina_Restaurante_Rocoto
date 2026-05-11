import { html, render } from 'lit-html';
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
    this.currentSearchQuery = "";
  }

  /**
   * Renderizado principal siguiendo el estilo Editorial Premium.
   */
  render(data, workers, companies, acciones) {
    const { day, month } = data;
    this.allAttendances = day;
    this.monthAttendances = month;
    this.allWorkers = workers;
    this.companies = companies;
    this.acciones = acciones;
    const today = getLocalDateString();

    const template = html`
      <div class="min-h-screen bg-[#fafafa] font-sans pb-32 text-stone-900">
        <div class="max-w-[1400px] mx-auto px-4 py-8 sm:py-16">
          
          <!-- Cabecera Editorial -->
          ${this._renderHeader(acciones.onBack)}

          <div class="space-y-12">
            <!-- DASHBOARD DE ESTADÍSTICAS -->
            ${this._renderDashboard(this.allAttendances, this.monthAttendances)}

            <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12 items-start">
                
                <!-- COLUMNA IZQUIERDA: Listado e Inventario -->
                <div class="xl:col-span-8 order-2 xl:order-1 space-y-10">
                    
                    <!-- Filtros y Búsqueda -->
                    <div class="space-y-8 bg-white p-6 sm:p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                        <div class="flex items-center gap-4 mb-2">
                            
                            <h3 class="text-xs font-black uppercase tracking-[0.4em]">Explorar Registros</h3>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="relative group">
                                <input type="text" id="search-attendance-list" 
                                       @input=${(e) => this._handleFilter()} 
                                       placeholder="Buscar trabajador o DNI..." 
                                       class="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-primary focus:bg-white outline-none transition-all" />
                                <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-300 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2.5"/></svg>
                            </div>
                            <div class="grid grid-cols-2 gap-3">
                                <input type="date" id="filter-date" .value=${today} @change=${() => acciones.onRefresh(document.getElementById("filter-date").value)} 
                                       class="bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 px-4 text-sm focus:border-primary focus:bg-white outline-none transition-all" />
                                <select id="filter-company-list" @change=${() => this._handleFilter()} 
                                        class="bg-stone-50 border-2 border-stone-50 rounded-2xl py-4 px-4 text-sm focus:border-primary focus:bg-white outline-none transition-all appearance-none font-bold text-stone-600">
                                    <option value="">Todas las empresas</option>
                                    ${this.companies.map(c => html`<option value="${c.nombre}">${c.nombre}</option>`)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla/Grid de Asistencia -->
                    <div id="table-container" class="space-y-4">
                        ${this._renderAttendanceTable(this.allAttendances)}
                    </div>
                </div>

                <!-- COLUMNA DERECHA: Editor y Reportes (Sticky - CLARO) -->
                <div class="xl:col-span-4 order-1 xl:order-2 space-y-8 lg:sticky lg:top-10">
                    
                    <!-- Editor de Registro (Blanco Premium) -->
                    <div class="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-stone-100 shadow-xl relative overflow-hidden" id="attendance-form-section">
                        <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        
                        <div class="relative z-10 mb-8 border-b border-stone-50 pb-6">
                            <h4 class="text-stone-900 font-display italic text-xl" id="form-title">Registro de Asistencia</h4>
                            <p class="text-[9px] text-stone-400 uppercase tracking-widest mt-1">Ingreso manual de consumo</p>
                        </div>

                        <form id="attendance-form" @submit=${(e) => this._handleFormSubmit(e)} class="relative z-10 space-y-6">
                            <input type="hidden" id="edit-attendance-id" value="" />
                            
                            <div class="space-y-5">
                                <div>
                                    <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1">Seleccionar Trabajador</label>
                                    <select id="attendance-worker-dni" @change=${(e) => this._handleWorkerChange(e)} class="w-full bg-stone-50 border-2 border-stone-100 rounded-2xl py-4 px-5 text-stone-900 text-sm focus:border-primary outline-none transition-all appearance-none cursor-pointer" required>
                                        ${this._renderWorkerOptions(this.allWorkers)}
                                    </select>
                                    <p class="text-[8px] text-stone-400 mt-2 ml-1 uppercase tracking-widest italic">Tip: Presiona una letra para buscar rápido</p>
                                </div>

                                <div class="grid grid-cols-2 gap-4">
                                    <div>
                                        <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1">Fecha</label>
                                        <input type="date" id="attendance-date" .value=${today} class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-sm focus:border-primary outline-none transition-all" required />
                                    </div>
                                    <div>
                                        <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block ml-1">Servicio</label>
                                        <select id="attendance-type" class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-stone-900 text-sm focus:border-primary outline-none transition-all appearance-none">
                                            <option value="Desayuno">Desayuno</option>
                                            <option value="Almuerzo" selected>Almuerzo</option>
                                            <option value="Cena">Cena</option>
                                        </select>
                                    </div>
                                </div>

                                <!-- Opciones de Campo -->
                                <div id="field-manager-options" class="hidden p-6 bg-amber-50/40 rounded-3xl border border-amber-100 space-y-4 animate-fade-in text-center">
                                    <div>
                                        <label class="text-[9px] uppercase tracking-[0.3em] text-amber-700 font-black mb-2 block">Raciones a Campo</label>
                                        <input type="number" id="attendance-field-qty" placeholder="0" min="0" value="0" class="w-full bg-transparent border-b-2 border-amber-200 py-2 text-stone-900 text-2xl text-center font-black outline-none focus:border-primary transition-all" />
                                    </div>
                                    <label class="flex items-center justify-center gap-3 cursor-pointer group">
                                        <input type="checkbox" id="attendance-also-eats" checked class="w-5 h-5 rounded border-amber-300 text-primary focus:ring-0 focus:ring-offset-0 bg-white" />
                                        <span class="text-[10px] font-black uppercase text-stone-500 group-hover:text-primary transition-colors">¿Consume en local?</span>
                                    </label>
                                </div>
                            </div>

                            <div class="flex flex-col gap-4 pt-4 border-t border-stone-50">
                                <button type="submit" id="submit-attendance-btn" class="w-full bg-stone-950 text-white py-8 sm:py-7 rounded-3xl text-sm sm:text-base uppercase tracking-[0.5em] font-black shadow-2xl hover:bg-primary transition-all duration-500 active:scale-[0.97] transform">
                                    Guardar Registro
                                </button>
                                <button type="button" @click=${() => this._resetForm()} class="w-full text-stone-400 py-4 text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-all italic text-center border-2 border-dashed border-transparent hover:border-stone-100 rounded-2xl">
                                    Cancelar / Limpiar
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Panel de Reportes (Consistente Blanco) -->
                    <div class="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-stone-100 shadow-xl space-y-8">
                        <div class="flex items-center gap-3 pb-4 border-b border-stone-50 text-center lg:text-left">
                            <h4 class="text-stone-900 font-display italic text-xl">Exportar Reportes</h4>
                            <p class="text-[9px] text-stone-400 uppercase tracking-widest mt-1">Generar cierres mensuales</p>
                        </div>

                        <div class="space-y-6">
                            <div>
                                <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Seleccionar Empresa</label>
                                <select id="report-company" class="w-full bg-stone-50 border-b-2 border-stone-100 py-3 text-sm font-bold text-stone-900 outline-none focus:border-primary transition-all">
                                    <option value="">Consolidado General</option>
                                    ${this.companies.map(c => html`<option value="${c.nombre}">${c.nombre}</option>`)}
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Desde</label>
                                    <input type="date" id="report-start-date" class="w-full bg-stone-50 border-b-2 border-stone-100 py-2 text-xs font-bold outline-none" />
                                </div>
                                <div>
                                    <label class="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold mb-3 block">Hasta</label>
                                    <input type="date" id="report-end-date" class="w-full bg-stone-50 border-b-2 border-stone-100 py-2 text-xs font-bold outline-none" />
                                </div>
                            </div>

                            <div class="p-6 bg-stone-50 rounded-3xl border border-stone-100 space-y-4">
                                <span class="text-[8px] font-black uppercase text-stone-300 tracking-[0.3em] block text-center">Precios de Liquidación (S/)</span>
                                <div class="grid grid-cols-3 gap-3">
                                    <div class="text-center">
                                        <span class="text-[7px] font-bold text-stone-400 uppercase block mb-1">D</span>
                                        <input type="number" id="price-d" value="10.00" step="0.10" class="w-full bg-white border-b-2 border-stone-200 py-1 text-xs text-center font-black text-primary outline-none" />
                                    </div>
                                    <div class="text-center">
                                        <span class="text-[7px] font-bold text-stone-400 uppercase block mb-1">A</span>
                                        <input type="number" id="price-a" value="10.00" step="0.10" class="w-full bg-white border-b-2 border-stone-200 py-1 text-xs text-center font-black text-primary outline-none" />
                                    </div>
                                    <div class="text-center">
                                        <span class="text-[7px] font-bold text-stone-400 uppercase block mb-1">C</span>
                                        <input type="number" id="price-c" value="10.00" step="0.10" class="w-full bg-white border-b-2 border-stone-200 py-1 text-xs text-center font-black text-primary outline-none" />
                                    </div>
                                </div>
                            </div>

                            <div class="flex flex-col gap-4 pt-4 border-t border-stone-50">
                                <button id="btn-export-pdf" @click=${() => this._handleExport('pdf')} class="w-full bg-stone-950 text-white py-6 rounded-3xl text-xs font-black uppercase tracking-[0.4em] shadow-xl hover:bg-primary transition-all active:scale-[0.97] flex items-center justify-center gap-3">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4 4m4-4V4"/></svg>
                                    Exportar PDF
                                </button>
                                <button id="btn-export-excel" @click=${() => this._handleExport('excel')} class="w-full bg-stone-50 text-emerald-700 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-50 transition-all active:scale-95 flex items-center justify-center gap-3 border border-emerald-100">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
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

  _renderHeader(onBack) {
    return html`
      <header class="flex flex-col sm:flex-row sm:items-end justify-between gap-8 mb-16 sm:mb-20 pb-8 border-b border-stone-200">
        <div class="space-y-4 sm:space-y-6">
            <button @click=${onBack} class="flex items-center gap-3 text-primary hover:text-stone-900 font-bold text-[9px] sm:text-[10px] uppercase tracking-[0.3em] sm:tracking-[0.5em] transition-all group">
                <svg class="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
                Volver al Panel
            </button>
            <div class="flex flex-col gap-2">
                <span class="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em] text-stone-400 font-bold">Control de Alimentación</span>
                <h2 class="text-3xl sm:text-6xl font-display italic text-stone-950 leading-none">
                    Gestión <span class="text-primary font-black not-italic underline decoration-stone-200 underline-offset-8">Asistencias</span>
                </h2>
            </div>
        </div>
      </header>
    `;
  }

  _renderDashboard(dayList, monthList) {
    const day = this.getStats(dayList);
    const month = this.getStats(monthList);
    
    const stats = [
        { t: "Total Hoy", v: day.totalIndividual + day.totalCampo, mv: month.totalIndividual + month.totalCampo, c: "bg-primary" },
        { t: "Desayunos", v: day.desayunos, mv: month.desayunos, c: "bg-amber-500" },
        { t: "Almuerzos", v: day.almuerzos, mv: month.almuerzos, c: "bg-emerald-600" },
        { t: "Cenas", v: day.cenas, mv: month.cenas, c: "bg-indigo-700" }
    ];

    return html`
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            ${stats.map(s => html`
                <div class="bg-white p-6 rounded-[2.5rem] border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-700 group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="h-10 w-10 rounded-2xl ${s.c} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                            <div class="h-1.5 w-1.5 rounded-full bg-white animate-pulse"></div>
                        </div>
                        <div class="text-right">
                            <span class="text-[7px] font-black uppercase tracking-widest text-stone-300">Mes</span>
                            <p class="text-xs font-black text-stone-900">${s.mv}</p>
                        </div>
                    </div>
                    <h4 class="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-1">${s.t}</h4>
                    <p class="text-3xl sm:text-4xl font-black text-stone-900 tracking-tighter">${s.v}</p>
                </div>
            `)}
        </div>
    `;
  }

  _renderAttendanceTable(attendances) {
    if (!attendances || attendances.length === 0) {
        return html`<div class="py-24 text-center border-2 border-dashed border-stone-100 rounded-[3rem] text-stone-300 uppercase tracking-[0.4em] text-[10px] font-bold italic bg-white">Sin registros para esta fecha</div>`;
    }

    return html`
        <div class="space-y-4">
            ${attendances.map(a => this._renderAttendanceRow(a))}
        </div>
    `;
  }

  _renderAttendanceRow(a) {
    const hasLocal = !a.soloCampo;
    const hasField = (a.cantidadCampo || 0) > 0;
    const isManager = a.esEncargadoCampo;

    return html`
        <div class="group relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border-2 border-stone-50 bg-white p-5 sm:p-6 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col sm:flex-row items-center gap-6"
             data-attendance-card data-name="${a.nombreCompleto.toLowerCase()}" data-dni="${a.dni}" data-company="${(a.empresa || '').toLowerCase()}">
            
            <div class="flex-1 min-w-0 w-full sm:w-auto">
                <div class="flex items-center gap-4 mb-2">
                    <div class="h-2 w-2 rounded-full ${a.tipo === 'Almuerzo' ? 'bg-primary' : a.tipo === 'Desayuno' ? 'bg-amber-500' : 'bg-indigo-600'} animate-pulse"></div>
                    <h4 class="text-sm sm:text-base font-sans font-bold text-stone-900 uppercase truncate">${a.nombreCompleto}</h4>
                </div>
                <div class="flex flex-wrap items-center gap-x-3 gap-y-1 ml-6">
                    <span class="text-[10px] font-mono text-stone-400 font-bold">${a.dni}</span>
                    <span class="h-1 w-1 rounded-full bg-stone-200"></span>
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black uppercase text-primary/60 tracking-widest">${a.empresa || 'Particular'}</span>
                        ${isManager ? html`<span class="px-2 py-0.5 rounded-md bg-amber-100 text-[7px] font-black text-amber-700 border border-amber-200 uppercase tracking-tighter">Encargado</span>` : ''}
                    </div>
                    <span class="h-1 w-1 rounded-full bg-stone-200"></span>
                    <span class="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">${a.fecha}</span>
                </div>
            </div>

            <div class="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 sm:border-l border-stone-50 pt-4 sm:pt-0 sm:pl-8">
                <div class="flex flex-col items-end gap-1">
                    <span class="px-3 py-1 rounded-lg bg-stone-50 text-[8px] font-black uppercase text-stone-500 border border-stone-100">${a.tipo}</span>
                    <div class="flex gap-1.5 mt-1">
                        ${hasLocal ? html`<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-[7px] font-black text-emerald-600 border border-emerald-100 uppercase">Local</span>` : ''}
                        ${hasField ? html`<span class="px-2 py-0.5 rounded-md bg-amber-50 text-[7px] font-black text-amber-600 border border-amber-100 uppercase">Campo (${a.cantidadCampo})</span>` : ''}
                    </div>
                </div>

                <div class="flex gap-2">
                    <button @click=${() => this.acciones.onEdit(a.id)} class="p-3.5 rounded-2xl bg-stone-50 text-stone-400 hover:bg-stone-950 hover:text-white transition-all active:scale-90 border border-stone-100 shadow-sm">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                    </button>
                    <button @click=${() => this._handleDelete(a.id)} class="p-3.5 rounded-2xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-90 border border-red-100 shadow-sm">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>
        </div>
    `;
  }

  // --- Lógica de Interacción ---

  _handleFilter() {
    const company = document.getElementById("filter-company-list").value.toLowerCase();
    const query = document.getElementById("search-attendance-list").value.toLowerCase().trim();
    const cards = this.rootElement.querySelectorAll("[data-attendance-card]");
    
    cards.forEach(card => {
        const name = card.getAttribute("data-name");
        const dni = card.getAttribute("data-dni");
        const comp = card.getAttribute("data-company");
        const matchesQuery = !query || name.includes(query) || dni.includes(query);
        const matchesCompany = !company || comp === company;
        card.classList.toggle("hidden", !(matchesQuery && matchesCompany));
    });
  }

  _handleWorkerSearch(e) {
    const term = e.target.value.toLowerCase();
    const filtered = this.allWorkers.filter(w => w.nombre.toLowerCase().includes(term) || w.apellidos.toLowerCase().includes(term) || w.dni.includes(term));
    const select = document.getElementById("attendance-worker-dni");
    if (select) render(html`${this._renderWorkerOptions(filtered)}`, select);
  }

  _handleWorkerChange(e) {
    const dni = e.target.value;
    const worker = this.allWorkers.find(w => w.dni === dni);
    const options = document.getElementById("field-manager-options");
    if (worker && worker.esEncargadoCampo) options.classList.remove("hidden");
    else { options.classList.add("hidden"); document.getElementById("attendance-field-qty").value = 0; }
  }

  _handleFormSubmit(e) {
    e.preventDefault();
    const dni = document.getElementById("attendance-worker-dni").value;
    const worker = this.allWorkers.find(w => w.dni === dni);
    const qtyCampo = parseInt(document.getElementById("attendance-field-qty").value) || 0;
    const alsoEats = document.getElementById("attendance-also-eats").checked;
    
    const data = { 
        dni, 
        nombreCompleto: worker ? `${worker.apellidos}, ${worker.nombre}` : "Desconocido", 
        empresa: worker ? (worker.empresa || "Particular") : "Particular", 
        fecha: document.getElementById("attendance-date").value, 
        tipo: document.getElementById("attendance-type").value, 
        esEncargadoCampo: worker ? !!worker.esEncargadoCampo : false 
    };

    // Lógica explícita para raciones a campo y consumo local
    if (data.esEncargadoCampo) {
        data.cantidadCampo = qtyCampo;
        // Es "Solo Campo" (true) si lleva raciones y NO consume en local.
        // Si consume en local, soloCampo debe ser false explícitamente para que Firestore actualice.
        data.soloCampo = (qtyCampo > 0 && !alsoEats);
    } else {
        data.cantidadCampo = 0;
        data.soloCampo = false;
    }
    
    this.acciones.onSave(document.getElementById("edit-attendance-id").value, data);
    this._resetForm();
  }

  async _handleExport(format) {
    const company = document.getElementById("report-company").value;
    const start = document.getElementById("report-start-date").value;
    const end = document.getElementById("report-end-date").value;
    const prices = {
        d: parseFloat(document.getElementById("price-d").value) || 0,
        a: parseFloat(document.getElementById("price-a").value) || 0,
        c: parseFloat(document.getElementById("price-c").value) || 0
    };

    if (!start || !end) return toast.info("Seleccione el rango de fechas.");

    const btnId = format === 'pdf' ? 'btn-export-pdf' : 'btn-export-excel';
    const btn = document.getElementById(btnId);
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `◌ Generando...`;

    try {
        if (format === 'pdf') await this.acciones.onDownloadGroupPdf(company, start, end, prices);
        else await this.acciones.onDownloadGroupExcel(company, start, end, prices);
        toast.success("Éxito");
    } catch (e) { toast.error("Error"); }
    finally { btn.disabled = false; btn.innerHTML = originalText; }
  }

  _prepareEdit(attendance) {
    const container = document.getElementById("attendance-form-section");
    const form = document.getElementById("attendance-form");
    
    // 1. Cargar ID y datos básicos
    document.getElementById("edit-attendance-id").value = attendance.id;
    document.getElementById("attendance-worker-dni").value = attendance.dni;
    document.getElementById("attendance-date").value = attendance.fecha;
    document.getElementById("attendance-type").value = attendance.tipo;
    
    // 2. Manejar Opciones de Campo si el trabajador es encargado
    const options = document.getElementById("field-manager-options");
    const worker = this.allWorkers.find(w => w.dni === attendance.dni);
    
    if (worker && worker.esEncargadoCampo) {
        options.classList.remove("hidden");
        document.getElementById("attendance-field-qty").value = attendance.cantidadCampo || 0;
        document.getElementById("attendance-also-eats").checked = !attendance.soloCampo;
    } else {
        options.classList.add("hidden");
    }

    // 3. Cambiar estados visuales
    document.getElementById("form-title").textContent = "Editar Registro";
    document.getElementById("submit-attendance-btn").textContent = "Actualizar Registro";
    
    // Mostrar el botón de cancelar (buscamos el botón de tipo button en el footer del form)
    const cancelBtn = form.querySelector('button[type="button"]');
    if (cancelBtn) cancelBtn.classList.remove("hidden");

    // 4. Scroll y Feedback
    container.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    container.classList.add("ring-8", "ring-primary/10", "duration-500");
    setTimeout(() => container.classList.remove("ring-8", "ring-primary/10"), 2000);
  }

  _resetForm() {
    const form = document.getElementById("attendance-form");
    if (form) form.reset();
    document.getElementById("edit-attendance-id").value = "";
    document.getElementById("form-title").textContent = "Registro de Asistencia";
    document.getElementById("submit-attendance-btn").textContent = "Guardar Registro";
    document.getElementById("cancel-attendance-edit").classList.add("hidden");
    document.getElementById("field-manager-options").classList.add("hidden");
    const container = document.getElementById("attendance-form-section");
    if (container) container.classList.remove("ring-8", "ring-primary/10");
  }

  async _handleDelete(id) {
    if (await dialog.confirm("Eliminar", "¿Está seguro?")) this.acciones.onDelete(id);
  }

  _renderWorkerOptions(workers) {
    return html`
        <option value="">Seleccionar Trabajador</option>
        ${workers.sort((a,b) => a.apellidos.localeCompare(b.apellidos)).map(w => html`
            <option value="${w.dni}">${w.apellidos}, ${w.nombre} (${w.dni})</option>
        `)}
    `;
  }

  getStats(list) {
    return {
        totalIndividual: list.filter(a => !a.soloCampo).length,
        totalCampo: list.reduce((acc, a) => acc + (a.cantidadCampo || 0), 0),
        desayunos: list.filter(a => a.tipo === "Desayuno").reduce((acc, a) => acc + (a.soloCampo ? 0 : 1) + (a.cantidadCampo || 0), 0),
        almuerzos: list.filter(a => a.tipo === "Almuerzo").reduce((acc, a) => acc + (a.soloCampo ? 0 : 1) + (a.cantidadCampo || 0), 0),
        cenas: list.filter(a => a.tipo === "Cena").reduce((acc, a) => acc + (a.soloCampo ? 0 : 1) + (a.cantidadCampo || 0), 0),
    };
  }

  _safeRender(template) {
    try { render(template, this.rootElement); }
    catch (e) { this.rootElement.innerHTML = ""; render(template, this.rootElement); }
  }

  updateList(dayAttendances, monthList) {
    this.render({ day: dayAttendances, month: monthList }, this.allWorkers, this.companies, this.acciones);
  }

  prepareEdit(attendance) { this._prepareEdit(attendance); }
}
