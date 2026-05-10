import { adminShell, button, form } from "../ui/layout.js";
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
  }

  render(data, workers, companies, acciones) {
    const { day, month } = data;
    this.allAttendances = day;
    this.monthAttendances = month;
    this.allWorkers = workers;
    this.companies = companies;
    this.acciones = acciones;
    const today = getLocalDateString();

    this.rootElement.innerHTML = `
        <div class="min-h-screen bg-background px-2 py-4 sm:px-6 sm:py-8 pb-24">
            <div class="mx-auto w-full max-w-7xl rounded-[3rem] border border-surface-variant bg-surface p-4 sm:p-10 shadow-xl relative overflow-hidden">
                
                <!-- Decoración Sutil -->
                <div class="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                ${this._renderHeader()}

                <!-- Dashboard de Estadísticas -->
                <div id="attendance-dashboard" class="mb-12">
                    ${this._renderDashboard(this.allAttendances, this.monthAttendances)}
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
                    <!-- Columna Izquierda: Formulario y Reportes -->
                    <div class="xl:col-span-4 space-y-8 order-2 xl:order-1">
                        ${this._renderAttendanceForm(today)}
                        ${this._renderReportsPanel()}
                    </div>

                    <!-- Columna Derecha: Listado y Filtros -->
                    <div class="xl:col-span-8 space-y-6 order-1 xl:order-2">
                        ${this._renderFilters(today)}
                        ${this._renderAttendanceTable()}
                    </div>
                </div>
            </div>
        </div>
    `;
    this.setupEventListeners(acciones);
  }

  _renderHeader() {
    return `
        <div class="z-40 -mx-4 -mt-4 mb-10 border-b border-surface-variant bg-surface/95 p-4 backdrop-blur-md sm:sticky sm:top-0 sm:-mx-10 sm:-mt-10 sm:px-10 sm:pt-10 sm:pb-8 flex flex-col sm:flex-row sm:items-center justify-start gap-4 sm:gap-6">
            <button type="button" id="back-from-attendance" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 border border-stone-200 shadow-sm transition-all hover:bg-stone-200 active:scale-95">
                <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7"></path></svg>
            </button>
            <div>
                <h2 class="text-xl sm:text-3xl font-black tracking-tight text-primary leading-tight">Gestión de Asistencias</h2>
                <p class="hidden sm:block text-sm text-on-surface-variant/60 font-medium">Control de alimentación Fasal.</p>
            </div>
        </div>
    `;
  }

  _renderDashboard(dayList, monthList) {
    const day = this.getStats(dayList);
    const month = this.getStats(monthList);
    
    const statsConfig = [
        { title: "Total Hoy", val: day.totalIndividual + day.totalCampo, mVal: month.totalIndividual + month.totalCampo, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', color: "bg-primary" },
        { title: "Desayunos", val: day.desayunos, mVal: month.desayunos, icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', color: "bg-amber-500" },
        { title: "Almuerzos", val: day.almuerzos, mVal: month.almuerzos, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: "bg-emerald-600" },
        { title: "Cenas", val: day.cenas, mVal: month.cenas, icon: 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z', color: "bg-indigo-700" }
    ];

    return `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            ${statsConfig.map(s => `
                <div class="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="h-10 w-10 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-500">
                            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="${s.icon}"/></svg>
                        </div>
                        <div class="text-right">
                            <span class="text-[8px] font-black uppercase tracking-[0.2em] text-stone-300">Mes</span>
                            <p class="text-xs font-black text-on-background">${s.mVal}</p>
                        </div>
                    </div>
                    <div>
                        <h4 class="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-1">${s.title}</h4>
                        <p class="text-3xl font-black text-primary tracking-tighter">${s.val}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
  }

  _renderAttendanceForm(today) {
    return `
        <div class="bg-stone-50/50 rounded-[2rem] border border-stone-100 p-6 sm:p-8" id="attendance-form-section">
            <div class="flex items-center gap-3 mb-6">
                <div class="h-8 w-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M12 4v16m8-8H4"/></svg>
                </div>
                <h3 class="text-xs font-black uppercase tracking-widest text-primary" id="form-title">Registro Manual</h3>
            </div>
            
            <form id="attendance-form" class="space-y-5">
                <input type="hidden" id="edit-attendance-id" value="" />
                
                <div class="space-y-4">
                    <div>
                        <label class="${form.label} ml-1">Trabajador</label>
                        <input type="text" id="worker-search" placeholder="Nombre o DNI..." class="${form.input} h-11 mb-2 shadow-sm border-stone-200" />
                        <select id="attendance-worker-dni" class="${form.input} h-11 border-stone-200" required>
                            ${this._renderWorkerOptions(this.allWorkers)}
                        </select>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="${form.label} ml-1">Fecha</label>
                            <input type="date" id="attendance-date" class="${form.input} h-11 border-stone-200" required value="${today}" />
                        </div>
                        <div>
                            <label class="${form.label} ml-1">Consumo</label>
                            <select id="attendance-type" class="${form.input} h-11 border-stone-200" required>
                                <option value="Desayuno">Desayuno</option>
                                <option value="Almuerzo" selected>Almuerzo</option>
                                <option value="Cena">Cena</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div id="field-manager-options" class="hidden space-y-4 p-5 bg-white rounded-2xl border border-primary/10 shadow-inner animate-fade-in">
                    <div>
                        <label class="${form.label} text-primary">Raciones a Campo</label>
                        <input type="number" id="attendance-field-qty" class="${form.input} h-11 border-primary/20" placeholder="0" min="0" value="0" />
                    </div>
                    <div class="flex items-center gap-3">
                        <input type="checkbox" id="attendance-also-eats" class="w-5 h-5 rounded border-primary/30 text-primary focus:ring-primary cursor-pointer shrink-0" checked />
                        <label for="attendance-also-eats" class="text-[10px] font-black uppercase text-primary/60 cursor-pointer leading-tight">¿Consume en local?</label>
                    </div>
                </div>

                <div class="flex flex-col gap-2 pt-2">
                    <button type="submit" id="submit-attendance-btn" class="${button.base} ${button.primary} w-full py-4 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20">Guardar Registro</button>
                    <button type="button" id="cancel-attendance-edit" class="hidden ${button.base} ${button.outlineDark} w-full py-3 text-[10px] font-black uppercase">Cancelar Edición</button>
                </div>
            </form>
        </div>
    `;
  }

  _renderReportsPanel() {
    return `
        <div class="bg-white rounded-[2rem] border border-stone-100 p-6 sm:p-8 shadow-sm">
            <div class="flex items-center gap-3 mb-8">
                <div class="h-8 w-8 rounded-xl bg-stone-800 text-white flex items-center justify-center">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                </div>
                <h3 class="text-xs font-black uppercase tracking-widest text-stone-800">Exportar Reportes</h3>
            </div>

            <div class="space-y-5">
                <div>
                    <label class="${form.label} ml-1">Filtro Empresa</label>
                    <select id="report-company" class="${form.input} h-11 border-stone-200">
                        <option value="">Consolidado General</option>
                        ${this.companies.map(c => `<option value="${c.nombre}">${escapeHtml(c.nombre)}</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="${form.label} ml-1">Inicio</label>
                        <input type="date" id="report-start-date" class="${form.input} h-11 border-stone-200 text-[10px]" />
                    </div>
                    <div>
                        <label class="${form.label} ml-1">Fin</label>
                        <input type="date" id="report-end-date" class="${form.input} h-11 border-stone-200 text-[10px]" />
                    </div>
                </div>

                <div class="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-3">
                    <p class="text-[9px] font-black uppercase text-stone-400 tracking-widest mb-2">Precios por Ración (S/)</p>
                    <div class="grid grid-cols-3 gap-2">
                        <div>
                            <label class="text-[8px] font-bold text-stone-400 uppercase block mb-1 ml-1">Desayuno</label>
                            <input type="number" id="price-d" class="${form.input} h-9 text-xs border-stone-200" value="10.00" step="0.10" />
                        </div>
                        <div>
                            <label class="text-[8px] font-bold text-stone-400 uppercase block mb-1 ml-1">Almuerzo</label>
                            <input type="number" id="price-a" class="${form.input} h-9 text-xs border-stone-200" value="10.00" step="0.10" />
                        </div>
                        <div>
                            <label class="text-[8px] font-bold text-stone-400 uppercase block mb-1 ml-1">Cena</label>
                            <input type="number" id="price-c" class="${form.input} h-9 text-xs border-stone-200" value="10.00" step="0.10" />
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3 pt-2">
                    <button id="btn-group-pdf" class="${button.base} ${button.primary} py-3.5 gap-2 uppercase text-[9px] font-black tracking-widest shadow-lg shadow-primary/20">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" stroke-width="2.5"/></svg> PDF
                    </button>
                    <button id="btn-group-excel" class="${button.base} border-2 border-green-600 text-green-700 hover:bg-green-50 py-3.5 gap-2 uppercase text-[9px] font-black tracking-widest">
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke-width="2.5"/></svg> EXCEL
                    </button>
                </div>
            </div>
        </div>
    `;
  }

  _renderFilters(today) {
    return `
        <div class="flex flex-col gap-4">
            <div class="relative group">
                <input type="text" id="search-attendance-list" placeholder="Buscar por nombre, DNI o empresa..." class="${form.input} py-4 pl-12 rounded-2xl shadow-sm border-stone-200 focus:border-primary/30" />
                <svg class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant opacity-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <div class="flex flex-col sm:flex-row gap-3">
                <div class="flex-1 relative">
                    <span class="absolute left-4 -top-2 px-1 bg-white text-[8px] font-black uppercase text-primary/40 tracking-widest z-10">Fecha (Opcional)</span>
                    <input type="date" id="filter-date" class="${form.input} h-12 shadow-sm rounded-xl border-stone-200" value="${today}" />
                </div>
                <div class="flex-1 relative">
                    <span class="absolute left-4 -top-2 px-1 bg-white text-[8px] font-black uppercase text-primary/40 tracking-widest z-10">Empresa</span>
                    <select id="filter-company-list" class="${form.input} h-12 shadow-sm rounded-xl border-stone-200">
                        <option value="">Todas las empresas</option>
                        ${this.companies.map(c => `<option value="${c.nombre}">${escapeHtml(c.nombre)}</option>`).join('')}
                    </select>
                </div>
            </div>
        </div>
    `;
  }

  _renderAttendanceTable() {
    return `
        <div class="relative overflow-hidden rounded-[2.5rem] border border-stone-100 bg-white shadow-sm">
            <div id="attendance-list-container" class="overflow-auto max-h-[600px] scrollbar-thin">
                <table class="w-full text-left min-w-[800px] relative border-separate border-spacing-0">
                    <thead class="sticky top-0 z-20 bg-stone-50 border-b border-stone-100 text-[9px] font-black uppercase tracking-[0.2em] text-stone-400">
                        <tr>
                            <th class="px-8 py-5 border-b border-stone-100">Trabajador</th>
                            <th class="px-4 py-5 text-center border-b border-stone-100">DNI</th>
                            <th class="px-4 py-5 text-center border-b border-stone-100">Empresa</th>
                            <th class="px-4 py-5 text-center border-b border-stone-100">Fecha</th>
                            <th class="px-4 py-5 text-center border-b border-stone-100">Tipo</th>
                            <th class="px-4 py-5 text-center border-b border-stone-100">Raciones / Consumo</th>
                            <th class="px-4 py-5 text-right pr-8 border-b border-stone-100">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="attendance-table-body" class="divide-y divide-stone-50">
                        ${this._renderTableRows(this.allAttendances)}
                    </tbody>
                </table>
            </div>
        </div>

        <style>
            /* Scrollbar Estilizada Premium */
            .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
            .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
            .scrollbar-thin::-webkit-scrollbar-thumb { 
                background: #e5e7eb; 
                border-radius: 20px; 
            }
            .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        </style>
    `;
  }

  _renderTableRows(attendances) {
    if (attendances.length === 0) return `<tr><td colspan="7" class="px-8 py-20 text-center text-[10px] font-black text-stone-200 uppercase tracking-[0.3em]">No hay registros para este día</td></tr>`;
    return attendances.map(a => {
        const hasLocal = !a.soloCampo;
        const hasField = (a.cantidadCampo || 0) > 0;
        
        return `
            <tr class="hover:bg-primary/[0.02] transition-colors group">
                <td class="px-8 py-5">
                    <div class="flex items-center gap-3">
                        <div class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                        <span class="text-xs font-black text-on-background uppercase truncate max-w-[200px] tracking-tight">${escapeHtml(a.nombreCompleto)}</span>
                    </div>
                </td>
                <td class="px-4 py-5 text-center font-mono text-[10px] text-stone-400">${a.dni}</td>
                <td class="px-4 py-5 text-center"><span class="text-[9px] font-black text-primary/40 uppercase tracking-tighter">${escapeHtml(a.empresa || 'Particular')}</span></td>
                <td class="px-4 py-5 text-center font-mono text-[10px] text-stone-600">${a.fecha || '---'}</td>
                <td class="px-4 py-5 text-center">
                    <span class="px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-100 text-[8px] font-black uppercase text-stone-500">${a.tipo}</span>
                </td>
                <td class="px-4 py-5 text-center">
                    <div class="flex flex-col items-center gap-1">
                        <div class="flex gap-1">
                            ${hasLocal ? '<span class="px-2 py-0.5 rounded-md bg-emerald-50 text-[7px] font-black text-emerald-600 border border-emerald-100 uppercase tracking-tighter">Local</span>' : ''}
                            ${hasField ? `<span class="px-2 py-0.5 rounded-md bg-amber-50 text-[7px] font-black text-amber-600 border border-amber-100 uppercase tracking-tighter">Campo (${a.cantidadCampo})</span>` : ''}
                        </div>
                    </div>
                </td>
                <td class="px-4 py-5 text-right pr-8">
                    <div class="flex justify-end gap-2">
                        <button class="edit-attendance-btn flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 hover:text-white transition-all border border-blue-100" data-id="${a.id}">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                            Editar
                        </button>
                        <button class="delete-attendance-btn flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-red-600 hover:text-white transition-all border border-red-100" data-id="${a.id}">
                            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            Borrar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
  }

  _renderWorkerOptions(workers) {
    return `
        <option value="">Seleccionar Trabajador</option>
        ${workers.sort((a,b) => a.apellidos.localeCompare(b.apellidos)).map(w => `
            <option value="${w.dni}">${escapeHtml(w.apellidos)}, ${escapeHtml(w.nombre)} (${w.dni})</option>
        `).join('')}
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

  setupEventListeners(acciones) {
    const { onBack, onSave, onDelete, onEdit, onRefresh, onDownloadGroupPdf, onDownloadGroupExcel } = acciones;
    const backBtn = this.rootElement.querySelector("#back-from-attendance");
    if (backBtn) backBtn.onclick = onBack;

    const workerSelect = document.getElementById("attendance-worker-dni");
    const workerSearch = document.getElementById("worker-search");
    const fieldManagerOptions = document.getElementById("field-manager-options");
    
    workerSearch.oninput = (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = this.allWorkers.filter(w => w.nombre.toLowerCase().includes(term) || w.apellidos.toLowerCase().includes(term) || w.dni.includes(term));
        workerSelect.innerHTML = this._renderWorkerOptions(filtered);
    };

    workerSelect.onchange = (e) => {
        const dni = e.target.value;
        const worker = this.allWorkers.find(w => w.dni === dni);
        if (worker && worker.esEncargadoCampo) fieldManagerOptions.classList.remove("hidden");
        else { fieldManagerOptions.classList.add("hidden"); document.getElementById("attendance-field-qty").value = 0; }
    };

    const formElement = document.getElementById("attendance-form");
    formElement.onsubmit = (e) => {
        e.preventDefault();
        const dni = workerSelect.value, worker = this.allWorkers.find(w => w.dni === dni);
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
        if (qtyCampo > 0) data.cantidadCampo = qtyCampo;
        if (qtyCampo > 0 && !alsoEats) data.soloCampo = true;
        onSave(document.getElementById("edit-attendance-id").value, data);
    };

    const handleRefresh = () => onRefresh(document.getElementById("filter-date").value);
    document.getElementById("filter-date").onchange = handleRefresh;
    
    const clearDateBtn = document.getElementById("clear-date-filter");
    if (clearDateBtn) {
        clearDateBtn.onclick = () => {
            document.getElementById("filter-date").value = "";
            handleRefresh();
        };
    }

    const filterList = () => {
        const company = document.getElementById("filter-company-list").value;
        const query = document.getElementById("search-attendance-list").value.toLowerCase().trim();
        const filtered = this.allAttendances.filter(a => {
            const matchesCompany = !company || a.empresa === company;
            const matchesSearch = !query || a.nombreCompleto.toLowerCase().includes(query) || a.dni.includes(query);
            return matchesCompany && matchesSearch;
        });
        
        // Renderizar solo la tabla para el filtro cliente
        const tb = document.getElementById("attendance-table-body");
        if (tb) tb.innerHTML = this._renderTableRows(filtered);
        this.attachTableEvents();
    };

    document.getElementById("filter-company-list").onchange = filterList;
    document.getElementById("search-attendance-list").oninput = filterList;

    document.getElementById("btn-group-pdf").onclick = () => {
        const company = document.getElementById("report-company").value;
        const start = document.getElementById("report-start-date").value;
        const end = document.getElementById("report-end-date").value;
        const prices = {
            d: parseFloat(document.getElementById("price-d").value) || 0,
            a: parseFloat(document.getElementById("price-a").value) || 0,
            c: parseFloat(document.getElementById("price-c").value) || 0
        };
        if (!start || !end) return toast.info("Seleccione fechas.");
        onDownloadGroupPdf(company, start, end, prices);
    };

    document.getElementById("btn-group-excel").onclick = () => {
        const company = document.getElementById("report-company").value;
        const start = document.getElementById("report-start-date").value;
        const end = document.getElementById("report-end-date").value;
        const prices = {
            d: parseFloat(document.getElementById("price-d").value) || 0,
            a: parseFloat(document.getElementById("price-a").value) || 0,
            c: parseFloat(document.getElementById("price-c").value) || 0
        };
        if (!start || !end) return toast.info("Seleccione fechas.");
        onDownloadGroupExcel(company, start, end, prices);
    };

    this.attachTableEvents(onEdit, onDelete);
  }

  attachTableEvents(onEdit, onDelete) {
    const editHandler = onEdit || (this.acciones ? this.acciones.onEdit : null);
    const deleteHandler = onDelete || (this.acciones ? this.acciones.onDelete : null);
    if (!editHandler || !deleteHandler) return;
    this.rootElement.querySelectorAll(".edit-attendance-btn").forEach(btn => { btn.onclick = () => editHandler(btn.dataset.id); });
    this.rootElement.querySelectorAll(".delete-attendance-btn").forEach(btn => {
        btn.onclick = async () => { if (await dialog.confirm("Eliminar Registro", "¿Está seguro?")) deleteHandler(btn.dataset.id); };
    });
  }

  updateList(dayAttendances, monthList) {
    this.allAttendances = dayAttendances;
    if (monthList) this.monthAttendances = monthList;
    
    const tb = document.getElementById("attendance-table-body");
    if (tb) tb.innerHTML = this._renderTableRows(dayAttendances);
    const db = document.getElementById("attendance-dashboard");
    if (db) db.innerHTML = this._renderDashboard(dayAttendances, this.monthAttendances);
    this.attachTableEvents();
  }

  prepareEdit(attendance) {
    document.getElementById("edit-attendance-id").value = attendance.id;
    const s = document.getElementById("attendance-worker-dni"); s.innerHTML = this._renderWorkerOptions(this.allWorkers);
    document.getElementById("worker-search").value = ""; s.value = attendance.dni;
    document.getElementById("attendance-date").value = attendance.fecha;
    document.getElementById("attendance-type").value = attendance.tipo;
    if (attendance.esEncargadoCampo) {
        document.getElementById("field-manager-options").classList.remove("hidden");
        document.getElementById("attendance-field-qty").value = attendance.cantidadCampo || 0;
        document.getElementById("attendance-also-eats").checked = !attendance.soloCampo;
    }
    document.getElementById("form-title").textContent = "Editar Registro";
    document.getElementById("submit-attendance-btn").textContent = "Actualizar Registro";
    document.getElementById("cancel-attendance-edit").classList.remove("hidden");
    document.getElementById("attendance-form-section").scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
